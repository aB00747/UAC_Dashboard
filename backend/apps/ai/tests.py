from unittest.mock import patch, MagicMock

import httpx
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .services import AIServiceClient, AIServiceUnavailable, AIServiceError

User = get_user_model()
TEST_PASS = 'T3stP@ssw0rd!'  # noqa: S105


def make_user():
    return User.objects.create_user(username='aiuser', password=TEST_PASS)


# ---------------------------------------------------------------------------
# AIServiceClient unit tests (mock httpx)
# ---------------------------------------------------------------------------

class AIServiceClientInitTest(TestCase):
    def test_defaults(self):
        svc = AIServiceClient()
        self.assertEqual(svc.base_url, 'http://localhost:8001')
        self.assertEqual(svc.timeout, 120)

    def test_headers_include_api_key(self):
        svc = AIServiceClient()
        h = svc._headers()
        self.assertIn('X-API-Key', h)
        self.assertEqual(h['Content-Type'], 'application/json')


class HandleResponseTest(TestCase):
    def setUp(self):
        self.svc = AIServiceClient()

    def test_403_raises_service_error(self):
        resp = MagicMock(status_code=403)
        with self.assertRaises(AIServiceError):
            self.svc._handle_response(resp)

    def test_503_raises_unavailable(self):
        resp = MagicMock(status_code=503)
        with self.assertRaises(AIServiceUnavailable):
            self.svc._handle_response(resp)

    def test_success_returns_json(self):
        resp = MagicMock(status_code=200)
        resp.json.return_value = {'ok': True}
        resp.raise_for_status = MagicMock()
        self.assertEqual(self.svc._handle_response(resp), {'ok': True})


class HealthCheckTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.return_value = MagicMock(json=MagicMock(return_value={'status': 'healthy'}))
        mock_client_cls.return_value = ctx

        result = AIServiceClient().health_check()
        self.assertEqual(result, {'status': 'healthy'})

    @patch('apps.ai.services.httpx.Client')
    def test_connect_error(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.side_effect = httpx.ConnectError('refused')
        mock_client_cls.return_value = ctx

        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().health_check()

    @patch('apps.ai.services.httpx.Client')
    def test_generic_exception(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.side_effect = RuntimeError('boom')
        mock_client_cls.return_value = ctx

        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().health_check()


def _mock_httpx_client(mock_cls, method='post', response=None, side_effect=None):
    """Helper to configure a mocked httpx.Client context manager."""
    ctx = MagicMock()
    ctx.__enter__ = MagicMock(return_value=ctx)
    ctx.__exit__ = MagicMock(return_value=False)
    target = getattr(ctx, method)
    if side_effect:
        target.side_effect = side_effect
    else:
        resp = MagicMock(status_code=200)
        resp.json.return_value = response or {}
        resp.raise_for_status = MagicMock()
        target.return_value = resp
    mock_cls.return_value = ctx
    return ctx


class ChatServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'response': 'hi'})
        result = AIServiceClient().chat('hello', user_id=1)
        self.assertEqual(result, {'response': 'hi'})

    @patch('apps.ai.services.httpx.Client')
    def test_with_conversation_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'post', {'response': 'ok'})
        AIServiceClient().chat('hello', user_id=1, conversation_id='abc')
        payload = ctx.post.call_args[1]['json']
        self.assertEqual(payload['conversation_id'], 'abc')

    @patch('apps.ai.services.httpx.Client')
    def test_timeout_raises_unavailable(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.TimeoutException('timeout'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().chat('hello', user_id=1)

    @patch('apps.ai.services.httpx.Client')
    def test_generic_exception_raises_service_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=RuntimeError('boom'))
        with self.assertRaises(AIServiceError):
            AIServiceClient().chat('hello', user_id=1)


class ListConversationsServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'conversations': []})
        result = AIServiceClient().list_conversations(user_id=1)
        self.assertEqual(result, {'conversations': []})

    @patch('apps.ai.services.httpx.Client')
    def test_connect_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', side_effect=httpx.ConnectError('refused'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().list_conversations(user_id=1)


class GetConversationMessagesServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'messages': []})
        result = AIServiceClient().get_conversation_messages('conv1', user_id=1)
        self.assertEqual(result, {'messages': []})

    @patch('apps.ai.services.httpx.Client')
    def test_passes_user_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'get', {'messages': []})
        AIServiceClient().get_conversation_messages('conv1', user_id=42)
        self.assertEqual(ctx.get.call_args[1]['params'], {'user_id': 42})


class DeleteConversationServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'delete', {'deleted': True})
        result = AIServiceClient().delete_conversation('conv1', user_id=1)
        self.assertEqual(result, {'deleted': True})

    @patch('apps.ai.services.httpx.Client')
    def test_passes_user_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'delete', {'deleted': True})
        AIServiceClient().delete_conversation('conv1', user_id=42)
        self.assertEqual(ctx.delete.call_args[1]['params'], {'user_id': 42})


class GenerateInsightServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'insight': 'data'})
        result = AIServiceClient().generate_insight('sales_trend')
        self.assertEqual(result, {'insight': 'data'})

    @patch('apps.ai.services.httpx.Client')
    def test_timeout(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.TimeoutException('slow'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().generate_insight('sales_trend')


class QuickInsightsServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'insights': []})
        result = AIServiceClient().quick_insights()
        self.assertEqual(result, {'insights': []})


class ProcessDocumentServiceTest(TestCase):
    @patch('apps.ai.services.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'processed': True})
        result = AIServiceClient().process_document('/tmp/a.pdf', 'a.pdf', 'pdf', user_id=1)
        self.assertEqual(result, {'processed': True})

    @patch('apps.ai.services.httpx.Client')
    def test_connect_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.ConnectError('refused'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().process_document('/tmp/a.pdf', 'a.pdf', 'pdf', user_id=1)


# ---------------------------------------------------------------------------
# View tests (mock ai_client at the view layer)
# ---------------------------------------------------------------------------

AI_CLIENT = 'apps.ai.views.ai_client'


class AIViewTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.client.force_authenticate(user=self.user)


class HealthViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_health')

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.health_check.return_value = {'status': 'healthy'}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'healthy')

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.health_check.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_unauthenticated(self):
        self.client.force_authenticate(user=None)
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ChatViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_chat')

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.chat.return_value = {'response': 'Hello!', 'conversation_id': 'c1'}
        res = self.client.post(self.url(), {'message': 'Hi'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.chat.assert_called_once_with(
            message='Hi', user_id=self.user.id, conversation_id=None, context_type='general',
        )

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.chat.side_effect = AIServiceUnavailable()
        res = self.client.post(self.url(), {'message': 'Hi'})
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch(AI_CLIENT)
    def test_service_error(self, mock_ai):
        mock_ai.chat.side_effect = AIServiceError('boom')
        res = self.client.post(self.url(), {'message': 'Hi'})
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertNotIn('boom', res.data['detail'])

    def test_missing_message(self):
        res = self.client.post(self.url(), {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_context_type(self):
        res = self.client.post(self.url(), {'message': 'Hi', 'context_type': 'nope'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class ConversationsViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_conversations')

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.list_conversations.return_value = {'conversations': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.list_conversations.assert_called_once_with(self.user.id)

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.list_conversations.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch(AI_CLIENT)
    def test_service_error(self, mock_ai):
        mock_ai.list_conversations.side_effect = AIServiceError('err')
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class ConversationMessagesViewTest(AIViewTestBase):
    def url(self, cid='conv-1'):
        return reverse('ai_conversation_messages', args=[cid])

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.get_conversation_messages.return_value = {'messages': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.get_conversation_messages.assert_called_once_with('conv-1', user_id=self.user.id)

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.get_conversation_messages.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch(AI_CLIENT)
    def test_service_error(self, mock_ai):
        mock_ai.get_conversation_messages.side_effect = AIServiceError('err')
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class ConversationDeleteViewTest(AIViewTestBase):
    def url(self, cid='conv-1'):
        return reverse('ai_conversation_delete', args=[cid])

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.delete_conversation.return_value = {'deleted': True}
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.delete_conversation.assert_called_once_with('conv-1', user_id=self.user.id)

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.delete_conversation.side_effect = AIServiceUnavailable()
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch(AI_CLIENT)
    def test_service_error(self, mock_ai):
        mock_ai.delete_conversation.side_effect = AIServiceError('err')
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class InsightViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_insight')

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.generate_insight.return_value = {'data': 'insight'}
        res = self.client.post(self.url(), {'insight_type': 'sales_trend'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.generate_insight.side_effect = AIServiceUnavailable()
        res = self.client.post(self.url(), {'insight_type': 'sales_trend'})
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch(AI_CLIENT)
    def test_service_error(self, mock_ai):
        mock_ai.generate_insight.side_effect = AIServiceError('err')
        res = self.client.post(self.url(), {'insight_type': 'sales_trend'})
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)

    def test_invalid_type(self):
        res = self.client.post(self.url(), {'insight_type': 'invalid'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class QuickInsightsViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_quick_insights')

    @patch(AI_CLIENT)
    def test_success(self, mock_ai):
        mock_ai.quick_insights.return_value = {'insights': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch(AI_CLIENT)
    def test_unavailable(self, mock_ai):
        mock_ai.quick_insights.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


class ProcessDocumentViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_process_document')

    @patch(AI_CLIENT)
    @patch('os.path.realpath', side_effect=lambda p: p)
    def test_success(self, _rp, mock_ai):
        mock_ai.process_document.return_value = {'processed': True}
        res = self.client.post(self.url(), {
            'file_path': 'docs/test.pdf', 'file_name': 'test.pdf', 'file_type': 'pdf',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch(AI_CLIENT)
    @patch('os.path.realpath', side_effect=lambda p: p)
    def test_unavailable(self, _rp, mock_ai):
        mock_ai.process_document.side_effect = AIServiceUnavailable()
        res = self.client.post(self.url(), {
            'file_path': 'docs/test.pdf', 'file_name': 'test.pdf', 'file_type': 'pdf',
        })
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_invalid_file_type(self):
        res = self.client.post(self.url(), {
            'file_path': 'test.xyz', 'file_name': 'test.xyz', 'file_type': 'xyz',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

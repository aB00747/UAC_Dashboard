from unittest.mock import patch, MagicMock

import httpx
from django.test import TestCase
from django.contrib.auth import get_user_model

from ..services import AIServiceClient, AIServiceUnavailable, AIServiceError

User = get_user_model()
TEST_PASS = 'T3stP@ssw0rd!'  # noqa: S105


def make_user():
    return User.objects.create_user(username='aiuser', password=TEST_PASS)


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
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.return_value = MagicMock(json=MagicMock(return_value={'status': 'healthy'}))
        mock_client_cls.return_value = ctx

        result = AIServiceClient().health_check()
        self.assertEqual(result, {'status': 'healthy'})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_connect_error(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.side_effect = httpx.ConnectError('refused')
        mock_client_cls.return_value = ctx

        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().health_check()

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_generic_exception(self, mock_client_cls):
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=ctx)
        ctx.__exit__ = MagicMock(return_value=False)
        ctx.get.side_effect = RuntimeError('boom')
        mock_client_cls.return_value = ctx

        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().health_check()


class ChatServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'response': 'hi'})
        result = AIServiceClient().chat('hello', user_id=1)
        self.assertEqual(result, {'response': 'hi'})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_with_conversation_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'post', {'response': 'ok'})
        AIServiceClient().chat('hello', user_id=1, conversation_id='abc')
        payload = ctx.post.call_args[1]['json']
        self.assertEqual(payload['conversation_id'], 'abc')

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_timeout_raises_unavailable(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.TimeoutException('timeout'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().chat('hello', user_id=1)

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_generic_exception_raises_service_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=RuntimeError('boom'))
        with self.assertRaises(AIServiceError):
            AIServiceClient().chat('hello', user_id=1)


class ListConversationsServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'conversations': []})
        result = AIServiceClient().list_conversations(user_id=1)
        self.assertEqual(result, {'conversations': []})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_connect_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', side_effect=httpx.ConnectError('refused'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().list_conversations(user_id=1)


class GetConversationMessagesServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'messages': []})
        result = AIServiceClient().get_conversation_messages('conv1', user_id=1)
        self.assertEqual(result, {'messages': []})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_passes_user_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'get', {'messages': []})
        AIServiceClient().get_conversation_messages('conv1', user_id=42)
        self.assertEqual(ctx.get.call_args[1]['params'], {'user_id': 42})


class DeleteConversationServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'delete', {'deleted': True})
        result = AIServiceClient().delete_conversation('conv1', user_id=1)
        self.assertEqual(result, {'deleted': True})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_passes_user_id(self, mock_cls):
        ctx = _mock_httpx_client(mock_cls, 'delete', {'deleted': True})
        AIServiceClient().delete_conversation('conv1', user_id=42)
        self.assertEqual(ctx.delete.call_args[1]['params'], {'user_id': 42})


class GenerateInsightServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'insight': 'data'})
        result = AIServiceClient().generate_insight('sales_trend')
        self.assertEqual(result, {'insight': 'data'})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_timeout(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.TimeoutException('slow'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().generate_insight('sales_trend')


class QuickInsightsServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'get', {'insights': []})
        result = AIServiceClient().quick_insights()
        self.assertEqual(result, {'insights': []})


class ProcessDocumentServiceTest(TestCase):
    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_success(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', {'processed': True})
        result = AIServiceClient().process_document('/tmp/a.pdf', 'a.pdf', 'pdf', user_id=1)
        self.assertEqual(result, {'processed': True})

    @patch('apps.ai.services.ai_client.httpx.Client')
    def test_connect_error(self, mock_cls):
        _mock_httpx_client(mock_cls, 'post', side_effect=httpx.ConnectError('refused'))
        with self.assertRaises(AIServiceUnavailable):
            AIServiceClient().process_document('/tmp/a.pdf', 'a.pdf', 'pdf', user_id=1)

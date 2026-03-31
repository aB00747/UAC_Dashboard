from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from ..services import AIServiceUnavailable, AIServiceError

User = get_user_model()
TEST_PASS = 'T3stP@ssw0rd!'  # noqa: S105


def make_user():
    return User.objects.create_user(username='aiuser', password=TEST_PASS)


class AIViewTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.client.force_authenticate(user=self.user)


class HealthViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_health')

    @patch('apps.ai.views.health.ai_client')
    def test_success(self, mock_ai):
        mock_ai.health_check.return_value = {'status': 'healthy'}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'healthy')

    @patch('apps.ai.views.health.ai_client')
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

    @patch('apps.ai.views.chat.ai_client')
    def test_success(self, mock_ai):
        mock_ai.chat.return_value = {'response': 'Hello!', 'conversation_id': 'c1'}
        res = self.client.post(self.url(), {'message': 'Hi'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.chat.assert_called_once_with(
            message='Hi', user_id=self.user.id, conversation_id=None, context_type='general',
        )

    @patch('apps.ai.views.chat.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.chat.side_effect = AIServiceUnavailable()
        res = self.client.post(self.url(), {'message': 'Hi'})
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.ai.views.chat.ai_client')
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

    @patch('apps.ai.views.chat.ai_client')
    def test_success(self, mock_ai):
        mock_ai.list_conversations.return_value = {'conversations': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.list_conversations.assert_called_once_with(self.user.id)

    @patch('apps.ai.views.chat.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.list_conversations.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.ai.views.chat.ai_client')
    def test_service_error(self, mock_ai):
        mock_ai.list_conversations.side_effect = AIServiceError('err')
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class ConversationMessagesViewTest(AIViewTestBase):
    def url(self, cid='conv-1'):
        return reverse('ai_conversation_messages', args=[cid])

    @patch('apps.ai.views.chat.ai_client')
    def test_success(self, mock_ai):
        mock_ai.get_conversation_messages.return_value = {'messages': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.get_conversation_messages.assert_called_once_with('conv-1', user_id=self.user.id)

    @patch('apps.ai.views.chat.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.get_conversation_messages.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.ai.views.chat.ai_client')
    def test_service_error(self, mock_ai):
        mock_ai.get_conversation_messages.side_effect = AIServiceError('err')
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class ConversationDeleteViewTest(AIViewTestBase):
    def url(self, cid='conv-1'):
        return reverse('ai_conversation_delete', args=[cid])

    @patch('apps.ai.views.chat.ai_client')
    def test_success(self, mock_ai):
        mock_ai.delete_conversation.return_value = {'deleted': True}
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        mock_ai.delete_conversation.assert_called_once_with('conv-1', user_id=self.user.id)

    @patch('apps.ai.views.chat.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.delete_conversation.side_effect = AIServiceUnavailable()
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.ai.views.chat.ai_client')
    def test_service_error(self, mock_ai):
        mock_ai.delete_conversation.side_effect = AIServiceError('err')
        res = self.client.delete(self.url())
        self.assertEqual(res.status_code, status.HTTP_502_BAD_GATEWAY)


class InsightViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_insight')

    @patch('apps.ai.views.insights.ai_client')
    def test_success(self, mock_ai):
        mock_ai.generate_insight.return_value = {'data': 'insight'}
        res = self.client.post(self.url(), {'insight_type': 'sales_trend'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch('apps.ai.views.insights.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.generate_insight.side_effect = AIServiceUnavailable()
        res = self.client.post(self.url(), {'insight_type': 'sales_trend'})
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.ai.views.insights.ai_client')
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

    @patch('apps.ai.views.insights.ai_client')
    def test_success(self, mock_ai):
        mock_ai.quick_insights.return_value = {'insights': []}
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch('apps.ai.views.insights.ai_client')
    def test_unavailable(self, mock_ai):
        mock_ai.quick_insights.side_effect = AIServiceUnavailable()
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


class ProcessDocumentViewTest(AIViewTestBase):
    def url(self):
        return reverse('ai_process_document')

    @patch('apps.ai.views.documents.ai_client')
    @patch('os.path.realpath', side_effect=lambda p: p)
    def test_success(self, _rp, mock_ai):
        mock_ai.process_document.return_value = {'processed': True}
        res = self.client.post(self.url(), {
            'file_path': 'docs/test.pdf', 'file_name': 'test.pdf', 'file_type': 'pdf',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    @patch('apps.ai.views.documents.ai_client')
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

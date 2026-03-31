import logging
import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class AIServiceUnavailable(Exception):
    """Raised when the AI service is not reachable."""
    pass


class AIServiceError(Exception):
    """Raised when the AI service returns an error."""
    pass


class AIServiceClient:
    """HTTP client for communicating with the FastAPI AI service."""

    def __init__(self):
        self.base_url = getattr(settings, 'AI_SERVICE_URL', 'http://localhost:8001')
        self.api_key = getattr(settings, 'AI_SERVICE_API_KEY', '')
        self.timeout = 120

    def _headers(self):
        return {'X-API-Key': self.api_key, 'Content-Type': 'application/json'}

    def _handle_response(self, response):
        if response.status_code == 403:
            raise AIServiceError('Invalid AI service API key')
        if response.status_code == 503:
            raise AIServiceUnavailable('AI service is unavailable')
        response.raise_for_status()
        return response.json()

    # --- Health ---

    def health_check(self):
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(f'{self.base_url}/health/')
                return resp.json()
        except httpx.ConnectError:
            raise AIServiceUnavailable('Cannot connect to AI service')
        except Exception as e:
            logger.error(f'AI health check failed: {e}')
            raise AIServiceUnavailable(str(e))

    # --- Chat ---

    def chat(self, message, user_id, conversation_id=None, context_type='general'):
        try:
            with httpx.Client(timeout=self.timeout) as client:
                payload = {
                    'message': message,
                    'user_id': user_id,
                    'context_type': context_type,
                }
                if conversation_id:
                    payload['conversation_id'] = conversation_id
                resp = client.post(
                    f'{self.base_url}/chat/',
                    json=payload,
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI chat error: {e}')
            raise AIServiceError(str(e))

    def list_conversations(self, user_id):
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(
                    f'{self.base_url}/chat/conversations/',
                    params={'user_id': user_id},
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI list conversations error: {e}')
            raise AIServiceError(str(e))

    def get_conversation_messages(self, conversation_id, user_id):
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(
                    f'{self.base_url}/chat/conversations/{conversation_id}/messages/',
                    params={'user_id': user_id},
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI get messages error: {e}')
            raise AIServiceError(str(e))

    def delete_conversation(self, conversation_id, user_id):
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.delete(
                    f'{self.base_url}/chat/conversations/{conversation_id}/',
                    params={'user_id': user_id},
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI delete conversation error: {e}')
            raise AIServiceError(str(e))

    # --- Insights ---

    def generate_insight(self, insight_type, period_days=30):
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(
                    f'{self.base_url}/insights/generate/',
                    json={'insight_type': insight_type, 'period_days': period_days},
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI insight error: {e}')
            raise AIServiceError(str(e))

    def quick_insights(self):
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(
                    f'{self.base_url}/insights/quick/',
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI quick insights error: {e}')
            raise AIServiceError(str(e))

    # --- Documents ---

    def process_document(self, file_path, file_name, file_type, user_id):
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(
                    f'{self.base_url}/documents/process/',
                    json={
                        'file_path': file_path,
                        'file_name': file_name,
                        'file_type': file_type,
                        'user_id': user_id,
                    },
                    headers=self._headers(),
                )
                return self._handle_response(resp)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise AIServiceUnavailable('AI service is not responding')
        except (AIServiceUnavailable, AIServiceError):
            raise
        except Exception as e:
            logger.error(f'AI document processing error: {e}')
            raise AIServiceError(str(e))


ai_client = AIServiceClient()

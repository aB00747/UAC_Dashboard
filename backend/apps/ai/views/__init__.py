from .health import ai_health_view
from .chat import ai_chat_view, ai_conversations_view, ai_conversation_messages_view, ai_conversation_delete_view
from .insights import ai_insight_view, ai_quick_insights_view
from .documents import ai_process_document_view

__all__ = [
    'ai_health_view',
    'ai_chat_view',
    'ai_conversations_view',
    'ai_conversation_messages_view',
    'ai_conversation_delete_view',
    'ai_insight_view',
    'ai_quick_insights_view',
    'ai_process_document_view',
]

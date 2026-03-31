from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.ai_health_view, name='ai_health'),
    path('chat/', views.ai_chat_view, name='ai_chat'),
    path('conversations/', views.ai_conversations_view, name='ai_conversations'),
    path('conversations/<str:conversation_id>/messages/', views.ai_conversation_messages_view, name='ai_conversation_messages'),
    path('conversations/<str:conversation_id>/', views.ai_conversation_delete_view, name='ai_conversation_delete'),
    path('insights/generate/', views.ai_insight_view, name='ai_insight'),
    path('insights/quick/', views.ai_quick_insights_view, name='ai_quick_insights'),
    path('documents/process/', views.ai_process_document_view, name='ai_process_document'),
]

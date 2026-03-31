import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..services import ai_client, AIServiceUnavailable, AIServiceError
from ..serializers import ChatRequestSerializer

logger = logging.getLogger(__name__)

AI_UNAVAILABLE = {'detail': 'AI service is not available. Please try again later.'}
AI_ERROR = {'detail': 'An error occurred while processing your request.'}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat_view(request):
    serializer = ChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        data = ai_client.chat(
            message=serializer.validated_data['message'],
            user_id=request.user.id,
            conversation_id=serializer.validated_data.get('conversation_id'),
            context_type=serializer.validated_data.get('context_type', 'general'),
        )
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI chat error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_conversations_view(request):
    try:
        data = ai_client.list_conversations(request.user.id)
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI list conversations error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_conversation_messages_view(request, conversation_id):
    try:
        data = ai_client.get_conversation_messages(conversation_id, user_id=request.user.id)
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI get messages error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def ai_conversation_delete_view(request, conversation_id):
    try:
        data = ai_client.delete_conversation(conversation_id, user_id=request.user.id)
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI delete conversation error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)

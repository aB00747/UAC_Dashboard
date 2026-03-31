import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..services import ai_client, AIServiceUnavailable, AIServiceError
from ..serializers import DocumentProcessSerializer

logger = logging.getLogger(__name__)

AI_UNAVAILABLE = {'detail': 'AI service is not available. Please try again later.'}
AI_ERROR = {'detail': 'An error occurred while processing your request.'}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_process_document_view(request):
    serializer = DocumentProcessSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        data = ai_client.process_document(
            file_path=serializer.validated_data['file_path'],
            file_name=serializer.validated_data['file_name'],
            file_type=serializer.validated_data['file_type'],
            user_id=request.user.id,
        )
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI document processing error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)

import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..services import ai_client, AIServiceUnavailable, AIServiceError
from ..serializers import InsightRequestSerializer

logger = logging.getLogger(__name__)

AI_UNAVAILABLE = {'detail': 'AI service is not available. Please try again later.'}
AI_ERROR = {'detail': 'An error occurred while processing your request.'}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_insight_view(request):
    serializer = InsightRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        data = ai_client.generate_insight(
            insight_type=serializer.validated_data['insight_type'],
            period_days=serializer.validated_data.get('period_days', 30),
        )
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI insight error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_quick_insights_view(request):
    try:
        data = ai_client.quick_insights()
        return Response(data)
    except AIServiceUnavailable:
        return Response(AI_UNAVAILABLE, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except AIServiceError as e:
        logger.error('AI quick insights error surfaced to view: %s', e)
        return Response(AI_ERROR, status=status.HTTP_502_BAD_GATEWAY)

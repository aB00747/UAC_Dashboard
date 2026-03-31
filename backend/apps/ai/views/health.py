from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..services import ai_client, AIServiceUnavailable


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_health_view(request):
    try:
        data = ai_client.health_check()
        return Response(data)
    except AIServiceUnavailable:
        return Response(
            {'status': 'offline', 'detail': 'AI service is not available'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

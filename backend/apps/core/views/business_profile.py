from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from ..models import BusinessProfile
from ..serializers import BusinessProfileSerializer


class BusinessProfileView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        from apps.accounts.permissions import IsAdminOrAbove
        return [IsAdminOrAbove()]

    def get(self, request):
        instance = BusinessProfile.get_or_none()
        if instance is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = BusinessProfileSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = BusinessProfile.get_or_create_instance()
        serializer = BusinessProfileSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

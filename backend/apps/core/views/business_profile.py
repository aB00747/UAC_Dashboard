from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import BusinessProfile
from ..serializers import BusinessProfileSerializer


class BusinessProfileView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        from apps.accounts.permissions import IsAdminOrAbove
        return [IsAdminOrAbove()]

    def get(self, request):
        instance = BusinessProfile.get_instance()
        serializer = BusinessProfileSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = BusinessProfile.get_instance()
        serializer = BusinessProfileSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

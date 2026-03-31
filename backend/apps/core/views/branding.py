from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import BrandingSetting
from ..serializers import BrandingSettingSerializer


class BrandingSettingView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        from apps.accounts.permissions import IsAdminOrAbove
        return [IsAdminOrAbove()]

    def get(self, request):
        instance = BrandingSetting.get_instance()
        serializer = BrandingSettingSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        instance = BrandingSetting.get_instance()
        serializer = BrandingSettingSerializer(instance, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

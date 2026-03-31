from rest_framework import viewsets
from ..models import Setting
from ..serializers import SettingSerializer


class SettingViewSet(viewsets.ModelViewSet):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    lookup_field = 'key'
    pagination_class = None

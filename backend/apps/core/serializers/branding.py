from rest_framework import serializers
from ..models import BrandingSetting


class BrandingSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()

    class Meta:
        model = BrandingSetting
        fields = ['system_name', 'logo', 'favicon', 'logo_url', 'favicon_url', 'updated_at']
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'favicon': {'write_only': True, 'required': False},
        }

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
        return ''

    def get_favicon_url(self, obj):
        if obj.favicon:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.favicon.url)
        return ''

from rest_framework import serializers
from ..models import BrandingSetting

ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 'image/png', 'image/webp',
    'image/gif', 'image/svg+xml',
}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_image_file(file):
    if file is None:
        return file
    mime = getattr(file, 'content_type', '')
    if mime not in ALLOWED_IMAGE_TYPES:
        raise serializers.ValidationError(
            f'Unsupported file type "{mime}". Allowed: JPEG, PNG, WebP, GIF, SVG.'
        )
    if file.size > MAX_IMAGE_SIZE:
        raise serializers.ValidationError('File too large. Maximum size is 5 MB.')
    return file


class BrandingSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    login_bg_url = serializers.SerializerMethodField()

    class Meta:
        model = BrandingSetting
        fields = [
            'system_name', 'logo', 'favicon', 'login_bg',
            'logo_url', 'favicon_url', 'login_bg_url',
            'primary_color', 'secondary_color', 'dark_mode_default',
            'updated_at',
        ]
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'favicon': {'write_only': True, 'required': False},
            'login_bg': {'write_only': True, 'required': False},
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

    def get_login_bg_url(self, obj):
        if obj.login_bg:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.login_bg.url)
        return ''

    def validate_logo(self, value):
        return validate_image_file(value)

    def validate_favicon(self, value):
        return validate_image_file(value)

    def validate_login_bg(self, value):
        return validate_image_file(value)

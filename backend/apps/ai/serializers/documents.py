from rest_framework import serializers


class DocumentProcessSerializer(serializers.Serializer):
    file_path = serializers.CharField()
    file_name = serializers.CharField(max_length=255)
    file_type = serializers.ChoiceField(choices=['pdf', 'docx', 'xlsx', 'csv', 'txt'])

    def validate_file_path(self, value):
        import os
        from django.conf import settings
        media_root = str(getattr(settings, 'MEDIA_ROOT', ''))
        if not media_root:
            raise serializers.ValidationError('File storage is not configured.')
        resolved = os.path.realpath(os.path.join(media_root, value))
        if not resolved.startswith(os.path.realpath(media_root)):
            raise serializers.ValidationError('Invalid file path.')
        return resolved

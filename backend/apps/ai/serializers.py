from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    conversation_id = serializers.CharField(required=False, allow_null=True)
    context_type = serializers.ChoiceField(
        choices=['general', 'sales', 'inventory', 'customers', 'orders'],
        default='general',
    )


class InsightRequestSerializer(serializers.Serializer):
    insight_type = serializers.ChoiceField(
        choices=['sales_trend', 'inventory_health', 'customer_analysis', 'revenue_summary', 'anomaly_detection'],
    )
    period_days = serializers.IntegerField(default=30, min_value=1, max_value=365)


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

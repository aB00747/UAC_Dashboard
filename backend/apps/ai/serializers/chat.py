from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    conversation_id = serializers.CharField(required=False, allow_null=True)
    context_type = serializers.ChoiceField(
        choices=['general', 'sales', 'inventory', 'customers', 'orders'],
        default='general',
    )

from rest_framework import serializers
from ..models import Message


class MessageListSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'recipient', 'recipient_name', 'subject', 'is_read', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender']

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()[:10]
            return MessageListSerializer(replies, many=True).data
        return []

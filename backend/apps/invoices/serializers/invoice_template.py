from rest_framework import serializers
from ..models import InvoiceTemplate


class InvoiceTemplateListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model  = InvoiceTemplate
        fields = ['id', 'name', 'description', 'thumbnail', 'is_default',
                  'created_by_name', 'created_at', 'updated_at']


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InvoiceTemplate
        fields = ['id', 'name', 'description', 'schema', 'thumbnail',
                  'is_default', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

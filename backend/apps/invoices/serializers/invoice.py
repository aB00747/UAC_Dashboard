from rest_framework import serializers
from ..models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    company_profile_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_company_profile_name(self, obj):
        return obj.company_profile.name if obj.company_profile else None

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        return obj.created_by.get_full_name() or obj.created_by.username


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the history list view."""
    company_profile_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_date', 'invoice_type',
            'buyer_name', 'grand_total', 'status',
            'company_profile', 'company_profile_name', 'created_at',
        ]

    def get_company_profile_name(self, obj):
        return obj.company_profile.name if obj.company_profile else None

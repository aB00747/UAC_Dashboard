from rest_framework import serializers
from ..models import BusinessProfile


class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = [
            'name', 'address', 'email', 'phone', 'website',
            'gstin', 'pan', 'state', 'state_code',
            'bank_name', 'account_no', 'ifsc_code',
            'currency', 'timezone', 'language', 'date_format',
            'logo_base64', 'updated_at',
        ]

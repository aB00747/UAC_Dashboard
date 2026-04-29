import re
from rest_framework import serializers
from ..models import BusinessProfile

# Max ~750 KB for the base64 string (≈ 500 KB image)
LOGO_BASE64_MAX_LEN = 750_000

GSTIN_RE = re.compile(r'^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$')
PAN_RE = re.compile(r'^[A-Z]{5}\d{4}[A-Z]$')
IFSC_RE = re.compile(r'^[A-Z]{4}0[A-Z0-9]{6}$')
PHONE_RE = re.compile(r'^\+?[\d\s\-\(\)]{7,20}$')
ACCOUNT_NO_RE = re.compile(r'^\d{9,18}$')
STATE_CODE_RE = re.compile(r'^\d{1,2}$')


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
        read_only_fields = ['updated_at']
        extra_kwargs = {
            'name': {'required': True},
        }

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Company name is required.')
        if len(value) < 2:
            raise serializers.ValidationError('Company name must be at least 2 characters.')
        return value

    def validate_gstin(self, value):
        value = value.strip().upper()
        if value and not GSTIN_RE.match(value):
            raise serializers.ValidationError(
                'Invalid GSTIN format. Expected: 22AAAAA0000A1Z5'
            )
        return value

    def validate_pan(self, value):
        value = value.strip().upper()
        if value and not PAN_RE.match(value):
            raise serializers.ValidationError(
                'Invalid PAN format. Expected: ABCDE1234F'
            )
        return value

    def validate_ifsc_code(self, value):
        value = value.strip().upper()
        if value and not IFSC_RE.match(value):
            raise serializers.ValidationError(
                'Invalid IFSC format. Expected: SBIN0001234'
            )
        return value

    def validate_phone(self, value):
        value = value.strip()
        if value and not PHONE_RE.match(value):
            raise serializers.ValidationError(
                'Invalid phone number. Use digits, spaces, +, -, or parentheses (7–20 chars).'
            )
        return value

    def validate_account_no(self, value):
        value = value.strip()
        if value and not ACCOUNT_NO_RE.match(value):
            raise serializers.ValidationError(
                'Account number must be 9–18 digits.'
            )
        return value

    def validate_state_code(self, value):
        value = value.strip()
        if value and not STATE_CODE_RE.match(value):
            raise serializers.ValidationError(
                'State code must be a 1–2 digit number (e.g. 27).'
            )
        return value

    def validate_logo_base64(self, value):
        if value and len(value) > LOGO_BASE64_MAX_LEN:
            raise serializers.ValidationError(
                'Logo image is too large. Maximum size is 500 KB.'
            )
        if value and not value.startswith('data:image/'):
            raise serializers.ValidationError(
                'Logo must be a valid base64 image (data:image/...).'
            )
        return value

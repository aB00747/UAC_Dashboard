from rest_framework import serializers
from ..models import Financial

class FinancialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financial
        exclude = ['customer']

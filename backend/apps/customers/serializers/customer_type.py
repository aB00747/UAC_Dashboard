from rest_framework import serializers
from ..models import CustomerType


class CustomerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerType
        fields = ['id', 'name']

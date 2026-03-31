from rest_framework import serializers
from ..models import OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    chemical_name = serializers.CharField(source='chemical.chemical_name', read_only=True)
    class Meta:
        model = OrderItem
        fields = '__all__'

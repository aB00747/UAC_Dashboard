from rest_framework import serializers
from ..models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    class Meta:
        model = Delivery
        fields = '__all__'

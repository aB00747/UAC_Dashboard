from rest_framework import serializers
from ..models import Order, OrderItem
from .order_item import OrderItemSerializer


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default='')
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_number']

class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer', 'customer_name', 'order_date', 'status', 'total_amount', 'payment_status', 'items_count', 'created_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    class Meta:
        model = Order
        fields = ['customer', 'order_date', 'expected_delivery_date', 'status', 'payment_status', 'notes', 'discount_amount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        order = Order.objects.create(**validated_data)
        total = 0
        tax = 0
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            total += item.total_price
            # Calculate tax from chemical's GST percentage
            gst = item.chemical.gst_percentage if item.chemical else 0
            tax += item.total_price * gst / 100
        order.total_amount = total + tax - order.discount_amount
        order.tax_amount = tax
        order.save()
        return order

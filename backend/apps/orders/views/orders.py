from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Order, OrderItem
from ..serializers import OrderSerializer, OrderListSerializer, OrderCreateSerializer, OrderItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer', 'created_by').all()
    search_fields = ['order_number', 'customer__first_name', 'customer__last_name']
    filterset_fields = ['status', 'payment_status', 'customer']
    ordering_fields = ['order_date', 'total_amount', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        return OrderItem.objects.filter(order_id=self.kwargs.get('order_pk'))

from rest_framework import viewsets
from ..models import Delivery
from ..serializers import DeliverySerializer

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.select_related('order').all()
    serializer_class = DeliverySerializer
    search_fields = ['tracking_number', 'driver_name', 'vehicle_number']
    filterset_fields = ['status', 'order']
    ordering_fields = ['delivery_date', 'created_at']

from rest_framework import serializers
from ..models import StockEntry


class StockEntrySerializer(serializers.ModelSerializer):
    chemical_name = serializers.CharField(source='chemical.chemical_name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True, default='')
    class Meta:
        model = StockEntry
        fields = '__all__'

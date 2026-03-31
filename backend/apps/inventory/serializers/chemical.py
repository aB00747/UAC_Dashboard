from rest_framework import serializers
from ..models import Chemical


class ChemicalSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    is_low_stock = serializers.ReadOnlyField()
    class Meta:
        model = Chemical
        fields = '__all__'

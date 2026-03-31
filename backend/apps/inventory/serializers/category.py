from rest_framework import serializers
from ..models import Category


class CategorySerializer(serializers.ModelSerializer):
    chemicals_count = serializers.IntegerField(source='chemicals.count', read_only=True)
    class Meta:
        model = Category
        fields = '__all__'

from rest_framework import viewsets
from ..models import Category, Chemical, Vendor, StockEntry
from ..serializers import CategorySerializer, ChemicalSerializer, VendorSerializer, StockEntrySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ['name']
    pagination_class = None

class ChemicalViewSet(viewsets.ModelViewSet):
    queryset = Chemical.objects.select_related('category').all()
    serializer_class = ChemicalSerializer
    search_fields = ['chemical_name', 'chemical_code']
    filterset_fields = ['category']
    ordering_fields = ['chemical_name', 'quantity', 'selling_price', 'created_at']

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    search_fields = ['vendor_name', 'contact_person', 'phone']

class StockEntryViewSet(viewsets.ModelViewSet):
    queryset = StockEntry.objects.select_related('chemical', 'vendor').all()
    serializer_class = StockEntrySerializer
    filterset_fields = ['chemical', 'entry_type', 'vendor']
    ordering_fields = ['created_at', 'quantity']

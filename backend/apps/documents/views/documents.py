from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import Document
from ..serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related('uploaded_by').all()
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]
    search_fields = ['title', 'description']
    filterset_fields = ['category']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import InvoiceTemplate
from ..serializers import InvoiceTemplateSerializer, InvoiceTemplateListSerializer


class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    queryset = InvoiceTemplate.objects.select_related('created_by').all()
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'updated_at', 'created_at']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceTemplateListSerializer
        return InvoiceTemplateSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        original = self.get_object()
        clone = InvoiceTemplate.objects.create(
            name=f'{original.name} (copy)',
            description=original.description,
            schema=original.schema,
            thumbnail=original.thumbnail,
            is_default=False,
            created_by=request.user,
        )
        return Response(InvoiceTemplateSerializer(clone).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
        template = self.get_object()
        template.is_default = True
        template.save(update_fields=['is_default'])
        return Response({'status': 'default set'})

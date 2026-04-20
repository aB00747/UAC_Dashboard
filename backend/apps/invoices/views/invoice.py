import re
from datetime import date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.audit.mixins import AuditLogMixin
from ..models import Invoice
from ..serializers import InvoiceSerializer, InvoiceListSerializer


class InvoiceViewSet(AuditLogMixin, viewsets.ModelViewSet):
    audit_module = 'invoices'
    queryset = Invoice.objects.select_related('company_profile', 'created_by').all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['invoice_type', 'status', 'company_profile']
    search_fields = ['invoice_number', 'buyer_name']
    ordering_fields = ['invoice_date', 'grand_total', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    def perform_create(self, serializer):
        # Save with created_by, then log manually (bypasses mixin's super() call
        # so we can pass the extra kwarg without double-saving).
        instance = serializer.save(created_by=self.request.user)
        self._log('created', instance)

    @action(detail=False, methods=['get'], url_path='next-number')
    def next_number(self, request):
        """Return the next auto-incremented invoice number for the current FY."""
        today = date.today()
        fy_start = today.year if today.month >= 4 else today.year - 1
        fy_end = fy_start + 1
        fy = f'{str(fy_start)[-2:]}-{str(fy_end)[-2:]}'

        last = (
            Invoice.objects
            .filter(invoice_number__endswith=f'/{fy}')
            .order_by('-created_at')
            .first()
        )

        if last:
            m = re.match(r'^(\d+)/', last.invoice_number)
            seq = int(m.group(1)) + 1 if m else 1
        else:
            seq = 1

        return Response({'next_number': f'{seq}/{fy}', 'financial_year': fy})

    @action(detail=True, methods=['post'], url_path='finalise')
    def finalise(self, request, pk=None):
        """Mark a draft invoice as final (triggered by download/print)."""
        invoice = self.get_object()
        if invoice.status != 'final':
            invoice.status = 'final'
            invoice.save(update_fields=['status'])
            self._log('finalised', invoice)
        return Response(InvoiceSerializer(invoice).data)

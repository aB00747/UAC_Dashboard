from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Read-only, filterable audit log endpoint."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['module', 'action', 'user']
    search_fields = ['action', 'object_repr']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        qs = AuditLog.objects.select_related('user').all()
        module = self.request.query_params.get('module')
        if module:
            qs = qs.filter(module=module)
        from_dt = self.request.query_params.get('from')
        to_dt = self.request.query_params.get('to')
        if from_dt:
            qs = qs.filter(timestamp__gte=from_dt)
        if to_dt:
            qs = qs.filter(timestamp__lte=to_dt)
        return qs

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.audit.mixins import AuditLogMixin
from ..models import CompanyProfile
from ..serializers import CompanyProfileSerializer


class CompanyProfileViewSet(AuditLogMixin, viewsets.ModelViewSet):
    audit_module = 'invoices'
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None   # return all profiles without pagination

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        self._log('created', instance)

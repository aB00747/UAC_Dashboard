from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from ..models import Role
from ..serializers import RoleSerializer, UserManagementSerializer
from ..permissions import IsAdminOrAbove

User = get_user_model()


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class UserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminOrAbove]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role__name', 'is_active']

    def get_queryset(self):
        qs = User.objects.select_related('role').all().order_by('-date_joined')
        if self.request.user.role and self.request.user.role.name == 'admin':
            qs = qs.filter(role__level__lt=3)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return qs

    def perform_destroy(self, instance):
        if self.request.user.role_level <= instance.role_level:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You cannot delete a user with an equal or higher role.')
        instance.delete()

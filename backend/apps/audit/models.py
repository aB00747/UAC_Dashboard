from django.db import models
from django.conf import settings
from .utils import get_client_ip


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=100)       # e.g. "invoice.created"
    module = models.CharField(max_length=50)        # e.g. "invoices", "customers"
    object_id = models.CharField(max_length=100, blank=True, default='')
    object_repr = models.CharField(max_length=255, blank=True, default='')
    extra_data = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['module']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f'[{self.module}] {self.action} — {self.object_repr}'

    @classmethod
    def log(cls, user, action, module, object_repr='', object_id='', request=None, extra=None):
        """Convenience classmethod for logging outside of ViewSets (e.g. signals)."""
        return cls.objects.create(
            user=user if user and getattr(user, 'is_authenticated', False) else None,
            action=action,
            module=module,
            object_id=str(object_id),
            object_repr=str(object_repr)[:255],
            extra_data=extra,
            ip_address=get_client_ip(request),
        )

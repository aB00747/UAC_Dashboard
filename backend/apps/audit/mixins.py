import json
from datetime import date, datetime
from decimal import Decimal
from django.forms.models import model_to_dict


class AuditLogMixin:
    """
    Add to any ModelViewSet to auto-log create/update/delete actions.
    Set audit_module = 'modulename' on the ViewSet, or it falls back to
    the queryset model's app_label (e.g. 'invoices', 'customers').
    """
    audit_module = None

    def get_audit_module(self):
        if self.audit_module:
            return self.audit_module
        qs = getattr(self, 'queryset', None)
        if qs is not None:
            return qs.model._meta.app_label
        return self.__class__.__name__.lower().replace('viewset', '')

    # ------------------------------------------------------------------ #
    # Override perform_* — each calls super() first so existing overrides  #
    # (e.g. perform_create that sets created_by) still run.  ViewSets that #
    # pass extra kwargs to serializer.save() should call self._log()       #
    # themselves after saving rather than calling super().                 #
    # ------------------------------------------------------------------ #

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self._log('created', serializer.instance)

    def perform_update(self, serializer):
        before = self._safe_dict(serializer.instance)
        super().perform_update(serializer)
        self._log('updated', serializer.instance, extra={'before': before})

    def perform_destroy(self, instance):
        before = self._safe_dict(instance)
        self._log('deleted', instance, extra={'before': before})
        super().perform_destroy(instance)

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    def _log(self, action, instance, extra=None):
        from apps.audit.models import AuditLog
        user = getattr(self.request, 'user', None)
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=f'{self.get_audit_module()}.{action}',
            module=self.get_audit_module(),
            object_id=str(getattr(instance, 'pk', '')),
            object_repr=str(instance)[:255],
            extra_data=extra,
            ip_address=self._get_client_ip(),
        )

    def _get_client_ip(self):
        xff = self.request.META.get('HTTP_X_FORWARDED_FOR')
        return xff.split(',')[0].strip() if xff else self.request.META.get('REMOTE_ADDR')

    def _safe_dict(self, instance):
        try:
            raw = model_to_dict(instance)
            return json.loads(json.dumps(raw, default=self._json_default))
        except Exception:
            return {}

    @staticmethod
    def _json_default(obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return str(obj)
        return str(obj)

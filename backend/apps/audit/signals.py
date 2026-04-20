from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from .utils import get_client_ip


@receiver(user_logged_in)
def on_login(sender, request, user, **kwargs):
    from .models import AuditLog
    AuditLog.log(
        user=user,
        action='auth.login',
        module='auth',
        object_repr=str(user),
        object_id=str(user.pk),
        request=request,
    )


@receiver(user_logged_out)
def on_logout(sender, request, user, **kwargs):
    from .models import AuditLog
    AuditLog.log(
        user=user,
        action='auth.logout',
        module='auth',
        object_repr=str(user) if user else 'Unknown',
        object_id=str(user.pk) if user else '',
        request=request,
    )


@receiver(user_login_failed)
def on_login_failed(sender, credentials, request, **kwargs):
    from .models import AuditLog
    AuditLog.log(
        user=None,
        action='auth.login_failed',
        module='auth',
        object_repr=credentials.get('username', 'Unknown'),
        request=request,
    )

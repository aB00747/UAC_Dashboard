from django.db import models
from django.conf import settings


class InvoiceTemplate(models.Model):
    name        = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, default='')
    schema      = models.JSONField(default=dict)   # full canvas JSON
    thumbnail   = models.TextField(blank=True, default='')  # base64 dataURL
    is_default  = models.BooleanField(default=False)
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='invoice_templates',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_templates'
        ordering = ['-updated_at']

    def __str__(self):
        return self.name
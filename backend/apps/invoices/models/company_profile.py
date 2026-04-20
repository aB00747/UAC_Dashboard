from django.db import models
from django.conf import settings


class CompanyProfile(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    gstin = models.CharField(max_length=15)
    pan = models.CharField(max_length=10)
    state = models.CharField(max_length=100)
    state_code = models.CharField(max_length=2)
    email = models.EmailField(blank=True, default='')
    bank_name = models.CharField(max_length=255, blank=True, default='')
    account_no = models.CharField(max_length=50, blank=True, default='')
    ifsc_code = models.CharField(max_length=20, blank=True, default='')
    logo_base64 = models.TextField(blank=True, default='')
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_profiles',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_profiles'
        ordering = ['-is_default', 'name']

    def __str__(self):
        return self.name

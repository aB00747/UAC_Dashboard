from django.db import models


class BrandingSetting(models.Model):
    DARK_MODE_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]

    system_name = models.CharField(max_length=255, default='Vardhan ERP')
    logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    favicon = models.ImageField(upload_to='branding/', blank=True, null=True)
    login_bg = models.ImageField(upload_to='branding/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#6366f1')
    secondary_color = models.CharField(max_length=7, default='#10b981')
    dark_mode_default = models.CharField(
        max_length=10, choices=DARK_MODE_CHOICES, default='system'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'branding_settings'
        verbose_name = 'Branding Setting'
        verbose_name_plural = 'Branding Settings'

    def __str__(self):
        return self.system_name

    @classmethod
    def get_instance(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance

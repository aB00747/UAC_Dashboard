from django.db import models


class BrandingSetting(models.Model):
    system_name = models.CharField(max_length=255, default='Umiya Chemical Dashboard')
    logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    favicon = models.ImageField(upload_to='branding/', blank=True, null=True)
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

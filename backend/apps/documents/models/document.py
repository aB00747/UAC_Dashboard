from django.db import models
from django.conf import settings


class Document(models.Model):
    CATEGORY_CHOICES = [
        ('invoice', 'Invoice'),
        ('report', 'Report'),
        ('certificate', 'Certificate'),
        ('contract', 'Contract'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='documents')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

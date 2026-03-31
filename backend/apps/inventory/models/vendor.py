from django.db import models


class Vendor(models.Model):
    vendor_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=15, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    gstin = models.CharField(max_length=15, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendors'
        ordering = ['vendor_name']

    def __str__(self):
        return self.vendor_name

from django.db import models
from .customer_type import CustomerType


class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, default='')
    company_name = models.CharField(max_length=200, blank=True, default='')
    address_line1 = models.CharField(max_length=255, blank=True, default='')
    address_line2 = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    state_code = models.CharField(max_length=10, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    country_code = models.CharField(max_length=5, blank=True, default='')
    pin_code = models.CharField(max_length=10, blank=True, default='')
    phone = models.CharField(max_length=15, blank=True, default='')
    alternate_phone = models.CharField(max_length=15, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    gstin = models.CharField(max_length=15, blank=True, default='')
    pan = models.CharField(max_length=10, blank=True, default='')
    customer_type = models.ForeignKey(
        CustomerType, null=True, blank=True, on_delete=models.SET_NULL, related_name='customers'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'
        ordering = ['-created_at']

    def __str__(self):
        return self.full_name

    @property
    def full_name(self):
        parts = [self.first_name, self.last_name]
        return ' '.join(p for p in parts if p)

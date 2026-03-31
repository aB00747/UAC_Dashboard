from django.db import models
from .chemical import Chemical
from .vendor import Vendor


class StockEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('adjustment', 'Adjustment'),
    ]

    chemical = models.ForeignKey(Chemical, on_delete=models.CASCADE, related_name='stock_entries')
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_entries')
    reference_note = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stock_entries'
        ordering = ['-created_at']
        verbose_name_plural = 'stock entries'

    def __str__(self):
        return f"{self.entry_type} - {self.chemical} - {self.quantity}"

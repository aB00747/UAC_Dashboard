from django.db import models
from .category import Category


class Chemical(models.Model):
    chemical_name = models.CharField(max_length=200)
    chemical_code = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='chemicals')
    description = models.TextField(blank=True, default='')
    unit = models.CharField(max_length=20, default='KG')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chemicals'
        ordering = ['chemical_name']

    def __str__(self):
        return f"{self.chemical_name} ({self.chemical_code})"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_quantity

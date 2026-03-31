from django.db import models
from .order import Order


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    chemical = models.ForeignKey('inventory.Chemical', on_delete=models.CASCADE, related_name='order_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    specifications = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.order} - {self.chemical}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

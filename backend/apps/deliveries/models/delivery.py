from django.db import models


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]

    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='deliveries')
    delivery_date = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, default='')
    vehicle_number = models.CharField(max_length=20, blank=True, default='')
    driver_name = models.CharField(max_length=100, blank=True, default='')
    driver_phone = models.CharField(max_length=15, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tracking_number = models.CharField(max_length=50, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deliveries'
        ordering = ['-created_at']
        verbose_name_plural = 'deliveries'

    def __str__(self):
        return f"Delivery for {self.order}"

from django.db import models
from .customer import Customer
from decimal import Decimal


class Financial(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]
    PRICE_TIER_CHOICES = [
        ('standard', 'Standard'),
        ('wholesale', 'Wholesale'),
        ('premium', 'Premium'),
        ('vip', 'VIP'),
    ]
    CREDIT_STATUS_CHOICES = [
        ('good', 'Good'),
        ('warning', 'Warning'),
        ('blocked', 'Blocked'),
        ('review', 'Review'),
    ]
    PAYMENT_BEHAVIOR_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('average', 'Average'),
        ('poor', 'Poor'),
    ]

    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='financial')
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    available_credit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    used_credit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    outstanding_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    overdue_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    payment_terms_days = models.IntegerField(default=30)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    ytd_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    last_year_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    average_order_value = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_orders = models.IntegerField(default=0)
    ytd_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    pending_orders = models.IntegerField(default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    price_tier = models.CharField(max_length=20, choices=PRICE_TIER_CHOICES, default='standard')
    last_payment_date = models.DateField(null=True, blank=True)
    last_order_date = models.DateField(null=True, blank=True)
    first_order_date = models.DateField(null=True, blank=True)
    credit_status = models.CharField(max_length=20, choices=CREDIT_STATUS_CHOICES, default='good')
    payment_behavior = models.CharField(max_length=20, choices=PAYMENT_BEHAVIOR_CHOICES, default='good')
    days_since_last_payment = models.IntegerField(default=0)
    gst_amount_collected = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    tds_amount_deducted = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    bank_name = models.CharField(max_length=100, blank=True, default='')
    account_number = models.CharField(max_length=50, blank=True, default='')
    ifsc_code = models.CharField(max_length=20, blank=True, default='')
    branch_name = models.CharField(max_length=100, blank=True, default='')
    financial_notes = models.TextField(blank=True, default='')
    credit_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'financials'

    def __str__(self):
        return f"Financial - {self.customer}"

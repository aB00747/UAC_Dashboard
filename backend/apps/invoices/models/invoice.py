from django.db import models
from decimal import Decimal
from django.conf import settings


class Invoice(models.Model):
    INVOICE_TYPE_CHOICES = [
        ('gst_einvoice', 'GST E-Invoice'),
        ('challan', 'Challan Cum Invoice'),
        ('gst_logo', 'GST Invoice with Logo'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('final', 'Final'),
    ]

    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE_CHOICES)
    invoice_number = models.CharField(max_length=50)
    invoice_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    company_profile = models.ForeignKey(
        'invoices.CompanyProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
    )

    buyer_name = models.CharField(max_length=255)
    buyer_address = models.TextField(blank=True, default='')
    buyer_gstin = models.CharField(max_length=15, blank=True, default='')
    buyer_state = models.CharField(max_length=100, blank=True, default='')
    buyer_state_code = models.CharField(max_length=2, blank=True, default='')

    vehicle_no = models.CharField(max_length=20, blank=True, default='')
    buyer_order_no = models.CharField(max_length=50, blank=True, default='')
    delivery_note_no = models.CharField(max_length=50, blank=True, default='')

    # e-Invoice placeholders (nullable until user fills from portal)
    irn = models.CharField(max_length=100, blank=True, default='')
    ack_no = models.CharField(max_length=50, blank=True, default='')
    ack_date = models.DateField(null=True, blank=True)

    line_items = models.JSONField(default=list)   # [{description, hsn, qty, unit, rate, amount}]

    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('2.5'))
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('2.5'))
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0'))

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    cgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    sgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    igst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_invoices',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.invoice_number} — {self.buyer_name}'

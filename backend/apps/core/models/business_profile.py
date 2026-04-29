from django.db import models


class BusinessProfile(models.Model):
    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee'), ('USD', 'US Dollar'),
        ('EUR', 'Euro'), ('GBP', 'British Pound'), ('AED', 'UAE Dirham'),
    ]
    LANGUAGE_CHOICES = [('en', 'English'), ('hi', 'Hindi')]
    DATE_FORMAT_CHOICES = [
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
    ]

    name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    gstin = models.CharField(max_length=15, blank=True)
    pan = models.CharField(max_length=10, blank=True)
    state = models.CharField(max_length=100, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_no = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='INR')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    date_format = models.CharField(
        max_length=12, choices=DATE_FORMAT_CHOICES, default='DD/MM/YYYY'
    )
    logo_base64 = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_profile'
        verbose_name = 'Business Profile'

    def __str__(self):
        return self.name or 'Business Profile'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_or_none(cls):
        """Return existing profile or None — does NOT auto-create a blank row."""
        return cls.objects.filter(pk=1).first()

    @classmethod
    def get_or_create_instance(cls):
        """Use only on PUT/save — creates the row if it doesn't exist yet."""
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance

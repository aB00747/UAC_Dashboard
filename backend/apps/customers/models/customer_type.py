from django.db import models


class CustomerType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'customer_types'
        ordering = ['name']

    def __str__(self):
        return self.name

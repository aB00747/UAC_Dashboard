from django.db import models


class Country(models.Model):
    country_code = models.CharField(max_length=5, unique=True)
    country_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'countries'
        ordering = ['country_name']
        verbose_name_plural = 'countries'

    def __str__(self):
        return self.country_name


class State(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='states')
    alpha_code = models.CharField(max_length=10, blank=True, default='')
    iso_code = models.CharField(max_length=10, blank=True, default='')
    state_code = models.CharField(max_length=5, blank=True, default='')
    state_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'states'
        ordering = ['state_name']

    def __str__(self):
        return self.state_name

from django.db import models


class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, default='')
    description = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'settings'

    def __str__(self):
        return self.key

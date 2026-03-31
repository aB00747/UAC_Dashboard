from django.db import models


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    level = models.IntegerField(default=0)

    class Meta:
        db_table = 'roles'
        ordering = ['-level']

    def __str__(self):
        return self.label

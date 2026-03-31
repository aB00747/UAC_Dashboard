from django.contrib.auth.models import AbstractUser
from django.db import models

from .role import Role


class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, default='')
    address = models.TextField(blank=True, default='')
    role = models.ForeignKey(
        Role, null=True, on_delete=models.SET_NULL, related_name='users'
    )

    @property
    def role_level(self):
        return self.role.level if self.role else 0

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.get_full_name() or self.username

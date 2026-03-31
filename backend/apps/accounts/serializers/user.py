from rest_framework import serializers
from django.contrib.auth import get_user_model
from .role import RoleSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'address', 'role']
        read_only_fields = ['id', 'username']

from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Role
from .role import RoleSerializer

User = get_user_model()


class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    role_detail = RoleSerializer(source='role', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'role_detail', 'is_active', 'date_joined', 'password'
        ]
        read_only_fields = ['id', 'date_joined']

    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.user.role_level <= value.level:
            raise serializers.ValidationError('You cannot assign a role equal to or above your own.')
        return value

    def validate(self, data):
        if not self.instance and 'password' not in data:
            raise serializers.ValidationError({'password': 'Password is required when creating a user.'})
        if self.instance:
            request = self.context.get('request')
            if request and request.user.role_level <= self.instance.role_level:
                raise serializers.ValidationError('You cannot edit a user with an equal or higher role.')
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

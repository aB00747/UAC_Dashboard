from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Role

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirmation', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({'password_confirmation': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirmation')
        user = User.objects.create_user(**validated_data)
        staff_role = Role.objects.filter(name='staff').first()
        if staff_role:
            user.role = staff_role
            user.save(update_fields=['role'])
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

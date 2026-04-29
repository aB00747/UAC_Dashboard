from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.accounts.models import User, Role


def make_admin():
    role, _ = Role.objects.get_or_create(name='admin')
    user = User.objects.create_user(username='admin', password='pass', role=role)
    return user


def make_regular():
    role, _ = Role.objects.get_or_create(name='staff')
    user = User.objects.create_user(username='staff', password='pass', role=role)
    return user


class BusinessProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('business-profile')

    def test_get_returns_empty_profile_when_not_set(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('name', response.data)

    def test_put_creates_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {
            'name': 'Shree Chemicals', 'gstin': '27ABCDE1234F1Z5',
            'currency': 'INR', 'timezone': 'Asia/Kolkata',
            'language': 'en', 'date_format': 'DD/MM/YYYY',
        }
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Shree Chemicals')

    def test_put_updates_existing_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        self.client.put(self.url, {'name': 'Old Name', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        response = self.client.put(self.url, {'name': 'New Name', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'New Name')

    def test_unauthenticated_get_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_staff_cannot_put(self):
        staff = make_regular()
        self.client.force_authenticate(user=staff)
        response = self.client.put(self.url, {'name': 'x', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        self.assertEqual(response.status_code, 403)

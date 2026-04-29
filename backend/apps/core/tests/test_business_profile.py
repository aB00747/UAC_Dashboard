from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.accounts.models import User, Role

VALID_PAYLOAD = {
    'name': 'Shree Chemicals Pvt. Ltd.',
    'currency': 'INR',
    'timezone': 'Asia/Kolkata',
    'language': 'en',
    'date_format': 'DD/MM/YYYY',
}


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

    # ── GET ────────────────────────────────────────────────────────────────

    def test_get_returns_404_when_profile_not_set(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 404)

    def test_get_returns_profile_after_put(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        self.client.put(self.url, VALID_PAYLOAD, format='json')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Shree Chemicals Pvt. Ltd.')

    def test_unauthenticated_get_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    # ── PUT — success ──────────────────────────────────────────────────────

    def test_put_creates_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, VALID_PAYLOAD, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Shree Chemicals Pvt. Ltd.')

    def test_put_updates_existing_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        self.client.put(self.url, VALID_PAYLOAD, format='json')
        updated = {**VALID_PAYLOAD, 'name': 'New Name'}
        response = self.client.put(self.url, updated, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'New Name')

    def test_put_with_valid_gstin(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {**VALID_PAYLOAD, 'gstin': '27AABCU9603R1ZX'}
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 200)

    def test_put_with_valid_pan(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {**VALID_PAYLOAD, 'pan': 'AABCU9603R'}
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 200)

    def test_put_with_valid_ifsc(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {**VALID_PAYLOAD, 'ifsc_code': 'SBIN0001234'}
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 200)

    # ── PUT — validation errors ────────────────────────────────────────────

    def test_put_without_name_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != 'name'}
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('name', response.data)

    def test_put_with_empty_name_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'name': '  '}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_put_with_invalid_gstin_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'gstin': 'BADINPUT'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('gstin', response.data)

    def test_put_with_invalid_pan_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'pan': '12345'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('pan', response.data)

    def test_put_with_invalid_ifsc_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'ifsc_code': 'BADINPUT'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('ifsc_code', response.data)

    def test_put_with_invalid_account_no_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'account_no': 'ABC123'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('account_no', response.data)

    def test_put_with_oversized_logo_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        big_logo = 'data:image/png;base64,' + ('A' * 800_000)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'logo_base64': big_logo}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('logo_base64', response.data)

    def test_put_with_invalid_logo_format_returns_400(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.put(self.url, {**VALID_PAYLOAD, 'logo_base64': 'not-a-valid-base64-image'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('logo_base64', response.data)

    # ── Permissions ────────────────────────────────────────────────────────

    def test_staff_cannot_put(self):
        staff = make_regular()
        self.client.force_authenticate(user=staff)
        response = self.client.put(self.url, VALID_PAYLOAD, format='json')
        self.assertEqual(response.status_code, 403)

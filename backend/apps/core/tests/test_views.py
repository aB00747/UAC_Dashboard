from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import Country, State, Notification, Setting, BrandingSetting

User = get_user_model()
_TP = 'T3stP@ss!'  # noqa: S105


def make_user(username, role=None):
    user = User.objects.create_user(username=username, password=_TP)
    if role:
        user.role = role
        user.save()
    return user


class CountryViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('country_user')
        self.client.force_authenticate(user=self.user)
        self.country = Country.objects.create(country_name='India', country_code='IN')

    def test_list(self):
        self.assertEqual(self.client.get(reverse('country-list')).status_code, status.HTTP_200_OK)

    def test_retrieve(self):
        res = self.client.get(reverse('country-detail', args=[self.country.pk]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['country_name'], 'India')

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(reverse('country-list')).status_code, status.HTTP_401_UNAUTHORIZED)


class StateViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('state_user')
        self.client.force_authenticate(user=self.user)
        self.india = Country.objects.create(country_name='India', country_code='IN')
        self.usa = Country.objects.create(country_name='USA', country_code='US')
        State.objects.create(country=self.india, state_name='Maharashtra')
        State.objects.create(country=self.india, state_name='Gujarat')
        State.objects.create(country=self.usa, state_name='California')

    def test_list_all(self):
        res = self.client.get(reverse('state-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 3)

    def test_filter_by_country(self):
        res = self.client.get(reverse('state-list'), {'country_id': self.india.pk})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)

    def test_filter_other_country(self):
        res = self.client.get(reverse('state-list'), {'country_id': self.usa.pk})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)


class NotificationViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('notif_api')
        self.other = make_user('notif_other')
        self.client.force_authenticate(user=self.user)
        self.n1 = Notification.objects.create(user=self.user, title='N1', message='M1', is_read=False)
        self.n2 = Notification.objects.create(user=self.user, title='N2', message='M2', is_read=False)
        Notification.objects.create(user=self.other, title='Other', message='Msg')

    def test_list_own_only(self):
        res = self.client.get(reverse('notification-list'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data['results'] if 'results' in res.data else res.data
        returned_ids = {n['id'] for n in results}
        self.assertIn(self.n1.pk, returned_ids)
        self.assertIn(self.n2.pk, returned_ids)
        other_notif_ids = set(
            Notification.objects.filter(user=self.other).values_list('id', flat=True)
        )
        self.assertTrue(returned_ids.isdisjoint(other_notif_ids))

    def test_mark_single_read(self):
        res = self.client.post(reverse('notification-read', args=[self.n1.pk]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.n1.refresh_from_db()
        self.assertTrue(self.n1.is_read)

    def test_mark_all_read(self):
        res = self.client.post(reverse('notification-mark-all-read'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(Notification.objects.filter(user=self.user, is_read=False).exists())

    def test_mark_all_read_does_not_affect_others(self):
        self.client.post(reverse('notification-mark-all-read'))
        self.assertTrue(Notification.objects.filter(user=self.other, is_read=False).exists())

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(reverse('notification-list')).status_code, status.HTTP_401_UNAUTHORIZED)


class SearchViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('search_api')
        self.client.force_authenticate(user=self.user)

    def test_no_query_returns_empty(self):
        res = self.client.get(reverse('search'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['results'], [])

    def test_short_query_returns_empty(self):
        res = self.client.get(reverse('search'), {'q': 'a'})
        self.assertEqual(res.data['results'], [])

    def test_whitespace_only_returns_empty(self):
        res = self.client.get(reverse('search'), {'q': '   '})
        self.assertEqual(res.data['results'], [])

    def test_finds_customers(self):
        from apps.customers.models import Customer
        Customer.objects.create(first_name='Findable', last_name='Test', email='f@t.com')
        res = self.client.get(reverse('search'), {'q': 'Findable'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('customer', [r['type'] for r in res.data['results']])

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(
            self.client.get(reverse('search'), {'q': 'test'}).status_code,
            status.HTTP_401_UNAUTHORIZED
        )


class SettingViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('setting_api')
        self.client.force_authenticate(user=self.user)

    def test_list(self):
        Setting.objects.create(key='site_name', value='Test')
        self.assertEqual(self.client.get(reverse('setting-list')).status_code, status.HTTP_200_OK)

    def test_create(self):
        res = self.client.post(reverse('setting-list'), {'key': 'new_key', 'value': 'val'})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['key'], 'new_key')

    def test_retrieve(self):
        Setting.objects.create(key='my_key', value='my_val')
        res = self.client.get(reverse('setting-detail', kwargs={'key': 'my_key'}))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['value'], 'my_val')

    def test_update(self):
        Setting.objects.create(key='upd_key', value='old')
        res = self.client.put(
            reverse('setting-detail', kwargs={'key': 'upd_key'}),
            {'key': 'upd_key', 'value': 'new'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['value'], 'new')

    def test_delete(self):
        Setting.objects.create(key='del_key', value='v')
        res = self.client.delete(reverse('setting-detail', kwargs={'key': 'del_key'}))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)


class BrandingSettingViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('brand_user')
        self.client.force_authenticate(user=self.user)

    def test_get_returns_defaults(self):
        res = self.client.get(reverse('branding'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('system_name', res.data)
        self.assertEqual(res.data['logo_url'], '')
        self.assertEqual(res.data['favicon_url'], '')

    def test_patch_without_role_is_forbidden(self):
        res = self.client.patch(reverse('branding'), {'system_name': 'New'}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_as_super_admin(self):
        from apps.accounts.models import Role
        role, _ = Role.objects.get_or_create(name='super_admin', defaults={'label': 'Super Admin', 'level': 4})
        self.user.role = role
        self.user.save()
        res = self.client.patch(reverse('branding'), {'system_name': 'Patched'}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['system_name'], 'Patched')

    def test_get_requires_auth(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(reverse('branding')).status_code, status.HTTP_401_UNAUTHORIZED)


class BrandingSettingSerializerTest(TestCase):
    def test_logo_url_empty_when_no_logo(self):
        from ..serializers import BrandingSettingSerializer
        instance = BrandingSetting.get_instance()
        s = BrandingSettingSerializer(instance, context={})
        self.assertEqual(s.data['logo_url'], '')

    def test_favicon_url_empty_when_no_favicon(self):
        from ..serializers import BrandingSettingSerializer
        instance = BrandingSetting.get_instance()
        s = BrandingSettingSerializer(instance, context={})
        self.assertEqual(s.data['favicon_url'], '')

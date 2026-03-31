from django.test import TestCase
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


class CountryModelTest(TestCase):
    def test_str(self):
        self.assertEqual(str(Country(country_name='India', country_code='IN')), 'India')


class StateModelTest(TestCase):
    def test_str(self):
        country = Country.objects.create(country_name='India', country_code='IN')
        self.assertEqual(str(State(state_name='Maharashtra', country=country)), 'Maharashtra')


class NotificationModelTest(TestCase):
    def test_str(self):
        user = make_user('nm_user')
        self.assertEqual(str(Notification(user=user, title='Alert', message='Msg')), 'Alert')


class SettingModelTest(TestCase):
    def test_str(self):
        self.assertEqual(str(Setting(key='company_name')), 'company_name')


class BrandingSettingModelTest(TestCase):
    def test_str(self):
        self.assertEqual(str(BrandingSetting(system_name='My App')), 'My App')

    def test_get_instance_creates_singleton(self):
        i1 = BrandingSetting.get_instance()
        i2 = BrandingSetting.get_instance()
        self.assertEqual(i1.pk, i2.pk)
        self.assertEqual(BrandingSetting.objects.count(), 1)

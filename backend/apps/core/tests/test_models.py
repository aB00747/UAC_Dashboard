from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
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
    def setUp(self):
        self.country = Country.objects.create(country_name='India', country_code='IN')

    def test_str(self):
        self.assertEqual(str(State(state_name='Maharashtra', country=self.country)), 'Maharashtra')

    def test_fields_exist(self):
        state = State.objects.create(
            country=self.country,
            state_name='Maharashtra',
            alpha_code='MH',
            iso_code='IN-MH',
            state_code='27',
        )
        state.refresh_from_db()
        self.assertEqual(state.alpha_code, 'MH')
        self.assertEqual(state.iso_code, 'IN-MH')
        self.assertEqual(state.state_code, '27')


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


class SeedGeoDataTest(TestCase):
    def test_seed_populates_all_three_codes(self):
        call_command('seed_geo_data', verbosity=0)
        mh = State.objects.get(state_name='Maharashtra')
        self.assertEqual(mh.alpha_code, 'MH')
        self.assertEqual(mh.iso_code, 'IN-MH')
        self.assertEqual(mh.state_code, '27')

    def test_seed_is_idempotent(self):
        call_command('seed_geo_data', verbosity=0)
        call_command('seed_geo_data', verbosity=0)
        self.assertEqual(State.objects.filter(state_name='Maharashtra').count(), 1)

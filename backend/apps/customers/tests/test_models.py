from django.test import TestCase
from ..models import Customer


def make_customer(**kwargs):
    defaults = {'first_name': 'Test', 'last_name': 'Customer', 'email': 'test@example.com'}
    defaults.update(kwargs)
    return Customer.objects.create(**defaults)


class CustomerModelTest(TestCase):
    def test_full_name_with_last_name(self):
        c = Customer(first_name='John', last_name='Doe')
        self.assertEqual(c.full_name, 'John Doe')

    def test_full_name_without_last_name(self):
        c = Customer(first_name='John', last_name='')
        self.assertEqual(c.full_name, 'John')

    def test_str_returns_full_name(self):
        c = Customer(first_name='Jane', last_name='Smith')
        self.assertEqual(str(c), 'Jane Smith')

    def test_is_active_default_true(self):
        c = make_customer(first_name='Active')
        self.assertTrue(c.is_active)

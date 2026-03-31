from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import Customer

User = get_user_model()
_TEST_PASS = 'T3stP@ss!'  # noqa: S105


def make_customer(**kwargs):
    defaults = {'first_name': 'Test', 'last_name': 'Customer', 'email': 'test@example.com'}
    defaults.update(kwargs)
    return Customer.objects.create(**defaults)


class CustomerListCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='staff', password=_TEST_PASS)
        self.client.force_authenticate(user=self.user)
        self.url = reverse('customer-list')

    def test_list_customers(self):
        make_customer(first_name='Alice')
        make_customer(first_name='Bob')
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data['count'], 2)

    def test_create_customer(self):
        res = self.client.post(self.url, {'first_name': 'New', 'last_name': 'Customer'})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['first_name'], 'New')

    def test_create_customer_requires_auth(self):
        self.client.force_authenticate(user=None)
        res = self.client.post(self.url, {'first_name': 'No'})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_filter_by_active(self):
        make_customer(first_name='Active', is_active=True)
        make_customer(first_name='Inactive', is_active=False)
        res = self.client.get(self.url, {'is_active': 'true'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for item in res.data['results']:
            self.assertTrue(item['is_active'])


class CustomerDetailTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='staff2', password=_TEST_PASS)
        self.client.force_authenticate(user=self.user)
        self.customer = make_customer(first_name='Detail')

    def test_retrieve_customer(self):
        res = self.client.get(reverse('customer-detail', args=[self.customer.id]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['first_name'], 'Detail')

    def test_update_customer(self):
        res = self.client.patch(
            reverse('customer-detail', args=[self.customer.id]),
            {'first_name': 'Updated'}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['first_name'], 'Updated')

    def test_delete_customer(self):
        res = self.client.delete(reverse('customer-detail', args=[self.customer.id]))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Customer.objects.filter(id=self.customer.id).exists())


class CustomerSearchTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='searcher', password=_TEST_PASS)
        self.client.force_authenticate(user=self.user)
        make_customer(first_name='Searchable', email='search@example.com')

    def test_search_returns_results(self):
        res = self.client.get(reverse('customer-search'), {'q': 'Search'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_search_short_query_returns_empty(self):
        res = self.client.get(reverse('customer-search'), {'q': 'S'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, [])


class CustomerExportTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='exporter', password=_TEST_PASS)
        self.client.force_authenticate(user=self.user)
        make_customer(first_name='Export')

    def test_export_csv(self):
        res = self.client.get(reverse('customer-export'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('text/csv', res['Content-Type'])

    def test_export_template_xlsx(self):
        res = self.client.get(reverse('customer-export-template'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('spreadsheetml', res['Content-Type'])

    def test_export_template_csv(self):
        res = self.client.get(reverse('customer-export-template'), {'file_format': 'csv'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('text/csv', res['Content-Type'])

from django.test import TestCase
from apps.inventory.models import Chemical


class ChemicalHsnCodeTest(TestCase):
    def test_hsn_code_field_exists(self):
        chem = Chemical.objects.create(
            chemical_name='Hydrochloric Acid',
            chemical_code='HCL-001',
            hsn_code='28061000',
            unit='ltr',
            selling_price=50,
        )
        chem.refresh_from_db()
        self.assertEqual(chem.hsn_code, '28061000')

    def test_hsn_code_defaults_to_empty_string(self):
        chem = Chemical.objects.create(
            chemical_name='Sulphuric Acid',
            chemical_code='H2SO4-001',
            unit='ltr',
            selling_price=40,
        )
        chem.refresh_from_db()
        self.assertEqual(chem.hsn_code, '')

    def test_serializer_exposes_hsn_code(self):
        from apps.inventory.serializers import ChemicalSerializer
        chem = Chemical(
            chemical_name='Nitric Acid',
            chemical_code='HNO3-001',
            hsn_code='28080010',
            unit='ltr',
            selling_price=60,
        )
        data = ChemicalSerializer(chem).data
        self.assertIn('hsn_code', data)
        self.assertEqual(data['hsn_code'], '28080010')

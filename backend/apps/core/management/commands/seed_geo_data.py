from django.core.management.base import BaseCommand
from apps.core.models import Country, State


class Command(BaseCommand):
    help = 'Seed countries and Indian states data'

    def handle(self, *args, **options):
        india, _ = Country.objects.get_or_create(country_code='IN', defaults={'country_name': 'India'})
        Country.objects.get_or_create(country_code='US', defaults={'country_name': 'United States'})
        Country.objects.get_or_create(country_code='UK', defaults={'country_name': 'United Kingdom'})

        # (alpha_code, state_name, iso_code, gst_state_code)
        indian_states = [
            ('JK', 'Jammu and Kashmir',                          'IN-JK', '01'),
            ('HP', 'Himachal Pradesh',                           'IN-HP', '02'),
            ('PB', 'Punjab',                                     'IN-PB', '03'),
            ('CH', 'Chandigarh',                                 'IN-CH', '04'),
            ('UK', 'Uttarakhand',                                'IN-UK', '05'),
            ('HR', 'Haryana',                                    'IN-HR', '06'),
            ('DL', 'Delhi',                                      'IN-DL', '07'),
            ('RJ', 'Rajasthan',                                  'IN-RJ', '08'),
            ('UP', 'Uttar Pradesh',                              'IN-UP', '09'),
            ('BR', 'Bihar',                                      'IN-BR', '10'),
            ('SK', 'Sikkim',                                     'IN-SK', '11'),
            ('AR', 'Arunachal Pradesh',                          'IN-AR', '12'),
            ('NL', 'Nagaland',                                   'IN-NL', '13'),
            ('MN', 'Manipur',                                    'IN-MN', '14'),
            ('MZ', 'Mizoram',                                    'IN-MZ', '15'),
            ('TR', 'Tripura',                                    'IN-TR', '16'),
            ('ML', 'Meghalaya',                                  'IN-ML', '17'),
            ('AS', 'Assam',                                      'IN-AS', '18'),
            ('WB', 'West Bengal',                                'IN-WB', '19'),
            ('JH', 'Jharkhand',                                  'IN-JH', '20'),
            ('OD', 'Odisha',                                     'IN-OD', '21'),
            ('CG', 'Chhattisgarh',                               'IN-CG', '22'),
            ('MP', 'Madhya Pradesh',                             'IN-MP', '23'),
            ('GJ', 'Gujarat',                                    'IN-GJ', '24'),
            ('DN', 'Dadra and Nagar Haveli and Daman and Diu',   'IN-DN', '26'),
            ('MH', 'Maharashtra',                                'IN-MH', '27'),
            ('AP', 'Andhra Pradesh',                             'IN-AP', '28'),
            ('KA', 'Karnataka',                                  'IN-KA', '29'),
            ('GA', 'Goa',                                        'IN-GA', '30'),
            ('LD', 'Lakshadweep',                                'IN-LD', '31'),
            ('KL', 'Kerala',                                     'IN-KL', '32'),
            ('TN', 'Tamil Nadu',                                 'IN-TN', '33'),
            ('PY', 'Puducherry',                                 'IN-PY', '34'),
            ('AN', 'Andaman and Nicobar Islands',                'IN-AN', '35'),
            ('TS', 'Telangana',                                  'IN-TS', '36'),
            ('LA', 'Ladakh',                                     'IN-LA', '38'),
        ]

        for alpha, name, iso, gst in indian_states:
            State.objects.update_or_create(
                country=india,
                alpha_code=alpha,
                defaults={'state_name': name, 'iso_code': iso, 'state_code': gst},
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {Country.objects.count()} countries and {State.objects.count()} states'
        ))

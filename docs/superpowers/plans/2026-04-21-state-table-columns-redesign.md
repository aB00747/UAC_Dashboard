# State Table Columns Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `State.state_code` to `alpha_code`, add `iso_code` (e.g. "IN-MH") and a new `state_code` (GST numeric, e.g. "27") on the State lookup table, and update seed data, admin, and tests throughout.

**Architecture:** Single Django migration (0003) handles schema rename + two new columns + a data migration that backfills `iso_code` and `state_code` for existing Indian states. The `seed_geo_data` command is updated to write all three fields so re-seeding is idempotent. No serializer or frontend changes are needed — serializers use `fields='__all__'` and frontend field names on CompanyProfile/Invoice are unchanged.

**Tech Stack:** Django 5.1, DRF, SQLite (dev), pytest-django / Django TestCase

---

## File Map

| Action | File |
|--------|------|
| Modify | `backend/apps/core/models/geo.py` |
| Create | `backend/apps/core/migrations/0003_state_codes_redesign.py` |
| Modify | `backend/apps/core/management/commands/seed_geo_data.py` |
| Modify | `backend/apps/core/admin.py` |
| Modify | `backend/apps/core/tests/test_models.py` |

---

### Task 1: Update State model

**Files:**
- Modify: `backend/apps/core/models/geo.py`

- [ ] **Step 1: Write failing tests for the new field names**

Open `backend/apps/core/tests/test_models.py` and replace the `StateModelTest` class with:

```python
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python manage.py test apps.core.tests.test_models.StateModelTest -v 2
```

Expected: FAIL — `TypeError: State() got unexpected keyword argument 'alpha_code'`

- [ ] **Step 3: Update the State model**

Replace `backend/apps/core/models/geo.py` with:

```python
from django.db import models


class Country(models.Model):
    country_code = models.CharField(max_length=5, unique=True)
    country_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'countries'
        ordering = ['country_name']
        verbose_name_plural = 'countries'

    def __str__(self):
        return self.country_name


class State(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='states')
    alpha_code = models.CharField(max_length=10, blank=True, default='')
    iso_code = models.CharField(max_length=10, blank=True, default='')
    state_code = models.CharField(max_length=5, blank=True, default='')
    state_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'states'
        ordering = ['state_name']

    def __str__(self):
        return self.state_name
```

- [ ] **Step 4: Run tests — expect FAIL due to missing migration (not field error)**

```bash
cd backend && python manage.py test apps.core.tests.test_models.StateModelTest -v 2
```

Expected: `django.db.utils.OperationalError: table states has no column named alpha_code`  
(This is correct — migration comes next.)

---

### Task 2: Write and apply the migration

**Files:**
- Create: `backend/apps/core/migrations/0003_state_codes_redesign.py`

- [ ] **Step 1: Create the migration file**

Create `backend/apps/core/migrations/0003_state_codes_redesign.py`:

```python
from django.db import migrations, models


GST_MAP = {
    'JK': ('01', 'IN-JK'),
    'HP': ('02', 'IN-HP'),
    'PB': ('03', 'IN-PB'),
    'CH': ('04', 'IN-CH'),
    'UK': ('05', 'IN-UK'),
    'HR': ('06', 'IN-HR'),
    'DL': ('07', 'IN-DL'),
    'RJ': ('08', 'IN-RJ'),
    'UP': ('09', 'IN-UP'),
    'BR': ('10', 'IN-BR'),
    'SK': ('11', 'IN-SK'),
    'AR': ('12', 'IN-AR'),
    'NL': ('13', 'IN-NL'),
    'MN': ('14', 'IN-MN'),
    'MZ': ('15', 'IN-MZ'),
    'TR': ('16', 'IN-TR'),
    'ML': ('17', 'IN-ML'),
    'AS': ('18', 'IN-AS'),
    'WB': ('19', 'IN-WB'),
    'JH': ('20', 'IN-JH'),
    'OD': ('21', 'IN-OD'),
    'CG': ('22', 'IN-CG'),
    'MP': ('23', 'IN-MP'),
    'GJ': ('24', 'IN-GJ'),
    'DN': ('26', 'IN-DN'),
    'MH': ('27', 'IN-MH'),
    'AP': ('28', 'IN-AP'),
    'KA': ('29', 'IN-KA'),
    'GA': ('30', 'IN-GA'),
    'LD': ('31', 'IN-LD'),
    'KL': ('32', 'IN-KL'),
    'TN': ('33', 'IN-TN'),
    'PY': ('34', 'IN-PY'),
    'AN': ('35', 'IN-AN'),
    'TS': ('36', 'IN-TS'),
    'LA': ('38', 'IN-LA'),
}


def populate_new_codes(apps, schema_editor):
    State = apps.get_model('core', 'State')
    for state in State.objects.all():
        gst_code, iso_code = GST_MAP.get(state.alpha_code, ('', ''))
        state.state_code = gst_code
        state.iso_code = iso_code
        state.save(update_fields=['state_code', 'iso_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_brandingsetting'),
    ]

    operations = [
        migrations.RenameField(
            model_name='state',
            old_name='state_code',
            new_name='alpha_code',
        ),
        migrations.AddField(
            model_name='state',
            name='iso_code',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.AddField(
            model_name='state',
            name='state_code',
            field=models.CharField(blank=True, default='', max_length=5),
        ),
        migrations.RunPython(populate_new_codes, migrations.RunPython.noop),
    ]
```

- [ ] **Step 2: Apply the migration**

```bash
cd backend && python manage.py migrate core
```

Expected output:
```
Operations to perform:
  Apply all migrations: core
Running migrations:
  Applying core.0003_state_codes_redesign... OK
```

- [ ] **Step 3: Run the model tests — expect PASS**

```bash
cd backend && python manage.py test apps.core.tests.test_models.StateModelTest -v 2
```

Expected: `OK` — all 2 tests pass.

- [ ] **Step 4: Commit**

```bash
cd backend && git add apps/core/models/geo.py apps/core/migrations/0003_state_codes_redesign.py apps/core/tests/test_models.py
git commit -m "feat: rename State.state_code to alpha_code, add iso_code and GST state_code"
```

---

### Task 3: Update seed command

**Files:**
- Modify: `backend/apps/core/management/commands/seed_geo_data.py`

- [ ] **Step 1: Write a failing test for the seed command**

Add this test class to `backend/apps/core/tests/test_models.py` (below the existing classes):

```python
from django.core.management import call_command


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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python manage.py test apps.core.tests.test_models.SeedGeoDataTest -v 2
```

Expected: FAIL — `AssertionError: '' != 'IN-MH'` (seed command doesn't write new fields yet)

- [ ] **Step 3: Rewrite seed_geo_data.py**

Replace the full contents of `backend/apps/core/management/commands/seed_geo_data.py`:

```python
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd backend && python manage.py test apps.core.tests.test_models.SeedGeoDataTest -v 2
```

Expected: `OK` — both seed tests pass.

- [ ] **Step 5: Run full core test suite to confirm nothing broken**

```bash
cd backend && python manage.py test apps.core -v 2
```

Expected: all tests pass, no errors.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/core/management/commands/seed_geo_data.py backend/apps/core/tests/test_models.py
git commit -m "feat: update seed_geo_data with alpha_code, iso_code, GST state_code"
```

---

### Task 4: Update core admin

**Files:**
- Modify: `backend/apps/core/admin.py`

- [ ] **Step 1: Update StateAdmin**

In `backend/apps/core/admin.py`, replace the `StateAdmin` class:

```python
@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['state_name', 'alpha_code', 'iso_code', 'state_code', 'country']
    list_filter = ['country']
    search_fields = ['state_name', 'alpha_code', 'state_code']
```

- [ ] **Step 2: Verify admin loads without error**

```bash
cd backend && python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Commit**

```bash
git add backend/apps/core/admin.py
git commit -m "fix: update StateAdmin to use alpha_code, iso_code, state_code"
```

---

### Task 5: Re-seed the live database and verify

- [ ] **Step 1: Run seed command against the dev database**

```bash
cd backend && python manage.py seed_geo_data
```

Expected:
```
Seeded 3 countries and 36 states
```

- [ ] **Step 2: Spot-check via Django shell**

```bash
cd backend && python manage.py shell -c "
from apps.core.models import State
mh = State.objects.get(alpha_code='MH')
print(mh.alpha_code, mh.iso_code, mh.state_code)
gj = State.objects.get(alpha_code='GJ')
print(gj.alpha_code, gj.iso_code, gj.state_code)
"
```

Expected:
```
MH IN-MH 27
GJ IN-GJ 24
```

- [ ] **Step 3: Run full backend test suite**

```bash
cd backend && python manage.py test --verbosity=2
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify seed and all tests pass after state codes redesign"
```

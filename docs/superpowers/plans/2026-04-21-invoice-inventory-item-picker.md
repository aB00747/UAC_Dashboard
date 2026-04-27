# Invoice Inventory Item Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `hsn_code` to the Chemical model and wire a per-row inventory dropdown into InvoiceForm Step 4 that pre-fills description, HSN, unit, and rate from the selected chemical.

**Architecture:** Backend adds one field (`hsn_code`) to `Chemical` via a new migration — the existing serializer exposes it automatically. Frontend fetches all chemicals on Step 4 mount and renders a `<select>` at the top of each line-item card; selecting a chemical populates editable defaults while leaving qty blank.

**Tech Stack:** Django 5.1, DRF, React 18, Vite, Tailwind v4

---

## File Map

| Action | File |
|--------|------|
| Modify | `backend/apps/inventory/models/chemical.py` |
| Create | `backend/apps/inventory/migrations/0002_chemical_hsn_code.py` |
| Create | `backend/apps/inventory/tests/test_chemical_hsn.py` |
| Modify | `frontend/src/pages/Invoices/components/InvoiceForm.jsx` |

---

### Task 1: Add hsn_code to Chemical model

**Files:**
- Modify: `backend/apps/inventory/models/chemical.py`
- Create: `backend/apps/inventory/migrations/0002_chemical_hsn_code.py`
- Create: `backend/apps/inventory/tests/test_chemical_hsn.py`

- [ ] **Step 1: Write the failing test**

Create `backend/apps/inventory/tests/test_chemical_hsn.py`:

```python
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python manage.py test apps.inventory.tests.test_chemical_hsn -v 2
```

Expected: FAIL — `TypeError: Chemical() got unexpected keyword argument 'hsn_code'`

- [ ] **Step 3: Add hsn_code to the Chemical model**

In `backend/apps/inventory/models/chemical.py`, add the field after `chemical_code`:

```python
from django.db import models
from .category import Category


class Chemical(models.Model):
    chemical_name = models.CharField(max_length=200)
    chemical_code = models.CharField(max_length=50, unique=True)
    hsn_code = models.CharField(max_length=20, blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='chemicals')
    description = models.TextField(blank=True, default='')
    unit = models.CharField(max_length=20, default='KG')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chemicals'
        ordering = ['chemical_name']

    def __str__(self):
        return f"{self.chemical_name} ({self.chemical_code})"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_quantity
```

- [ ] **Step 4: Create the migration**

Create `backend/apps/inventory/migrations/0002_chemical_hsn_code.py`:

```python
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chemical',
            name='hsn_code',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
```

- [ ] **Step 5: Apply the migration**

```bash
cd backend && python manage.py migrate inventory
```

Expected:
```
Operations to perform:
  Apply all migrations: inventory
Running migrations:
  Applying inventory.0002_chemical_hsn_code... OK
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
cd backend && python manage.py test apps.inventory.tests.test_chemical_hsn -v 2
```

Expected: `Ran 3 tests ... OK`

- [ ] **Step 7: Run full backend suite to confirm nothing broken**

```bash
cd backend && python manage.py test --verbosity=1
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add backend/apps/inventory/models/chemical.py \
        backend/apps/inventory/migrations/0002_chemical_hsn_code.py \
        backend/apps/inventory/tests/test_chemical_hsn.py
git commit -m "feat: add hsn_code field to Chemical model"
```

---

### Task 2: Wire inventory picker into InvoiceForm Step 4

**Files:**
- Modify: `frontend/src/pages/Invoices/components/InvoiceForm.jsx`

- [ ] **Step 1: Add the chemicalsAPI import**

At the top of `frontend/src/pages/Invoices/components/InvoiceForm.jsx`, the existing imports are:

```js
import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui';
import { FormField } from '../../../components/common';
import { invoicesAPI } from '../../../api/invoices';
import { calcTotals } from '../../../utils/invoiceUtils';
import toast from 'react-hot-toast';
```

Add the `chemicalsAPI` import:

```js
import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui';
import { FormField } from '../../../components/common';
import { invoicesAPI } from '../../../api/invoices';
import { chemicalsAPI } from '../../../api/inventory';
import { calcTotals } from '../../../utils/invoiceUtils';
import toast from 'react-hot-toast';
```

- [ ] **Step 2: Add chemicals state and fetch logic**

Inside the `InvoiceForm` component, after the existing `const [step, setStep] = useState(1);` line, add:

```js
const [chemicals, setChemicals] = useState([]);

useEffect(() => {
  if (step === 4 && chemicals.length === 0) {
    chemicalsAPI.list({ page_size: 1000 }).then((res) => {
      setChemicals(res.data.results ?? res.data);
    });
  }
}, [step]);
```

- [ ] **Step 3: Add the pickChemical helper function**

After the existing `removeItem` function (line ~59), add:

```js
function pickChemical(index, chemId) {
  if (!chemId) return;
  const chem = chemicals.find((c) => String(c.id) === String(chemId));
  if (!chem) return;
  const UNITS = ['kgs', 'ltr', 'nos', 'pcs', 'mtr', 'box'];
  const normUnit = chem.unit.trim().toLowerCase();
  const unit = UNITS.includes(normUnit) ? normUnit : 'kgs';
  const items = [...(value.line_items || [])];
  items[index] = {
    ...items[index],
    description: chem.chemical_name,
    hsn: chem.hsn_code || '',
    unit,
    rate: String(chem.selling_price),
    amount: '',
  };
  update('line_items', items);
}
```

- [ ] **Step 4: Add the inventory dropdown to each item row in Step 4**

In Step 4's JSX, the item card currently starts with:

```jsx
<div key={i} className="p-3 rounded-lg u-bg-surface-2 space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium u-text-2">Item {i + 1}</span>
    <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
  <FormField label="Description" value={item.description} onChange={(v) => updateItem(i, 'description', v)} />
```

Replace that block with:

```jsx
<div key={i} className="p-3 rounded-lg u-bg-surface-2 space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium u-text-2">Item {i + 1}</span>
    <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
  {chemicals.length > 0 && (
    <div>
      <label className="block text-xs font-medium u-text-2 mb-1">Select from inventory</label>
      <select
        className="u-input w-full px-2 py-1.5 rounded text-xs"
        value=""
        onChange={(e) => pickChemical(i, e.target.value)}
      >
        <option value="">— select from inventory —</option>
        {chemicals.map((c) => (
          <option key={c.id} value={c.id}>
            {c.chemical_name} ({c.chemical_code})
          </option>
        ))}
      </select>
    </div>
  )}
  <FormField label="Description" value={item.description} onChange={(v) => updateItem(i, 'description', v)} />
```

- [ ] **Step 5: Verify in browser**

Start backend and frontend:

```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

1. Open `http://localhost:5173`, log in.
2. Navigate to Invoices → New Invoice.
3. Proceed to Step 4 (Items).
4. Click "Add Item" — a new item card appears.
5. The "Select from inventory" dropdown lists all chemicals.
6. Select a chemical — description, HSN, unit, rate populate automatically.
7. Qty field remains empty — type a value and verify Amount updates.
8. All fields remain editable after selection.
9. Select a different chemical from the same dropdown — fields update again.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Invoices/components/InvoiceForm.jsx
git commit -m "feat: add inventory item picker to invoice line items"
```

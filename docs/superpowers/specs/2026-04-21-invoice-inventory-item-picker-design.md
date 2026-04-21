# Invoice Inventory Item Picker — Design Spec

**Date:** 2026-04-21
**Branch:** feature/invoices
**Status:** Approved

## Overview

When adding line items to an invoice, the user can pick a chemical from inventory via a dropdown. Selecting a chemical pre-fills description, HSN code, unit, and selling price as editable defaults. Quantity is always left for the user to enter.

## Backend Changes

### Chemical model (`backend/apps/inventory/models/chemical.py`)

Add one field:

```python
hsn_code = models.CharField(max_length=20, blank=True, default='')
```

### Migration (`backend/apps/inventory/migrations/0002_chemical_hsn_code.py`)

Single `AddField` operation on the `chemicals` table.

### Serializer

`ChemicalSerializer` already uses `fields = '__all__'` — `hsn_code` is automatically exposed. No changes needed.

## Frontend Changes

### InvoiceForm Step 4 (`frontend/src/pages/Invoices/components/InvoiceForm.jsx`)

**Data loading:**
- On Step 4 mount (using `useEffect` with `[step]` dependency), fetch all chemicals once: `chemicalsAPI.list({ page_size: 1000 })`. Store in local state `chemicals`.
- No loading indicator needed for this list — it's a background fetch.

**Per-item dropdown:**
- Each item row (inside the existing `u-bg-surface-2` card) gets a `<select>` at the top labelled "Select from inventory…".
- The select has a blank default option (`— select from inventory —`).
- Options are rendered as: `{chemical_name} ({chemical_code})`.
- On change:
  - Populate `description` ← `chemical_name`
  - Populate `hsn` ← `hsn_code`
  - Populate `unit` ← normalised unit (see below)
  - Populate `rate` ← `selling_price`
  - Leave `qty` unchanged
  - Reset the select back to `""` so user can re-trigger if needed
- All existing fields remain fully editable after population.

**Unit normalisation:**
```
normalised = chemical.unit.trim().toLowerCase()
unit = UNITS.includes(normalised) ? normalised : 'kgs'
```
`UNITS = ['kgs', 'ltr', 'nos', 'pcs', 'mtr', 'box']`

**API import:**
Add `import { chemicalsAPI } from '../../../api/inventory';` to InvoiceForm.

## Files Touched

```
backend/apps/inventory/models/chemical.py
backend/apps/inventory/migrations/0002_chemical_hsn_code.py   (new)
frontend/src/pages/Invoices/components/InvoiceForm.jsx
```

## What Does NOT Change

- `ChemicalSerializer` — no edit needed
- Invoice model — no edit needed
- `Builder.jsx` — no edit needed
- Manual item entry (no chemical selected) — works exactly as before

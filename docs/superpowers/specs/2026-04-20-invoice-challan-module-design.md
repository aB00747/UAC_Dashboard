# Invoice & Challan Generation Module — Design Spec
**Date:** 2026-04-20  
**Status:** Approved  
**Branch:** feature/invoices

---

## Overview

Build a full Invoice & Challan Generation Module for the Umiya Dashboard. Users can create, preview, download (PDF + Excel), and print GST-compliant invoices and delivery challans. All invoices are stored in Django backend. A system-wide audit log tracks all user actions across every dashboard module, surfaced as a collapsible drawer on every page.

---

## Scope

### In scope
- 3 invoice template types rendered as A4 PDFs
- Dedicated `/invoices` sidebar entry and routes
- Invoice builder with live PDF preview
- PDF download, Excel download, Print
- Invoice history list with filters
- Saved company profiles (multiple sellers)
- Auto-incremented invoice numbers (financial year format)
- IRN/Ack placeholder fields (editable, pending state)
- System-wide audit logging (all modules, all CRUD + auth events)
- Per-page collapsible `AuditLogDrawer` component

### Out of scope
- Government e-Invoice portal API integration (IRN auto-generation)
- WhatsApp sharing
- Email sending
- Multi-currency support

---

## Invoice Types

| Type | Template Style | Company |
|------|---------------|---------|
| `gst_einvoice` | Clean white/black, IRN block, QR placeholder | Gayatri Acid & Chemicals |
| `challan` | Blue accent (#1a3a7c), container tracking table | Riddhi Chemicals |
| `gst_logo` | Maroon/cream (#8b0000), KIL-TON logo | Parth Chem |

---

## Backend Architecture

### New Django App: `backend/apps/invoices/`

```
apps/invoices/
├── __init__.py
├── apps.py
├── admin.py
├── urls.py
├── models/
│   ├── __init__.py
│   ├── company_profile.py
│   └── invoice.py
├── serializers/
│   ├── __init__.py
│   ├── company_profile.py
│   └── invoice.py
├── views/
│   ├── __init__.py
│   ├── company_profile.py
│   └── invoice.py
└── migrations/
```

### New Django App: `backend/apps/audit/`

```
apps/audit/
├── __init__.py
├── apps.py
├── admin.py
├── urls.py
├── models.py       # AuditLog model
├── mixins.py       # AuditLogMixin for ViewSets
├── signals.py      # Auth event listeners
├── serializers.py
├── views.py
└── migrations/
```

### Models

#### `CompanyProfile`
```python
name          CharField
address       TextField
gstin         CharField(15)
pan           CharField(10)
state         CharField
state_code    CharField(2)
email         EmailField (nullable)
bank_name     CharField (nullable)
account_no    CharField (nullable)
ifsc_code     CharField (nullable)
logo_base64   TextField (nullable)   # base64 encoded logo image
is_default    BooleanField
created_by    FK → User
created_at    DateTimeField
```

#### `Invoice`
```python
invoice_type    CharField  # gst_einvoice | challan | gst_logo
invoice_number  CharField  # e.g. "167/26-27"
invoice_date    DateField
status          CharField  # draft | final
company_profile FK → CompanyProfile
buyer_name      CharField
buyer_address   TextField
buyer_gstin     CharField (nullable)
buyer_state     CharField
buyer_state_code CharField
vehicle_no      CharField (nullable)
buyer_order_no  CharField (nullable)
delivery_note_no CharField (nullable)
irn             CharField (nullable)   # e-Invoice placeholder
ack_no          CharField (nullable)
ack_date        DateField (nullable)
line_items      JSONField  # [{description, hsn, qty, unit, rate, amount}]
cgst_rate       DecimalField  # default 2.5
sgst_rate       DecimalField  # default 2.5
igst_rate       DecimalField  # default 0
subtotal        DecimalField
cgst_amount     DecimalField
sgst_amount     DecimalField
igst_amount     DecimalField
grand_total     DecimalField
created_by      FK → User
created_at      DateTimeField
updated_at      DateTimeField
```

#### `AuditLog`
```python
user          FK → User (nullable — for system events)
action        CharField  # e.g. "invoice.created", "auth.login"
module        CharField  # invoices | orders | customers | inventory | ...
object_id     CharField (nullable)
object_repr   CharField  # human-readable description
extra_data    JSONField (nullable)  # before/after values
ip_address    GenericIPAddressField (nullable)
timestamp     DateTimeField(auto_now_add=True)
```

### AuditLogMixin (applied to all ViewSets)
```python
class AuditLogMixin:
    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.log(user, f"{module}.created", instance)

    def perform_update(self, serializer):
        # capture before state
        instance = serializer.save()
        AuditLog.log(user, f"{module}.updated", instance, extra={before, after})

    def perform_destroy(self, instance):
        AuditLog.log(user, f"{module}.deleted", instance)
        instance.delete()
```

Auth signals: `user_logged_in`, `user_logged_out`, `user_login_failed` → `AuditLog.log()`

### API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET/POST | `/api/invoices/` | List invoices, create new |
| GET/PATCH/DELETE | `/api/invoices/:id/` | Retrieve, update, delete |
| GET | `/api/invoices/next-number/` | Get next auto-incremented invoice number |
| GET/POST | `/api/invoices/company-profiles/` | List/create company profiles |
| GET/PATCH/DELETE | `/api/invoices/company-profiles/:id/` | Manage profiles |
| GET | `/api/audit-logs/` | List logs (filterable by module, user, date, action) |

---

## Frontend Architecture

### Routing

`navigation.js` — new entry between Documents and Settings:
```js
{ name: 'Invoices', href: '/invoices', icon: Receipt }
```

`App.jsx` — new routes:
```jsx
<Route path="/invoices" element={<InvoiceHistory />} />
<Route path="/invoices/new" element={<InvoiceBuilder />} />
<Route path="/invoices/:id/edit" element={<InvoiceBuilder />} />
```

### File Structure

```
src/pages/Invoices/
├── Index.jsx                     # History list
├── Builder.jsx                   # New/edit invoice
└── components/
    ├── InvoiceForm.jsx            # Multi-step form (5 steps)
    ├── InvoicePreview.jsx         # Right panel — PDFViewer wrapper
    ├── InvoicePreviewModal.jsx    # Full-screen preview modal
    ├── CompanyProfileModal.jsx    # Save/switch company profiles
    └── templates/
        ├── GSTEInvoice.jsx        # @react-pdf/renderer — Gayatri Acid style
        ├── ChallanInvoice.jsx     # @react-pdf/renderer — Riddhi Chemicals style
        └── GSTLogoInvoice.jsx     # @react-pdf/renderer — Parth Chem/KIL-TON style

src/components/common/AuditLogDrawer.jsx   # Reusable per-page audit panel
src/api/invoices.js                        # Axios invoice API calls
src/api/auditLogs.js                       # Axios audit log API calls
src/utils/invoiceUtils.js                  # amountToWords, financialYear helpers
```

### Invoice Builder Layout

```
┌─────────────────────────────────────────────────────────┐
│  [← Back to Invoices]          [Save Draft] [Download ▾] [Print] │
├───────────────────────┬─────────────────────────────────┤
│                       │                                 │
│   Multi-Step Form     │      Live PDF Preview           │
│   (40%)               │      (60%)                      │
│                       │                                 │
│   Step 1: Type        │   PDFViewer renders template    │
│   Step 2: Details     │   in real time as form updates  │
│   Step 3: Buyer       │                                 │
│   Step 4: Line Items  │                                 │
│   Step 5: Tax         │                                 │
│                       │                                 │
└───────────────────────┴─────────────────────────────────┘
│ [History] Audit Log ▲   invoice.created 2 min ago       │  ← AuditLogDrawer
└─────────────────────────────────────────────────────────┘
```

Mobile: tabs to switch between Form and Preview.

### Download Menu
Clicking `Download ▾` shows:
- Download PDF
- Download Excel

Both actions also mark the invoice `status = final` in the backend.

---

## Audit Log Drawer

`<AuditLogDrawer module="invoices" />` — mounted in every page.

- Collapsed: thin strip at bottom-left showing module label + last event timestamp
- Expanded: ~280px tall timeline panel showing last 20 events for the module
- "View All" link → Settings → Audit Logs (admin/super_admin only)
- Auto-refreshes every 30 seconds when expanded
- Each entry: action badge · object repr · user · relative timestamp

### Audit Log Coverage

| Module | Actions Logged |
|--------|---------------|
| `invoices` | created, updated, deleted, downloaded, printed |
| `orders` | created, updated, deleted |
| `customers` | created, updated, deleted, imported |
| `inventory` | chemical.created/updated/deleted, stock.added |
| `deliveries` | created, updated, status_changed |
| `documents` | uploaded, deleted |
| `messaging` | sent |
| `users` | created, updated, role_changed, deleted |
| `auth` | login, logout, login_failed |

---

## PDF Templates

All templates use `@react-pdf/renderer`. Common utilities:
- `amountToWords(n)` — Indian format ("Sixty Eight Thousand Nine Hundred Eighty Five")
- `financialYear(date)` — returns "26-27" from a date
- `nextInvoiceNumber(last, date)` — returns "167/26-27"

### Template: `GSTEInvoice` (Gayatri Acid)
- Clean white background, black borders, bold headings
- IRN / Ack No / Ack Date block at top (shows "Pending" if null)
- QR code placeholder box (right side of header)
- HSN summary table after line items
- Declaration paragraph + bank details + authorised signatory block
- "This is a Computer Generated Invoice" footer

### Template: `ChallanInvoice` (Riddhi Chemicals)
- Blue accent (#1a3a7c) for header boxes and table headers
- Sure Purity tagline + product category pills (Acids/Chemicals/Solvents)
- Container tracking table at bottom
- 11-point terms & conditions
- Receiver's Signature & Stamp block

### Template: `GSTLogoInvoice` (Parth Chem / KIL-TON)
- Maroon header theme (#8b0000), cream/gold accent
- KIL-TON logo (base64 img) top-left, PARTH CHEM right
- Challan No + P.O. No reference block
- IGST row in tax summary
- "FOR PARTH CHEM / Proprietor" signature block

---

## Excel Export

Uses `xlsx` library. One workbook per invoice with:
- Row 1: Company header (merged cells, bold)
- Row 2: Invoice metadata (number, date, buyer)
- Rows 4+: Line items table with borders
- Tax summary block (right-aligned)
- Amount in words row
- Bank details block
- Footer: GSTIN, PAN, declaration

Mirrors the PDF layout as closely as Excel allows. Column widths set to match A4 proportions.

---

## Number → Words (Indian Format)

Custom utility supporting Indian numbering (lakh, crore):
```
68985   → "Indian Rupees Sixty Eight Thousand Nine Hundred Eighty Five Only"
150000  → "Indian Rupees One Lakh Fifty Thousand Only"
```

---

## Auto-Increment Invoice Number

Format: `{seq}/{FY}` e.g. `167/26-27`  
Financial year: April–March (April 2026 → FY "26-27")  
Sequence resets to 1 at start of each financial year.  
Backend provides `GET /api/invoices/next-number/` — returns next number for selected company profile.

---

## New npm Dependencies

| Package | Purpose |
|---------|---------|
| `@react-pdf/renderer` | PDF generation and preview |
| `xlsx` | Excel export |
| `lucide-react` | `Receipt` icon (already installed, new icon only) |

---

## Acceptance Criteria

- [ ] `/invoices` sidebar entry visible to all authenticated users
- [ ] All 3 invoice types render correct A4 PDF matching reference templates
- [ ] Live preview updates as user fills the form
- [ ] PDF download works and saves invoice as `final`
- [ ] Excel download produces formatted workbook matching invoice layout
- [ ] Print opens browser print dialog on the PDF
- [ ] Invoice number auto-increments with financial year suffix
- [ ] IRN/Ack fields show "Pending" placeholder, editable by user
- [ ] Company profiles can be created, switched, and set as default
- [ ] Invoice history list with filters (date, type, buyer search)
- [ ] Duplicate invoice copies all fields into a new builder form
- [ ] AuditLogDrawer appears on every page (collapsed by default)
- [ ] All CRUD actions across all modules are logged to AuditLog
- [ ] Auth events (login/logout/failed) are logged
- [ ] Audit log drawer shows last 20 events scoped to the current module
- [ ] Admin-only full audit log view under Settings

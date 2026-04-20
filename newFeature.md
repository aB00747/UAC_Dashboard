# Claude Code Prompt: Invoice & Challan Generation Module

> Copy-paste this entire document into Claude Code to build the invoice/challan generation feature in your dashboard.

---

## 🎯 TASK OVERVIEW

Build a **PDF Invoice & Challan Generation Module** for my existing dashboard. The module must support three document types based on real templates I use:

1. **GST Tax Invoice** — e-Invoice compliant (Gayatri Acid & Chemicals style)
2. **Challan Cum Invoice** — Simple delivery challan (Riddhi Chemicals style)
3. **GST Tax Invoice with Brand Logo** — For Parth Chem with KIL-TON branding

All documents must be **printable A4 PDFs**, generated from form input in the dashboard UI.

---

## 📁 EXISTING PROJECT CONTEXT

- This is being added to my **existing dashboard project**
- Use whatever frontend stack is already in the project (React / Next.js / Vue — check existing files)
- For PDF generation use **`@react-pdf/renderer`** (if React) or **`pdfmake`** (if plain JS)
- Store generated PDFs temporarily and offer a **Download** and **Print** button

---

## 🧾 DOCUMENT TYPE 1: GST TAX INVOICE (e-Invoice)

### Header Section
```
Seller Company Name          |  Invoice No: [auto-incremented, e.g. 166/26-27]
Full Address                 |  Dated: [DD-MMM-YY]
Email                        |  Delivery Note No: [same as invoice]
GSTIN/UIN: [GSTIN]          |  Delivery Note Date: [date]
State: Maharashtra, Code: 27 |  Motor Vehicle No: [MH14AZ1766]
                             |  Buyer's Order No: [BY PHONE / editable]
```

### IRN / e-Invoice Block (top of document)
```
IRN   : [hash string]
Ack No: [number]
Ack Date: [date]
```
Show a placeholder QR code box (right side of header).

### Buyer Section
```
Buyer (Bill to):
Company Name
Address Line 1
Address Line 2
City, Pin
GSTIN/UIN: [buyer GSTIN]
State: Maharashtra, Code: 27
```

### Line Items Table
Columns: `Sl No. | Description of Goods | HSN/SAC | Quantity | Rate | Per | Amount`

**Sample Data (pre-fill for testing):**
| # | Description | HSN | Qty | Rate | Per | Amount |
|---|-------------|-----|-----|------|-----|--------|
| 1 | SULPHURIC ACID (30 Carboys X 60 Kg) | 28070010 | 1,800.00 kgs | 31.50 | kgs | 56,700.00 |
| 2 | NITRIC ACID (4 Carboys X 45 Kg) | 28080010 | 180.00 kgs | 50.00 | kgs | 9,000.00 |

### Tax Summary
```
Sub Total:                    65,700.00
Output CGST @ 2.5%:            1,642.50
Output SGST @ 2.5%:            1,642.50
─────────────────────────────────────
GRAND TOTAL (₹):              68,985.00
```

### HSN Summary Table
Columns: `HSN/SAC | Taxable Value | CGST Rate | CGST Amt | SGST Rate | SGST Amt | Total Tax`

### Footer
- Amount in words (auto-generate from total): *"Indian Rupees Sixty Eight Thousand Nine Hundred Eighty Five Only"*
- Tax Amount in words
- Company PAN number
- Declaration text (standard GST declaration paragraph)
- Bank details: Bank Name, A/c No., Branch & IFS Code
- **"Authorised Signatory"** block (bottom right)
- *"This is a Computer Generated Invoice"* footer line

---

## 🧾 DOCUMENT TYPE 2: CHALLAN CUM INVOICE (Riddhi Chemicals Style)

### Header (Two-column layout)
**Left side:** Company logo area + "Sure Purity" tagline + product categories (Acids / Chemicals / Solvents)

**Right side:**
```
RIDDHI CHEMICALS
DEALERS IN ALL TYPE OF ACIDS & CHEMICALS
Address: 'RIDDHI' No. B-4, Plot No. 101, Manas Park,
         Sector No. 16, Near Ganesh Temple,
         Raje Shivaji Nagar, Pradhikaran,
         Chikhali, Pune - 412 114 MAHARASHTRA
Contact: NITIN PATEL - Mob.: 09850047816
Email: riddhichemicalspune@gmail.com
GSTIN No.: 27AIRPP2392R1Z4
State: Maharashtra  State Code: 27
PAN No.: AIRPP2392R
```

### Document Title
`CHALLAN CUM INVOICE` (centered, bold, underlined)

### Customer & Reference Block
```
M/s: [customer name & address]    | Challan No:___  Dt:___
                                  | Order No:___    Dt:___
                                  | Vehicle No:___
```

### Line Items Table
Columns: `Item Code | Description | Weight | Rate ₹ | Unit | Amount ₹`

### Footer Section
```
Amount in words: ₹ [___________]
                                    Total Amount Before Tax: [   ]
Terms & Conditions (11 points):     Add CGST       %:        [   ]
1. Interest 24% p.a. after due date Add SGST       %:        [   ]
2. Containers returnable to Bhosari Tax Amount GST:          [   ]
3. Goods once sold cannot be taken  GRAND TOTAL:             [   ]
   back...
[etc.]
```

### Container Tracking Table (bottom)
```
| Opening Balance | Delivered | Empty Returned | Balance B/F | For RIDDHI CHEMICALS |
|                 |           |                |             |                      |
```
**Receiver's Signature & Stamp** (bottom left)

---

## 🧾 DOCUMENT TYPE 3: GST TAX INVOICE WITH BRAND LOGO (Parth Chem / KIL-TON)

### Header Layout
```
[KIL-TON LOGO]     GST TAX INVOICE     [PARTH CHEM]
                                        DEALERS IN ALL TYPE OF ACIDS & CHEMICALS
                                        Office: Flat No. 7, Plot No. 47, Pragati Pawan,
                                        Sec. No. 16, Raje Shivaji Nagar,
                                        Chikhali Pradhikaran, Chinchwad, Pune - 411019
                                        Mob: 9822058236
                                        parthchem.patel@gmail.com
```

### Reference Block
```
To: [customer name & address]     | Invoice No:___   Date:___
                                  | Challan No:___   Date:___
GSTIN No: [___________________]  | P.O. No:___      Date:___
State: [_____] State Code: [__]  | Delivery To: [_____________]
```

### Line Items Table
Columns: `Sr. No. | Particulars | HSN Code | Qty. | Rate | Amount (Rs. | Ps.)`

### Tax Summary
```
Rupees: [amount in words]         Total Amount Before Tax: [   ]
                                  Add CGST    %:           [   ]
                                  Add SGST    %:           [   ]
                                  Add IGST    %:           [   ]
                                  Round off:               [   ]
                                  Grand Total:             [   ]
```

### Bank Details + GST Footer
```
Bank Detail:
Bank Name : ICICI BANK
Ac No.    : 215205501152
IFS Code  : ICIC0002152
```

```
GSTIN No.: 27ABJPP1574A1ZS  State: MAHARASHTRA  State Code: 27
PAN No.: ABJPP1574A
[Declaration paragraph — standard GST certification text]
                                              FOR PARTH CHEM
                                              Proprietor
```

### KIL-TON Logo Specs
- The logo is a dark navy blue rectangle with red border
- Bold white text: **KIL-TON** with a registered ® symbol
- Use as an `<img>` tag — accept logo upload in settings or embed as base64

---

## 🖥️ DASHBOARD UI REQUIREMENTS

### Page: `/invoices` or `/documents`

#### Left Panel — Form Input
Build a multi-step form or single scrollable form with these sections:

**Step 1: Document Type**
- Dropdown: `GST Tax Invoice | Challan Cum Invoice | GST Invoice with Logo`
- Seller profile selector (pre-saved company profiles)

**Step 2: Invoice Details**
- Invoice Number (auto-increment, editable)
- Invoice Date (date picker, default today)
- Vehicle Number
- Buyer's Order No.

**Step 3: Buyer Details**
- Company Name, Address, GSTIN, State

**Step 4: Line Items**
- Dynamic rows: Add / Remove item
- Fields per row: Description, HSN Code, Quantity, Unit (kg/ltr/nos), Rate
- Auto-calculate: Amount = Qty × Rate

**Step 5: Tax Settings**
- CGST % (default 2.5)
- SGST % (default 2.5)
- IGST % (0 for intra-state)
- Auto-calculate all tax amounts

#### Right Panel — Live PDF Preview
- Real-time preview as user fills form
- Show rendered PDF template on right side
- **Buttons:** `Download PDF` | `Print` | `Save Draft` | `Share via WhatsApp`

---

## ⚙️ COMPANY PROFILE SETTINGS

Create a settings page/modal where users can save:
```json
{
  "companyName": "KIL-TON",
  "address": "Office: Flat No. 7, Plot No. 47, Pragati Pawan, Sec. No. 16, Raje Shivaji Nagar,Chikhali Pradhikaran, Chinchwad, Pune - 411019",
  "gstin": "27ABQPP9189A1Z2",
  "pan": "ABQPP9189A",
  "state": "Maharashtra",
  "stateCode": "27",
  "email": "Gayatriacidpune@gmail.com",
  "bankName": "Kotak Mahindra Bank Ltd",
  "accountNo": "0511994096",
  "ifscCode": "KKBK0000721",
  "logoBase64": "[base64 encoded logo]"
}
```
Support **multiple saved profiles** (seller can switch between them).

---

## 📦 INVOICE HISTORY / LIST PAGE

Show a table with columns:
`Invoice No. | Date | Buyer Name | Amount | Type | Actions`

Actions per row: `View | Download | Duplicate | Delete`

Add filters: Date range, Invoice type, Search by buyer name.

---

## 🔧 TECHNICAL IMPLEMENTATION NOTES

### PDF Generation
```javascript
// Use @react-pdf/renderer for React projects
import { PDFViewer, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// OR use pdfmake for plain JS / Vue projects
// import pdfMake from 'pdfmake/build/pdfmake';
```

### Number to Words (for invoice totals)
```javascript
// Install: npm install num-words  OR  implement custom converter
// Must support Indian numbering: Lakh, Crore
function amountToWords(amount) {
  // Return: "Indian Rupees Sixty Eight Thousand Nine Hundred Eighty Five Only"
}
```

### Auto-increment Invoice Number
```javascript
// Format: [number]/[FY]
// Example: 166/26-27 means invoice 166 of financial year 2026-27
// Financial year: April to March
function generateInvoiceNo(lastNo, date) {
  const fy = getFinancialYear(date); // "26-27"
  const next = (lastNo + 1).toString();
  return `${next}/${fy}`;
}
```

### GSTIN Validation
```javascript
// GSTIN format: 2-digit state code + 10-char PAN + 1 entity + Z + checksum
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
```

---

## 🎨 STYLING NOTES

### For the PDF templates:
- **GST Tax Invoice:** Clean white background, black borders, bold headings, standard table grid
- **Challan:** Blue accent color (`#1a3a7c`) for header boxes and table headers
- **Parth Chem / KIL-TON:** Maroon/dark red (`#8b0000`) header theme, cream/gold accent background

### For the Dashboard UI:
- Match the existing dashboard color scheme
- Use responsive layout — form on left (40%), preview on right (60%)
- On mobile: tabs to switch between Form and Preview

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All 3 invoice types render correctly as A4 PDF
- [ ] PDF matches layout of the physical templates (see reference images)
- [ ] Form auto-calculates all tax amounts
- [ ] Amount in words generates correctly in Indian format
- [ ] Invoice number auto-increments with financial year suffix
- [ ] Company profiles can be saved and switched
- [ ] Download PDF button works
- [ ] Print button opens browser print dialog with correct PDF
- [ ] Invoice history list shows all generated invoices
- [ ] Duplicate invoice feature copies all fields into a new form

---

## 📎 REFERENCE FILES

These files are available in the project for reference:
- `Sales_166_26-27.pdf` — Sample filled GST Tax Invoice from Gayatri Acid
- `WhatsApp_Image_Riddhi.jpeg` — Challan Cum Invoice blank template
- `WhatsApp_Image_ParthChem.jpeg` — GST Tax Invoice with KIL-TON logo blank template
- `KILTON_logo.jpeg` — KIL-TON brand logo (navy/red/white)

---

*End of prompt document. Paste everything above into Claude Code to begin implementation.*
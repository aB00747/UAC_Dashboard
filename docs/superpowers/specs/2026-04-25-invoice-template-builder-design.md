# Invoice Template Builder — Design Spec

**Date:** 2026-04-25
**Branch:** feature/invoices
**Status:** Approved

---

## Overview

A dynamic, drag-and-drop invoice template builder integrated into the Invoices section of the Umiya Dashboard. Users can create templates from scratch (Figma-style canvas), start from existing built-in templates, or upload a photo/scan of any document and have it auto-parsed into an editable canvas via OCR + Ollama. Templates are saved to the database and reused when filling invoices. Final output is downloadable as WYSIWYG PDF or crisp vector PDF, and printable.

---

## 1. Core Requirements

1. **Canvas builder** — Figma-style: left element palette, centre A4 canvas, right properties panel
2. **Drag & drop** elements from palette onto canvas; freely move and resize on canvas
3. **Inline colour editing** — clicking any element shows a floating mini-toolbar above it; changes apply live so user can see colour consistency across the full page
4. **Right properties panel** — detailed style controls, synced with floating toolbar
5. **10 element types** — Text, Image/Logo, Data Field, Line Items Table, Totals Block, Amount in Words, Bank Details, QR Code, Box/Container, Divider Line
6. **Full per-element customisation** — background colour, text colour, font family/size/weight, border, alignment, letter-spacing, opacity (element-type-appropriate)
7. **OCR upload** — upload invoice image → Tesseract.js (browser) → Ollama AI service → canvas auto-populated
8. **Template manager** — card grid at `/invoices/templates` to list, create, edit, duplicate, delete, set default
9. **Template picker** — shown when creating a new invoice; user picks a saved template, then fills data
10. **Live preview** — data fields in the template fill with real invoice values as user types in the form
11. **PDF export** — WYSIWYG (html2canvas + jsPDF, client-side) AND vector (Puppeteer server-side)
12. **Print** — existing print flow works with templates

---

## 2. UI / Frontend Design

### 2.1 New Routes

| Route | Component | Notes |
|---|---|---|
| `/invoices/templates` | `TemplateManager.jsx` | New tab inside Invoices section |
| `/invoices/templates/new` | `TemplateBuilder.jsx` | Canvas builder, blank start |
| `/invoices/templates/:id` | `TemplateBuilder.jsx` | Canvas builder, edit existing |

Existing routes `/invoices` and `/invoices/:id/edit` get minor additions only (template picker modal, template switcher button).

### 2.2 Canvas Builder Layout

Three-panel layout matching system design (`#141413` sidebar panels, `#c96442` terracotta accents, warm neutral surfaces):

```
┌─────────────────────────────────────────────────────────────┐
│ ← Templates   [Template Name]   [Upload OCR]  [Preview]  [Save] │  ← Toolbar (#141413)
├──────────────┬──────────────────────────────┬───────────────┤
│ ELEMENT      │                              │ PROPERTIES    │
│ PALETTE      │       A4 CANVAS              │ PANEL         │
│ (#141413)    │   (white document, snap grid)│ (#141413)     │
│              │                              │               │
│ Layout       │  ┌────────────────────────┐  │ Selected elem │
│ □ Box        │  │ [floating toolbar when │  │ Position X/Y  │
│ ─ Divider    │  │  element selected]     │  │ Size W/H      │
│              │  │                        │  │ BG colour     │
│ Content      │  │  drag/drop elements    │  │ Text colour   │
│ T Text       │  │  resize handles        │  │ Font/Size     │
│ 🖼 Image     │  │  snap to 8px grid      │  │ Border        │
│ ≡ Data Field │  │                        │  │ Layer order   │
│              │  └────────────────────────┘  │ Delete        │
│ Invoice      │                              │               │
│ ⊞ Table      │  [−] 100% [+]               │ Canvas:       │
│ ₹ Totals     │                              │ Snap grid ⬤  │
│ ✍ Amt Words  │                              │ Grid: 8px     │
│ 🏦 Bank      │                              │               │
│ ⬛ QR Code   │                              │               │
│              │                              │               │
│ Start From   │                              │               │
│ 📋 GST Logo  │                              │               │
│ 📋 Challan   │                              │               │
│ 📋 e-Invoice │                              │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

### 2.3 Inline Floating Toolbar

Appears directly above the selected element on the canvas:

```
[BG ■ ■ ■ ■ ■ ■ +] | [T ■ ■ ■] | [Sz 11pt] | [B] [I] | [More ›] [🗑]
```

- **BG swatches** — quick colour presets + `+` opens full native colour picker
- **T swatches** — text colour presets + full picker
- **Sz** — font size input (for text-based elements)
- **B / I** — bold / italic toggles
- **More ›** — expands right panel with advanced controls
- **Changes apply instantly** — whole A4 page updates in real time so user sees colour consistency across all elements
- Right panel hex inputs stay in sync with toolbar swatches bidirectionally

### 2.4 Per-Element Style Controls

| Element | Customisable Properties |
|---|---|
| Text Block | Content, font family, size, weight, italic, colour, background, alignment, letter-spacing, padding |
| Data Field | Bound field (dropdown), label prefix, font, colour, background, alignment |
| Image / Logo | Upload source, object-fit, border, border-radius, background |
| Line Items Table | Header BG + text colour, odd/even row colours, border colour + width, visible columns, font size |
| Totals Block | Which rows show (CGST/SGST/IGST toggles), Grand Total BG + text, row text colour, font size |
| Box / Container | Background, border colour + width + style, border-radius, opacity |
| Divider Line | Colour, thickness (0.5–4pt), style (solid/dashed/dotted), orientation (H/V) |
| Bank Details | Background, border, font size, label colour, value colour |
| Amount in Words | Font, colour, background, italic toggle |
| QR Code | Data source field binding, foreground + background colour, size |

### 2.5 Canvas Interactions

- **Drag from palette → canvas**: drops at cursor, auto-selects, shows floating toolbar
- **Click element**: selects it, resize handles appear, properties panel updates
- **Drag element**: moves freely, snaps to 8px grid when enabled
- **Resize handles**: corners + edges via `react-rnd`, bounded to A4 page
- **Double-click text**: inline edit mode
- **Keyboard**: Delete removes, Arrow keys nudge 1px, Ctrl+Z undo (undo stack, last 20 ops)
- **Zoom**: +/− controls, canvas scales visually, element coords stay in px units
- **Snap grid**: toggle on/off, configurable grid size (default 8px)

### 2.6 Template Manager (`/invoices/templates`)

- Tabs: "Invoices" | "Templates" (inside the existing Invoices page layout)
- Card grid (2 columns on desktop, 1 on mobile) — each card shows:
  - Auto-generated thumbnail (screenshot of canvas on save)
  - Template name + last updated
  - "Default" badge (terracotta) for the default template
  - "OCR" badge (green) for templates created via upload
  - Edit / Duplicate / Delete buttons
- Header: "Upload Image (OCR)" button + "New Template" button
- Clicking the `+` card or "New Template" opens canvas builder at `/invoices/templates/new`

### 2.7 Template Picker Modal

Shown when user clicks "New Invoice" from the invoice list:

- Grid of template thumbnails (max 6 shown, scrollable)
- Clicking a card selects it (terracotta border highlight)
- "Skip — use default" link
- "Use Selected →" primary button
- On confirm: navigates to `/invoices/new` with `templateId` passed as state

### 2.8 Invoice Builder Integration

Existing `Builder.jsx` changes:
- Right-side preview panel renders the selected template with live invoice data substituted into data fields
- "Change Template" button in the toolbar opens the template picker
- Download PDF uses the template renderer (html2canvas or Puppeteer endpoint)

---

## 3. Data Model

### 3.1 New: `InvoiceTemplate` (Django)

```python
class InvoiceTemplate(models.Model):
    name        = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    schema      = models.JSONField(default=dict)   # full canvas state
    thumbnail   = models.ImageField(upload_to='template_thumbs/', null=True, blank=True)
    is_default  = models.BooleanField(default=False)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_templates'
        ordering = ['-updated_at']
```

### 3.2 Template Schema (JSON stored in `schema` field)

```json
{
  "pageSize": { "width": 794, "height": 1123 },
  "elements": [
    {
      "id": "elem-uuid",
      "type": "text | image | field | table | totals | amountwords | bankdetails | qrcode | box | line",
      "x": 20,
      "y": 20,
      "width": 200,
      "height": 30,
      "zIndex": 1,
      "props": {
        "content": "TAX INVOICE",
        "fontSize": 11,
        "fontWeight": "bold",
        "fontFamily": "Playfair Display",
        "color": "#ffffff",
        "backgroundColor": "#1a237e",
        "textAlign": "center",
        "letterSpacing": 3,
        "field": "invoice_number"
      }
    }
  ]
}
```

### 3.3 Modified: `Invoice` model

Add one nullable FK (no breaking change to existing data):

```python
template = models.ForeignKey(
    'invoices.InvoiceTemplate',
    on_delete=models.SET_NULL,
    null=True, blank=True,
    related_name='invoices'
)
```

---

## 4. API Endpoints

### 4.1 Django REST — Invoice Templates

| Method | URL | Action |
|---|---|---|
| GET | `/api/invoice-templates/` | List all templates |
| POST | `/api/invoice-templates/` | Create new template |
| GET | `/api/invoice-templates/:id/` | Retrieve one |
| PUT | `/api/invoice-templates/:id/` | Full update |
| DELETE | `/api/invoice-templates/:id/` | Delete |
| POST | `/api/invoice-templates/:id/duplicate/` | Clone template |
| POST | `/api/invoice-templates/:id/set-default/` | Set as default (clears others) |
| POST | `/api/invoice-templates/:id/pdf/` | Render invoice PDF via Puppeteer. Body: `{ invoice_id: int }` or `{ invoice_data: {...} }` |

### 4.2 FastAPI AI Service (`:8001`) — OCR

```
POST /ocr/parse-invoice
Body: {
  "text_blocks": [
    { "text": "TAX INVOICE", "x": 240, "y": 80, "width": 180, "height": 20, "confidence": 98 },
    ...
  ],
  "page_width": 794,
  "page_height": 1123
}

Response: {
  "fields": {
    "invoice_number": "INV-001",
    "buyer_name": "XYZ Pvt Ltd",
    "grand_total": "5880.00",
    ...
  },
  "elements": [
    { "type": "text", "x": 240, "y": 80, "width": 180, "height": 20,
      "props": { "content": "TAX INVOICE", "textAlign": "center" } },
    ...
  ]
}
```

---

## 5. OCR Pipeline

1. **User uploads image** (PNG/JPG/PDF) via "Upload Image (OCR)" button
2. **Preview modal** shows the image; user clicks "Parse this document"
3. **Tesseract.js** runs in-browser (no server upload at this stage):
   - Extracts text blocks with bounding boxes `{ text, x, y, width, height, confidence }`
   - ~2–5s depending on image size and quality
4. **POST to `/ocr/parse-invoice`** (FastAPI AI service at `:8001`):
   - Ollama LLM receives the text blocks + page dimensions
   - Prompt instructs it to identify invoice fields (company, buyer, invoice number, date, line items, totals) and map each text block to a field binding or static text element
   - Returns structured JSON: `{ fields, elements }`
5. **Canvas populated** with elements at proportional positions from the original document
6. **Data fields auto-bound** where the LLM recognised them (e.g. `{invoice_number}`)
7. User fine-tunes — adjusts colours, fonts, positions — and saves as a named template

---

## 6. PDF Generation

### WYSIWYG (client-side)
- `html2canvas` captures the A4 canvas div as a rasterised image
- `jsPDF` wraps it into a PDF document
- 100% pixel-accurate to canvas preview
- Slightly rasterised (not pure vector)
- Works offline, ~1–2s

### Vector PDF (server-side)
- Django endpoint `POST /api/invoice-templates/:id/pdf/` receives invoice data + template ID
- Server renders the template HTML with invoice data injected
- Puppeteer (headless Chromium) prints to PDF with `@page` print settings
- Crisp vector text, proper fonts, better for archival/email
- Requires Node.js + Puppeteer installed on server
- ~3–5s

Both options available in the download menu, matching the existing download dropdown pattern.

---

## 7. Technology Stack

| Concern | Library | Reason |
|---|---|---|
| Drag onto canvas | `@dnd-kit/core` | Already standard in React ecosystem |
| Element drag + resize | `react-rnd` | Handles both drag and resize handles in one, bounds support |
| OCR | `tesseract.js` | In-browser, no server upload, free |
| Client PDF | `html2canvas` + `jsPDF` | WYSIWYG pixel-accurate |
| Server PDF | `puppeteer` (Node.js) | Crisp vector, headless Chrome |
| AI field mapping | Ollama (existing `:8001`) | Already integrated, no new API keys |
| Thumbnail generation | `html2canvas` | Capture canvas on save |

---

## 8. Design System Compliance

The builder UI (panels, toolbar, handles) uses the existing system tokens:

| UI Zone | Token / Value |
|---|---|
| Panel backgrounds | `var(--bg-sidebar)` = `#141413` |
| Canvas background | `var(--bg-surface-2)` = `#1e1e1c` |
| A4 document | `#ffffff` |
| Selection handles | `var(--brand)` = `#c96442` terracotta |
| Accent / active | `var(--brand)` = `#c96442` |
| Panel text | `var(--text-3)` = `#b0aea5` warm silver |
| Section labels | `var(--text-4)` = `#87867f` stone gray |
| Panel borders | `var(--border)` = `#30302e` |
| Inputs in panel | `var(--bg-surface)` dark = `#1e1e1c` |
| Template card surfaces | `var(--bg-surface)` = `#faf9f5` |
| Headings | Playfair Display (`var(--font-serif)`) |

**The A4 document canvas page itself has no forced colour scheme** — all element colours are 100% user-defined.

---

## 9. Navigation Changes

| Location | Change |
|---|---|
| `/invoices` index | "New Invoice" button shows template picker modal first |
| Invoice list page | Add "Templates" tab next to implicit "Invoices" tab |
| `/invoices/new` (Builder) | Preview panel renders chosen template; "Change Template" button in toolbar |
| `/invoices/:id/edit` | Same as above |
| `/invoices/templates` | **New** — Template Manager card grid |
| `/invoices/templates/new` | **New** — Canvas Builder (blank) |
| `/invoices/templates/:id` | **New** — Canvas Builder (edit existing) |

---

## 10. Out of Scope

- Real-time collaborative editing (multiple users editing same template simultaneously)
- Template versioning / history
- Export template as shareable file (import/export between installations)
- Mobile canvas editing (builder is desktop-only; invoice form + preview remains mobile-friendly)
- Cloud OCR services (Google Vision, AWS Textract) — Tesseract + Ollama covers the requirement
- Puppeteer setup automation — server setup documented separately

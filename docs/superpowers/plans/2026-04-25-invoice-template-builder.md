# Invoice Template Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Figma-style drag-and-drop invoice template builder with OCR upload, full colour customisation, template persistence, and dual PDF export — integrated into the existing Invoices section.

**Architecture:** New `InvoiceTemplate` Django model stores canvas layout as JSON. React frontend uses `react-rnd` for drag+resize on a DOM-based A4 canvas. OCR pipeline runs Tesseract.js in-browser then posts text blocks to the existing Ollama AI service for field mapping. Templates are selected when creating invoices and rendered live in the existing Builder preview panel.

**Tech Stack:** `react-rnd`, `@dnd-kit/core`, `tesseract.js`, `html2canvas`, `jspdf`, Django REST Framework, Ollama (existing FastAPI service at :8001)

---

## File Map

### Backend (create)
- `backend/apps/invoices/models/invoice_template.py` — InvoiceTemplate model
- `backend/apps/invoices/serializers/invoice_template.py` — serializer + list serializer
- `backend/apps/invoices/views/invoice_template.py` — ViewSet with duplicate/set-default actions

### Backend (modify)
- `backend/apps/invoices/models/__init__.py` — export InvoiceTemplate
- `backend/apps/invoices/models/invoice.py` — add template FK
- `backend/apps/invoices/serializers/__init__.py` — export new serializers
- `backend/apps/invoices/views/__init__.py` — export new ViewSet
- `backend/apps/invoices/urls.py` — register new router

### AI Service (create)
- `D:/Projects/Umiya/AI/ocr/router.py` — FastAPI OCR endpoint
- `D:/Projects/Umiya/AI/ocr/service.py` — Tesseract block → Ollama → canvas JSON

### Frontend API (create)
- `frontend/src/api/invoiceTemplates.js` — API client

### Frontend pages (create)
- `frontend/src/pages/Invoices/TemplateManager.jsx` — card grid list page
- `frontend/src/pages/Invoices/TemplateBuilder.jsx` — full canvas builder page
- `frontend/src/pages/Invoices/components/canvas/Canvas.jsx` — A4 canvas with snap grid + zoom
- `frontend/src/pages/Invoices/components/canvas/ElementPalette.jsx` — left drag palette
- `frontend/src/pages/Invoices/components/canvas/PropertiesPanel.jsx` — right style panel
- `frontend/src/pages/Invoices/components/canvas/FloatingToolbar.jsx` — inline colour toolbar
- `frontend/src/pages/Invoices/components/canvas/elements/index.jsx` — element renderer switch
- `frontend/src/pages/Invoices/components/canvas/elements/TextElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/DataFieldElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/ImageElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/TableElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/TotalsElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/AmountWordsElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/BankDetailsElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/QRCodeElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/BoxElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/elements/LineElement.jsx`
- `frontend/src/pages/Invoices/components/canvas/useCanvasState.js` — elements state + undo
- `frontend/src/pages/Invoices/components/TemplatePickerModal.jsx`
- `frontend/src/pages/Invoices/components/OCRUploadModal.jsx`
- `frontend/src/pages/Invoices/components/TemplateRenderer.jsx` — renders template with live invoice data

### Frontend pages (modify)
- `frontend/src/App.jsx` — add 3 new routes
- `frontend/src/pages/Invoices/Index.jsx` — add Templates tab + template picker trigger
- `frontend/src/pages/Invoices/Builder.jsx` — integrate TemplateRenderer in preview panel

---

## Phase 1 — Backend

### Task 1: InvoiceTemplate model + migration

**Files:**
- Create: `backend/apps/invoices/models/invoice_template.py`
- Modify: `backend/apps/invoices/models/__init__.py`
- Modify: `backend/apps/invoices/models/invoice.py`

- [ ] **Create model file**

```python
# backend/apps/invoices/models/invoice_template.py
from django.db import models
from django.conf import settings


class InvoiceTemplate(models.Model):
    name        = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, default='')
    schema      = models.JSONField(default=dict)   # full canvas JSON
    thumbnail   = models.TextField(blank=True, default='')  # base64 dataURL
    is_default  = models.BooleanField(default=False)
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='invoice_templates',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoice_templates'
        ordering = ['-updated_at']

    def __str__(self):
        return self.name
```

- [ ] **Add to models `__init__.py`**

```python
# backend/apps/invoices/models/__init__.py  — add to existing imports
from .invoice_template import InvoiceTemplate
```

- [ ] **Add template FK to Invoice model** — append after `challan_no` field in `backend/apps/invoices/models/invoice.py`:

```python
    template = models.ForeignKey(
        'invoices.InvoiceTemplate',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='invoices',
    )
```

- [ ] **Generate and run migrations**

```bash
cd backend
python manage.py makemigrations invoices --name invoice_template
python manage.py migrate
```

Expected: two new tables `invoice_templates` and a new column `template_id` on `invoices`.

- [ ] **Commit**

```bash
git add backend/apps/invoices/models/invoice_template.py backend/apps/invoices/models/__init__.py backend/apps/invoices/models/invoice.py backend/apps/invoices/migrations/
git commit -m "feat: add InvoiceTemplate model and template FK on Invoice"
```

---

### Task 2: InvoiceTemplate serializers

**Files:**
- Create: `backend/apps/invoices/serializers/invoice_template.py`
- Modify: `backend/apps/invoices/serializers/__init__.py`

- [ ] **Create serializer file**

```python
# backend/apps/invoices/serializers/invoice_template.py
from rest_framework import serializers
from ..models import InvoiceTemplate


class InvoiceTemplateListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model  = InvoiceTemplate
        fields = ['id', 'name', 'description', 'thumbnail', 'is_default',
                  'created_by_name', 'created_at', 'updated_at']


class InvoiceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InvoiceTemplate
        fields = ['id', 'name', 'description', 'schema', 'thumbnail',
                  'is_default', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
```

- [ ] **Export from `__init__.py`** — add to existing exports in `backend/apps/invoices/serializers/__init__.py`:

```python
from .invoice_template import InvoiceTemplateSerializer, InvoiceTemplateListSerializer
```

- [ ] **Commit**

```bash
git add backend/apps/invoices/serializers/
git commit -m "feat: InvoiceTemplate serializers"
```

---

### Task 3: InvoiceTemplate ViewSet

**Files:**
- Create: `backend/apps/invoices/views/invoice_template.py`
- Modify: `backend/apps/invoices/views/__init__.py`
- Modify: `backend/apps/invoices/urls.py`

- [ ] **Create ViewSet**

```python
# backend/apps/invoices/views/invoice_template.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import InvoiceTemplate
from ..serializers import InvoiceTemplateSerializer, InvoiceTemplateListSerializer


class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    queryset = InvoiceTemplate.objects.select_related('created_by').all()
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'updated_at', 'created_at']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceTemplateListSerializer
        return InvoiceTemplateSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        original = self.get_object()
        clone = InvoiceTemplate.objects.create(
            name=f'{original.name} (copy)',
            description=original.description,
            schema=original.schema,
            thumbnail=original.thumbnail,
            is_default=False,
            created_by=request.user,
        )
        return Response(InvoiceTemplateSerializer(clone).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
        template = self.get_object()
        template.is_default = True
        template.save(update_fields=['is_default'])
        return Response({'status': 'default set'})
```

- [ ] **Export from views `__init__.py`** — add to existing `backend/apps/invoices/views/__init__.py`:

```python
from .invoice_template import InvoiceTemplateViewSet
```

- [ ] **Register in urls.py**

```python
# backend/apps/invoices/urls.py  — full replacement
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, CompanyProfileViewSet, InvoiceTemplateViewSet

router = DefaultRouter()
router.register(r'company-profiles', CompanyProfileViewSet, basename='company-profile')
router.register(r'invoice-templates', InvoiceTemplateViewSet, basename='invoice-template')
router.register(r'', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
```

- [ ] **Smoke test** — start backend and verify endpoints exist:

```bash
cd backend && python manage.py runserver
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/invoices/invoice-templates/
```

Expected: `{"count": 0, "results": []}`

- [ ] **Commit**

```bash
git add backend/apps/invoices/views/ backend/apps/invoices/urls.py
git commit -m "feat: InvoiceTemplate ViewSet with duplicate and set-default actions"
```

---

## Phase 2 — AI Service OCR Endpoint

### Task 4: FastAPI OCR endpoint

**Files:**
- Create: `D:/Projects/Umiya/AI/ocr/router.py`
- Create: `D:/Projects/Umiya/AI/ocr/service.py`
- Modify: `D:/Projects/Umiya/AI/main.py` (or equivalent entry point — check existing file)

- [ ] **Check AI service entry point**

```bash
ls D:/Projects/Umiya/AI/
```

Find the file that calls `app = FastAPI()` and registers routers.

- [ ] **Create OCR service**

```python
# D:/Projects/Umiya/AI/ocr/service.py
import json
import ollama


PARSE_PROMPT = """You are an invoice parser. Given a list of text blocks extracted from an invoice image (each with text content and position on page), identify what each block represents and return structured JSON.

Text blocks (each has: text, x, y, width, height as fractions of page 0.0-1.0):
{blocks}

Return ONLY valid JSON in this exact format:
{{
  "fields": {{
    "company_name": "...",
    "company_gstin": "...",
    "invoice_number": "...",
    "invoice_date": "...",
    "buyer_name": "...",
    "buyer_gstin": "...",
    "buyer_address": "...",
    "grand_total": "..."
  }},
  "elements": [
    {{
      "type": "text|field",
      "x_frac": 0.0,
      "y_frac": 0.0,
      "w_frac": 0.2,
      "h_frac": 0.03,
      "props": {{
        "content": "...",
        "field": "invoice_number|buyer_name|invoice_date|buyer_gstin|grand_total|company_name|null",
        "fontSize": 10,
        "fontWeight": "normal|bold",
        "textAlign": "left|center|right",
        "color": "#141413",
        "backgroundColor": "transparent"
      }}
    }}
  ]
}}

Rules:
- Use type "field" when the block is dynamic invoice data (invoice number, date, buyer info, totals)
- Use type "text" for static labels and headings
- x_frac/y_frac/w_frac/h_frac are fractions of page dimensions (0.0 to 1.0)
- Set field to null for static text elements
- Detect heading rows (bold, centred) and set fontWeight "bold"
"""


def parse_invoice_blocks(text_blocks: list, page_width: int, page_height: int) -> dict:
    """Send Tesseract blocks to Ollama for field mapping."""
    # Normalise positions to fractions
    normalised = []
    for b in text_blocks:
        normalised.append({
            'text': b['text'],
            'x_frac': round(b['x'] / page_width, 3),
            'y_frac': round(b['y'] / page_height, 3),
            'w_frac': round(b['width'] / page_width, 3),
            'h_frac': round(b['height'] / page_height, 3),
            'confidence': b.get('confidence', 0),
        })

    # Filter low-confidence blocks
    normalised = [b for b in normalised if b['confidence'] > 40]

    prompt = PARSE_PROMPT.format(blocks=json.dumps(normalised, indent=2))

    response = ollama.chat(
        model='llama3.1:8b',
        messages=[{'role': 'user', 'content': prompt}],
        options={'temperature': 0.1},
    )

    raw = response['message']['content'].strip()
    # Extract JSON from response (LLM may wrap in markdown)
    if '```' in raw:
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]

    parsed = json.loads(raw)

    # Convert fractional positions to px (A4 at 96dpi = 794×1123)
    A4_W, A4_H = 794, 1123
    for elem in parsed.get('elements', []):
        elem['x'] = round(elem.pop('x_frac') * A4_W)
        elem['y'] = round(elem.pop('y_frac') * A4_H)
        elem['width'] = max(40, round(elem.pop('w_frac') * A4_W))
        elem['height'] = max(14, round(elem.pop('h_frac') * A4_H))
        elem['id'] = f"ocr-{elem['x']}-{elem['y']}"
        elem['zIndex'] = 1

    return parsed
```

- [ ] **Create OCR router**

```python
# D:/Projects/Umiya/AI/ocr/router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from .service import parse_invoice_blocks

router = APIRouter(prefix='/ocr', tags=['ocr'])


class TextBlock(BaseModel):
    text: str
    x: float
    y: float
    width: float
    height: float
    confidence: Optional[float] = 0


class ParseRequest(BaseModel):
    text_blocks: List[TextBlock]
    page_width: int = 794
    page_height: int = 1123


@router.post('/parse-invoice')
async def parse_invoice(req: ParseRequest):
    try:
        blocks = [b.dict() for b in req.text_blocks]
        result = parse_invoice_blocks(blocks, req.page_width, req.page_height)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Register router in AI service main.py** — find the `app.include_router(...)` section and add:

```python
from ocr.router import router as ocr_router
app.include_router(ocr_router)
```

- [ ] **Test endpoint**

```bash
cd D:/Projects/Umiya/AI && python -m uvicorn main:app --port 8001 --reload
curl -X POST http://localhost:8001/ocr/parse-invoice \
  -H "Content-Type: application/json" \
  -d '{"text_blocks":[{"text":"TAX INVOICE","x":300,"y":80,"width":180,"height":20,"confidence":98}],"page_width":794,"page_height":1123}'
```

Expected: JSON response with `fields` and `elements` arrays.

- [ ] **Commit**

```bash
cd D:/Projects/Umiya/AI
git add ocr/ main.py
git commit -m "feat: OCR parse-invoice endpoint with Ollama field mapping"
```

---

## Phase 3 — Frontend Foundation

### Task 5: Install packages + API client + routes

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Create: `frontend/src/api/invoiceTemplates.js`
- Modify: `frontend/src/App.jsx`

- [ ] **Install npm packages**

```bash
cd frontend
npm install react-rnd @dnd-kit/core @dnd-kit/utilities tesseract.js html2canvas jspdf
```

- [ ] **Create API client**

```js
// frontend/src/api/invoiceTemplates.js
import client from './client';

export const templatesAPI = {
  list:       (params) => client.get('/invoices/invoice-templates/', { params }),
  get:        (id)     => client.get(`/invoices/invoice-templates/${id}/`),
  create:     (data)   => client.post('/invoices/invoice-templates/', data),
  update:     (id, data) => client.patch(`/invoices/invoice-templates/${id}/`, data),
  delete:     (id)     => client.delete(`/invoices/invoice-templates/${id}/`),
  duplicate:  (id)     => client.post(`/invoices/invoice-templates/${id}/duplicate/`),
  setDefault: (id)     => client.post(`/invoices/invoice-templates/${id}/set-default/`),
};
```

- [ ] **Add routes to App.jsx** — add these 3 lazy imports after existing invoice imports:

```js
const TemplateManager = lazy(() => import('./pages/Invoices/TemplateManager'));
const TemplateBuilder = lazy(() => import('./pages/Invoices/TemplateBuilder'));
```

Then add inside `<Route element={<AuthenticatedLayout />}>`:

```jsx
<Route path="/invoices/templates" element={<TemplateManager />} />
<Route path="/invoices/templates/new" element={<TemplateBuilder />} />
<Route path="/invoices/templates/:id" element={<TemplateBuilder />} />
```

- [ ] **Commit**

```bash
cd frontend
git add package.json package-lock.json src/api/invoiceTemplates.js src/App.jsx
git commit -m "feat: install canvas deps, add template API client and routes"
```

---

## Phase 4 — Canvas State Hook

### Task 6: useCanvasState — elements state + undo/redo

**Files:**
- Create: `frontend/src/pages/Invoices/components/canvas/useCanvasState.js`

- [ ] **Create hook**

```js
// frontend/src/pages/Invoices/components/canvas/useCanvasState.js
import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';   // already available via dnd-kit transitive dep

const MAX_HISTORY = 20;

function cloneElements(elements) {
  return elements.map(e => ({ ...e, props: { ...e.props } }));
}

export function useCanvasState(initialElements = []) {
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState(null);
  const historyRef = useRef([initialElements]);
  const historyIdx = useRef(0);

  const pushHistory = useCallback((elems) => {
    const trimmed = historyRef.current.slice(0, historyIdx.current + 1);
    trimmed.push(cloneElements(elems));
    if (trimmed.length > MAX_HISTORY) trimmed.shift();
    historyRef.current = trimmed;
    historyIdx.current = trimmed.length - 1;
  }, []);

  const updateElements = useCallback((updater) => {
    setElements(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const addElement = useCallback((type, x = 40, y = 40) => {
    const defaults = {
      text:        { content: 'Text', fontSize: 11, fontWeight: 'normal', fontFamily: 'sans-serif', color: '#141413', backgroundColor: 'transparent', textAlign: 'left', letterSpacing: 0, padding: 4 },
      field:       { field: 'invoice_number', label: 'Invoice No.', fontSize: 10, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' },
      image:       { src: null, objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent' },
      table:       { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description','hsn','qty','rate','amount'] },
      totals:      { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 },
      amountwords: { fontSize: 9, color: '#141413', backgroundColor: 'transparent', italic: true },
      bankdetails: { fontSize: 9, labelColor: '#5e5d59', valueColor: '#141413', backgroundColor: '#faf9f5', border: '1px solid #e8e6dc' },
      qrcode:      { field: 'invoice_number', fgColor: '#141413', bgColor: '#ffffff' },
      box:         { backgroundColor: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 1, borderStyle: 'solid', borderRadius: 0, opacity: 1 },
      line:        { color: '#141413', thickness: 1, style: 'solid', orientation: 'horizontal' },
    };
    const sizes = {
      text: { w: 200, h: 28 }, field: { w: 200, h: 20 }, image: { w: 120, h: 60 },
      table: { w: 754, h: 160 }, totals: { w: 200, h: 80 }, amountwords: { w: 350, h: 20 },
      bankdetails: { w: 280, h: 70 }, qrcode: { w: 80, h: 80 },
      box: { w: 200, h: 80 }, line: { w: 754, h: 2 },
    };
    const id = nanoid(8);
    const { w, h } = sizes[type] || { w: 150, h: 40 };
    const el = { id, type, x, y, width: w, height: h, zIndex: Date.now(), props: { ...defaults[type] } };
    updateElements(prev => [...prev, el]);
    setSelectedId(id);
    return id;
  }, [updateElements]);

  const updateElement = useCallback((id, changes) => {
    updateElements(prev => prev.map(e => {
      if (e.id !== id) return e;
      const { props: propChanges, ...rest } = changes;
      return { ...e, ...rest, props: propChanges ? { ...e.props, ...propChanges } : e.props };
    }));
  }, [updateElements]);

  const deleteElement = useCallback((id) => {
    updateElements(prev => prev.filter(e => e.id !== id));
    setSelectedId(null);
  }, [updateElements]);

  const bringForward = useCallback((id) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, zIndex: e.zIndex + 1 } : e));
  }, [updateElements]);

  const sendBackward = useCallback((id) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, zIndex: Math.max(1, e.zIndex - 1) } : e));
  }, [updateElements]);

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    historyIdx.current -= 1;
    setElements(cloneElements(historyRef.current[historyIdx.current]));
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return;
    historyIdx.current += 1;
    setElements(cloneElements(historyRef.current[historyIdx.current]));
    setSelectedId(null);
  }, []);

  const selected = elements.find(e => e.id === selectedId) || null;

  return { elements, selectedId, selected, setSelectedId, addElement, updateElement, deleteElement, bringForward, sendBackward, updateElements, undo, redo };
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/canvas/useCanvasState.js
git commit -m "feat: canvas state hook with undo/redo"
```

---

## Phase 5 — Canvas Element Components

### Task 7: All 10 element components

**Files:** All files under `frontend/src/pages/Invoices/components/canvas/elements/`

- [ ] **TextElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/TextElement.jsx
export default function TextElement({ props, isEditing, onContentChange }) {
  const style = {
    width: '100%', height: '100%', fontSize: props.fontSize,
    fontWeight: props.fontWeight, fontFamily: props.fontFamily,
    fontStyle: props.italic ? 'italic' : 'normal',
    color: props.color, background: props.backgroundColor,
    textAlign: props.textAlign, letterSpacing: props.letterSpacing,
    padding: props.padding, boxSizing: 'border-box',
    wordBreak: 'break-word', overflow: 'hidden',
    display: 'flex', alignItems: 'center',
  };
  if (isEditing) {
    return (
      <textarea
        autoFocus style={{ ...style, resize: 'none', border: 'none', outline: 'none' }}
        value={props.content}
        onChange={e => onContentChange(e.target.value)}
        onMouseDown={e => e.stopPropagation()}
      />
    );
  }
  return <div style={style}>{props.content}</div>;
}
```

- [ ] **DataFieldElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/DataFieldElement.jsx
export const FIELD_LABELS = {
  invoice_number: 'Invoice No.', invoice_date: 'Date', buyer_name: 'Buyer Name',
  buyer_gstin: 'Buyer GSTIN', buyer_address: 'Buyer Address', buyer_state: 'State',
  vehicle_no: 'Vehicle No.', challan_no: 'Challan No.', grand_total: 'Grand Total',
  company_name: 'Company Name', irn: 'IRN', ack_no: 'Ack No.', ack_date: 'Ack Date',
};

export default function DataFieldElement({ props, liveData }) {
  const value = liveData?.[props.field] ?? `{${props.field}}`;
  const style = {
    width: '100%', height: '100%', fontSize: props.fontSize,
    fontWeight: props.fontWeight, color: props.color,
    background: props.backgroundColor, textAlign: props.textAlign,
    padding: 3, boxSizing: 'border-box', display: 'flex', alignItems: 'center',
    overflow: 'hidden',
  };
  const label = props.label ? `${props.label}: ` : '';
  return <div style={style}><span style={{ opacity: 0.6, marginRight: 2 }}>{label}</span>{value}</div>;
}
```

- [ ] **ImageElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/ImageElement.jsx
import { useRef } from 'react';

export default function ImageElement({ props, onUpload }) {
  const inputRef = useRef();
  const style = { width: '100%', height: '100%', background: props.backgroundColor, borderRadius: props.borderRadius, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  if (!props.src) {
    return (
      <div style={{ ...style, border: '1.5px dashed #c96442', cursor: 'pointer', flexDirection: 'column', gap: 4 }}
           onClick={() => inputRef.current?.click()}>
        <span style={{ fontSize: 20 }}>🖼</span>
        <span style={{ fontSize: 9, color: '#87867f' }}>Click to upload</span>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
               onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => onUpload(ev.target.result); r.readAsDataURL(f); } }} />
      </div>
    );
  }
  return <div style={style}><img src={props.src} alt="" style={{ width: '100%', height: '100%', objectFit: props.objectFit, borderRadius: props.borderRadius }} /></div>;
}
```

- [ ] **TableElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/TableElement.jsx
const COL_LABELS = { description: 'Description', hsn: 'HSN', qty: 'Qty', unit: 'Unit', rate: 'Rate', amount: 'Amount', discount: 'Discount' };
const COL_WIDTHS = { description: '35%', hsn: '12%', qty: '10%', unit: '8%', rate: '12%', amount: '13%', discount: '10%' };

export default function TableElement({ props, liveData }) {
  const cols = props.columns || ['description', 'hsn', 'qty', 'rate', 'amount'];
  const items = liveData?.line_items || [{ description: 'Sample item', hsn: '2804', qty: '10', rate: '100.00', amount: '1,000.00' }];
  const hStyle = { background: props.headerBg, color: props.headerColor, fontSize: props.fontSize, fontWeight: 'bold', padding: '2px 4px', borderRight: `${props.borderWidth}px solid ${props.borderColor}` };
  const rowStyle = (i) => ({ background: i % 2 === 0 ? props.oddRowBg : props.evenRowBg, fontSize: props.fontSize, padding: '2px 4px', borderRight: `${props.borderWidth}px solid ${props.borderColor}`, borderBottom: `${props.borderWidth}px solid ${props.borderColor}` });

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', border: `${props.borderWidth}px solid ${props.borderColor}`, boxSizing: 'border-box' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>{cols.map(c => <th key={c} style={{ ...hStyle, width: COL_WIDTHS[c] }}>{COL_LABELS[c]}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>{cols.map(c => <td key={c} style={rowStyle(i)}>{item[c] ?? ''}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **TotalsElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/TotalsElement.jsx
export default function TotalsElement({ props, liveData }) {
  const fmt = v => parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', fontSize: props.fontSize, color: props.rowColor }}>
      <span>{label}</span><span>₹ {fmt(value)}</span>
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
      {row('Subtotal', liveData?.subtotal)}
      {props.showCgst && row(`CGST @${liveData?.cgst_rate ?? 2.5}%`, liveData?.cgst_amount)}
      {props.showSgst && row(`SGST @${liveData?.sgst_rate ?? 2.5}%`, liveData?.sgst_amount)}
      {props.showIgst && row(`IGST @${liveData?.igst_rate ?? 0}%`, liveData?.igst_amount)}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', fontSize: props.fontSize, fontWeight: 'bold', background: props.grandTotalBg, color: props.grandTotalColor, marginTop: 2, borderRadius: 2 }}>
        <span>Grand Total</span><span>₹ {fmt(liveData?.grand_total)}</span>
      </div>
    </div>
  );
}
```

- [ ] **AmountWordsElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/AmountWordsElement.jsx
import { amountToWords } from '../../../../../utils/invoiceUtils';
export default function AmountWordsElement({ props, liveData }) {
  const words = liveData?.grand_total ? amountToWords(liveData.grand_total) : 'Amount in Words';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', fontSize: props.fontSize, color: props.color, background: props.backgroundColor, fontStyle: props.italic ? 'italic' : 'normal', padding: 4, boxSizing: 'border-box' }}>
      {words}
    </div>
  );
}
```

- [ ] **BankDetailsElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/BankDetailsElement.jsx
export default function BankDetailsElement({ props, profile }) {
  const rows = [
    ['Bank', profile?.bank_name], ['A/C No.', profile?.bank_account],
    ['IFSC', profile?.bank_ifsc], ['Branch', profile?.bank_branch],
  ].filter(([, v]) => v);
  return (
    <div style={{ width: '100%', height: '100%', background: props.backgroundColor, border: props.border, padding: '4px 6px', fontSize: props.fontSize, boxSizing: 'border-box' }}>
      <div style={{ fontWeight: 'bold', color: props.labelColor, marginBottom: 3 }}>Bank Details</div>
      {rows.map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 4 }}>
          <span style={{ color: props.labelColor, minWidth: 50 }}>{l}:</span>
          <span style={{ color: props.valueColor }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **QRCodeElement.jsx** — install qrcode.react first: `npm install qrcode.react`

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/QRCodeElement.jsx
import { QRCodeSVG } from 'qrcode.react';
export default function QRCodeElement({ props, liveData }) {
  const value = liveData?.[props.field] || props.field || 'QR';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: props.bgColor }}>
      <QRCodeSVG value={value} fgColor={props.fgColor} bgColor={props.bgColor} size={Math.min(props.size || 80, 200)} />
    </div>
  );
}
```

- [ ] **BoxElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/BoxElement.jsx
export default function BoxElement({ props }) {
  return (
    <div style={{ width: '100%', height: '100%', background: props.backgroundColor, border: `${props.borderWidth}px ${props.borderStyle} ${props.borderColor}`, borderRadius: props.borderRadius, opacity: props.opacity, boxSizing: 'border-box' }} />
  );
}
```

- [ ] **LineElement.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/LineElement.jsx
export default function LineElement({ props }) {
  const isH = props.orientation !== 'vertical';
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: isH ? '100%' : props.thickness,
        height: isH ? props.thickness : '100%',
        background: props.color,
        borderTop: isH ? `${props.thickness}px ${props.style} ${props.color}` : 'none',
        borderLeft: !isH ? `${props.thickness}px ${props.style} ${props.color}` : 'none',
      }} />
    </div>
  );
}
```

- [ ] **Element index switcher**

```jsx
// frontend/src/pages/Invoices/components/canvas/elements/index.jsx
import TextElement from './TextElement';
import DataFieldElement from './DataFieldElement';
import ImageElement from './ImageElement';
import TableElement from './TableElement';
import TotalsElement from './TotalsElement';
import AmountWordsElement from './AmountWordsElement';
import BankDetailsElement from './BankDetailsElement';
import QRCodeElement from './QRCodeElement';
import BoxElement from './BoxElement';
import LineElement from './LineElement';

export default function ElementRenderer({ element, liveData, profile, isEditing, onContentChange, onUpload }) {
  const p = element.props;
  switch (element.type) {
    case 'text':        return <TextElement props={p} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'field':       return <DataFieldElement props={p} liveData={liveData} />;
    case 'image':       return <ImageElement props={p} onUpload={onUpload} />;
    case 'table':       return <TableElement props={p} liveData={liveData} />;
    case 'totals':      return <TotalsElement props={p} liveData={liveData} />;
    case 'amountwords': return <AmountWordsElement props={p} liveData={liveData} />;
    case 'bankdetails': return <BankDetailsElement props={p} profile={profile} />;
    case 'qrcode':      return <QRCodeElement props={p} liveData={liveData} />;
    case 'box':         return <BoxElement props={p} />;
    case 'line':        return <LineElement props={p} />;
    default:            return <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#888' }}>{element.type}</div>;
  }
}
```

- [ ] **Commit**

```bash
cd frontend
git add src/pages/Invoices/components/canvas/elements/
git commit -m "feat: all 10 canvas element components"
```

---

## Phase 6 — FloatingToolbar + PropertiesPanel

### Task 8: FloatingToolbar

**Files:**
- Create: `frontend/src/pages/Invoices/components/canvas/FloatingToolbar.jsx`

- [ ] **Create FloatingToolbar**

```jsx
// frontend/src/pages/Invoices/components/canvas/FloatingToolbar.jsx
const SWATCHES = ['#141413','#c96442','#8b0000','#1a237e','#2e7d32','#4a148c','#e65100','#ffffff','#faf9f5','transparent'];

function Swatch({ color, active, onClick }) {
  return (
    <div onClick={() => onClick(color)}
      style={{ width: 16, height: 16, background: color === 'transparent' ? 'none' : color, border: active ? '2px solid #c96442' : '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', flexShrink: 0, backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px' : 'none' }}
    />
  );
}

export default function FloatingToolbar({ element, onUpdate, onDelete, onShowMore }) {
  if (!element) return null;
  const p = element.props;
  const isText = ['text', 'field', 'amountwords'].includes(element.type);

  return (
    <div onMouseDown={e => e.stopPropagation()}
      style={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#141413', border: '1px solid #3d3d3a', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,.6)', whiteSpace: 'nowrap', pointerEvents: 'all' }}>

      {/* Background colour */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#87867f', fontSize: 8 }}>BG</span>
        {SWATCHES.map(c => <Swatch key={c} color={c} active={p.backgroundColor === c} onClick={col => onUpdate({ props: { backgroundColor: col } })} />)}
        <input type="color" value={p.backgroundColor === 'transparent' ? '#ffffff' : (p.backgroundColor || '#ffffff')}
          onChange={e => onUpdate({ props: { backgroundColor: e.target.value } })}
          style={{ width: 18, height: 18, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0 }} title="Custom colour" />
      </div>

      <div style={{ width: 1, height: 18, background: '#30302e' }} />

      {/* Text colour (for text-capable elements) */}
      {isText && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#87867f', fontSize: 8 }}>T</span>
            {['#141413','#ffffff','#faf9f5','#c96442','#1a237e','#8b0000'].map(c => <Swatch key={c} color={c} active={p.color === c} onClick={col => onUpdate({ props: { color: col } })} />)}
            <input type="color" value={p.color || '#141413'} onChange={e => onUpdate({ props: { color: e.target.value } })}
              style={{ width: 18, height: 18, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0 }} />
          </div>
          <div style={{ width: 1, height: 18, background: '#30302e' }} />
          <input type="number" value={p.fontSize || 11} min={6} max={48}
            onChange={e => onUpdate({ props: { fontSize: parseInt(e.target.value) } })}
            style={{ background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#e8e6dc', borderRadius: 4, padding: '2px 4px', fontSize: 9, width: 38, textAlign: 'center' }} />
          <button onClick={() => onUpdate({ props: { fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold' } })}
            style={{ background: p.fontWeight === 'bold' ? '#c96442' : '#1e1e1c', border: '1px solid #3d3d3a', color: p.fontWeight === 'bold' ? '#faf9f5' : '#b0aea5', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 'bold', cursor: 'pointer' }}>B</button>
        </>
      )}

      <div style={{ width: 1, height: 18, background: '#30302e' }} />
      <button onClick={onShowMore} style={{ background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 4, padding: '2px 8px', fontSize: 9, cursor: 'pointer' }}>More ›</button>
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: '#5e5d59', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>🗑</button>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/canvas/FloatingToolbar.jsx
git commit -m "feat: floating inline colour toolbar"
```

---

### Task 9: PropertiesPanel

**Files:**
- Create: `frontend/src/pages/Invoices/components/canvas/PropertiesPanel.jsx`

- [ ] **Create PropertiesPanel**

```jsx
// frontend/src/pages/Invoices/components/canvas/PropertiesPanel.jsx
import { FIELD_LABELS } from './elements/DataFieldElement';

const inp = { background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#e8e6dc', borderRadius: 5, padding: '3px 6px', fontSize: 9, width: '100%', boxSizing: 'border-box' };
const label = { color: '#5e5d59', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 };
const section = { marginBottom: 12 };

function ColorRow({ label: l, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ color: '#87867f', fontSize: 8, minWidth: 36 }}>{l}</span>
      <input type="color" value={value === 'transparent' ? '#ffffff' : (value || '#ffffff')} onChange={e => onChange(e.target.value)}
        style={{ width: 20, height: 20, border: '1px solid #3d3d3a', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
      <input value={value || ''} onChange={e => onChange(e.target.value)} style={{ ...inp, width: '100%' }} placeholder="#000000 or transparent" />
    </div>
  );
}

export default function PropertiesPanel({ element, onUpdate, onDelete, onBringForward, onSendBackward, snapGrid, onSnapChange, gridSize, onGridSizeChange }) {
  if (!element) {
    return (
      <div style={{ padding: 12, color: '#5e5d59', fontSize: 10, textAlign: 'center', paddingTop: 32 }}>
        <div style={{ marginBottom: 8, fontSize: 20 }}>←</div>
        Click an element to edit its properties
        <div style={{ ...section, marginTop: 20 }}>
          <div style={label}>Canvas</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#b0aea5', fontSize: 9 }}>Snap to grid</span>
            <div onClick={onSnapChange} style={{ background: snapGrid ? '#c96442' : '#30302e', borderRadius: 8, width: 28, height: 14, position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', width: 10, height: 10, background: '#faf9f5', borderRadius: '50%', top: 2, left: snapGrid ? 16 : 2, transition: 'left .15s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#b0aea5', fontSize: 9 }}>Grid size</span>
            <input type="number" value={gridSize} min={4} max={32} onChange={e => onGridSizeChange(parseInt(e.target.value))}
              style={{ ...inp, width: 44, textAlign: 'center' }} />
          </div>
        </div>
      </div>
    );
  }

  const p = element.props;
  const up = changes => onUpdate(element.id, changes);

  return (
    <div style={{ padding: 10, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ color: '#d97757', fontSize: 9, fontWeight: 600, marginBottom: 10 }}>
        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element
      </div>

      {/* Position + Size */}
      <div style={section}>
        <div style={label}>Position</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[['X', 'x'], ['Y', 'y']].map(([l, k]) => (
            <div key={k}><div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>{l}</div>
              <input type="number" value={element[k]} style={inp} onChange={e => up({ [k]: parseInt(e.target.value) || 0 })} /></div>
          ))}
        </div>
      </div>
      <div style={section}>
        <div style={label}>Size</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[['Width', 'width'], ['Height', 'height']].map(([l, k]) => (
            <div key={k}><div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>{l}</div>
              <input type="number" value={element[k]} style={inp} onChange={e => up({ [k]: parseInt(e.target.value) || 20 })} /></div>
          ))}
        </div>
      </div>

      {/* Colours */}
      <div style={section}>
        <div style={label}>Colours</div>
        {p.backgroundColor !== undefined && <ColorRow label="BG" value={p.backgroundColor} onChange={v => up({ props: { backgroundColor: v } })} />}
        {p.color !== undefined && <ColorRow label="Text" value={p.color} onChange={v => up({ props: { color: v } })} />}
        {p.borderColor !== undefined && <ColorRow label="Border" value={p.borderColor} onChange={v => up({ props: { borderColor: v } })} />}
        {p.headerBg !== undefined && <ColorRow label="Header BG" value={p.headerBg} onChange={v => up({ props: { headerBg: v } })} />}
        {p.headerColor !== undefined && <ColorRow label="Header Text" value={p.headerColor} onChange={v => up({ props: { headerColor: v } })} />}
        {p.grandTotalBg !== undefined && <ColorRow label="Total BG" value={p.grandTotalBg} onChange={v => up({ props: { grandTotalBg: v } })} />}
        {p.grandTotalColor !== undefined && <ColorRow label="Total Text" value={p.grandTotalColor} onChange={v => up({ props: { grandTotalColor: v } })} />}
        {p.oddRowBg !== undefined && <ColorRow label="Row 1" value={p.oddRowBg} onChange={v => up({ props: { oddRowBg: v } })} />}
        {p.evenRowBg !== undefined && <ColorRow label="Row 2" value={p.evenRowBg} onChange={v => up({ props: { evenRowBg: v } })} />}
      </div>

      {/* Font controls */}
      {p.fontSize !== undefined && (
        <div style={section}>
          <div style={label}>Typography</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
            <div><div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>Size</div>
              <input type="number" value={p.fontSize} min={6} max={48} style={inp} onChange={e => up({ props: { fontSize: parseInt(e.target.value) } })} /></div>
            <div><div style={{ color: '#87867f', fontSize: 8, marginBottom: 2 }}>Weight</div>
              <select value={p.fontWeight || 'normal'} style={inp} onChange={e => up({ props: { fontWeight: e.target.value } })}>
                <option value="normal">Normal</option><option value="bold">Bold</option>
              </select></div>
          </div>
          {p.textAlign !== undefined && (
            <div style={{ display: 'flex', gap: 3 }}>
              {['left','center','right'].map(a => (
                <button key={a} onClick={() => up({ props: { textAlign: a } })}
                  style={{ flex: 1, background: p.textAlign === a ? '#c96442' : '#1e1e1c', border: '1px solid #3d3d3a', color: p.textAlign === a ? '#faf9f5' : '#b0aea5', borderRadius: 4, padding: '3px 0', fontSize: 10, cursor: 'pointer' }}>
                  {a === 'left' ? '⬛' : a === 'center' ? '▪️' : '⬛'}  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Field binding */}
      {element.type === 'field' && (
        <div style={section}>
          <div style={label}>Bound Field</div>
          <select value={p.field || ''} style={inp} onChange={e => up({ props: { field: e.target.value } })}>
            {Object.entries(FIELD_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <div style={{ color: '#87867f', fontSize: 8, marginTop: 4, marginBottom: 2 }}>Label prefix</div>
          <input value={p.label || ''} style={inp} onChange={e => up({ props: { label: e.target.value } })} placeholder="e.g. Invoice No." />
        </div>
      )}

      {/* Table column toggles */}
      {element.type === 'table' && (
        <div style={section}>
          <div style={label}>Visible Columns</div>
          {['description','hsn','qty','unit','rate','discount','amount'].map(col => (
            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#b0aea5', cursor: 'pointer', marginBottom: 3 }}>
              <input type="checkbox" checked={(p.columns || []).includes(col)} style={{ accentColor: '#c96442' }}
                onChange={e => {
                  const cols = p.columns || [];
                  up({ props: { columns: e.target.checked ? [...cols, col] : cols.filter(c => c !== col) } });
                }} />
              {col.charAt(0).toUpperCase() + col.slice(1)}
            </label>
          ))}
        </div>
      )}

      {/* Totals toggles */}
      {element.type === 'totals' && (
        <div style={section}>
          <div style={label}>Show Rows</div>
          {[['showCgst','CGST'], ['showSgst','SGST'], ['showIgst','IGST']].map(([k, l]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#b0aea5', cursor: 'pointer', marginBottom: 3 }}>
              <input type="checkbox" checked={!!p[k]} style={{ accentColor: '#c96442' }} onChange={e => up({ props: { [k]: e.target.checked } })} /> {l}
            </label>
          ))}
        </div>
      )}

      {/* Layer */}
      <div style={{ ...section, borderTop: '1px solid #30302e', paddingTop: 10 }}>
        <div style={label}>Layer</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => onBringForward(element.id)} style={{ flex: 1, background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 5, padding: '4px 0', fontSize: 9, cursor: 'pointer' }}>↑ Forward</button>
          <button onClick={() => onSendBackward(element.id)} style={{ flex: 1, background: '#1e1e1c', border: '1px solid #3d3d3a', color: '#b0aea5', borderRadius: 5, padding: '4px 0', fontSize: 9, cursor: 'pointer' }}>↓ Back</button>
        </div>
      </div>

      <button onClick={() => onDelete(element.id)} style={{ width: '100%', background: 'rgba(181,89,59,.15)', border: '1px solid rgba(181,89,59,.3)', color: '#b5593b', borderRadius: 6, padding: '5px 0', fontSize: 9, cursor: 'pointer', marginTop: 4 }}>
        🗑 Delete Element
      </button>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/canvas/PropertiesPanel.jsx
git commit -m "feat: properties panel with full per-element style controls"
```

---

## Phase 7 — Canvas + ElementPalette

### Task 10: Canvas.jsx

**Files:**
- Create: `frontend/src/pages/Invoices/components/canvas/Canvas.jsx`

- [ ] **Create Canvas.jsx**

```jsx
// frontend/src/pages/Invoices/components/canvas/Canvas.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import ElementRenderer from './elements/index';
import FloatingToolbar from './FloatingToolbar';

const A4_W = 794;
const A4_H = 1123;

function snapTo(val, grid) {
  return grid > 1 ? Math.round(val / grid) * grid : val;
}

export default function Canvas({ elements, selectedId, onSelect, onUpdate, onDelete, onBringForward, onSendBackward, snapGrid, gridSize, liveData, profile, zoom }) {
  const [editingId, setEditingId] = useState(null);
  const canvasRef = useRef(null);
  const scale = zoom / 100;

  // Click on canvas background deselects
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.dataset.canvas) {
      onSelect(null);
      setEditingId(null);
    }
  }, [onSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && editingId !== selectedId) { onDelete(selectedId); }
      }
      if (e.key === 'Escape') { onSelect(null); setEditingId(null); }
      const nudge = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { e.preventDefault(); onUpdate(selectedId, { x: (elements.find(el => el.id === selectedId)?.x || 0) - nudge }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onUpdate(selectedId, { x: (elements.find(el => el.id === selectedId)?.x || 0) + nudge }); }
      if (e.key === 'ArrowUp') { e.preventDefault(); onUpdate(selectedId, { y: (elements.find(el => el.id === selectedId)?.y || 0) - nudge }); }
      if (e.key === 'ArrowDown') { e.preventDefault(); onUpdate(selectedId, { y: (elements.find(el => el.id === selectedId)?.y || 0) + nudge }); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedId, editingId, elements, onDelete, onUpdate]);

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const selectedEl = elements.find(e => e.id === selectedId);

  return (
    <div style={{ background: '#1e1e1c', overflow: 'auto', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 }}>
      {/* A4 page */}
      <div
        ref={canvasRef}
        data-canvas="true"
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          width: A4_W * scale,
          height: A4_H * scale,
          background: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          flexShrink: 0,
          backgroundImage: snapGrid ? 'radial-gradient(#e0ddd6 1px,transparent 1px)' : 'none',
          backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
        }}
      >
        {/* Scale wrapper for all elements */}
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_W, height: A4_H, position: 'absolute', top: 0, left: 0 }}>
          {sorted.map(el => {
            const isSelected = el.id === selectedId;
            const isEditing = el.id === editingId;
            return (
              <Rnd
                key={el.id}
                position={{ x: el.x, y: el.y }}
                size={{ width: el.width, height: el.height }}
                bounds="parent"
                onDragStop={(_, d) => {
                  const x = snapGrid ? snapTo(d.x, gridSize) : d.x;
                  const y = snapGrid ? snapTo(d.y, gridSize) : d.y;
                  onUpdate(el.id, { x: Math.max(0, Math.min(x, A4_W - el.width)), y: Math.max(0, Math.min(y, A4_H - el.height)) });
                }}
                onResizeStop={(_, __, ref, ___, pos) => {
                  onUpdate(el.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: pos.x, y: pos.y });
                }}
                style={{ zIndex: el.zIndex, boxSizing: 'border-box', outline: isSelected ? '2px solid #c96442' : 'none', outlineOffset: 1 }}
                resizeHandleStyles={isSelected ? {
                  bottomRight: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', right: -4, bottom: -4 },
                  right: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', right: -4, top: '50%', transform: 'translateY(-50%)' },
                  bottom: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', bottom: -4, left: '50%', transform: 'translateX(-50%)' },
                  topLeft: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', left: -4, top: -4 },
                } : {}}
                enableResizing={isSelected}
                disableDragging={isEditing}
                onClick={e => { e.stopPropagation(); onSelect(el.id); }}
                onDoubleClick={() => { if (el.type === 'text') setEditingId(el.id); }}
              >
                {/* Floating toolbar — rendered above selected element */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
                    <FloatingToolbar
                      element={el}
                      onUpdate={changes => onUpdate(el.id, changes)}
                      onDelete={() => onDelete(el.id)}
                      onShowMore={() => {}}
                    />
                  </div>
                )}
                <ElementRenderer
                  element={el}
                  liveData={liveData}
                  profile={profile}
                  isEditing={isEditing}
                  onContentChange={val => onUpdate(el.id, { props: { content: val } })}
                  onUpload={src => onUpdate(el.id, { props: { src } })}
                />
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/canvas/Canvas.jsx
git commit -m "feat: A4 drag-drop canvas with react-rnd, snap grid, inline toolbar"
```

---

### Task 11: ElementPalette.jsx

**Files:**
- Create: `frontend/src/pages/Invoices/components/canvas/ElementPalette.jsx`

- [ ] **Create ElementPalette**

```jsx
// frontend/src/pages/Invoices/components/canvas/ElementPalette.jsx
const GROUPS = [
  {
    label: 'Layout',
    items: [
      { type: 'box',  icon: '□', label: 'Box / Container' },
      { type: 'line', icon: '─', label: 'Divider Line' },
    ],
  },
  {
    label: 'Content',
    items: [
      { type: 'text',  icon: 'T', label: 'Text Block' },
      { type: 'image', icon: '🖼', label: 'Image / Logo' },
      { type: 'field', icon: '≡', label: 'Data Field', highlight: true },
    ],
  },
  {
    label: 'Invoice',
    items: [
      { type: 'table',       icon: '⊞', label: 'Line Items Table' },
      { type: 'totals',      icon: '₹', label: 'Totals Block' },
      { type: 'amountwords', icon: '✍', label: 'Amount in Words' },
      { type: 'bankdetails', icon: '🏦', label: 'Bank Details' },
      { type: 'qrcode',      icon: '⬛', label: 'QR Code' },
    ],
  },
];

const STARTER_TEMPLATES = [
  { label: 'GST Logo',  key: 'gst_logo' },
  { label: 'Challan',   key: 'challan' },
  { label: 'e-Invoice', key: 'gst_einvoice' },
];

export default function ElementPalette({ onAddElement, onLoadStarter }) {
  return (
    <div style={{ background: '#141413', borderRight: '1px solid #30302e', padding: 10, overflowY: 'auto', height: '100%', width: 175, flexShrink: 0 }}>
      <div style={{ color: '#5e5d59', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Elements</div>

      {GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 10 }}>
          <div style={{ color: '#87867f', fontSize: 9, fontWeight: 600, marginBottom: 4 }}>{group.label}</div>
          {group.items.map(item => (
            <div key={item.type}
              draggable
              onDragEnd={e => {
                // When dropped onto canvas, add at approx drop position
                onAddElement(item.type);
              }}
              onClick={() => onAddElement(item.type)}
              style={{
                background: item.highlight ? 'rgba(201,100,66,0.15)' : '#1e1e1c',
                border: item.highlight ? '1px solid rgba(201,100,66,0.4)' : '1px solid #30302e',
                borderRadius: 6, padding: '5px 8px', marginBottom: 3,
                fontSize: 10, color: item.highlight ? '#d97757' : '#e8e6dc',
                cursor: 'grab', display: 'flex', alignItems: 'center', gap: 7,
                fontWeight: item.highlight ? 600 : 400,
                userSelect: 'none',
              }}>
              <span style={{ color: item.highlight ? '#d97757' : '#5e5d59', fontSize: 11 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div style={{ borderTop: '1px solid #30302e', paddingTop: 10 }}>
        <div style={{ color: '#87867f', fontSize: 9, fontWeight: 600, marginBottom: 4 }}>Start From</div>
        {STARTER_TEMPLATES.map(t => (
          <div key={t.key} onClick={() => onLoadStarter(t.key)}
            style={{ border: '1px dashed #3d3d3a', borderRadius: 6, padding: '5px 8px', marginBottom: 3, fontSize: 10, color: '#87867f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#c96442' }}>📋</span> {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/canvas/ElementPalette.jsx
git commit -m "feat: element palette with grouped items and starter templates"
```

---

## Phase 8 — TemplateBuilder page

### Task 12: TemplateBuilder.jsx

**Files:**
- Create: `frontend/src/pages/Invoices/TemplateBuilder.jsx`

- [ ] **Create TemplateBuilder**

```jsx
// frontend/src/pages/Invoices/TemplateBuilder.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '../../components/ui';
import Canvas from './components/canvas/Canvas';
import ElementPalette from './components/canvas/ElementPalette';
import PropertiesPanel from './components/canvas/PropertiesPanel';
import { useCanvasState } from './components/canvas/useCanvasState';
import { templatesAPI } from '../../api/invoiceTemplates';
import OCRUploadModal from './components/OCRUploadModal';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const STARTER_SCHEMAS = {
  gst_logo: { pageSize: { width: 794, height: 1123 }, elements: [
    { id: 's1', type: 'image',  x: 12,  y: 12,  width: 90,  height: 52, zIndex: 1, props: { src: null, objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent' } },
    { id: 's2', type: 'text',   x: 112, y: 14,  width: 240, height: 20, zIndex: 2, props: { content: 'Company Name', fontSize: 12, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#141413', backgroundColor: 'transparent', textAlign: 'left', letterSpacing: 0, padding: 2 } },
    { id: 's3', type: 'line',   x: 8,   y: 68,  width: 778, height: 2,  zIndex: 3, props: { color: '#c96442', thickness: 2, style: 'solid', orientation: 'horizontal' } },
    { id: 's4', type: 'text',   x: 297, y: 76,  width: 200, height: 22, zIndex: 4, props: { content: 'TAX INVOICE', fontSize: 12, fontWeight: 'bold', fontFamily: 'Playfair Display', color: '#c96442', backgroundColor: 'transparent', textAlign: 'center', letterSpacing: 3, padding: 2 } },
    { id: 's5', type: 'field',  x: 8,   y: 104, width: 200, height: 16, zIndex: 5, props: { field: 'invoice_number', label: 'Invoice No.', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
    { id: 's6', type: 'field',  x: 214, y: 104, width: 160, height: 16, zIndex: 5, props: { field: 'invoice_date', label: 'Date', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
    { id: 's7', type: 'table',  x: 8,   y: 130, width: 778, height: 180, zIndex: 6, props: { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description','hsn','qty','rate','amount'] } },
    { id: 's8', type: 'totals', x: 558, y: 322, width: 228, height: 90,  zIndex: 7, props: { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 } },
    { id: 's9', type: 'amountwords', x: 8, y: 324, width: 360, height: 22, zIndex: 7, props: { fontSize: 9, color: '#141413', backgroundColor: 'transparent', italic: true } },
  ]},
};

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('Untitled Template');
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [snapGrid, setSnapGrid] = useState(true);
  const [gridSize, setGridSize] = useState(8);
  const [showOCR, setShowOCR] = useState(false);
  const canvasRef = useRef(null);

  const { elements, selectedId, selected, setSelectedId, addElement, updateElement, deleteElement, bringForward, sendBackward, updateElements, undo, redo } = useCanvasState([]);

  useEffect(() => {
    if (id) loadTemplate();
  }, [id]);

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  async function loadTemplate() {
    try {
      const { data } = await templatesAPI.get(id);
      setName(data.name);
      if (data.schema?.elements) updateElements(() => data.schema.elements);
    } catch { toast.error('Failed to load template'); }
  }

  function handleLoadStarter(key) {
    const schema = STARTER_SCHEMAS[key];
    if (!schema) return;
    updateElements(() => schema.elements.map(e => ({ ...e, props: { ...e.props } })));
    toast.success(`Loaded ${key} starter template`);
  }

  async function generateThumbnail() {
    const canvasEl = document.querySelector('[data-canvas="true"]');
    if (!canvasEl) return '';
    try {
      const cvs = await html2canvas(canvasEl, { scale: 0.3, useCORS: true, logging: false });
      return cvs.toDataURL('image/jpeg', 0.7);
    } catch { return ''; }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const thumbnail = await generateThumbnail();
      const schema = { pageSize: { width: 794, height: 1123 }, elements };
      const payload = { name, schema, thumbnail };
      if (id) {
        await templatesAPI.update(id, payload);
      } else {
        const { data } = await templatesAPI.create(payload);
        navigate(`/invoices/templates/${data.id}`, { replace: true });
      }
      toast.success('Template saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  function handleOCRResult({ elements: ocrElements }) {
    if (ocrElements?.length) {
      updateElements(() => ocrElements);
      toast.success(`${ocrElements.length} elements detected from image`);
    }
    setShowOCR(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Toolbar */}
      <div style={{ background: '#141413', color: '#faf9f5', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #30302e', flexShrink: 0 }}>
        <button onClick={() => navigate('/invoices/templates')} style={{ background: 'none', border: 'none', color: '#c96442', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Templates
        </button>
        <input value={name} onChange={e => setName(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#faf9f5', fontSize: 13, fontFamily: 'Georgia,serif', fontWeight: 600, textAlign: 'center', outline: 'none' }}
          onBlur={e => { if (!e.target.value.trim()) setName('Untitled Template'); }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ color: '#87867f', fontSize: 10 }}>Ctrl+Z undo</span>
          <button onClick={() => setShowOCR(true)}
            style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', padding: '4px 10px', borderRadius: 8, fontSize: 10, cursor: 'pointer' }}>
            Upload Image (OCR)
          </button>
          <div style={{ display: 'flex', gap: 3 }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 25))}
              style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>−</button>
            <span style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', padding: '0 8px', borderRadius: 6, fontSize: 10, display: 'flex', alignItems: 'center', minWidth: 44, justifyContent: 'center' }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 25))}
              style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>+</button>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ background: '#c96442', border: 'none', color: '#faf9f5', padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: saving ? .6 : 1 }}>
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* 3-column workspace */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ElementPalette onAddElement={addElement} onLoadStarter={handleLoadStarter} />
        <div style={{ flex: 1, overflow: 'hidden' }} ref={canvasRef}>
          <Canvas
            elements={elements} selectedId={selectedId}
            onSelect={setSelectedId} onUpdate={updateElement}
            onDelete={deleteElement} onBringForward={bringForward} onSendBackward={sendBackward}
            snapGrid={snapGrid} gridSize={gridSize}
            liveData={null} profile={null}
            zoom={zoom}
          />
        </div>
        <div style={{ width: 195, flexShrink: 0, background: '#141413', borderLeft: '1px solid #30302e', overflowY: 'auto' }}>
          <PropertiesPanel
            element={selected} onUpdate={updateElement}
            onDelete={deleteElement} onBringForward={bringForward} onSendBackward={sendBackward}
            snapGrid={snapGrid} onSnapChange={() => setSnapGrid(v => !v)}
            gridSize={gridSize} onGridSizeChange={setGridSize}
          />
        </div>
      </div>

      {showOCR && <OCRUploadModal onResult={handleOCRResult} onClose={() => setShowOCR(false)} />}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/TemplateBuilder.jsx
git commit -m "feat: TemplateBuilder page with full canvas, palette, properties panel"
```

---

## Phase 9 — OCR Upload Modal

### Task 13: OCRUploadModal.jsx

**Files:**
- Create: `frontend/src/pages/Invoices/components/OCRUploadModal.jsx`

- [ ] **Create OCRUploadModal**

```jsx
// frontend/src/pages/Invoices/components/OCRUploadModal.jsx
import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';

export default function OCRUploadModal({ onResult, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | ocr | ai | done
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }

  async function handleParse() {
    if (!file) return;
    setStatus('ocr');
    setProgress(0);
    try {
      // Step 1: Tesseract OCR
      const worker = await createWorker('eng', 1, {
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 60)); },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();

      // Convert Tesseract words to text blocks
      const blocks = data.words.map(w => ({
        text: w.text,
        x: w.bbox.x0,
        y: w.bbox.y0,
        width: w.bbox.x1 - w.bbox.x0,
        height: w.bbox.y1 - w.bbox.y0,
        confidence: w.confidence,
      })).filter(b => b.text.trim().length > 0 && b.confidence > 40);

      setStatus('ai');
      setProgress(65);

      // Step 2: Ollama field mapping via AI service
      const res = await fetch('http://localhost:8001/ocr/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_blocks: blocks,
          page_width: data.hocr ? 794 : (data.blocks?.[0]?.bbox?.x1 || 794),
          page_height: data.hocr ? 1123 : (data.blocks?.[0]?.bbox?.y1 || 1123),
        }),
      });
      if (!res.ok) throw new Error('AI parsing failed');
      const parsed = await res.json();
      setProgress(100);
      setStatus('done');

      onResult(parsed);
    } catch (err) {
      console.error(err);
      toast.error(`OCR failed: ${err.message}`);
      setStatus('idle');
    }
  }

  const statusMsg = { idle: '', ocr: `Running OCR… ${progress}%`, ai: 'Mapping fields with Ollama…', done: 'Done!' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#faf9f5', borderRadius: 12, padding: 24, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontFamily: 'Georgia,serif', color: '#141413' }}>Upload Invoice Image (OCR)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#87867f' }}><X size={18} /></button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          style={{ border: '2px dashed #e8c4b0', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: preview ? '#f0eee6' : 'white', marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} />
          ) : (
            <>
              <div style={{ fontSize: 32 }}>📄</div>
              <div style={{ fontSize: 13, color: '#5e5d59' }}>Click or drag & drop an invoice image</div>
              <div style={{ fontSize: 11, color: '#87867f' }}>PNG, JPG, PDF accepted</div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
        </div>

        {/* Progress */}
        {status !== 'idle' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: '#f0eee6', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ background: '#c96442', height: '100%', width: `${progress}%`, transition: 'width .3s', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: '#5e5d59' }}>{statusMsg[status]}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#f0eee6', border: '1px solid #e8e6dc', color: '#4d4c48', padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleParse} disabled={!file || status !== 'idle'}
            style={{ background: '#c96442', border: 'none', color: '#faf9f5', padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!file || status !== 'idle') ? .5 : 1 }}>
            {status === 'idle' ? 'Parse this document' : 'Processing…'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/OCRUploadModal.jsx
git commit -m "feat: OCR upload modal with Tesseract.js + Ollama pipeline"
```

---

## Phase 10 — Template Manager

### Task 14: TemplateManager.jsx

**Files:**
- Create: `frontend/src/pages/Invoices/TemplateManager.jsx`

- [ ] **Create TemplateManager**

```jsx
// frontend/src/pages/Invoices/TemplateManager.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Copy, Trash2, Star } from 'lucide-react';
import { Button } from '../../components/ui';
import { PageHeader } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';
import { templatesAPI } from '../../api/invoiceTemplates';
import toast from 'react-hot-toast';

export default function TemplateManager() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await templatesAPI.list();
      setTemplates(data.results || data || []);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this template?')) return;
    try { await templatesAPI.delete(id); load(); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  }

  async function handleDuplicate(id) {
    try { await templatesAPI.duplicate(id); load(); toast.success('Duplicated'); }
    catch { toast.error('Duplicate failed'); }
  }

  async function handleSetDefault(id) {
    try { await templatesAPI.setDefault(id); load(); toast.success('Set as default'); }
    catch { toast.error('Failed'); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Invoice Templates">
        <Button icon={Plus} onClick={() => navigate('/invoices/templates/new')}>New Template</Button>
      </PageHeader>

      {templates.length === 0 ? (
        <div className="u-card p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="u-text-3 mb-4">No templates yet. Create one or upload an invoice image.</p>
          <Button icon={Plus} onClick={() => navigate('/invoices/templates/new')}>Create First Template</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {templates.map(t => (
            <div key={t.id} className="u-card overflow-hidden hover:shadow-md transition-shadow" style={{ border: t.is_default ? '2px solid var(--brand)' : '1px solid var(--border)' }}>
              {/* Thumbnail */}
              <div style={{ height: 120, background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
                onClick={() => navigate(`/invoices/templates/${t.id}`)}>
                {t.thumbnail
                  ? <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <div style={{ fontSize: 40, opacity: .3 }}>📄</div>
                }
                {t.is_default && (
                  <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--brand)', color: 'var(--brand-fg)', fontSize: 9, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>Default</span>
                )}
              </div>
              {/* Card body */}
              <div className="p-3">
                <div className="u-text font-semibold text-sm mb-0.5">{t.name}</div>
                <div className="u-text-3 text-xs mb-3">Updated {new Date(t.updated_at).toLocaleDateString('en-IN')}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => navigate(`/invoices/templates/${t.id}`)}
                    className="flex-1 text-xs py-1 rounded-md u-bg-surface-2 u-text-2 hover:u-text border u-border">Edit</button>
                  <button onClick={() => handleDuplicate(t.id)}
                    className="flex-1 text-xs py-1 rounded-md u-bg-surface-2 u-text-2 hover:u-text border u-border">Copy</button>
                  {!t.is_default && (
                    <button onClick={() => handleSetDefault(t.id)} title="Set as default"
                      className="p-1.5 u-text-3 hover:u-text rounded border u-border"><Star className="h-3 w-3" /></button>
                  )}
                  <button onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded border border-red-200"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}

          {/* New template card */}
          <div onClick={() => navigate('/invoices/templates/new')}
            className="u-card flex flex-col items-center justify-center cursor-pointer hover:u-bg-surface-2 transition-colors"
            style={{ minHeight: 200, border: '1.5px dashed var(--border)' }}>
            <div style={{ width: 36, height: 36, background: 'var(--brand-light)', border: '1.5px dashed var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontSize: 20, marginBottom: 8 }}>+</div>
            <div className="text-sm font-semibold u-text-brand">New Template</div>
            <div className="text-xs u-text-3 mt-1 text-center px-4">Start blank or upload an image</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/TemplateManager.jsx
git commit -m "feat: TemplateManager card grid page"
```

---

## Phase 11 — Invoice Builder Integration

### Task 15: TemplateRenderer + TemplatePickerModal

**Files:**
- Create: `frontend/src/pages/Invoices/components/TemplateRenderer.jsx`
- Create: `frontend/src/pages/Invoices/components/TemplatePickerModal.jsx`

- [ ] **Create TemplateRenderer.jsx** — renders a saved template schema with live invoice data

```jsx
// frontend/src/pages/Invoices/components/TemplateRenderer.jsx
import ElementRenderer from './canvas/elements/index';

const A4_W = 794;
const A4_H = 1123;

export default function TemplateRenderer({ schema, invoiceData, profile, scale = 0.5 }) {
  if (!schema?.elements?.length) {
    return (
      <div style={{ width: A4_W * scale, height: A4_H * scale, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#87867f', fontSize: 12, border: '1px solid #e8e6dc' }}>
        No template selected
      </div>
    );
  }

  const sorted = [...schema.elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  return (
    <div style={{ width: A4_W * scale, height: A4_H * scale, background: 'white', position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_W, height: A4_H, position: 'absolute', top: 0, left: 0 }}>
        {sorted.map(el => (
          <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, zIndex: el.zIndex || 1 }}>
            <ElementRenderer element={el} liveData={invoiceData} profile={profile} isEditing={false} onContentChange={() => {}} onUpload={() => {}} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Create TemplatePickerModal.jsx**

```jsx
// frontend/src/pages/Invoices/components/TemplatePickerModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { templatesAPI } from '../../../api/invoiceTemplates';
import toast from 'react-hot-toast';

export default function TemplatePickerModal({ currentId, onSelect, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(currentId || null);

  useEffect(() => {
    templatesAPI.list()
      .then(({ data }) => setTemplates(data.results || data || []))
      .catch(() => toast.error('Failed to load templates'));
  }, []);

  function handleConfirm() {
    const tmpl = templates.find(t => t.id === selected);
    onSelect(tmpl || null);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="u-card" style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontFamily: 'Georgia,serif' }} className="u-text">Choose a Template</h2>
          <button onClick={onClose} className="u-text-3 hover:u-text"><X size={18} /></button>
        </div>
        <p className="u-text-3 text-xs mb-4">Your invoice will use this layout. You can change it later.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, overflowY: 'auto', flex: 1, marginBottom: 14 }}>
          {templates.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              style={{ border: selected === t.id ? '2px solid var(--brand)' : '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 80, background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.thumbnail
                  ? <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 28, opacity: .3 }}>📄</span>
                }
              </div>
              <div style={{ padding: '5px 8px' }}>
                <div className="u-text text-xs font-semibold">{t.name} {t.is_default ? '★' : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { onSelect(null); onClose(); }} className="u-text-3 text-xs hover:u-text">Skip — use default</button>
          <button onClick={handleConfirm} disabled={!selected}
            style={{ background: 'var(--brand)', border: 'none', color: 'var(--brand-fg)', padding: '6px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: selected ? 1 : .5 }}>
            Use Selected →
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/components/TemplateRenderer.jsx frontend/src/pages/Invoices/components/TemplatePickerModal.jsx
git commit -m "feat: TemplateRenderer and TemplatePickerModal"
```

---

### Task 16: Wire template into Invoice Builder + Index

**Files:**
- Modify: `frontend/src/pages/Invoices/Builder.jsx`
- Modify: `frontend/src/pages/Invoices/Index.jsx`

- [ ] **Add template picker trigger to Index.jsx** — find the "New Invoice" button and replace:

```jsx
// Replace:
<Button icon={Plus} onClick={() => navigate('/invoices/new')}>New Invoice</Button>

// With:
const [showPicker, setShowPicker] = useState(false);
// ...
<Button icon={Plus} onClick={() => setShowPicker(true)}>New Invoice</Button>
{showPicker && (
  <TemplatePickerModal
    onSelect={tmpl => { setShowPicker(false); navigate('/invoices/new', { state: { template: tmpl } }); }}
    onClose={() => setShowPicker(false)}
  />
)}
```

Also add import at top of Index.jsx:
```jsx
import TemplatePickerModal from './components/TemplatePickerModal';
```

And add a "Templates" tab to the page header area (before the FilterBar):
```jsx
<div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 12 }}>
  <button onClick={() => {}} style={{ padding: '6px 16px', fontSize: 12, fontWeight: 700, color: 'var(--brand)', borderBottom: '2px solid var(--brand)', marginBottom: -2, background: 'none', border: 'none', cursor: 'pointer' }}>Invoices</button>
  <button onClick={() => navigate('/invoices/templates')} style={{ padding: '6px 16px', fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>Templates</button>
</div>
```

- [ ] **Add template rendering to Builder.jsx** — add these at the top of the component state:

```jsx
import { useLocation } from 'react-router-dom';
import TemplateRenderer from './components/TemplateRenderer';
import TemplatePickerModal from './components/TemplatePickerModal';
// ...
const location = useLocation();
const [activeTemplate, setActiveTemplate] = useState(location.state?.template || null);
const [showTemplatePicker, setShowTemplatePicker] = useState(false);
```

Replace the preview panel (the 60% right side) in Builder.jsx:
```jsx
{/* Preview — 60% */}
<div className="flex-1 overflow-hidden rounded-lg flex flex-col" style={{ backgroundColor: 'var(--surface)' }}>
  <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span className="u-text-3 text-xs">{activeTemplate ? activeTemplate.name : 'No template'}</span>
    <button onClick={() => setShowTemplatePicker(true)} className="text-xs u-text-brand hover:underline">
      {activeTemplate ? 'Change Template' : 'Pick Template'}
    </button>
  </div>
  <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 12 }}>
    {activeTemplate?.schema
      ? <TemplateRenderer schema={activeTemplate.schema} invoiceData={form} profile={activeProfile} scale={0.6} />
      : <InvoicePreview invoice={form} profile={activeProfile} />
    }
  </div>
</div>
```

Add modal at bottom of Builder return before closing div:
```jsx
{showTemplatePicker && (
  <TemplatePickerModal
    currentId={activeTemplate?.id}
    onSelect={tmpl => { setActiveTemplate(tmpl); setShowTemplatePicker(false); }}
    onClose={() => setShowTemplatePicker(false)}
  />
)}
```

- [ ] **Verify Builder still works** — start dev server, open `/invoices/new`, confirm existing flow unchanged.

```bash
cd frontend && npm run dev
```

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/Index.jsx frontend/src/pages/Invoices/Builder.jsx
git commit -m "feat: integrate template picker into invoice list and builder"
```

---

## Phase 12 — PDF Export

### Task 17: WYSIWYG PDF (html2canvas + jsPDF)

**Files:**
- Modify: `frontend/src/pages/Invoices/Builder.jsx`

The Puppeteer server-side PDF requires Node.js setup outside this plan. The WYSIWYG PDF via html2canvas is sufficient for all use cases and already installed.

- [ ] **Add WYSIWYG PDF download** — in Builder.jsx `handleDownloadPDF`, add template branch:

```jsx
async function handleDownloadPDF() {
  setShowDownloadMenu(false);
  try {
    toast.loading('Generating PDF…', { id: 'pdf' });

    if (activeTemplate?.schema) {
      // Capture the TemplateRenderer div
      const rendererEl = document.querySelector('[data-template-renderer]');
      if (!rendererEl) throw new Error('Renderer not found');
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(rendererEl, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`invoice-${form.invoice_number || 'draft'}.pdf`);
    } else {
      // Fallback to existing react-pdf flow
      const blob = await pdf(<InvoiceDocument invoice={form} profile={activeProfile} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${form.invoice_number || 'draft'}.pdf`; a.click();
      URL.revokeObjectURL(url);
    }

    toast.success('PDF downloaded', { id: 'pdf' });
    await handleSave('final');
  } catch (err) {
    console.error(err);
    toast.error('PDF generation failed', { id: 'pdf' });
  }
}
```

Add `data-template-renderer` attribute to the TemplateRenderer wrapper div in the preview panel.

- [ ] **Commit**

```bash
git add frontend/src/pages/Invoices/Builder.jsx
git commit -m "feat: WYSIWYG PDF download via html2canvas for template-based invoices"
```

---

## Phase 13 — Final Wiring + Smoke Test

### Task 18: End-to-end smoke test + navigation

- [ ] **Ensure backend is running**

```bash
cd backend && python manage.py runserver
```

- [ ] **Ensure frontend is running**

```bash
cd frontend && npm run dev
```

- [ ] **Test template creation flow**
  1. Navigate to `/invoices/templates`
  2. Click "New Template"
  3. Verify 3-panel builder loads
  4. Click "Text Block" in palette → element appears on canvas
  5. Click element → floating toolbar appears
  6. Change BG colour → verifies live update
  7. Click "Save Template" → toast success → URL updates to `/invoices/templates/:id`
  8. Navigate back to `/invoices/templates` → thumbnail card appears

- [ ] **Test template usage flow**
  1. Navigate to `/invoices`
  2. Click "New Invoice"
  3. Verify TemplatePickerModal opens
  4. Select template → click "Use Selected →"
  5. Verify Builder loads with template preview on right
  6. Fill in buyer name → verify data field in template updates live

- [ ] **Test OCR flow**
  1. Open `/invoices/templates/new`
  2. Click "Upload Image (OCR)"
  3. Upload any invoice image
  4. Click "Parse this document"
  5. Verify progress bar moves, then canvas populates

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: invoice template builder — complete implementation"
```

---

## Out of Scope (not in this plan)

- Puppeteer server-side vector PDF (requires Node.js server setup — document separately)
- `qrcode.react` install reminder: `npm install qrcode.react` (Task 7 step)
- Template import/export as shareable files
- Mobile canvas editing

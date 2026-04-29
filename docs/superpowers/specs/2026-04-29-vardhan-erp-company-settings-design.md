# Vardhan ERP — App Rebrand + Company Settings (Phase 1)

**Date:** 2026-04-29
**Branch:** feature/company-settings
**Scope:** Phase 1 of multi-tenant Vardhan ERP platform

---

## Overview

Rename the product from "Umiya Chemical Dashboard" to **Vardhan ERP** and build a comprehensive **Company Settings** panel that allows each client admin to configure their company branding, business identity, and invoice defaults — all from a single tabbed settings page.

This is Phase 1 of a larger multi-tenant SaaS roadmap. The architecture is designed to be multi-tenant-ready (models are structured for future `company_id` isolation) but no tenant switching or subdomain routing is built in this phase.

---

## Goals

- Rename all default branding to "Vardhan ERP"
- Give client admins a polished, tabbed Company Settings page
- Apply brand colors dynamically across the entire app via CSS custom properties
- Merge the per-invoice CompanyProfileModal concept with a global BusinessProfile
- Respect per-user dark/light mode override while allowing company-level default

---

## Out of Scope (Future Phases)

- Multi-tenant row isolation (`company_id` on every model)
- Subdomain / custom domain routing
- UI label personalization (module name overrides)
- Email template branding
- Report watermarks
- SSO / integrations

---

## Backend

### 1. Extend `Branding` model (`backend/apps/core/models.py`)

Add to the existing `Branding` model:

| Field | Type | Default | Notes |
|---|---|---|---|
| `primary_color` | CharField(7) | `#6366f1` | Hex color |
| `secondary_color` | CharField(7) | `#10b981` | Hex color |
| `login_bg` | ImageField | null/blank | Login page background |
| `dark_mode_default` | CharField(10) | `system` | Choices: `light`, `dark`, `system` |

Migration: `0002_branding_colors_theme.py`

### 2. New `BusinessProfile` model (`backend/apps/core/models.py`)

Singleton model (enforced via `save()` override — only one row allowed for now).

| Field | Type | Notes |
|---|---|---|
| `name` | CharField | Company legal name |
| `address` | TextField | Full address |
| `email` | EmailField | Contact email |
| `phone` | CharField | Contact phone |
| `website` | URLField | Optional |
| `gstin` | CharField(15) | GST number |
| `pan` | CharField(10) | PAN number |
| `state` | CharField | e.g. Maharashtra |
| `state_code` | CharField(2) | e.g. 27 |
| `bank_name` | CharField | |
| `account_no` | CharField | |
| `ifsc_code` | CharField(11) | |
| `currency` | CharField(3) | Default `INR` |
| `timezone` | CharField | Default `Asia/Kolkata` |
| `language` | CharField(10) | Default `en` |
| `date_format` | CharField | Default `DD/MM/YYYY` |
| `logo_base64` | TextField | Base64 encoded logo for invoices |

Migration: `0003_businessprofile.py`

### 3. API Endpoints

**Branding** (existing, extended):
- `GET /api/branding/` — returns all branding fields including new color + theme fields
- `PATCH /api/branding/` — update branding (multipart for logo/favicon/login_bg)

**BusinessProfile** (new):
- `GET /api/business-profile/` — returns singleton profile (404 if not set yet)
- `PUT /api/business-profile/` — create or update (upsert pattern)

Both endpoints: admin-only write, authenticated read.

---

## Frontend

### 1. App Rename

| Location | Change |
|---|---|
| `BrandingContext.jsx` DEFAULTS | `systemName: 'Vardhan ERP'` |
| `index.html` | `<title>Vardhan ERP</title>` |
| Login page header | "Vardhan ERP" |
| Login page footer | "Powered by Vardhan ERP" (small, muted) |
| Default logo | Replace `UAC.svg` reference with Vardhan ERP default |

### 2. `BrandingContext` Extensions

Add to context value:
- `primaryColor` (default `#6366f1`)
- `secondaryColor` (default `#10b981`)
- `darkModeDefault` (default `system`)

On `refreshBranding()`, after setting state, inject CSS variables:
```js
document.documentElement.style.setProperty('--brand-primary', data.primary_color)
document.documentElement.style.setProperty('--brand-secondary', data.secondary_color)
```

### 3. `ThemeContext` Integration

**Provider order requirement:** In `App.jsx`, `BrandingProvider` must wrap `ThemeProvider` so that `ThemeContext` can read `darkModeDefault` from `BrandingContext`. Current order must be verified and adjusted if needed.

`ThemeContext` determines active theme in this priority order:
1. `localStorage.getItem('theme')` — user's personal override
2. `BrandingContext.darkModeDefault` — company default
3. `'system'` — fallback

When user manually toggles theme, save to `localStorage`. Provide a "Reset to company default" option in user profile.

### 4. New API module: `frontend/src/api/businessProfile.js`

```js
export const businessProfileAPI = {
  get: () => client.get('/business-profile/'),
  update: (data) => client.put('/business-profile/', data),
}
```

### 5. Settings Page Refactor (`frontend/src/pages/Settings/Index.jsx`)

Replace current scroll layout with a 4-tab panel:

#### Tab: Branding
- Company display name (text input)
- Logo upload + preview (existing)
- Favicon upload + preview (existing)
- Login background image upload + preview (new)
- Primary color: 8 preset swatches + "Custom" opens `<input type="color">` (new)
- Secondary color: same pattern (new)
- Default theme: Radio group — Light / Dark / System (new)
- Save button → `PATCH /api/branding/` → `refreshBranding()`

#### Tab: Business Info
- Company name, address, email, phone, website
- GSTIN, PAN, State, State Code (grid layout)
- Bank name, Account no, IFSC code
- Currency (select: INR, USD, EUR, GBP, AED)
- Timezone (select, common Indian + global options)
- Language (select: English, Hindi — extensible)
- Date format (select: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Logo upload for invoices (base64)
- Save button → `PUT /api/business-profile/`

#### Tab: Invoice
- Moves existing `CompanyProfileModal` content inline
- List of invoice company profiles (create / edit / delete / set default)
- "Global Business Profile" is pre-populated from Business Info tab as the default
- No modal — inline panel list (same as current CompanyProfileModal list view)

#### Tab: App Settings
- Existing key/value settings unchanged
- Existing "Add New Setting" form unchanged
- Remove "System Information" card (not relevant for ERP product)

---

## CSS Theming

All existing UI elements that use brand color (`u-text-brand`, active sidebar items, primary buttons) reference `--brand-primary`. No component changes needed — injecting the CSS variable from `BrandingContext` is sufficient.

```css
/* These already exist in index.css — no change needed */
.u-btn-primary { background: var(--brand-primary); }
.sidebar-item.active { border-color: var(--brand-primary); color: var(--brand-primary); }
```

The `--brand-secondary` variable is used for:
- Success states / positive badges
- Secondary action buttons
- Chart accent colors

---

## Data Flow

```
App loads
  → BrandingContext.refreshBranding() → GET /api/branding/
  → Injects --brand-primary, --brand-secondary into :root
  → Sets systemName, logoUrl, darkModeDefault

ThemeContext reads darkModeDefault from BrandingContext
  → Checks localStorage for user override
  → Applies theme class to <html>

Settings page loads
  → Tab: Branding reads from BrandingContext (already loaded)
  → Tab: Business Info → GET /api/business-profile/
  → Tab: Invoice → GET /api/invoices/profiles/ (existing)
  → Tab: App Settings → GET /api/settings/ (existing)
```

---

## File Changes Summary

### Backend
- `backend/apps/core/models.py` — extend `Branding`, add `BusinessProfile`
- `backend/apps/core/serializers.py` — extend `BrandingSerializer`, add `BusinessProfileSerializer`
- `backend/apps/core/views.py` — extend `BrandingView`, add `BusinessProfileView`
- `backend/apps/core/urls.py` — add `/business-profile/` route
- `backend/apps/core/migrations/0002_branding_colors_theme.py`
- `backend/apps/core/migrations/0003_businessprofile.py`

### Frontend
- `frontend/src/contexts/BrandingContext.jsx` — add color/theme fields + CSS var injection
- `frontend/src/contexts/ThemeContext.jsx` — read company default from BrandingContext
- `frontend/src/pages/Settings/Index.jsx` — full refactor to tabbed layout
- `frontend/src/api/businessProfile.js` — new API module
- `frontend/src/pages/Auth/Login.jsx` — rename + "Powered by Vardhan ERP" footer
- `frontend/index.html` — update title
- `frontend/public/` — add Vardhan ERP default SVG logo

---

## Acceptance Criteria

- [ ] App title and default branding shows "Vardhan ERP" everywhere
- [ ] Settings page has 4 tabs: Branding, Business Info, Invoice, App Settings
- [ ] Changing primary color instantly repaints sidebar active states and buttons
- [ ] Business Info saves GST, address, bank, locale fields
- [ ] Company default theme (light/dark/system) applies on login
- [ ] User can override theme personally; override persists in localStorage
- [ ] Invoice tab shows existing company profiles (no regression)
- [ ] All changes are admin-only (non-admins see read-only or no settings)

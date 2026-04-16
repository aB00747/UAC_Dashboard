# Umiya Dashboard — Claude-Inspired Warm Retheme

**Date:** 2026-04-16
**Branch:** fix/ui
**Approach:** CSS-Variable Retheme + Targeted JSX Edits (Approach A)

---

## Overview

Replace the current indigo/cool-gray design system with a Claude/Anthropic-inspired warm palette. The redesign is a pure visual retheme — no layout structure, routing, or data model changes. The existing `u-*` utility class system absorbs most changes automatically when CSS variables are updated.

### Guiding Principles (from getDesign.md)
- Warm parchment canvas (`#f5f4ed`) — never cool gray
- Terracotta brand accent (`#c96442`) — the ONLY chromatic color
- Exclusively warm-toned neutrals — every gray has a yellow-brown undertone
- Ring-based shadows (`0px 0px 0px 1px`) instead of drop shadows
- Serif (Playfair Display) for page/section headings only; all UI text stays sans-serif
- Focus blue (`#3898ec`) is the ONLY cool color allowed — accessibility only

---

## 1. Color System

### Light Mode Token Changes

| CSS Variable | Old Value | New Value | Notes |
|---|---|---|---|
| `--bg-page` | `#f9fafb` | `#f5f4ed` | Parchment |
| `--bg-surface` | `#ffffff` | `#faf9f5` | Ivory |
| `--bg-surface-2` | `#f3f4f6` | `#f0eee6` | Border cream |
| `--bg-surface-3` | `#e5e7eb` | `#e8e6dc` | Warm sand |
| `--bg-input` | `#ffffff` | `#faf9f5` | Ivory |
| `--bg-hover` | `#f9fafb` | `#f0eee6` | Warm hover |
| `--bg-active` | `#eff6ff` | `#fdf5f1` | Warm active tint |
| `--bg-sidebar` | `#ffffff` | `#141413` | Near black |
| `--bg-sidebar-active` | `#eef2ff` | `rgba(201,100,66,0.15)` | Terracotta tint |
| `--bg-sidebar-hover` | `#f9fafb` | `rgba(255,255,255,0.06)` | Subtle warm hover |
| `--text` | `#111827` | `#141413` | Warm near black |
| `--text-2` | `#374151` | `#4d4c48` | Charcoal warm |
| `--text-3` | `#6b7280` | `#5e5d59` | Olive gray |
| `--text-4` | `#9ca3af` | `#87867f` | Stone gray |
| `--text-placeholder` | `#9ca3af` | `#87867f` | Stone gray |
| `--text-inverse` | `#ffffff` | `#faf9f5` | Ivory |
| `--brand` | `#6366f1` | `#c96442` | Terracotta |
| `--brand-hover` | `#4f46e5` | `#b5593b` | Terracotta dark |
| `--brand-light` | `#eef2ff` | `#fdf5f1` | Warm terracotta tint |
| `--brand-text` | `#4338ca` | `#c96442` | Terracotta |
| `--brand-border` | `#c7d2fe` | `#e8c4b0` | Warm terracotta border |
| `--brand-fg` | `#ffffff` | `#faf9f5` | Ivory |
| `--border` | `#e5e7eb` | `#f0eee6` | Border cream |
| `--border-strong` | `#d1d5db` | `#e8e6dc` | Border warm |
| `--border-focus` | `#6366f1` | `#3898ec` | Focus blue (accessibility only) |
| `--border-input` | `#d1d5db` | `#e8e6dc` | Border warm |
| `--shadow-sm` | blue-tinted | `rgba(0,0,0,0.04) 0px 1px 2px` | Whisper |
| `--shadow` | blue-tinted | `rgba(0,0,0,0.05) 0px 0px 0px 1px` | Ring |
| `--shadow-md` | blue-tinted | `rgba(0,0,0,0.05) 0px 4px 24px` | Whisper soft |
| `--shadow-lg` | blue-tinted | `rgba(0,0,0,0.07) 0px 8px 32px` | Lifted |

### Status Colors (warm shift)

| Token group | Old | New |
|---|---|---|
| `--red-bg` | `#fef2f2` | `#fdf2f0` |
| `--red-text` | `#991b1b` | `#b53333` (warm crimson) |
| `--red-border` | `#fecaca` | `#f5c4bc` |
| `--red-solid` | `#ef4444` | `#b53333` |
| `--blue-bg` | `#eff6ff` | `#fff7f4` (warm peach) |
| `--blue-text` | `#1e40af` | `#c96442` (terracotta) |
| `--blue-border` | `#bfdbfe` | `#e8c4b0` |
| `--blue-solid` | `#3b82f6` | `#d97757` (coral accent) |
| Green, yellow, purple, orange | unchanged | unchanged (already warm-toned) |

### Dark Mode Token Changes

| CSS Variable | New Dark Value |
|---|---|
| `--bg-page` | `#141413` |
| `--bg-surface` | `#1e1e1c` |
| `--bg-surface-2` | `#30302e` |
| `--bg-surface-3` | `#3d3d3a` |
| `--bg-input` | `#30302e` |
| `--bg-hover` | `#30302e` |
| `--bg-active` | `rgba(201,100,66,0.15)` |
| `--bg-sidebar` | `#0f0f0e` |
| `--bg-sidebar-active` | `rgba(201,100,66,0.2)` |
| `--bg-sidebar-hover` | `rgba(255,255,255,0.05)` |
| `--text` | `#faf9f5` |
| `--text-2` | `#e8e6dc` |
| `--text-3` | `#b0aea5` (warm silver) |
| `--text-4` | `#87867f` |
| `--brand` | `#d97757` (coral — lighter for dark bg) |
| `--brand-hover` | `#c96442` |
| `--brand-light` | `rgba(201,100,66,0.15)` |
| `--brand-text` | `#d97757` |
| `--brand-border` | `rgba(201,100,66,0.4)` |
| `--border` | `#30302e` |
| `--border-strong` | `#3d3d3a` |
| `--border-focus` | `#3898ec` |
| `--border-input` | `#3d3d3a` |
| Dark status colors | rgba warm variants | same pattern, warm-tinted |

---

## 2. Typography

### Font Loading
Add to `frontend/index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap" rel="stylesheet">
```

### CSS Variables (add to `_variables.css`)
```css
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans: system-ui, -apple-system, 'Inter', sans-serif;
```

### New Utility Classes (add to `_utilities.css`)
```css
.u-heading    { font-family: var(--font-serif); font-weight: 500; line-height: 1.20; }
.u-heading-lg { font-size: 2rem; }    /* page titles — h1 */
.u-heading-md { font-size: 1.5rem; }  /* section headings — h2 */
.u-heading-sm { font-size: 1.3rem; }  /* card/sub headings — h3 */
```

### JSX Application Rule
- Every `<h1>` page title → add `u-heading u-heading-lg`
- Every `<h2>` section heading → add `u-heading u-heading-md`
- All other text (table headers, form labels, buttons, badges, nav items) → unchanged, stays sans-serif

---

## 3. Sidebar

File: `frontend/src/components/SidebarContent.jsx`

**Visual treatment:**
- Background: `var(--bg-sidebar)` = `#141413` — already wired, variable change handles it
- System name / logo: add `u-heading` class for Playfair Display rendering
- Nav item text: `var(--text-3)` = `#b0aea5` warm silver
- Hover state: `var(--bg-sidebar-hover)` = `rgba(255,255,255,0.06)`
- Active item: `var(--bg-sidebar-active)` = terracotta tint + left border `3px solid var(--brand)`
- Active item text: `var(--text)` = `#faf9f5` ivory

The `u-sidebar-item` and `u-sidebar-item--active` classes in `_utilities.css` need updating to reflect the new dark sidebar context (text colors, border accent).

---

## 4. Component Updates

### Buttons
- Primary button border-radius: bump from `var(--r)` to `var(--r-lg)` (12px)
- Hover ring shadow: `box-shadow: 0px 0px 0px 1px var(--brand-hover)`
- All color changes automatic via variable update

### Cards & Panels
- All automatic via variable changes
- `u-card` shadow becomes `var(--shadow)` = ring pattern
- `u-stat-card` hover shadow becomes `var(--shadow-md)` = whisper soft

### Inputs
- Focus ring changes from indigo to Focus Blue `#3898ec` (the one allowed cool color)
- Focus shadow: `0 0 0 3px rgba(56,152,236,0.15)`

### Badges
- `u-badge--blue` shifts to warm: peach bg, terracotta text, warm border
- `u-badge--brand` shifts to terracotta family
- `u-badge--red` shifts to warm crimson

### Loading Spinner
- In `AuthenticatedLayout.jsx`: `border-indigo-600` → `style={{ borderBottomColor: 'var(--brand)' }}`

### Scrollbars & Selection
- Scrollbar thumb: `var(--border-strong)` = `#e8e6dc`
- Text selection: `background: rgba(201,100,66,0.15)` / `color: var(--brand-text)`

---

## 5. Hardcoded Tailwind Class Fixes

Grep patterns to find and replace across all JSX files:

| Pattern | Replacement |
|---|---|
| `text-indigo-600`, `text-indigo-700` | `u-text-brand` |
| `text-indigo-500`, `text-indigo-400` | `u-text-brand` |
| `bg-indigo-600`, `bg-indigo-500` | `u-bg-brand` |
| `bg-indigo-50`, `bg-indigo-100` | `u-bg-brand-light` |
| `border-indigo-*` | `u-border` or remove |
| `ring-indigo-*` | remove (ring shadows from CSS now) |
| `focus:ring-indigo-*` | remove (focus handled by `u-input`) |

---

## 6. Files Changed

### CSS files (4)
- `frontend/src/styles/_variables.css` — full rewrite of all tokens
- `frontend/src/styles/_utilities.css` — add heading utilities, update sidebar/badge/button rules
- `frontend/src/styles/_base.css` — update scrollbar, selection, focus-visible
- `frontend/index.html` — add Google Fonts link

### JSX files (targeted)
- `frontend/src/layouts/AuthenticatedLayout.jsx` — fix loading spinner class
- `frontend/src/components/SidebarContent.jsx` — add u-heading to logo, fix active border
- `frontend/src/pages/*/Index.jsx` (12 files) — add u-heading to h1/h2 page titles
- Any JSX with hardcoded `text-indigo-*`, `bg-indigo-*` classes (grep-identified)

### No changes to
- Routing, API, auth, data models
- Layout structure (sidebar width, grid columns, breakpoints)
- Test files
- Backend

---

## 7. Out of Scope

- Organic illustrations (would require new SVG assets)
- Dark/light section alternation within pages (marketing pattern, not dashboard pattern)
- Model comparison cards (not applicable to this dashboard)
- Responsive breakpoint changes

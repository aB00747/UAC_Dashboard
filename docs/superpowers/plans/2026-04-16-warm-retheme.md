# Umiya Dashboard Warm Retheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the indigo/cool-gray design system with a Claude-inspired warm palette (parchment, terracotta, Playfair Display serif headings) across the entire frontend.

**Architecture:** CSS variable retheme — update `_variables.css` token values so all `u-*` utility classes automatically recolor; add a Tailwind v4 `@theme` block to warm the gray scale (fixing 330+ hardcoded `gray-*` JSX classes in one step); then fix ~40 remaining hardcoded `indigo-*` classes individually.

**Tech Stack:** React + Vite + Tailwind CSS v4 (`@import "tailwindcss"` / `@tailwindcss/vite`) — no `tailwind.config.js`. Google Fonts (Playfair Display). Tests: Vitest + React Testing Library (`npm test` in `frontend/`).

---

## File Map

| File | Change |
|---|---|
| `frontend/index.html` | Add Google Fonts `<link>` tags |
| `frontend/src/styles/_variables.css` | Full rewrite of all CSS tokens (light + dark) |
| `frontend/src/styles/_utilities.css` | Add `.u-heading` variants; update sidebar, badge, button, input rules |
| `frontend/src/styles/_base.css` | Warm scrollbar thumb + selection highlight |
| `frontend/src/index.css` | Add `@theme` block to override Tailwind gray scale |
| `frontend/src/components/ui/Spinner.jsx` | Fix hardcoded `border-indigo-600` |
| `frontend/src/layouts/AuthenticatedLayout.jsx` | Fix hardcoded `border-indigo-600` on loading spinner |
| `frontend/src/components/SidebarContent.jsx` | Fix logo `bg-indigo-600`; add `u-heading` to system name |
| `frontend/src/components/common/PageHeader.jsx` | Add `u-heading u-heading-lg` to `<h1>` |
| `frontend/src/components/AIInsightsWidget.jsx` | Fix `text-indigo-500` |
| `frontend/src/pages/Dashboard/Index.jsx` | Add `u-heading` to h1/h2; fix chart `COLORS` array + `tooltipStyle` |
| `frontend/src/pages/Auth/Login.jsx` | Fix button, inputs, link — all indigo → warm |
| `frontend/src/pages/Auth/Register.jsx` | Same as Login.jsx |
| `frontend/src/pages/Profile/Index.jsx` | Fix avatar bg/icon + input indigo classes |
| `frontend/src/pages/Reports/Index.jsx` | Fix `bg-indigo-500` stat card color |
| `frontend/src/pages/Customers/components/CustomerDetail.jsx` | Fix avatar indigo |
| `frontend/src/pages/Customers/components/CustomerStats.jsx` | Fix indigo color string |
| `frontend/src/pages/Customers/components/CustomerImport.jsx` | Fix text link |
| `frontend/src/pages/Customers/components/CustomerForm.jsx` | Fix checkbox + input |
| `frontend/src/pages/Customers/components/CustomerTable.jsx` | Fix spinner + edit button hover + tab border |
| `frontend/src/pages/Customers/Index.jsx` | Fix active tab border color |
| `frontend/src/pages/Orders/components/OrderTable.jsx` | Fix spinner + button hover |
| `frontend/src/pages/Orders/components/OrderForm.jsx` | Fix text link |
| `frontend/src/pages/Deliveries/components/DeliveryCard.jsx` | Fix icon + link |
| `frontend/src/pages/Documents/Index.jsx` | Fix icon bg + download link |
| `frontend/src/pages/Inventory/components/CategoriesTable.jsx` | Fix button hover |
| `frontend/src/pages/Inventory/components/ChemicalsTable.jsx` | Fix button hover |
| `frontend/src/pages/Inventory/components/VendorsTable.jsx` | Fix button hover |
| `frontend/src/pages/Messaging/Index.jsx` | Fix selected bg + unread icon |
| `frontend/src/pages/Pricing/Index.jsx` | Fix input focus + button hover |
| `frontend/src/pages/Settings/Index.jsx` | Fix input focus |
| `frontend/src/pages/Users/components/UserForm.jsx` | Fix inputs + checkbox |
| `frontend/src/pages/Users/components/UserTable.jsx` | Fix spinner + edit button |

---

## Task 1: Add Google Fonts and font CSS variables

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/styles/_variables.css` (add 2 lines at top of `:root`)

- [ ] **Step 1: Add Playfair Display font link to index.html**

  Replace the existing `<head>` section content with:

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/UAC.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Umiya Chemical Dashboard</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap" rel="stylesheet">
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 2: Add font variables to `_variables.css`**

  Insert these two lines at the top of the `:root {` block (after the opening brace, before `/* ── Page / Layout`):

  ```css
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: system-ui, -apple-system, 'Inter', sans-serif;
  ```

- [ ] **Step 3: Verify dev server loads without errors**

  Run: `cd frontend && npm run dev`
  Open http://localhost:5173/ — no console errors about fonts.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/index.html frontend/src/styles/_variables.css
  git commit -m "feat(ui): add Playfair Display font and font CSS variables"
  ```

---

## Task 2: Rewrite light mode CSS variables

**Files:**
- Modify: `frontend/src/styles/_variables.css` — full rewrite of `:root` block

- [ ] **Step 1: Replace entire `:root` block**

  Replace everything from `:root {` through the closing `}` (lines 6–96) with:

  ```css
  :root {
    --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans: system-ui, -apple-system, 'Inter', sans-serif;

    /* ── Page / Layout ─────────────────────────────────────────── */
    --bg-page:        #f5f4ed;   /* parchment  */
    --bg-surface:     #faf9f5;   /* ivory      */
    --bg-surface-2:   #f0eee6;   /* border cream */
    --bg-surface-3:   #e8e6dc;   /* warm sand  */
    --bg-input:       #faf9f5;
    --bg-hover:       #f0eee6;
    --bg-active:      #fdf5f1;   /* warm terracotta tint */

    /* ── Sidebar ───────────────────────────────────────────────── */
    --bg-sidebar:        #141413;               /* near black */
    --bg-sidebar-active: rgba(201,100,66,0.15); /* terracotta tint */
    --bg-sidebar-hover:  rgba(255,255,255,0.06);

    /* ── Text ──────────────────────────────────────────────────── */
    --text:           #141413;   /* warm near black */
    --text-2:         #4d4c48;   /* charcoal warm   */
    --text-3:         #5e5d59;   /* olive gray      */
    --text-4:         #87867f;   /* stone gray      */
    --text-placeholder: #87867f;
    --text-inverse:   #faf9f5;   /* ivory           */

    /* ── Brand ─────────────────────────────────────────────────── */
    --brand:          #c96442;   /* terracotta      */
    --brand-hover:    #b5593b;   /* terracotta dark */
    --brand-light:    #fdf5f1;   /* warm tint       */
    --brand-text:     #c96442;
    --brand-border:   #e8c4b0;   /* warm terra border */
    --brand-fg:       #faf9f5;   /* ivory           */

    /* ── Borders ───────────────────────────────────────────────── */
    --border:         #f0eee6;   /* border cream  */
    --border-strong:  #e8e6dc;   /* border warm   */
    --border-focus:   #3898ec;   /* focus blue — accessibility only */
    --border-input:   #e8e6dc;

    /* ── Status: Success (green) ───────────────────────────────── */
    --green-bg:       #f0fdf4;
    --green-text:     #166534;
    --green-border:   #bbf7d0;
    --green-solid:    #22c55e;

    /* ── Status: Warning (amber) ───────────────────────────────── */
    --yellow-bg:      #fefce8;
    --yellow-text:    #854d0e;
    --yellow-border:  #fef08a;
    --yellow-solid:   #eab308;

    /* ── Status: Danger / Error (warm crimson) ─────────────────── */
    --red-bg:         #fdf2f0;
    --red-text:       #b53333;   /* warm crimson  */
    --red-border:     #f5c4bc;
    --red-solid:      #b53333;

    /* ── Status: Info (warm — terracotta family) ───────────────── */
    --blue-bg:        #fff7f4;
    --blue-text:      #c96442;   /* terracotta    */
    --blue-border:    #e8c4b0;
    --blue-solid:     #d97757;   /* coral accent  */

    /* ── Status: Purple ─────────────────────────────────────────── */
    --purple-bg:      #f5f3ff;
    --purple-text:    #5b21b6;
    --purple-border:  #ddd6fe;
    --purple-solid:   #8b5cf6;

    /* ── Status: Orange ─────────────────────────────────────────── */
    --orange-bg:      #fff7ed;
    --orange-text:    #9a3412;
    --orange-border:  #fed7aa;
    --orange-solid:   #f97316;

    /* ── Shadows ───────────────────────────────────────────────── */
    --shadow-sm:      rgba(0,0,0,0.04) 0px 1px 2px;
    --shadow:         rgba(0,0,0,0.05) 0px 0px 0px 1px;
    --shadow-md:      rgba(0,0,0,0.05) 0px 4px 24px;
    --shadow-lg:      rgba(0,0,0,0.07) 0px 8px 32px;

    /* ── Radius ────────────────────────────────────────────────── */
    --r-sm:  0.375rem;   /* 6px  */
    --r:     0.5rem;     /* 8px  */
    --r-md:  0.625rem;   /* 10px */
    --r-lg:  0.75rem;    /* 12px */
    --r-xl:  1rem;       /* 16px */
    --r-2xl: 1.5rem;     /* 24px */

    /* ── Transitions ───────────────────────────────────────────── */
    --transition: 150ms ease;
    --transition-md: 200ms ease;
  }
  ```

- [ ] **Step 2: Run tests to ensure no regressions**

  ```bash
  cd frontend && npm test -- --run
  ```

  Expected: all tests pass (or same as baseline — no new failures).

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/styles/_variables.css
  git commit -m "feat(ui): rewrite light mode CSS tokens to warm parchment palette"
  ```

---

## Task 3: Rewrite dark mode CSS variables

**Files:**
- Modify: `frontend/src/styles/_variables.css` — rewrite `html.dark` block

- [ ] **Step 1: Replace the entire `html.dark` block**

  Replace everything from `html.dark {` through its closing `}` with:

  ```css
  html.dark {
    /* Page / Layout */
    --bg-page:        #141413;
    --bg-surface:     #1e1e1c;
    --bg-surface-2:   #30302e;
    --bg-surface-3:   #3d3d3a;
    --bg-input:       #30302e;
    --bg-hover:       #30302e;
    --bg-active:      rgba(201,100,66,0.15);

    /* Sidebar */
    --bg-sidebar:        #0f0f0e;
    --bg-sidebar-active: rgba(201,100,66,0.2);
    --bg-sidebar-hover:  rgba(255,255,255,0.05);

    /* Text */
    --text:           #faf9f5;   /* ivory       */
    --text-2:         #e8e6dc;
    --text-3:         #b0aea5;   /* warm silver */
    --text-4:         #87867f;
    --text-placeholder: #87867f;
    --text-inverse:   #141413;

    /* Brand */
    --brand:          #d97757;   /* coral — lighter on dark */
    --brand-hover:    #c96442;
    --brand-light:    rgba(201,100,66,0.15);
    --brand-text:     #d97757;
    --brand-border:   rgba(201,100,66,0.4);
    --brand-fg:       #faf9f5;

    /* Borders */
    --border:         #30302e;
    --border-strong:  #3d3d3a;
    --border-focus:   #3898ec;
    --border-input:   #3d3d3a;

    /* Status: Success */
    --green-bg:       rgba(34,197,94,0.1);
    --green-text:     #86efac;
    --green-border:   rgba(34,197,94,0.3);
    --green-solid:    #22c55e;

    /* Status: Warning */
    --yellow-bg:      rgba(234,179,8,0.1);
    --yellow-text:    #fde047;
    --yellow-border:  rgba(234,179,8,0.3);
    --yellow-solid:   #eab308;

    /* Status: Danger */
    --red-bg:         rgba(181,51,51,0.1);
    --red-text:       #f5a5a5;
    --red-border:     rgba(181,51,51,0.3);
    --red-solid:      #b53333;

    /* Status: Info */
    --blue-bg:        rgba(201,100,66,0.1);
    --blue-text:      #d97757;
    --blue-border:    rgba(201,100,66,0.3);
    --blue-solid:     #d97757;

    /* Status: Purple */
    --purple-bg:      rgba(139,92,246,0.1);
    --purple-text:    #c4b5fd;
    --purple-border:  rgba(139,92,246,0.3);
    --purple-solid:   #8b5cf6;

    /* Status: Orange */
    --orange-bg:      rgba(249,115,22,0.1);
    --orange-text:    #fdba74;
    --orange-border:  rgba(249,115,22,0.3);
    --orange-solid:   #f97316;

    /* Shadows */
    --shadow-sm:      rgba(0,0,0,0.3) 0px 1px 2px;
    --shadow:         rgba(0,0,0,0.4) 0px 0px 0px 1px;
    --shadow-md:      rgba(0,0,0,0.4) 0px 4px 24px;
    --shadow-lg:      rgba(0,0,0,0.5) 0px 8px 32px;
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

  Expected: all tests pass.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/styles/_variables.css
  git commit -m "feat(ui): rewrite dark mode CSS tokens to warm near-black palette"
  ```

---

## Task 4: Override Tailwind v4 gray scale to warm values

**Files:**
- Modify: `frontend/src/index.css`

This single change warms all 330+ hardcoded `bg-gray-*`, `text-gray-*`, `border-gray-*`, and `dark:bg-gray-*` Tailwind classes across every JSX file automatically — without touching any JSX.

- [ ] **Step 1: Add `@theme` block to `index.css`**

  The current `index.css` is:
  ```css
  @import "tailwindcss";
  @import "./styles/_variables.css";
  @import "./styles/_base.css";
  @import "./styles/_utilities.css";

  @layer utilities {
    .dark {
      color-scheme: dark;
    }
  }

  html.dark {
    color-scheme: dark;
  }
  ```

  Replace it with:

  ```css
  @import "tailwindcss";
  @import "./styles/_variables.css";
  @import "./styles/_base.css";
  @import "./styles/_utilities.css";

  /* Override Tailwind gray scale with warm equivalents */
  @theme {
    --color-gray-50:  #f9f8f4;
    --color-gray-100: #f0eee6;
    --color-gray-200: #e8e6dc;
    --color-gray-300: #d6d4ca;
    --color-gray-400: #b0aea5;
    --color-gray-500: #87867f;
    --color-gray-600: #5e5d59;
    --color-gray-700: #4d4c48;
    --color-gray-800: #3d3d3a;
    --color-gray-900: #30302e;
  }

  @layer utilities {
    .dark {
      color-scheme: dark;
    }
  }

  html.dark {
    color-scheme: dark;
  }
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

  Expected: all tests pass.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/index.css
  git commit -m "feat(ui): override Tailwind gray scale with warm palette via @theme"
  ```

---

## Task 5: Add heading utilities + update sidebar, badge, button, input rules

**Files:**
- Modify: `frontend/src/styles/_utilities.css`

- [ ] **Step 1: Add heading utility classes**

  Insert this block after the `/* ── Backgrounds */` section (after `.u-bg-hover` line):

  ```css
  /* ── Headings ──────────────────────────────────────────────── */
  .u-heading    { font-family: var(--font-serif); font-weight: 500; line-height: 1.20; }
  .u-heading-lg { font-size: 2rem; }    /* 32px — page titles */
  .u-heading-md { font-size: 1.5rem; }  /* 24px — section headings */
  .u-heading-sm { font-size: 1.3rem; }  /* ~21px — card headings */
  ```

- [ ] **Step 2: Update sidebar item utilities**

  Replace the existing `.u-sidebar-item`, `.u-sidebar-item:hover`, and `.u-sidebar-item--active` rules with:

  ```css
  .u-sidebar-item {
    color: var(--text-3);
    transition: background-color var(--transition), color var(--transition);
  }
  .u-sidebar-item:hover {
    background-color: var(--bg-sidebar-hover);
    color: var(--text-inverse);
  }
  .u-sidebar-item--active {
    background-color: var(--bg-sidebar-active);
    color: var(--text-inverse);
    border-left: 3px solid var(--brand);
    padding-left: calc(0.75rem - 3px); /* compensate for border width */
  }
  ```

- [ ] **Step 3: Update primary button — larger radius + ring hover**

  Replace `.u-btn--primary` and its hover rule with:

  ```css
  .u-btn--primary {
    background-color: var(--brand);
    color: var(--brand-fg);
    border-color: var(--brand);
    border-radius: var(--r-lg);  /* 12px — matches Claude spec */
  }
  .u-btn--primary:hover:not(:disabled) {
    background-color: var(--brand-hover);
    border-color: var(--brand-hover);
    box-shadow: 0px 0px 0px 1px var(--brand-hover);
  }
  ```

- [ ] **Step 4: Update input focus to Focus Blue**

  Replace the `.u-input:focus` and `html.dark .u-input:focus` rules with:

  ```css
  .u-input:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(56,152,236,0.15);
  }
  html.dark .u-input:focus {
    box-shadow: 0 0 0 3px rgba(56,152,236,0.2);
  }
  ```

  Also update `.u-search-input:focus` and `html.dark .u-search-input:focus` the same way:

  ```css
  .u-search-input:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(56,152,236,0.12);
  }
  html.dark .u-search-input:focus {
    box-shadow: 0 0 0 3px rgba(56,152,236,0.18);
  }
  ```

- [ ] **Step 5: Update blue badge to warm**

  Replace `.u-badge--blue` with:

  ```css
  .u-badge--blue   { background-color: var(--blue-bg);   color: var(--blue-text);   border-color: var(--blue-border); }
  ```

  (This rule already exists with that pattern — it now picks up the warm blue tokens from Task 2.)

- [ ] **Step 6: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

  Expected: all tests pass.

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/styles/_utilities.css
  git commit -m "feat(ui): add heading utilities, update sidebar/button/input/badge rules"
  ```

---

## Task 6: Update `_base.css` scrollbar and selection colors

**Files:**
- Modify: `frontend/src/styles/_base.css`

- [ ] **Step 1: Update text selection highlight**

  Replace the `::selection` and `html.dark ::selection` rules with:

  ```css
  ::selection {
    background-color: rgba(201, 100, 66, 0.15);
    color: var(--brand-text);
  }

  html.dark ::selection {
    background-color: rgba(217, 119, 87, 0.3);
    color: var(--text);
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add frontend/src/styles/_base.css
  git commit -m "feat(ui): warm selection highlight in base styles"
  ```

---

## Task 7: Fix `Spinner.jsx` — remove hardcoded indigo

**Files:**
- Modify: `frontend/src/components/ui/Spinner.jsx`

- [ ] **Step 1: Replace the file content**

  ```jsx
  import PropTypes from 'prop-types';

  export function PageSpinner() {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderBottomColor: 'var(--brand)' }}
        />
      </div>
    );
  }

  export function InlineSpinner({ className = 'h-6 w-6' }) {
    return (
      <div
        className={`inline-block animate-spin rounded-full border-b-2 ${className}`}
        style={{ borderBottomColor: 'var(--brand)' }}
      />
    );
  }

  PageSpinner.propTypes = {
    className: PropTypes.string,
  };

  InlineSpinner.propTypes = {
    className: PropTypes.string,
  };
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/ui/Spinner.jsx
  git commit -m "feat(ui): remove hardcoded indigo from Spinner, use CSS variable"
  ```

---

## Task 8: Fix `AuthenticatedLayout.jsx` loading spinner

**Files:**
- Modify: `frontend/src/layouts/AuthenticatedLayout.jsx`

- [ ] **Step 1: Fix the loading spinner className on line 27**

  Find:
  ```jsx
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
  ```

  Replace with:
  ```jsx
  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/layouts/AuthenticatedLayout.jsx
  git commit -m "feat(ui): fix loading spinner indigo color in AuthenticatedLayout"
  ```

---

## Task 9: Fix `SidebarContent.jsx` — logo + system name

**Files:**
- Modify: `frontend/src/components/SidebarContent.jsx`

- [ ] **Step 1: Replace logo `bg-indigo-600` with CSS variable + add serif to system name**

  Find:
  ```jsx
  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
    <span className="text-white font-bold text-sm">UC</span>
  </div>
  ```
  ```jsx
  <span className="font-bold u-text truncate">{systemName || 'Umiya Chemical'}</span>
  ```

  Replace with:
  ```jsx
  <div
    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
    style={{ backgroundColor: 'var(--brand)' }}
  >
    <span className="font-bold text-sm" style={{ color: 'var(--brand-fg)' }}>UC</span>
  </div>
  ```
  ```jsx
  <span className="u-heading truncate" style={{ fontSize: '1.1rem', color: 'var(--text-inverse)' }}>{systemName || 'Umiya Chemical'}</span>
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/SidebarContent.jsx
  git commit -m "feat(ui): warm sidebar logo + serif system name"
  ```

---

## Task 10: Fix `PageHeader.jsx` — add serif to page titles

**Files:**
- Modify: `frontend/src/components/common/PageHeader.jsx`

- [ ] **Step 1: Add `u-heading u-heading-lg` to the h1**

  Find:
  ```jsx
  <h1 className="text-2xl font-bold u-text">{title}</h1>
  ```

  Replace with:
  ```jsx
  <h1 className="u-heading u-heading-lg u-text">{title}</h1>
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/common/PageHeader.jsx
  git commit -m "feat(ui): add serif Playfair Display to PageHeader page titles"
  ```

---

## Task 11: Fix `AIInsightsWidget.jsx` indigo

**Files:**
- Modify: `frontend/src/components/AIInsightsWidget.jsx`

- [ ] **Step 1: Replace `text-indigo-500` and `text-indigo-400` with `u-text-brand`**

  Find line 28:
  ```js
  info: 'text-indigo-500 dark:text-indigo-400',
  ```
  Replace with:
  ```js
  info: 'u-text-brand',
  ```

  Find line 58:
  ```jsx
  <Sparkles className="h-5 w-5 text-indigo-500" />
  ```
  Replace with:
  ```jsx
  <Sparkles className="h-5 w-5 u-text-brand" />
  ```

  Find line 76:
  ```jsx
  <Sparkles className="h-5 w-5 text-indigo-500" />
  ```
  Replace with:
  ```jsx
  <Sparkles className="h-5 w-5 u-text-brand" />
  ```

- [ ] **Step 2: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/AIInsightsWidget.jsx
  git commit -m "feat(ui): replace indigo with terracotta in AIInsightsWidget"
  ```

---

## Task 12: Fix `Dashboard/Index.jsx` — headings + chart colors

**Files:**
- Modify: `frontend/src/pages/Dashboard/Index.jsx`

- [ ] **Step 1: Add serif to the dashboard h1**

  Find line 59:
  ```jsx
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{systemName}</h1>
  ```
  Replace with:
  ```jsx
  <h1 className="u-heading u-heading-lg u-text">{systemName}</h1>
  ```

- [ ] **Step 2: Add serif to all h2 section headings**

  Find (line 72):
  ```jsx
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview</h2>
  ```
  Replace with:
  ```jsx
  <h2 className="u-heading u-heading-md u-text mb-4">Monthly Overview</h2>
  ```

  Find (line 88):
  ```jsx
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status</h2>
  ```
  Replace with:
  ```jsx
  <h2 className="u-heading u-heading-md u-text mb-4">Order Status</h2>
  ```

  Find (line 106):
  ```jsx
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
  ```
  Replace with:
  ```jsx
  <h2 className="u-heading u-heading-md u-text mb-4">Recent Orders</h2>
  ```

  Find (line 137):
  ```jsx
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alerts</h2>
  ```
  Replace with:
  ```jsx
  <h2 className="u-heading u-heading-md u-text mb-4">Low Stock Alerts</h2>
  ```

- [ ] **Step 3: Fix chart COLORS array — replace indigo with terracotta**

  Find line 17:
  ```js
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  ```
  Replace with:
  ```js
  const COLORS = ['#c96442', '#10b981', '#f59e0b', '#b53333', '#8b5cf6'];
  ```

- [ ] **Step 4: Fix dark mode tooltipStyle**

  Find:
  ```js
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }
    : {};
  ```
  Replace with:
  ```js
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e1e1c', border: '1px solid #30302e', color: '#faf9f5' }
    : {};
  ```

- [ ] **Step 5: Fix `bg-indigo-500` stat card color**

  `StatCard` passes `color` directly as a className (`<div className={...color}>`). Tailwind v4 supports arbitrary hex values via `bg-[#hex]` syntax.

  Find line 42:
  ```js
  { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'bg-indigo-500' },
  ```
  Replace with:
  ```js
  { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'bg-[#d97757]' },
  ```

- [ ] **Step 6: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/pages/Dashboard/Index.jsx
  git commit -m "feat(ui): warm Dashboard — serif headings, terracotta chart colors"
  ```

---

## Task 13: Fix `Auth/Login.jsx` and `Auth/Register.jsx`

**Files:**
- Modify: `frontend/src/pages/Auth/Login.jsx`
- Modify: `frontend/src/pages/Auth/Register.jsx`

- [ ] **Step 1: Rewrite `Login.jsx` form with warm classes**

  Replace the entire return block with:

  ```jsx
  return (
    <form onSubmit={handleSubmit} className="u-card p-8 space-y-5" style={{ borderRadius: 'var(--r-xl)' }}>
      <h2 className="u-heading u-heading-md u-text text-center">Sign in to your account</h2>
      <div>
        <label htmlFor='username' className="block text-sm font-medium u-text-2 mb-1">Username</label>
        <input
          id="username"
          type="text"
          required
          className="u-input w-full px-3 py-2 text-sm rounded-lg"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor='password' className="block text-sm font-medium u-text-2 mb-1">Password</label>
        <input
          id="password"
          type="password"
          required
          className="u-input w-full px-3 py-2 text-sm rounded-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="u-btn u-btn--primary w-full py-2.5 text-sm"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm u-text-3">
        Don't have an account?{' '}
        <Link to="/register" className="u-text-brand font-medium hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
  ```

- [ ] **Step 2: Rewrite `Register.jsx` with warm classes**

  The `field` helper on line 43 generates every input. Update it and the form wrapper:

  Replace the `field` helper (lines 43–54) with:
  ```jsx
  const field = (label, name, type = 'text') => (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-1">{label}</label>
      <input
        type={type}
        required
        className="u-input w-full px-3 py-2 text-sm rounded-lg"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </div>
  );
  ```

  Replace the return block (lines 56–81) with:
  ```jsx
  return (
    <form onSubmit={handleSubmit} className="u-card p-8 space-y-4" style={{ borderRadius: 'var(--r-xl)' }}>
      <h2 className="u-heading u-heading-md u-text text-center">Create an account</h2>
      <div className="grid grid-cols-2 gap-4">
        {field('First Name', 'first_name')}
        {field('Last Name', 'last_name')}
      </div>
      {field('Username', 'username')}
      {field('Email', 'email', 'email')}
      {field('Password', 'password', 'password')}
      {field('Confirm Password', 'password_confirmation', 'password')}
      <button
        type="submit"
        disabled={loading}
        className="u-btn u-btn--primary w-full py-2.5 text-sm"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
      <p className="text-center text-sm u-text-3">
        Already have an account?{' '}
        <Link to="/login" className="u-text-brand font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
  ```

- [ ] **Step 3: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/pages/Auth/Login.jsx frontend/src/pages/Auth/Register.jsx
  git commit -m "feat(ui): warm Auth pages — terracotta buttons, warm inputs, serif heading"
  ```

---

## Task 14: Fix `Profile/Index.jsx`

**Files:**
- Modify: `frontend/src/pages/Profile/Index.jsx`

- [ ] **Step 1: Fix avatar container and icon**

  Find:
  ```jsx
  <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
    <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
  </div>
  ```
  Replace with:
  ```jsx
  <div className="h-16 w-16 u-bg-brand-light rounded-full flex items-center justify-center">
    <User className="h-8 w-8 u-text-brand" />
  </div>
  ```

- [ ] **Step 2: Fix the h1 page title**

  Find:
  ```jsx
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
  ```
  Replace with:
  ```jsx
  <h1 className="u-heading u-heading-lg u-text">Profile</h1>
  ```

- [ ] **Step 3: Fix input `focus:ring-indigo-500` classes**

  There is one input on line 74. Find:
  ```
  focus:outline-none focus:ring-2 focus:ring-indigo-500
  ```
  Replace with:
  ```
  u-input
  ```
  And remove the other hardcoded bg/border/text Tailwind classes from that input, replacing the whole className with `u-input w-full px-3 py-2 text-sm rounded-lg`.

- [ ] **Step 4: Run tests**

  ```bash
  cd frontend && npm test -- --run
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/pages/Profile/Index.jsx
  git commit -m "feat(ui): warm Profile page — avatar, heading, input"
  ```

---

## Task 15: Fix `Reports/Index.jsx` stat card color

**Files:**
- Modify: `frontend/src/pages/Reports/Index.jsx`

- [ ] **Step 1: Replace both `bg-indigo-500` colors**

  Find (line 70):
  ```jsx
  <StatCard label="Total Orders" value={salesData.total_orders} icon={ShoppingCart} color="bg-indigo-500" />
  ```
  Replace with:
  ```jsx
  <StatCard label="Total Orders" value={salesData.total_orders} icon={ShoppingCart} color="bg-[#d97757]" />
  ```

  Find (line 147):
  ```jsx
  <StatCard label="Total Chemicals" value={inventoryData.total_chemicals} icon={Package} color="bg-indigo-500" />
  ```
  Replace with:
  ```jsx
  <StatCard label="Total Chemicals" value={inventoryData.total_chemicals} icon={Package} color="bg-[#d97757]" />
  ```

- [ ] **Step 2: Add serif to h1 if present**

  Find (line 48):
  ```jsx
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
  ```
  Replace with:
  ```jsx
  <h1 className="u-heading u-heading-lg u-text">Reports & Analytics</h1>
  ```

- [ ] **Step 3: Run tests and commit**

  ```bash
  cd frontend && npm test -- --run
  git add frontend/src/pages/Reports/Index.jsx
  git commit -m "feat(ui): warm Reports page — stat card colors + serif heading"
  ```

---

## Task 16: Fix Customer components

**Files:**
- Modify: `frontend/src/pages/Customers/components/CustomerDetail.jsx`
- Modify: `frontend/src/pages/Customers/components/CustomerStats.jsx`
- Modify: `frontend/src/pages/Customers/components/CustomerImport.jsx`
- Modify: `frontend/src/pages/Customers/components/CustomerForm.jsx`
- Modify: `frontend/src/pages/Customers/components/CustomerTable.jsx`
- Modify: `frontend/src/pages/Customers/Index.jsx`

- [ ] **Step 1: `CustomerDetail.jsx` — fix avatar**

  Find:
  ```jsx
  <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-2">
    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{customer.first_name?.[0]}{customer.last_name?.[0]}</span>
  ```
  Replace with:
  ```jsx
  <div className="mx-auto h-16 w-16 u-bg-brand-light rounded-full flex items-center justify-center mb-2">
    <span className="text-xl font-bold u-text-brand">{customer.first_name?.[0]}{customer.last_name?.[0]}</span>
  ```

- [ ] **Step 2: `CustomerStats.jsx` — fix indigo color string**

  Find line 7:
  ```js
  { label: 'Total', value: customers.length, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30' },
  ```
  Replace with:
  ```js
  { label: 'Total', value: customers.length, icon: Users, color: 'u-text-brand u-bg-brand-light' },
  ```

- [ ] **Step 3: `CustomerImport.jsx` — fix text link**

  Find:
  ```jsx
  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
  ```
  Replace with:
  ```jsx
  className="text-sm u-text-brand hover:underline"
  ```

- [ ] **Step 4: `CustomerForm.jsx` — fix input and checkbox**

  Find the input className containing `focus:ring-indigo-500`. Replace the full hardcoded className with `u-input w-full px-3 py-2 text-sm rounded-lg`.

  Find:
  ```jsx
  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
  ```
  Replace with:
  ```jsx
  className="rounded u-border" style={{ accentColor: 'var(--brand)' }}
  ```

- [ ] **Step 5: `CustomerTable.jsx` — fix inline spinner + edit button + tab border**

  Find the inline spinner:
  ```jsx
  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
  ```
  Replace with:
  ```jsx
  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
  ```

  Find:
  ```jsx
  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
  ```
  Replace with:
  ```jsx
  className="p-1.5 u-text-4 hover:u-text-brand u-btn u-btn--ghost rounded"
  ```

- [ ] **Step 6: `Customers/Index.jsx` — fix active tab border**

  Find:
  ```jsx
  activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
  ```
  Replace with:
  ```jsx
  activeTab === tab ? 'u-text-brand' : 'border-transparent u-text-3 hover:u-text-2'
  ```
  And add `style={{ borderBottomColor: activeTab === tab ? 'var(--brand)' : 'transparent' }}` to the tab button element.

- [ ] **Step 7: Run tests and commit**

  ```bash
  cd frontend && npm test -- --run
  git add frontend/src/pages/Customers/
  git commit -m "feat(ui): warm Customer pages — avatar, stats, form, table, tabs"
  ```

---

## Task 17: Fix Orders, Deliveries, Documents components

**Files:**
- Modify: `frontend/src/pages/Orders/components/OrderTable.jsx`
- Modify: `frontend/src/pages/Orders/components/OrderForm.jsx`
- Modify: `frontend/src/pages/Deliveries/components/DeliveryCard.jsx`
- Modify: `frontend/src/pages/Documents/Index.jsx`

- [ ] **Step 1: `OrderTable.jsx` — inline spinner + edit button**

  Find:
  ```jsx
  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
  ```
  Replace with:
  ```jsx
  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
  ```

  Find:
  ```jsx
  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
  ```
  Replace with:
  ```jsx
  className="p-1.5 u-text-4 u-btn u-btn--ghost rounded"
  ```

- [ ] **Step 2: `OrderForm.jsx` — fix "Add Item" link**

  Find:
  ```jsx
  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
  ```
  Replace with:
  ```jsx
  className="text-sm u-text-brand hover:underline"
  ```

- [ ] **Step 3: `DeliveryCard.jsx` — fix icon and link**

  Find:
  ```jsx
  <Truck className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
  ```
  Replace with:
  ```jsx
  <Truck className="h-5 w-5 u-text-brand" />
  ```

  Find:
  ```jsx
  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
  ```
  Replace with:
  ```jsx
  className="text-sm u-text-brand hover:underline flex items-center gap-1"
  ```

- [ ] **Step 4: `Documents/Index.jsx` — fix icon bg and download link**

  Find:
  ```jsx
  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><FileText className="h-6 w-6 text-indigo-500 dark:text-indigo-400" /></div>
  ```
  Replace with:
  ```jsx
  <div className="p-2 u-bg-brand-light rounded-lg"><FileText className="h-6 w-6 u-text-brand" /></div>
  ```

  Find:
  ```jsx
  className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
  ```
  Replace with:
  ```jsx
  className="p-1.5 u-text-brand u-btn u-btn--ghost rounded"
  ```

- [ ] **Step 5: Run tests and commit**

  ```bash
  cd frontend && npm test -- --run
  git add frontend/src/pages/Orders/ frontend/src/pages/Deliveries/ frontend/src/pages/Documents/
  git commit -m "feat(ui): warm Orders, Deliveries, Documents — remove indigo"
  ```

---

## Task 18: Fix Inventory, Messaging, Pricing, Settings, Users

**Files:**
- Modify: `frontend/src/pages/Inventory/components/CategoriesTable.jsx`
- Modify: `frontend/src/pages/Inventory/components/ChemicalsTable.jsx`
- Modify: `frontend/src/pages/Inventory/components/VendorsTable.jsx`
- Modify: `frontend/src/pages/Messaging/Index.jsx`
- Modify: `frontend/src/pages/Pricing/Index.jsx`
- Modify: `frontend/src/pages/Settings/Index.jsx`
- Modify: `frontend/src/pages/Users/components/UserForm.jsx`
- Modify: `frontend/src/pages/Users/components/UserTable.jsx`

- [ ] **Step 1: Inventory table edit buttons (3 files)**

  In each of `CategoriesTable.jsx`, `ChemicalsTable.jsx`, `VendorsTable.jsx`, find:
  ```jsx
  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
  ```
  Replace with:
  ```jsx
  className="p-1.5 u-text-4 u-btn u-btn--ghost rounded"
  ```

- [ ] **Step 2: `Messaging/Index.jsx` — selected bg + unread icon**

  Find:
  ```jsx
  selected?.id === msg.id && 'bg-indigo-50 dark:bg-indigo-900/30',
  ```
  Replace with:
  ```jsx
  selected?.id === msg.id && 'u-bg-active',
  ```

  Find:
  ```jsx
  {msg.is_read ? <MailOpen className="h-4 w-4 text-gray-400" /> : <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />}
  ```
  Replace with:
  ```jsx
  {msg.is_read ? <MailOpen className="h-4 w-4 u-text-4" /> : <Mail className="h-4 w-4 u-text-brand" />}
  ```

- [ ] **Step 3: `Pricing/Index.jsx` — input focus + save button hover**

  Find all instances of `focus:ring-indigo-500` and `focus:ring-1 focus:ring-indigo-500` in this file. Replace each containing input's className with `u-input px-2 py-1 text-sm text-right rounded` (removing the hardcoded bg/border/text/dark: classes).

  Find:
  ```jsx
  className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
  ```
  Replace with:
  ```jsx
  className="p-1.5 u-text-brand u-btn u-btn--ghost rounded"
  ```

- [ ] **Step 4: `Settings/Index.jsx` — input focus**

  Find the input with `focus:ring-indigo-500`. Replace its className with `u-input w-full max-w-md px-3 py-2 text-sm rounded-lg`.

- [ ] **Step 5: `UserForm.jsx` — inputs + checkbox**

  For each input with `focus:ring-indigo-500`, replace the full hardcoded className with `u-input w-full px-3 py-2 text-sm rounded-lg`.

  Find:
  ```jsx
  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
  ```
  Replace with:
  ```jsx
  className="h-4 w-4 rounded u-border" style={{ accentColor: 'var(--brand)' }}
  ```

- [ ] **Step 6: `UserTable.jsx` — spinner + edit button**

  Find:
  ```jsx
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
  ```
  Replace with:
  ```jsx
  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--brand)' }} />
  ```

  Find:
  ```jsx
  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
  ```
  Replace with:
  ```jsx
  className="p-1.5 rounded-lg u-text-3 u-btn u-btn--ghost"
  ```

- [ ] **Step 7: Run tests and commit**

  ```bash
  cd frontend && npm test -- --run
  git add frontend/src/pages/Inventory/ frontend/src/pages/Messaging/ frontend/src/pages/Pricing/ frontend/src/pages/Settings/ frontend/src/pages/Users/
  git commit -m "feat(ui): warm Inventory, Messaging, Pricing, Settings, Users — remove indigo"
  ```

---

## Task 19: Final verification

- [ ] **Step 1: Run full test suite**

  ```bash
  cd frontend && npm test -- --run
  ```

  Expected: all tests pass.

- [ ] **Step 2: Start dev server and do a visual pass**

  ```bash
  cd frontend && npm run dev
  ```

  Open http://localhost:5173/ and check:
  - [ ] Login page: parchment background, terracotta button, Playfair Display heading
  - [ ] Sidebar: near-black background, warm silver nav links, terracotta active item with left border
  - [ ] Dashboard: Playfair Display h1, warm chart colors (terracotta replaces indigo)
  - [ ] Customers page: warm avatar, terracotta tab underline
  - [ ] Toggle dark mode: near-black surfaces, warm silver text — no cool grays visible
  - [ ] Any spinner: terracotta border color

- [ ] **Step 3: Check for any remaining indigo**

  ```bash
  grep -rn "indigo" frontend/src/ --include="*.jsx" --include="*.css" | grep -v ".test." | grep -v "node_modules"
  ```

  Expected: zero results. If any remain, fix them inline.

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "feat(ui): complete warm retheme — Claude-inspired parchment palette"
  ```

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run `/autoplan` for full review pipeline, or individual reviews above.

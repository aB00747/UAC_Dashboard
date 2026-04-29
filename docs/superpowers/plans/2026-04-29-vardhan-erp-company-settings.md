# Vardhan ERP — App Rebrand + Company Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the app to Vardhan ERP and build a tabbed Company Settings page (Branding / Business Info / Invoice / App Settings) with dynamic CSS theming and per-user dark/light mode override.

**Architecture:** Extend the existing `BrandingSetting` model with color + theme fields; add a new `BusinessProfile` singleton model; refactor the Settings page into 4 tabs; inject brand colors as CSS custom properties from `BrandingContext`; swap provider order so `BrandingProvider` wraps `ThemeProvider`.

**Tech Stack:** Django 5.1 + DRF, React + Vite, Tailwind CSS v4, SimpleJWT

---

## File Map

### Backend (create / modify)
| File | Action | Purpose |
|---|---|---|
| `backend/apps/core/models/branding.py` | Modify | Add `primary_color`, `secondary_color`, `login_bg`, `dark_mode_default` to `BrandingSetting` |
| `backend/apps/core/models/business_profile.py` | **Create** | New `BusinessProfile` singleton model |
| `backend/apps/core/models/__init__.py` | Modify | Export `BusinessProfile` |
| `backend/apps/core/migrations/0004_brandingsetting_colors_theme.py` | **Create** | Migration for new Branding fields |
| `backend/apps/core/migrations/0005_businessprofile.py` | **Create** | Migration for BusinessProfile model |
| `backend/apps/core/serializers/branding.py` | Modify | Add new Branding fields to serializer |
| `backend/apps/core/serializers/business_profile.py` | **Create** | `BusinessProfileSerializer` |
| `backend/apps/core/serializers/__init__.py` | Modify | Export `BusinessProfileSerializer` |
| `backend/apps/core/views/branding.py` | Modify | Return new Branding fields |
| `backend/apps/core/views/business_profile.py` | **Create** | `BusinessProfileView` (GET + PUT upsert) |
| `backend/apps/core/views/__init__.py` | Modify | Export `BusinessProfileView` |
| `backend/apps/core/urls.py` | Modify | Add `/business-profile/` route |
| `backend/apps/core/tests/test_business_profile.py` | **Create** | API tests for BusinessProfile |

### Frontend (create / modify)
| File | Action | Purpose |
|---|---|---|
| `frontend/index.html` | Modify | Title → "Vardhan ERP", favicon ref |
| `frontend/public/vardhan-erp.svg` | **Create** | Default Vardhan ERP logo SVG |
| `frontend/src/contexts/BrandingContext.jsx` | Modify | Add colors + CSS var injection, update DEFAULTS |
| `frontend/src/contexts/ThemeContext.jsx` | Modify | Read `darkModeDefault` from BrandingContext, rename localStorage key |
| `frontend/src/main.jsx` | Modify | Swap provider order: `BrandingProvider` wraps `ThemeProvider` |
| `frontend/src/layouts/GuestLayout.jsx` | Modify | Update subtitle, remove hardcoded fallback name |
| `frontend/src/api/businessProfile.js` | **Create** | `businessProfileAPI.get()` + `.update()` |
| `frontend/src/pages/Settings/Index.jsx` | Modify | Full refactor to 4-tab layout |

---

## Task 1: Backend — Extend BrandingSetting model + migration

**Files:**
- Modify: `backend/apps/core/models/branding.py`
- Create: `backend/apps/core/migrations/0004_brandingsetting_colors_theme.py`

- [ ] **Step 1: Add new fields to BrandingSetting**

Replace the contents of `backend/apps/core/models/branding.py`:

```python
from django.db import models


class BrandingSetting(models.Model):
    DARK_MODE_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]

    system_name = models.CharField(max_length=255, default='Vardhan ERP')
    logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    favicon = models.ImageField(upload_to='branding/', blank=True, null=True)
    login_bg = models.ImageField(upload_to='branding/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#6366f1')
    secondary_color = models.CharField(max_length=7, default='#10b981')
    dark_mode_default = models.CharField(
        max_length=10, choices=DARK_MODE_CHOICES, default='system'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'branding_settings'
        verbose_name = 'Branding Setting'
        verbose_name_plural = 'Branding Settings'

    def __str__(self):
        return self.system_name

    @classmethod
    def get_instance(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance
```

- [ ] **Step 2: Generate migration**

```bash
cd backend
python manage.py makemigrations core --name brandingsetting_colors_theme
```

Expected output: `Migrations for 'core': backend/apps/core/migrations/0004_brandingsetting_colors_theme.py`

- [ ] **Step 3: Apply migration**

```bash
python manage.py migrate core
```

Expected output: `Applying core.0004_brandingsetting_colors_theme... OK`

- [ ] **Step 4: Commit**

```bash
git add backend/apps/core/models/branding.py backend/apps/core/migrations/0004_brandingsetting_colors_theme.py
git commit -m "feat(core): extend BrandingSetting with colors and theme fields"
```

---

## Task 2: Backend — BusinessProfile model + migration

**Files:**
- Create: `backend/apps/core/models/business_profile.py`
- Modify: `backend/apps/core/models/__init__.py`
- Create: `backend/apps/core/migrations/0005_businessprofile.py`

- [ ] **Step 1: Create business_profile.py**

```python
# backend/apps/core/models/business_profile.py
from django.db import models


class BusinessProfile(models.Model):
    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee'), ('USD', 'US Dollar'),
        ('EUR', 'Euro'), ('GBP', 'British Pound'), ('AED', 'UAE Dirham'),
    ]
    LANGUAGE_CHOICES = [('en', 'English'), ('hi', 'Hindi')]
    DATE_FORMAT_CHOICES = [
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
    ]

    name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    gstin = models.CharField(max_length=15, blank=True)
    pan = models.CharField(max_length=10, blank=True)
    state = models.CharField(max_length=100, blank=True)
    state_code = models.CharField(max_length=2, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_no = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='INR')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    date_format = models.CharField(
        max_length=12, choices=DATE_FORMAT_CHOICES, default='DD/MM/YYYY'
    )
    logo_base64 = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_profile'
        verbose_name = 'Business Profile'

    def __str__(self):
        return self.name or 'Business Profile'

    def save(self, *args, **kwargs):
        # Enforce singleton — always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        instance, _ = cls.objects.get_or_create(pk=1)
        return instance
```

- [ ] **Step 2: Export from models __init__**

Edit `backend/apps/core/models/__init__.py` — add the import and export:

```python
from .geo import Country, State
from .notification import Notification
from .setting import Setting
from .branding import BrandingSetting
from .business_profile import BusinessProfile

__all__ = ['Country', 'State', 'Notification', 'Setting', 'BrandingSetting', 'BusinessProfile']
```

- [ ] **Step 3: Generate + apply migration**

```bash
cd backend
python manage.py makemigrations core --name businessprofile
python manage.py migrate core
```

Expected: `Applying core.0005_businessprofile... OK`

- [ ] **Step 4: Commit**

```bash
git add backend/apps/core/models/business_profile.py backend/apps/core/models/__init__.py backend/apps/core/migrations/0005_businessprofile.py
git commit -m "feat(core): add BusinessProfile singleton model"
```

---

## Task 3: Backend — Serializers for new models

**Files:**
- Modify: `backend/apps/core/serializers/branding.py`
- Create: `backend/apps/core/serializers/business_profile.py`
- Modify: `backend/apps/core/serializers/__init__.py`

- [ ] **Step 1: Extend BrandingSettingSerializer**

Replace `backend/apps/core/serializers/branding.py`:

```python
from rest_framework import serializers
from ..models import BrandingSetting


class BrandingSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    login_bg_url = serializers.SerializerMethodField()

    class Meta:
        model = BrandingSetting
        fields = [
            'system_name', 'logo', 'favicon', 'login_bg',
            'logo_url', 'favicon_url', 'login_bg_url',
            'primary_color', 'secondary_color', 'dark_mode_default',
            'updated_at',
        ]
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'favicon': {'write_only': True, 'required': False},
            'login_bg': {'write_only': True, 'required': False},
        }

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
        return ''

    def get_favicon_url(self, obj):
        if obj.favicon:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.favicon.url)
        return ''

    def get_login_bg_url(self, obj):
        if obj.login_bg:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.login_bg.url)
        return ''
```

- [ ] **Step 2: Create BusinessProfileSerializer**

Create `backend/apps/core/serializers/business_profile.py`:

```python
from rest_framework import serializers
from ..models import BusinessProfile


class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = [
            'name', 'address', 'email', 'phone', 'website',
            'gstin', 'pan', 'state', 'state_code',
            'bank_name', 'account_no', 'ifsc_code',
            'currency', 'timezone', 'language', 'date_format',
            'logo_base64', 'updated_at',
        ]
```

- [ ] **Step 3: Export from serializers __init__**

Replace `backend/apps/core/serializers/__init__.py` with:

```python
from .geo import CountrySerializer, StateSerializer
from .notification import NotificationSerializer
from .setting import SettingSerializer
from .branding import BrandingSettingSerializer
from .business_profile import BusinessProfileSerializer

__all__ = [
    'CountrySerializer',
    'StateSerializer',
    'NotificationSerializer',
    'SettingSerializer',
    'BrandingSettingSerializer',
    'BusinessProfileSerializer',
]
```

- [ ] **Step 4: Commit**

```bash
git add backend/apps/core/serializers/
git commit -m "feat(core): add BusinessProfile serializer, extend Branding serializer"
```

---

## Task 4: Backend — Views and URL for BusinessProfile

**Files:**
- Create: `backend/apps/core/views/business_profile.py`
- Modify: `backend/apps/core/views/__init__.py`
- Modify: `backend/apps/core/urls.py`
- Create: `backend/apps/core/tests/test_business_profile.py`

- [ ] **Step 1: Write the failing tests**

Create `backend/apps/core/tests/test_business_profile.py`:

```python
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.accounts.models import User, Role


def make_admin():
    role, _ = Role.objects.get_or_create(name='admin')
    user = User.objects.create_user(username='admin', password='pass', role=role)
    return user


def make_regular():
    role, _ = Role.objects.get_or_create(name='staff')
    user = User.objects.create_user(username='staff', password='pass', role=role)
    return user


class BusinessProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('business-profile')

    def test_get_returns_empty_profile_when_not_set(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('name', response.data)

    def test_put_creates_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        payload = {
            'name': 'Shree Chemicals', 'gstin': '27ABCDE1234F1Z5',
            'currency': 'INR', 'timezone': 'Asia/Kolkata',
            'language': 'en', 'date_format': 'DD/MM/YYYY',
        }
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Shree Chemicals')

    def test_put_updates_existing_profile(self):
        admin = make_admin()
        self.client.force_authenticate(user=admin)
        self.client.put(self.url, {'name': 'Old Name', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        response = self.client.put(self.url, {'name': 'New Name', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'New Name')

    def test_unauthenticated_get_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_staff_cannot_put(self):
        staff = make_regular()
        self.client.force_authenticate(user=staff)
        response = self.client.put(self.url, {'name': 'x', 'currency': 'INR',
            'timezone': 'Asia/Kolkata', 'language': 'en',
            'date_format': 'DD/MM/YYYY'}, format='json')
        self.assertEqual(response.status_code, 403)
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
python manage.py test apps.core.tests.test_business_profile -v 2
```

Expected: Multiple FAILs with `NoReverseMatch` or `ImportError` — that's correct, the view doesn't exist yet.

- [ ] **Step 3: Create BusinessProfileView**

Create `backend/apps/core/views/business_profile.py`:

```python
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import BusinessProfile
from ..serializers import BusinessProfileSerializer


class BusinessProfileView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        from apps.accounts.permissions import IsAdminOrAbove
        return [IsAdminOrAbove()]

    def get(self, request):
        instance = BusinessProfile.get_instance()
        serializer = BusinessProfileSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = BusinessProfile.get_instance()
        serializer = BusinessProfileSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
```

- [ ] **Step 4: Export from views __init__**

Replace `backend/apps/core/views/__init__.py` with:

```python
from .geo import CountryViewSet, StateViewSet
from .notifications import NotificationViewSet
from .search import search_view
from .settings import SettingViewSet
from .branding import BrandingSettingView
from .business_profile import BusinessProfileView

__all__ = [
    'CountryViewSet',
    'StateViewSet',
    'NotificationViewSet',
    'search_view',
    'SettingViewSet',
    'BrandingSettingView',
    'BusinessProfileView',
]
```

- [ ] **Step 5: Register URL**

Open `backend/apps/core/urls.py` and add the new path:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'countries', views.CountryViewSet)
router.register(r'states', views.StateViewSet, basename='state')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'settings', views.SettingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.search_view, name='search'),
    path('branding/', views.BrandingSettingView.as_view(), name='branding'),
    path('business-profile/', views.BusinessProfileView.as_view(), name='business-profile'),
]
```

- [ ] **Step 6: Run tests — expect all to pass**

```bash
cd backend
python manage.py test apps.core.tests.test_business_profile -v 2
```

Expected: `Ran 5 tests in ...s — OK`

- [ ] **Step 7: Commit**

```bash
git add backend/apps/core/views/business_profile.py backend/apps/core/views/__init__.py backend/apps/core/urls.py backend/apps/core/tests/test_business_profile.py
git commit -m "feat(core): add BusinessProfileView GET+PUT with admin permission"
```

---

## Task 5: Frontend — App rebrand (index.html + GuestLayout + default logo)

**Files:**
- Modify: `frontend/index.html`
- Create: `frontend/public/vardhan-erp.svg`
- Modify: `frontend/src/layouts/GuestLayout.jsx`

- [ ] **Step 1: Update index.html**

Replace the `<head>` section of `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vardhan-erp.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vardhan ERP</title>
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

- [ ] **Step 2: Create Vardhan ERP default SVG logo**

Create `frontend/public/vardhan-erp.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#6366f1"/>
  <path d="M16 18h8l8 20 8-20h8L36 46h-8L16 18z" fill="white"/>
  <circle cx="32" cy="50" r="3" fill="#10b981"/>
</svg>
```

- [ ] **Step 3: Update GuestLayout**

Replace the full contents of `frontend/src/layouts/GuestLayout.jsx`:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';

export default function GuestLayout() {
  const { user, loading } = useAuth();
  const { systemName, logoUrl, loginBgUrl } = useBranding();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center u-bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'var(--brand-primary)' }} />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={loginBgUrl ? {
        backgroundImage: `url(${loginBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : { background: 'var(--bg-page)' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {logoUrl && (
            <img src={logoUrl} alt={systemName} className="h-16 w-16 mx-auto mb-3 rounded-xl object-cover" />
          )}
          <h1 className="text-3xl font-bold u-text-brand">{systemName}</h1>
          <p className="mt-1 text-sm u-text-3">Powered by Vardhan ERP</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/public/vardhan-erp.svg frontend/src/layouts/GuestLayout.jsx
git commit -m "feat(frontend): rebrand to Vardhan ERP — title, logo, guest layout"
```

---

## Task 6: Frontend — Extend BrandingContext with colors + CSS variables

**Files:**
- Modify: `frontend/src/contexts/BrandingContext.jsx`

- [ ] **Step 1: Update BrandingContext**

Replace the full contents of `frontend/src/contexts/BrandingContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { brandingAPI } from '../api/core';
import defaultLogo from '../../public/vardhan-erp.svg';

const DEFAULTS = {
  systemName: 'Vardhan ERP',
  logoUrl: defaultLogo,
  faviconUrl: '',
  loginBgUrl: '',
  primaryColor: '#6366f1',
  secondaryColor: '#10b981',
  darkModeDefault: 'system',
};

const BrandingContext = createContext(null);

function applyBrandColors(primary, secondary) {
  document.documentElement.style.setProperty('--brand-primary', primary);
  document.documentElement.style.setProperty('--brand-secondary', secondary);
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULTS);

  const refreshBranding = useCallback(async () => {
    try {
      const { data } = await brandingAPI.get();
      const newBranding = {
        systemName: data.system_name || DEFAULTS.systemName,
        logoUrl: data.logo_url || DEFAULTS.logoUrl,
        faviconUrl: data.favicon_url || '',
        loginBgUrl: data.login_bg_url || '',
        primaryColor: data.primary_color || DEFAULTS.primaryColor,
        secondaryColor: data.secondary_color || DEFAULTS.secondaryColor,
        darkModeDefault: data.dark_mode_default || DEFAULTS.darkModeDefault,
      };
      setBranding(newBranding);

      document.title = newBranding.systemName;
      applyBrandColors(newBranding.primaryColor, newBranding.secondaryColor);

      if (newBranding.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = newBranding.faviconUrl;
      }
    } catch {
      // Use defaults if API fails
      applyBrandColors(DEFAULTS.primaryColor, DEFAULTS.secondaryColor);
    }
  }, []);

  useEffect(() => {
    // Apply defaults immediately so colors are set before API responds
    applyBrandColors(DEFAULTS.primaryColor, DEFAULTS.secondaryColor);
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshBranding();
    }
  }, [refreshBranding]);

  const value = useMemo(() => ({ ...branding, refreshBranding }), [refreshBranding, branding]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) throw new Error('useBranding must be used within BrandingProvider');
  return context;
}

BrandingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/contexts/BrandingContext.jsx
git commit -m "feat(branding): add primaryColor, secondaryColor, loginBgUrl, darkModeDefault to BrandingContext"
```

---

## Task 7: Frontend — ThemeContext integration + provider order fix

**Files:**
- Modify: `frontend/src/contexts/ThemeContext.jsx`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Update ThemeContext to read company default from BrandingContext**

Replace the full contents of `frontend/src/contexts/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useBranding } from './BrandingContext';

const STORAGE_KEY = 'vardhan-theme';
const ThemeContext = createContext();

function resolveTheme(stored, companyDefault) {
  if (stored === 'dark' || stored === 'light') return stored;
  if (companyDefault === 'dark') return 'dark';
  if (companyDefault === 'light') return 'light';
  // 'system' or anything else: check OS preference
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const { darkModeDefault } = useBranding();
  const stored = localStorage.getItem(STORAGE_KEY);
  const [theme, setTheme] = useState(() => resolveTheme(stored, darkModeDefault));

  // Re-resolve when company default loads from API
  useEffect(() => {
    const currentStored = localStorage.getItem(STORAGE_KEY);
    setTheme(resolveTheme(currentStored, darkModeDefault));
  }, [darkModeDefault]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function resetToCompanyDefault() {
    localStorage.removeItem(STORAGE_KEY);
    setTheme(resolveTheme(null, darkModeDefault));
  }

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, resetToCompanyDefault }),
    [theme] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
```

- [ ] **Step 2: Fix provider order in main.jsx**

`ThemeProvider` currently wraps `BrandingProvider` — it must be the other way around so `ThemeContext` can call `useBranding()`.

Replace the full contents of `frontend/src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BrandingProvider>
          <ThemeProvider>
            <App />
            <Toaster
              position="bottom-center"
              toastOptions={{
                className: 'dark:!bg-gray-800 dark:!text-white',
              }}
            />
          </ThemeProvider>
        </BrandingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 3: Verify app still boots**

```bash
cd frontend
npm run dev
```

Open http://localhost:5173/login — the login page should load without errors. Check browser console for no React errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/contexts/ThemeContext.jsx frontend/src/main.jsx
git commit -m "feat(theme): read company dark_mode_default from BrandingContext, fix provider order"
```

---

## Task 8: Frontend — businessProfile API module

**Files:**
- Create: `frontend/src/api/businessProfile.js`

- [ ] **Step 1: Create the API module**

Create `frontend/src/api/businessProfile.js`:

```js
import client from './client';

export const businessProfileAPI = {
  get: () => client.get('/business-profile/'),
  update: (data) => client.put('/business-profile/', data, {
    headers: { 'Content-Type': 'application/json' },
  }),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/businessProfile.js
git commit -m "feat(api): add businessProfileAPI module"
```

---

## Task 9: Frontend — Settings page refactor (Branding tab)

**Files:**
- Modify: `frontend/src/pages/Settings/Index.jsx`

This task rewrites Settings/Index.jsx in 4 sub-steps (one per tab), building the shell first.

- [ ] **Step 1: Build the tabbed shell with Branding tab**

Replace the full contents of `frontend/src/pages/Settings/Index.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { settingsAPI, brandingAPI } from '../../api/core';
import { businessProfileAPI } from '../../api/businessProfile';
import { invoicesAPI } from '../../api/invoices';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import toast from 'react-hot-toast';
import { Save, Plus, Upload, Image, Palette, Building2, FileText, Settings2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { PageHeader, FormField } from '../../components/common';
import { PageSpinner } from '../../components/ui/Spinner';

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9',
];

const TABS = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'app', label: 'App Settings', icon: Settings2 },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-2">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: color,
              borderColor: value === color ? 'var(--text)' : 'transparent',
            }}
          />
        ))}
        <label className="flex items-center gap-1.5 px-2 py-1 u-bg-subtle rounded-lg text-xs u-text-2 cursor-pointer">
          Custom
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
          />
        </label>
        <span className="text-xs u-text-3 font-mono">{value}</span>
      </div>
    </div>
  );
}

function FileUploadField({ label, preview, onFileSelect, accept = 'image/*' }) {
  return (
    <div>
      <label className="block text-sm font-medium u-text-2 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} alt={label} className="h-16 w-16 rounded-lg object-cover border" style={{ borderColor: 'var(--border)' }} />
        ) : (
          <div className="h-16 w-16 rounded-lg u-bg-subtle flex items-center justify-center">
            <Image className="h-6 w-6 u-text-3" />
          </div>
        )}
        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 u-bg-subtle u-text-2 text-sm rounded-lg hover:opacity-90">
          <Upload className="h-4 w-4" /> Upload
          <input type="file" accept={accept} className="hidden" onChange={onFileSelect} />
        </label>
      </div>
    </div>
  );
}

function BrandingTab({ isAdmin }) {
  const {
    systemName: currentSystemName,
    logoUrl: currentLogoUrl,
    faviconUrl: currentFaviconUrl,
    loginBgUrl: currentLoginBgUrl,
    primaryColor: currentPrimary,
    secondaryColor: currentSecondary,
    darkModeDefault: currentDarkMode,
    refreshBranding,
  } = useBranding();

  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [loginBgPreview, setLoginBgPreview] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [darkMode, setDarkMode] = useState('system');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentSystemName);
    setLogoPreview(currentLogoUrl);
    setFaviconPreview(currentFaviconUrl);
    setLoginBgPreview(currentLoginBgUrl);
    setPrimaryColor(currentPrimary);
    setSecondaryColor(currentSecondary);
    setDarkMode(currentDarkMode);
  }, [currentSystemName, currentLogoUrl, currentFaviconUrl, currentLoginBgUrl, currentPrimary, currentSecondary, currentDarkMode]);

  function handleFile(e, setFile, setPreview) {
    const file = e.target.files?.[0];
    if (file) { setFile(file); setPreview(URL.createObjectURL(file)); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('system_name', name);
      formData.append('primary_color', primaryColor);
      formData.append('secondary_color', secondaryColor);
      formData.append('dark_mode_default', darkMode);
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (loginBgFile) formData.append('login_bg', loginBgFile);
      await brandingAPI.update(formData);
      await refreshBranding();
      setLogoFile(null); setFaviconFile(null); setLoginBgFile(null);
      toast.success('Branding updated');
    } catch { toast.error('Failed to update branding'); }
    finally { setSaving(false); }
  }

  if (!isAdmin) {
    return <p className="text-sm u-text-3 text-center py-8">Only admins can edit branding.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="u-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Company Display Name</label>
          <input
            type="text"
            className="u-input w-full max-w-md px-3 py-2 rounded-lg text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FileUploadField label="Logo" preview={logoPreview} onFileSelect={(e) => handleFile(e, setLogoFile, setLogoPreview)} />
          <FileUploadField label="Favicon" preview={faviconPreview} onFileSelect={(e) => handleFile(e, setFaviconFile, setFaviconPreview)} />
          <FileUploadField label="Login Background" preview={loginBgPreview} onFileSelect={(e) => handleFile(e, setLoginBgFile, setLoginBgPreview)} />
        </div>
        <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
        <ColorPicker label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
        <div>
          <label className="block text-sm font-medium u-text-2 mb-2">Default Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="darkMode"
                  value={mode}
                  checked={darkMode === mode}
                  onChange={() => setDarkMode(mode)}
                  className="accent-[var(--brand-primary)]"
                />
                <span className="text-sm u-text capitalize">{mode}</span>
              </label>
            ))}
          </div>
        </div>
        <Button icon={Save} onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'super_admin' || user?.role?.name === 'admin';
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <div className="space-y-6">
      <PageHeader title="Company Settings" />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 u-bg-subtle rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'u-bg-surface u-text shadow-sm'
                : 'u-text-3 hover:u-text-2'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'branding' && <BrandingTab isAdmin={isAdmin} />}
      {activeTab === 'business' && <BusinessTab isAdmin={isAdmin} />}
      {activeTab === 'invoice' && <InvoiceTab />}
      {activeTab === 'app' && <AppSettingsTab isAdmin={isAdmin} />}
    </div>
  );
}

// Placeholders — filled in Tasks 10 & 11
function BusinessTab() { return null; }
function InvoiceTab() { return null; }
function AppSettingsTab() { return null; }
```

- [ ] **Step 2: Verify Branding tab renders**

```bash
cd frontend && npm run dev
```

Navigate to http://localhost:5173/settings — the tab bar should appear with "Branding" active showing the color pickers, file uploads, and theme radio group.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings/Index.jsx
git commit -m "feat(settings): tabbed shell + Branding tab with color pickers and theme mode"
```

---

## Task 10: Frontend — Business Info tab + Invoice tab

**Files:**
- Modify: `frontend/src/pages/Settings/Index.jsx`

- [ ] **Step 1: Add BusinessTab and InvoiceTab components**

Find the `// Placeholders — filled in Tasks 10 & 11` comment in `frontend/src/pages/Settings/Index.jsx` and replace the three placeholder functions with:

```jsx
function BusinessTab({ isAdmin }) {
  const EMPTY = {
    name: '', address: '', email: '', phone: '', website: '',
    gstin: '', pan: '', state: '', state_code: '',
    bank_name: '', account_no: '', ifsc_code: '',
    currency: 'INR', timezone: 'Asia/Kolkata',
    language: 'en', date_format: 'DD/MM/YYYY', logo_base64: '',
  };
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessProfileAPI.get()
      .then(({ data }) => setForm((prev) => ({ ...prev, ...data })))
      .catch(() => {}) // 404 means not yet created — keep empty form
      .finally(() => setLoading(false));
  }, []);

  function set(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logo_base64', reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await businessProfileAPI.update(form);
      toast.success('Business profile saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="u-card p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Company Name" value={form.name} onChange={(v) => set('name', v)} />
        <FormField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
        <FormField label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
        <FormField label="Website" value={form.website} onChange={(v) => set('website', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium u-text-2 mb-1">Address</label>
        <textarea
          className="u-input w-full px-3 py-2 rounded-lg text-sm"
          rows={3}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField label="GSTIN" value={form.gstin} onChange={(v) => set('gstin', v)} />
        <FormField label="PAN" value={form.pan} onChange={(v) => set('pan', v)} />
        <FormField label="State" value={form.state} onChange={(v) => set('state', v)} />
        <FormField label="State Code" value={form.state_code} onChange={(v) => set('state_code', v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Bank Name" value={form.bank_name} onChange={(v) => set('bank_name', v)} />
        <FormField label="Account No" value={form.account_no} onChange={(v) => set('account_no', v)} />
        <FormField label="IFSC Code" value={form.ifsc_code} onChange={(v) => set('ifsc_code', v)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Currency</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            {[['INR','Indian Rupee'],['USD','US Dollar'],['EUR','Euro'],['GBP','British Pound'],['AED','UAE Dirham']].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Timezone</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
            {['Asia/Kolkata','Asia/Dubai','Europe/London','America/New_York','America/Los_Angeles','UTC'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Language</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.language} onChange={(e) => set('language', e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium u-text-2 mb-1">Date Format</label>
          <select className="u-input w-full px-3 py-2 rounded-lg text-sm" value={form.date_format} onChange={(e) => set('date_format', e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium u-text-2 mb-1">Invoice Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs u-text-2" />
        {form.logo_base64 && (
          <img src={form.logo_base64} alt="logo" className="mt-2 h-10 object-contain" />
        )}
      </div>
      {isAdmin && (
        <Button icon={Save} onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Business Info'}
        </Button>
      )}
    </div>
  );
}

function InvoiceTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY_PROFILE = {
    name: '', address: '', gstin: '', pan: '', state: 'Maharashtra', state_code: '27',
    email: '', bank_name: '', account_no: '', ifsc_code: '', logo_base64: '', is_default: false,
  };

  useEffect(() => { loadProfiles(); }, []);

  async function loadProfiles() {
    setLoading(true);
    try {
      const { data } = await invoicesAPI.profiles.list();
      setProfiles(data.results || data || []);
    } catch { toast.error('Failed to load profiles'); }
    finally { setLoading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) {
        await invoicesAPI.profiles.update(editing.id, editing);
      } else {
        await invoicesAPI.profiles.create(editing);
      }
      toast.success('Profile saved');
      setEditing(null);
      loadProfiles();
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this profile?')) return;
    try {
      await invoicesAPI.profiles.delete(id);
      toast.success('Profile deleted');
      loadProfiles();
    } catch { toast.error('Failed to delete'); }
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditing((p) => ({ ...p, logo_base64: reader.result }));
    reader.readAsDataURL(file);
  }

  function set(field, val) { setEditing((p) => ({ ...p, [field]: val })); }

  if (loading) return <PageSpinner />;

  if (editing) {
    return (
      <div className="u-card p-6">
        <h3 className="text-sm font-semibold u-text mb-4">{editing.id ? 'Edit Profile' : 'New Invoice Profile'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Company Name *" value={editing.name} onChange={(v) => set('name', v)} required />
            <FormField label="Email" type="email" value={editing.email} onChange={(v) => set('email', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Address</label>
            <textarea className="u-input w-full px-3 py-2 rounded-lg text-sm" rows={2}
              value={editing.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="GSTIN" value={editing.gstin} onChange={(v) => set('gstin', v)} />
            <FormField label="PAN" value={editing.pan} onChange={(v) => set('pan', v)} />
            <FormField label="State" value={editing.state} onChange={(v) => set('state', v)} />
            <FormField label="State Code" value={editing.state_code} onChange={(v) => set('state_code', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Bank Name" value={editing.bank_name} onChange={(v) => set('bank_name', v)} />
            <FormField label="Account No" value={editing.account_no} onChange={(v) => set('account_no', v)} />
            <FormField label="IFSC Code" value={editing.ifsc_code} onChange={(v) => set('ifsc_code', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium u-text-2 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs u-text-2" />
            {editing.logo_base64 && <img src={editing.logo_base64} alt="logo" className="mt-2 h-10 object-contain" />}
          </div>
          <label className="flex items-center gap-2 text-sm u-text cursor-pointer">
            <input type="checkbox" checked={editing.is_default} onChange={(e) => set('is_default', e.target.checked)} />
            Set as default profile
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Profile</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {profiles.map((p) => (
        <div key={p.id} className="u-card flex items-center gap-3 p-4">
          <Building2 className="h-5 w-5 u-text-3 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium u-text truncate">{p.name}</p>
              {p.is_default && <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 rounded">Default</span>}
            </div>
            <p className="text-xs u-text-3 truncate">{p.gstin}</p>
          </div>
          <button onClick={() => setEditing(p)} className="text-xs u-text-brand hover:underline">Edit</button>
          <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
      ))}
      {profiles.length === 0 && <p className="text-sm u-text-3 text-center py-4">No invoice profiles yet.</p>}
      <Button onClick={() => setEditing({ ...EMPTY_PROFILE })}>+ Add Profile</Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Settings/Index.jsx
git commit -m "feat(settings): Business Info tab and Invoice tab"
```

---

## Task 11: Frontend — App Settings tab (final tab)

**Files:**
- Modify: `frontend/src/pages/Settings/Index.jsx`

- [ ] **Step 1: Replace the AppSettingsTab placeholder**

Find `function AppSettingsTab() { return null; }` in `frontend/src/pages/Settings/Index.jsx` and replace it with:

```jsx
function AppSettingsTab({ isAdmin }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data } = await settingsAPI.list();
      setSettings(data.results || data || []);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }

  function updateSetting(key, field, value) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }

  async function handleUpdate(setting) {
    try { await settingsAPI.update(setting.key, setting); toast.success('Setting updated'); }
    catch { toast.error('Update failed'); }
  }

  async function handleAdd() {
    if (!newKey.trim()) return toast.error('Key is required');
    try {
      const client = (await import('../../api/client')).default;
      await client.post('/settings/', { key: newKey, value: newValue, description: newDesc });
      toast.success('Setting added');
      setNewKey(''); setNewValue(''); setNewDesc('');
      loadSettings();
    } catch { toast.error('Add failed'); }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="u-card p-6">
        <h2 className="text-sm font-semibold u-text mb-4">Application Settings</h2>
        <div className="space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="flex items-end gap-4 p-4 u-bg-subtle rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-medium u-text-3 mb-1">{s.key}</label>
                <input type="text"
                  className="u-input w-full px-3 py-2 rounded-lg text-sm"
                  value={s.value}
                  onChange={(e) => updateSetting(s.key, 'value', e.target.value)}
                  disabled={!isAdmin}
                />
                {s.description && <p className="text-xs u-text-3 opacity-75 mt-1">{s.description}</p>}
              </div>
              {isAdmin && <Button icon={Save} size="sm" onClick={() => handleUpdate(s)}>Save</Button>}
            </div>
          ))}
          {settings.length === 0 && <p className="text-sm u-text-3 text-center py-4">No settings configured</p>}
        </div>
      </div>

      {isAdmin && (
        <div className="u-card p-6">
          <h2 className="text-sm font-semibold u-text mb-4">Add New Setting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Key" value={newKey} onChange={setNewKey} placeholder="e.g., company_name" />
            <FormField label="Value" value={newValue} onChange={setNewValue} placeholder="e.g., Vardhan ERP" />
            <FormField label="Description" value={newDesc} onChange={setNewDesc} placeholder="Optional description" />
          </div>
          <Button icon={Plus} className="mt-4" onClick={handleAdd}>Add Setting</Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Remove the old inline imports that are no longer needed**

At the top of `Settings/Index.jsx`, the `client` direct import (`import client from '../../api/client'`) was used in the old `handleAdd`. We now import it dynamically inside `AppSettingsTab`. Remove the static `client` import line if it was left over from the original file.

- [ ] **Step 3: Verify all 4 tabs work end-to-end**

Start both servers:
```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

Check each tab:
- **Branding**: Change primary color → save → sidebar accent color updates immediately
- **Business Info**: Fill in GSTIN, address → save → reload → values persist
- **Invoice**: Create a new invoice profile → it appears in the list
- **App Settings**: Edit a key/value setting → save → success toast

- [ ] **Step 4: Final commit**

```bash
git add frontend/src/pages/Settings/Index.jsx
git commit -m "feat(settings): App Settings tab — complete 4-tab Company Settings page"
```

---

## Acceptance Criteria Verification

- [ ] App title shows "Vardhan ERP" in browser tab
- [ ] Login page header shows "Vardhan ERP", footer shows "Powered by Vardhan ERP"
- [ ] Changing primary color in Branding tab repaints sidebar and buttons instantly after save
- [ ] Business Info tab saves and loads GST, address, bank, locale fields
- [ ] Company default theme (light/dark/system) applies on next login
- [ ] Individual user theme toggle works and persists in localStorage key `vardhan-theme`
- [ ] Invoice tab shows existing company profiles without regression
- [ ] Non-admin users cannot edit Branding or Business Info (read-only or hidden save buttons)
- [ ] All 5 backend tests pass: `python manage.py test apps.core.tests.test_business_profile`

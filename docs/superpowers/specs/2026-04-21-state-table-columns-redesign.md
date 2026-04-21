# State Table Columns Redesign

**Date:** 2026-04-21  
**Branch:** feature/invoices  
**Status:** Approved

## Overview

The `State` lookup table currently stores only a 2-letter alpha code (`state_code`). This redesign adds proper ISO codes and GST state codes, renames the existing field for clarity, and ensures all models and seed data are consistent.

## Changes

### 1. State Model (`backend/apps/core/models/geo.py`)

| Before | After | Notes |
|--------|-------|-------|
| `state_code` (2-letter alpha, e.g. "MH") | `alpha_code` | Renamed |
| — | `iso_code` (e.g. "IN-MH") | New field |
| — | `state_code` (GST numeric, e.g. "27") | New field |

Field definitions:
- `alpha_code` — `CharField(max_length=10, blank=True, default='')`
- `iso_code` — `CharField(max_length=10, blank=True, default='')`
- `state_code` — `CharField(max_length=5, blank=True, default='')` — GST numeric code

### 2. Django Migration (`backend/apps/core/migrations/0003_state_codes_redesign.py`)

- `RenameField`: `state_code` → `alpha_code`
- `AddField`: `iso_code`
- `AddField`: `state_code` (new GST column)
- Data migration: populate `iso_code` and `state_code` for all existing Indian states using the mapping below

### 3. Seed Command (`backend/apps/core/management/commands/seed_geo_data.py`)

Update `indian_states` list to a tuple of `(alpha_code, state_name, iso_code, gst_code)` and pass all four fields to `get_or_create`.

### 4. Core Admin (`backend/apps/core/admin.py`)

- `list_display`: `['state_name', 'alpha_code', 'iso_code', 'state_code', 'country']`
- `search_fields`: `['state_name', 'alpha_code', 'state_code']`

### 5. Customer Model (`backend/apps/customers/models/customer.py`)

No structural migration needed. The `state_code` CharField stays. Its **meaning** changes: going forward it stores the GST numeric code (e.g. "27") rather than the 2-letter alpha. No data migration for existing rows (field was largely empty).

### 6. No Changes Needed

- `CompanyProfile.state_code` — already stores GST numeric "27", max_length=2 sufficient
- `Invoice.buyer_state_code` — already stores GST numeric "27"
- All serializers use `fields='__all__'` — new State fields exposed automatically
- Frontend field names `state_code` / `buyer_state_code` on CompanyProfile and Invoice unchanged

## GST State Code Mapping

| GST Code | Alpha | ISO | State Name |
|----------|-------|-----|------------|
| 01 | JK | IN-JK | Jammu and Kashmir |
| 02 | HP | IN-HP | Himachal Pradesh |
| 03 | PB | IN-PB | Punjab |
| 04 | CH | IN-CH | Chandigarh |
| 05 | UK | IN-UK | Uttarakhand |
| 06 | HR | IN-HR | Haryana |
| 07 | DL | IN-DL | Delhi |
| 08 | RJ | IN-RJ | Rajasthan |
| 09 | UP | IN-UP | Uttar Pradesh |
| 10 | BR | IN-BR | Bihar |
| 11 | SK | IN-SK | Sikkim |
| 12 | AR | IN-AR | Arunachal Pradesh |
| 13 | NL | IN-NL | Nagaland |
| 14 | MN | IN-MN | Manipur |
| 15 | MZ | IN-MZ | Mizoram |
| 16 | TR | IN-TR | Tripura |
| 17 | ML | IN-ML | Meghalaya |
| 18 | AS | IN-AS | Assam |
| 19 | WB | IN-WB | West Bengal |
| 20 | JH | IN-JH | Jharkhand |
| 21 | OD | IN-OD | Odisha |
| 22 | CG | IN-CG | Chhattisgarh |
| 23 | MP | IN-MP | Madhya Pradesh |
| 24 | GJ | IN-GJ | Gujarat |
| 26 | DN | IN-DN | Dadra and Nagar Haveli and Daman and Diu |
| 27 | MH | IN-MH | Maharashtra |
| 28 | AP | IN-AP | Andhra Pradesh |
| 29 | KA | IN-KA | Karnataka |
| 30 | GA | IN-GA | Goa |
| 31 | LD | IN-LD | Lakshadweep |
| 32 | KL | IN-KL | Kerala |
| 33 | TN | IN-TN | Tamil Nadu |
| 34 | PY | IN-PY | Puducherry |
| 35 | AN | IN-AN | Andaman and Nicobar Islands |
| 36 | TS | IN-TS | Telangana |
| 38 | LA | IN-LA | Ladakh |

## Files Touched

```
backend/apps/core/models/geo.py
backend/apps/core/migrations/0003_state_codes_redesign.py   (new)
backend/apps/core/management/commands/seed_geo_data.py
backend/apps/core/admin.py
```

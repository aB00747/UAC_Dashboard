# MinIO File Storage Implementation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Django local `FileField` storage with MinIO (S3-compatible object storage) across all apps, using a central `StorageService` backed by `boto3`, with presigned URLs for secure access and a clean migration path to AWS S3 or Cloudflare R2.

**Architecture:** A single `StorageService` class wraps all `boto3` calls. All apps store only the S3 key string in the database via a new `StoredFile` metadata model. Files are never served through Django — clients receive short-lived presigned URLs and fetch directly from MinIO.

**Tech Stack:** MinIO (Docker), boto3, Django 5.1 + DRF, React + Vite frontend (no frontend changes in Phase 1).

---

## 1. Bucket Layout

One bucket (`erp-files`), private by default. All objects follow:

```
erp-files/
  tenant_1/
    invoices/   2026/04/{uuid}.pdf
    challans/   2026/04/{uuid}.pdf
    reports/    2026/04/{uuid}.xlsx
    documents/  2026/04/{uuid}.pdf
    products/   2026/04/{uuid}.jpg
    branding/   2026/04/{uuid}.svg
```

Key format: `tenant_{tenant_id}/{category}/{YYYY}/{MM}/{uuid}{ext}`

---

## 2. StoredFile Model

Lives in `backend/apps/documents/models/stored_file.py`. Used by all apps — other apps import and FK to this model rather than duplicating file storage logic.

```python
class StoredFile(models.Model):
    CATEGORY_CHOICES = [
        ('invoices',  'Invoices'),
        ('challans',  'Challans'),
        ('reports',   'Reports'),
        ('documents', 'Documents'),
        ('products',  'Products'),
        ('branding',  'Branding'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant_id     = models.IntegerField(default=1)       # Phase 2: FK to Tenant model
    category      = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    key           = models.CharField(max_length=512)     # full S3 path, never exposed to client
    original_name = models.CharField(max_length=255)     # original filename from upload
    mime_type     = models.CharField(max_length=100)
    size_bytes    = models.PositiveBigIntegerField()
    uploaded_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='stored_files'
    )
    created_at    = models.DateTimeField(auto_now_add=True)
    is_deleted    = models.BooleanField(default=False)   # soft delete

    class Meta:
        db_table = 'stored_files'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'category']),
            models.Index(fields=['is_deleted']),
        ]
```

---

## 3. StorageService

Single class at `backend/apps/documents/storage.py`. Instantiated once at module level (`storage = StorageService()`). All other code imports this instance.

```python
class StorageService:
    def __init__(self):
        # reads STORAGE_* env vars, creates boto3 client
        # path_style=True for MinIO, False for AWS/R2

    def build_key(self, category: str, tenant_id: int, filename: str) -> str:
        # returns tenant_{id}/{category}/YYYY/MM/{uuid}{ext}

    def upload(self, file_obj, category: str, tenant_id: int, original_name: str) -> str:
        # validates MIME + size against per-category limits
        # streams file to MinIO, returns key

    def presigned_url(self, key: str, category: str) -> str:
        # generates GET presigned URL
        # expiry from settings.PRESIGNED_URL_EXPIRY[category]

    def delete(self, key: str) -> None:
        # hard-deletes object from MinIO

    def object_exists(self, key: str) -> bool:
        # used by migration command to avoid re-uploading
```

**Validation inside `upload()`:**

| Category | Allowed MIME types | Max size |
|---|---|---|
| invoices, challans, reports, documents | application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document | 20 MB |
| products, branding | image/jpeg, image/png, image/webp, image/gif, image/svg+xml | 5 MB |

Raises `StorageValidationError` (a plain `Exception` subclass) on failure — the view catches this and returns HTTP 400.

---

## 4. API Endpoints

All under `/api/files/` — new URLconf entry in `backend/config/urls.py`.

| Method | URL | Auth | Purpose |
|--------|-----|------|---------|
| POST | `/api/files/upload/` | JWT required | Upload file, returns StoredFile JSON |
| GET | `/api/files/` | JWT required | List files (filter: category, tenant_id) |
| GET | `/api/files/{id}/` | JWT required | Get StoredFile metadata |
| GET | `/api/files/{id}/url/` | JWT required | Get presigned download URL |
| DELETE | `/api/files/{id}/` | JWT + admin | Soft-delete + MinIO hard-delete |

**Upload request:** `multipart/form-data` with fields `file` (binary) and `category` (string).

**URL response:**
```json
{ "url": "http://minio:9000/erp-files/tenant_1/invoices/...", "expires_in": 3600 }
```

---

## 5. Presigned URL Expiry Config

In `backend/config/settings.py`:

```python
PRESIGNED_URL_EXPIRY = {
    'invoices':   3600,    # 1 hour
    'challans':   3600,    # 1 hour
    'reports':    1800,    # 30 minutes
    'documents':  3600,    # 1 hour
    'products':   86400,   # 24 hours
    'branding':   86400,   # 24 hours
}
```

---

## 6. MinIO Docker Setup

Added to `docker-compose.dev.yml`:

```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  ports:
    - "9000:9000"    # S3 API
    - "9001:9001"    # Web console (http://localhost:9001)
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  volumes:
    - minio_data:/data
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
    interval: 5s
    timeout: 5s
    retries: 5

createbuckets:
  image: minio/mc
  depends_on:
    minio:
      condition: service_healthy
  entrypoint: >
    /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin123;
      mc mb --ignore-existing local/erp-files;
      mc anonymous set none local/erp-files;
      exit 0;
    "
```

---

## 7. Environment Variables

```ini
# .env (local development — MinIO)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin123
STORAGE_BUCKET=erp-files
STORAGE_REGION=us-east-1
STORAGE_USE_PATH_STYLE=true
```

**Production migration** — change these 4 vars, zero code changes:

| Variable | MinIO (local) | AWS S3 | Cloudflare R2 |
|---|---|---|---|
| `STORAGE_ENDPOINT` | `http://minio:9000` | *(leave empty)* | `https://<id>.r2.cloudflarestorage.com` |
| `STORAGE_USE_PATH_STYLE` | `true` | `false` | `false` |
| `STORAGE_ACCESS_KEY` | `minioadmin` | AWS key | R2 key |
| `STORAGE_SECRET_KEY` | `minioadmin123` | AWS secret | R2 secret |

---

## 8. Migration Strategy

**Management command:** `python manage.py migrate_files_to_minio`

Steps:
1. Iterates all `Document` rows where `file` is non-empty
2. Opens local file from `MEDIA_ROOT / document.file`
3. Calls `StorageService.upload()` → gets S3 key
4. Creates `StoredFile` row with the key + metadata from `Document`
5. Sets `Document.migrated = True` (new BooleanField added to old model)
6. Migrates `BrandingSetting.logo`, `.favicon`, `.login_bg` the same way — creates `StoredFile` rows and stores the keys in new `*_file` FK columns
7. Supports `--dry-run` flag (lists files without uploading)
8. Idempotent: skips rows where `Document.migrated = True`

**After migration:**
- `BrandingSetting.logo`, `.favicon`, `.login_bg` columns become `CharField(max_length=512)` storing the S3 key directly (no FK). The serializer calls `StorageService.presigned_url(key, 'branding')` to produce the `*_url` fields — no change to the API response shape clients already rely on.
- `Document` model is kept with `migrated` flag for one release, then dropped in a follow-up migration.

---

## 9. File Structure

```
backend/
  apps/
    documents/
      models/
        stored_file.py       # new StoredFile model
        document.py          # existing, add migrated=BooleanField
      storage.py             # StorageService class
      serializers/
        stored_file.py       # new serializer
      views/
        files.py             # new FileViewSet
      management/
        commands/
          migrate_files_to_minio.py
      migrations/
        0002_storedfile.py
        0003_document_migrated_flag.py
  config/
    settings.py              # add PRESIGNED_URL_EXPIRY + STORAGE_* vars
    urls.py                  # add /api/files/ route
docker-compose.dev.yml       # add minio + createbuckets services
.env.example                 # add STORAGE_* vars
```

---

## 10. Out of Scope (Phase 2)

- Direct browser-to-MinIO upload via presigned PUT URL
- Per-tenant bucket isolation
- Automatic expiry/lifecycle policies on MinIO objects
- CDN in front of MinIO for product images
- Frontend file manager UI

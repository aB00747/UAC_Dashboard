from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.core.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/messages/', include('apps.messaging.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/invoices/', include('apps.invoices.urls')),
    path('api/audit-logs/', include('apps.audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

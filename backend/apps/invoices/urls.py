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

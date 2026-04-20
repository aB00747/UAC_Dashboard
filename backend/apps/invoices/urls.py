from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, CompanyProfileViewSet

router = DefaultRouter()
router.register(r'company-profiles', CompanyProfileViewSet, basename='company-profile')
router.register(r'', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]

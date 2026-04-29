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

from django.contrib import admin
from .models import Country, State, Notification, Setting, BrandingSetting


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['country_name', 'country_code']
    search_fields = ['country_name', 'country_code']


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['state_name', 'alpha_code', 'iso_code', 'state_code', 'country']
    list_filter = ['country']
    search_fields = ['state_name', 'alpha_code', 'state_code']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['title', 'message']


@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'description']
    search_fields = ['key', 'description']


@admin.register(BrandingSetting)
class BrandingSettingAdmin(admin.ModelAdmin):
    list_display = ['system_name', 'updated_at']

from django.contrib import admin
from .models import Location

class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'latitude', 'longitude')

# Register your models here.
admin.site.register(Location, LocationAdmin)

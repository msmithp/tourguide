from django.contrib import admin
from .models import Location, Tour, TourLocation

class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'address', 'latitude', 'longitude')


class TourAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created')


class TourLocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'tour', 'location', 'index')

# Register your models here.
admin.site.register(Location, LocationAdmin)
admin.site.register(Tour, TourAdmin)
admin.site.register(TourLocation, TourLocationAdmin)

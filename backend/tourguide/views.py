from django.shortcuts import render
from rest_framework import viewsets
from .serializers import LocationSerializer, TourSerializer
from .models import Location, Tour, TourLocation
from utils.algorithms import calculate_tour
from django.db import connection
from django.http import HttpResponse, JsonResponse

# Create your views here.
class LocationView(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    queryset = Location.objects.all()


class TourView(viewsets.ModelViewSet):
    serializer_class = TourSerializer
    queryset = Tour.objects.all()


def get_tour(request, tour_id):
    # Query database to retrieve locations in tour
    # in SQL...
    # SELECT TL.location_id, L.latitude, L.longitude
    # FROM TourLocation TL, Location L
    # WHERE TL.tour_id = tour_id AND TL.location_id = L.location_id
    locs = TourLocation.objects.select_related("location").filter(tour=tour_id)
    tour = Tour.objects.get(pk=tour_id)

    # TODO: sort locs in order of indices in tour before creating dict
    # http://127.0.0.1:8000/get_tour/1/
    locations = [
        {"id": x.location.pk,
         "name": x.location.name,
         "address": x.location.address,
         "latitude": x.location.latitude,
         "longitude": x.location.longitude,
         "index": x.index} for x in locs
    ]

    res = {
        "name": tour.name,
        "created": tour.created,
        "locations": locations
    }

    return JsonResponse(res)


def insert_tour(request, data):
    # Create a new tour with a name and date (and no locations)
    pass


def delete_tour(request, data):
    # Delete a tour from the Tour table and TourLocation table
    pass


def add_to_tour(request, data):
    # We will re-calculate the tour here
    pass


def remove_from_tour(request, data):
    # We will re-calculate the tour here
    pass

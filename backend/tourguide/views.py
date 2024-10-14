from rest_framework import viewsets
from .serializers import LocationSerializer, TourSerializer
from .models import Location, Tour, TourLocation
from utils.algorithms import calculate_tour
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Min
import json
import requests

# Create your views here.
class LocationView(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    queryset = Location.objects.all()


class TourView(viewsets.ModelViewSet):
    """ Access all tours and associated data """
    serializer_class = TourSerializer
    queryset = Tour.objects.all()


def get_tour(request, tour_id):
    """ API endpoint to retrieve the name, time created, and locations
        of a tour given its ID """
    # Get location objects and tour object for specified tour
    locs = TourLocation.objects.select_related("location").filter(tour=tour_id)
    tour = Tour.objects.get(pk=tour_id)

    # Create locations list
    locations = [
        {"id": x.location.pk,
         "name": x.location.name,
         "address": x.location.address,
         "latitude": x.location.latitude,
         "longitude": x.location.longitude,
         "index": x.index} for x in locs
    ]

    # Sort locations on index
    locations = sorted(locations, key=lambda x: x["index"])

    # Create response dictionary
    res = {
        "name": tour.name,
        "created": tour.created,
        "locations": locations
    }

    return JsonResponse(res)


@csrf_exempt
def delete_tour(request, tour_id):
    """ API endpoint to delete a tour from the Tour table and TourLocation
        table given its ID """
    # Delete tour with the given ID from the database
    Tour.objects.filter(pk=tour_id).delete()

    return HttpResponse(status=200)


@csrf_exempt
def add_to_tour(request):
    """ API endpoint to add a location to a tour given the tour's ID and
        the location's ID """
    # Load data - `request.body` consists of a tour ID and location ID
    data = json.loads(request.body)
    tour_id = data.get("tour_id")
    location_id = data.get("location_id")

    # Get all locations in tour
    locs = TourLocation.objects.select_related("location").filter(tour=tour_id)
    
    # Check if location is already in tour
    if locs.filter(location_id=location_id).exists():
        # Location is already in tour, so no re-calculation is necessary
        return HttpResponse(status=200)
    
    # Add location to tour with placeholder index
    new_tour_loc = TourLocation(tour_id=tour_id, location_id=location_id, index=-1)
    new_tour_loc.save()

    # Turn locations into dictionary of the format: {location_id: (latitude, longitude)}
    locs_dict = {
        l.location.pk: (float(l.location.latitude), float(l.location.longitude)) 
        for l in locs
    }

    # Re-calculate tour with new location added
    start = locs.get(index=0).location.pk
    order, _ = calculate_tour(locs_dict, start)

    # Update indices in database
    for index, id in enumerate(order):
        l = TourLocation.objects.get(tour_id=tour_id, location_id=id)
        l.index = index
        l.save()

    return HttpResponse(status=200)


@csrf_exempt
def remove_from_tour(request):
    """ API endpoint to remove a location from a tour given the tour's ID 
        and the location's ID """
    # Load data - `request.body` consists of a tour ID and location ID
    data = json.loads(request.body)
    tour_id = data.get("tour_id")
    location_id = data.get("location_id")

    # Get all locations in tour
    locs = TourLocation.objects.select_related("location").filter(tour=tour_id)

    # Check if location is in tour
    if not locs.filter(location_id=location_id).exists():
        # Location is not in tour, so no re-calculation is necessary
        return HttpResponse(status=200)
    
    # Remove location from TourLocation table
    TourLocation.objects.get(tour_id=tour_id, location_id=location_id).delete()

    # Check if any other tours include this location
    if not TourLocation.objects.filter(location_id=location_id).exists():
        # No other tours include this location, so we can delete it from the database
        Location.objects.get(pk=location_id).delete()

    # Turn locations into dictionary of the format: {location_id: (latitude, longitude)}
    locs_dict = {
        l.location.pk: (float(l.location.latitude), float(l.location.longitude)) 
        for l in locs
    }

    # `start` is the location with the lowest index; if index 0 is the location
    # that was removed, then index 1 is the new start
    start = locs.get(index=locs.aggregate(Min("index"))["index__min"]).location.pk

    # Re-calculate tour with new location added
    order, _ = calculate_tour(locs_dict, start)

    # Update indices in database
    for index, id in enumerate(order):
        l = TourLocation.objects.get(tour_id=tour_id, location_id=id)
        l.index = index
        l.save()

    return HttpResponse(status=200)


def search_location(request, query):
    """ API endpoint to use the Nominatim API to search for a location by 
        name and return a dictionary containing 5 candidates """
    # Base URL for API
    url = "https://nominatim.openstreetmap.org/search"

    # Parameters and headers for API call
    params = {"q": query,               # search query
            "format": "json",           # return in json format
            "accept-language": "en",    # return results in English
            "limit": 5,                 # max number of results returned
    }
    headers = {"User-Agent": "TourGuide"}

    # Make API call
    response = requests.get(url, params=params, headers=headers)

    # Wrap response in a dictionary for JSON serialization
    as_dict = {"data": response.json()}

    return JsonResponse(as_dict)


def add_location(request, data):
    """ API endpoint to add a new location into the Locations table
        only if it does not already exist """
    pass

from rest_framework import viewsets
from .serializers import LocationSerializer, TourSerializer
from .models import Location, Tour, TourLocation
from utils.algorithms import calculate_tour
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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


@csrf_exempt
def delete_tour(request, tour_id):
    """ API endpoint to delete a tour from the Tour table and TourLocation
        table given its ID """
    Tour.objects.filter(pk=tour_id).delete()
    return HttpResponse(status=200)


@csrf_exempt
def add_to_tour(request):
    """ API endpoint to add a location to a tour given the tour's ID and
        the location's ID """
    # Load data
    data = json.loads(request.body)
    tour_id = data.get('tour_id')
    location_id = data.get('location_id')

    # Add location to tour with placeholder index
    new_tour_loc = TourLocation(tour_id=tour_id, location_id=location_id, index=-1)
    new_tour_loc.save()

    # Get locations in tour
    locs = TourLocation.objects.select_related("location").filter(tour=tour_id)
    new_loc = Location.objects.get(pk=location_id)

    # Turn locations into dictionary
    locs_dict = {l.location.pk: (float(l.location.latitude), float(l.location.longitude)) for l in locs}
    locs_dict[new_loc.pk] = (float(new_loc.latitude), float(new_loc.longitude))
    print(locs_dict)

    # Re-calculate tour with new location added
    start = TourLocation.objects.select_related("location").get(tour=tour_id, index=0).location.pk
    order, _ = calculate_tour(locs_dict, start)

    # Update indices in database
    for index, id in enumerate(order):
        l = TourLocation.objects.get(location=id)
        l.index = index
        l.save()

    return HttpResponse(status=200)


def remove_from_tour(request, data):
    """ API endpoint to remove a location from a tour given the tour's ID 
        and the location's ID """
    # TODO: We will re-calculate the tour here
    # TODO: Check if location is present in any other tours. If not, delete it from
    #       the locations table
    pass


def search_location(request, data):
    """ API endpoint to use the Nominatim API to search for a location by 
        name and return a dictionary containing 5 candidates """
    pass


def add_location(request, data):
    """ API endpoint to add a new location into the Locations table
        only if it does not already exist """
    pass

from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=250)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return self.name


class Tour(models.Model):
    name = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    locations = models.ManyToManyField(Location, through="TourLocation")

    def __str__(self):
        return self.name


class TourLocation(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    index = models.IntegerField()
    
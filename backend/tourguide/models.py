from django.db import models

# Create your models here.

class Location(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=250)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def _str_(self):
        return self.name

class Tour(models.Model):
    name = models.CharField(max_length=100)
    length = models.IntegerField()
    created = models.DateTimeField()
    
"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from tourguide import views

router = routers.DefaultRouter()
router.register(r"locations", views.LocationView, 'Locations')  # TODO: remove
router.register(r"tours", views.TourView, 'Tours')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/get_tour/<int:tour_id>/', views.get_tour, name='get_tour'),
    path('api/delete_tour/<int:tour_id>/', views.delete_tour, name='delete_tour'),
    path('api/add_to_tour/', views.add_to_tour, name='add_to_tour'),
    path('api/remove_from_tour/', views.remove_from_tour, name='remove_from_tour'),
    path('api/search/<str:query>/', views.search_location, name='search'),
    path('api/add_location/', views.add_location, name='add_location'),
    path('api/create_tour/', views.create_tour, name='create_tour'),
]

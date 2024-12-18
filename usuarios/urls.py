from django.urls import path
from . import views

urlpatterns = [
    path('', views.cargar_usuarios, name='cargar_usuarios'),
]

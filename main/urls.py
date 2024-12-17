from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/alumnos/registro-rapido/', views.registro_rapido_alumno, name='registro_rapido_alumno'),
]
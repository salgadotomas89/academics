from django.urls import path
from . import views

urlpatterns = [
    path('', views.alumnos, name='alumnos'),
    path('registro-rapido/', views.registro_rapido_alumno, name='registro_rapido_alumno'),
    path('obtener-alumnos/', views.obtener_alumnos, name='obtener_alumnos'),
    path('eliminar-alumno/<int:alumno_id>/', views.eliminar_alumno, name='eliminar_alumno'),
]
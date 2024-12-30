from django.urls import path
from . import views

urlpatterns = [
    path('', views.alumnos, name='alumnos'),
    path('registro-rapido/', views.registro_rapido_alumno, name='registro_rapido_alumno'),
    path('obtener-cursos/', views.obtener_cursos, name='obtener_cursos'),
]
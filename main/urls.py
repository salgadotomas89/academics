from django.urls import path
from . import views

urlpatterns = [
    #vista principal
    path('', views.dashboard, name='dashboard'),
    #api para registrar alumnos
    path('api/alumnos/registro-rapido/', views.registro_rapido_alumno, name='registro_rapido_alumno'),
    #api para crear usuarios
    path('crear/nuevo_usuario/', views.nuevo_usuario, name='nuevo_usuario'),
    #vista de colegio
    path('colegio/content/', views.content_view, name='colegio_content'),
    #api para cargar usuarios
]

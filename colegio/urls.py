from django.urls import path
from . import views

urlpatterns = [
    #vista principal
    path('', views.dashboard, name='dashboard'),
    #api para crear usuarios
    path('crear/nuevo_usuario/', views.nuevo_usuario, name='nuevo_usuario'),
    #vista de colegio
    path('colegio/content/', views.content_view, name='colegio_content'),
]

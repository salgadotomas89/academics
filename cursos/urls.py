from django.urls import path
from . import views

urlpatterns = [
    path('', views.cursos, name='cursos'),
    path('obtener-profesores/', views.obtener_profesores, name='obtener_profesores'),
]
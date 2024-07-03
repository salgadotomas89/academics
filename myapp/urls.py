from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contacto', views.contacto, name='contacto'),
    path('precios', views.precios, name="precios"),
    path('mensajes', views.mensajes, name="mensajes"),
    path('enviar', views.enviar_mensaje_view, name='enviar'),
    path('nosotros', views.nosotros, name = 'nosotros'),
    path('artefactos', views.artefactos, name='artefactos'),
    path('periodo-prueba', views.periodo_prueba, name="periodo_prueba"),
    path('preguntas-frecuentes', views.preguntas_frecuentes, name="preguntas"),
    path('juego', views.juego, name = 'juego'),
    path('seleccion-plan', views.seleccion_plan, name='seleccion_plan'),

]

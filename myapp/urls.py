from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contacto', views.contacto, name='contacto'),
    path('phone-contact', views.phone_contact, name='phone_contact'),
    path('precios', views.precios, name="precios"),
    path('mensajes', views.mensajes, name="mensajes"),
    path('enviar', views.enviar_mensaje_view, name='enviar'),
    path('nosotros', views.nosotros, name = 'nosotros'),
    path('artefactos', views.artefactos, name='artefactos'),
    path('periodo-prueba', views.periodo_prueba, name="periodo_prueba"),
    path('preguntas-frecuentes', views.preguntas_frecuentes, name="preguntas"),
    path('juego', views.juego, name = 'juego'),
    path('seleccion-plan', views.seleccion_plan, name='seleccion_plan'),
    path('demo1', views.demo1, name='demo1'),
    #colegios
    path('colegios', views.colegios, name='colegios'),#listado de colegios  
    path('colegios/crear/', views.crear_colegio, name='crear_colegio'),#crear colegio
    path('personas/crear/', views.crear_persona, name='crear_persona'),#crear persona
    path('colegios/cambiar-admin/', views.cambiar_administrador, name='cambiar_administrador'),#cambiar administrador
    path('colegios/get-personas/', views.get_personas_colegio, name='get_personas_colegio'),
]

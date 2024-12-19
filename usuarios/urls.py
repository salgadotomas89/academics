from django.urls import path
from . import views

urlpatterns = [
    path('cargar', views.cargar_usuarios, name='cargar_usuarios'),
    path('crear/nuevo_usuario/', views.crear_nuevo_usuario, name='crear_nuevo_usuario'),
    path('eliminar/<int:user_id>/', views.eliminar_usuario, name='eliminar_usuario'),
    path('cambiar-estado/<int:user_id>/', views.cambiar_estado_usuario, name='cambiar_estado_usuario'),
    path('obtener/<int:user_id>/', views.obtener_usuario, name='obtener_usuario'),
    path('actualizar/<int:user_id>/', views.actualizar_usuario, name='actualizar_usuario'),
]

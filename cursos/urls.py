from django.urls import path
from . import views

urlpatterns = [
    path('', views.cursos, name='cursos'),
    path('obtener-rbd/', views.obtener_rbd, name='obtener_rbd'),
    path('obtener-modalidades/', views.obtener_modalidades, name='obtener_modalidades'),
    path('obtener-jornadas/', views.obtener_jornadas, name='obtener_jornadas'),
    path('obtener-niveles/', views.obtener_niveles, name='obtener_niveles'),
    path('obtener-grados/', views.obtener_grados, name='obtener_grados'),
    path('crear/', views.crear_curso, name='crear_curso'),
    path('eliminar/<int:curso_id>/', views.eliminar_curso, name='eliminar_curso'),
    path('editar/<int:curso_id>/', views.editar_curso, name='editar_curso'),
    path('obtener-cursos/', views.obtener_cursos, name='obtener_cursos'),
]
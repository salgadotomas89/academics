from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
def alumnos(request):
    return render(request, 'alumnos.html')


@csrf_exempt
@require_http_methods(["POST"])
def registro_rapido_alumno(request):
    try:
        data = json.loads(request.body)
        
        # Validar datos del alumno
        alumno_data = {
            'ref_country_id': data.get('ref_country_id'),
            'tipo_documento': data.get('tipo_documento'),
            'run': data.get('run'),
            'ipe': data.get('ipe'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'second_last_name': data.get('second_last_name'),
            'birthdate': data.get('birthdate'),
            'course_id': data.get('course_id')
        }
        
        # Validar datos del apoderado si se proporcionaron
        apoderado_data = None
        if data.get('apoderado_run'):
            apoderado_data = {
                'run': data.get('apoderado_run'),
                'first_name': data.get('apoderado_first_name'),
                'last_name': data.get('apoderado_last_name'),
                'second_last_name': data.get('apoderado_second_last_name'),
                'relationship': data.get('apoderado_relationship'),
                'phone': data.get('apoderado_phone'),
                'email': data.get('apoderado_email'),
                'is_primary': data.get('apoderado_primary', False)
            }
        
        # Aquí irá la lógica para guardar en la base de datos
        # Por ahora solo simulamos una respuesta exitosa
        
        return JsonResponse({
            'status': 'success',
            'message': 'Alumno registrado exitosamente',
            'data': {
                'alumno_id': 1  # Este sería el ID real del alumno creado
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
    

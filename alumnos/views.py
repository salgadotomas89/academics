from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User, Course, K12Course, Organization
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
def alumnos(request):
    return render(request, 'alumnos.html')

@require_http_methods(["GET"])
def obtener_cursos(request):
    try:
        # Obtener la organización del usuario actual
        org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)

        # Obtener las organizaciones de tipo curso relacionadas con la organización principal
        org_cursos = Organization.objects.filter(
            child_relationships__parent_organization=org_role.organization,
            ref_organization_type_id=21  # Tipo curso
        )
        
        # Obtener los cursos asociados a esas organizaciones
        cursos = Course.objects.filter(
            organization__in=org_cursos
        ).select_related('organization')
        
        # Formatear los cursos para el select
        cursos_data = []
        for curso in cursos:
            try:
                k12_curso = K12Course.objects.get(organization=curso.organization)
                
                # Obtener cantidad de alumnos
                cantidad_alumnos = OrganizationPersonRole.objects.filter(
                    organization=curso.organization,
                    role_id=3  # Rol de alumno
                ).count()
                
                cursos_data.append({
                    'id': curso.organization.organization_id,
                    'nombre': f"{curso.description} ({cantidad_alumnos} alumnos)"
                })
            except K12Course.DoesNotExist:
                continue
        
        return JsonResponse({
            'status': 'success',
            'cursos': cursos_data
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

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
    

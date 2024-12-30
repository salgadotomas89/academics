from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User, Course, K12Course, Organization, PersonTelephone
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
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
    print('estoy en registro rapido alumno')
    try:
        data = json.loads(request.body)
        print('datos recibidos:', data)
        
        with transaction.atomic():
            # 1. Crear la persona (alumno)
            alumno = Person.objects.create(
                first_name=data.get('first_name'),
                middle_name=None,  # Segundo nombre opcional
                last_name=data.get('last_name'),
                generation_code=None,
                prefix=None,
                birthdate=data.get('birthdate'),
                ref_sex_id=1,  # Valor por defecto, ajustar según necesidad
                hispanic_latino_ethnicity=False,
                ref_us_citizenship_status_id=1,
                ref_state_of_residence_id=1,
                ref_proof_of_residency_type_id=1,
                ref_highest_education_level_completed_id=1,
                ref_personal_information_verification_id=1
            )
            
            # 2. Crear identificador (RUN o IPE)
            if data.get('tipo_documento') == 'run':
                PersonIdentifier.objects.create(
                    person=alumno,
                    identifier=data.get('run'),
                    ref_person_identification_system_id=51,  # RUN
                    ref_personal_information_verification_id=1
                )
            else:
                PersonIdentifier.objects.create(
                    person=alumno,
                    identifier=data.get('ipe'),
                    ref_person_identification_system_id=52,  # IPE
                    ref_personal_information_verification_id=1
                )
            
            # 3. Crear lugar de nacimiento
            PersonBirthplace.objects.create(
                person=alumno,
                city='Santiago',  # Valor por defecto, ajustar según necesidad
                ref_state_id=1,
                ref_country_id=data.get('ref_country_id', 1)
            )
            
            # 4. Asignar al curso
            curso_org = Organization.objects.get(organization_id=data.get('course_id'))
            OrganizationPersonRole.objects.create(
                organization=curso_org,
                person=alumno,
                role_id=3,  # Rol de alumno
                entry_date=timezone.now()
            )
            
            # 5. Si hay datos del apoderado, procesarlos
            if data.get('apoderado_run'):
                # Crear persona (apoderado)
                apoderado = Person.objects.create(
                    first_name=data.get('apoderado_first_name'),
                    middle_name=None,  # Segundo nombre opcional
                    last_name=data.get('apoderado_last_name'),
                    generation_code=None,
                    prefix=None,
                    ref_sex_id=1,
                    hispanic_latino_ethnicity=False,
                    ref_us_citizenship_status_id=1,
                    ref_state_of_residence_id=1,
                    ref_proof_of_residency_type_id=1,
                    ref_highest_education_level_completed_id=1,
                    ref_personal_information_verification_id=1
                )
                
                # Crear identificador del apoderado (RUN)
                PersonIdentifier.objects.create(
                    person=apoderado,
                    identifier=data.get('apoderado_run'),
                    ref_person_identification_system_id=51,  # RUN
                    ref_personal_information_verification_id=1
                )
                
                # Crear relación alumno-apoderado
                PersonRelationship.objects.create(
                    person=alumno,
                    related_person=apoderado,
                    ref_person_relationship_id=data.get('apoderado_relationship'),
                    custodial_relationship_indicator=True,
                    emergency_contact_ind=True,
                    lives_with_indicator=True,
                    primary_contact_indicator=data.get('apoderado_primary', False)
                )
                
                # Agregar teléfono del apoderado si se proporcionó
                if data.get('apoderado_phone'):
                    PersonTelephone.objects.create(
                        person=apoderado,
                        telephone_number=data.get('apoderado_phone'),
                        primary_telephone_number_indicator=True,
                        ref_person_telephone_number_type_id=1
                    )
                
                # Agregar email del apoderado si se proporcionó
                if data.get('apoderado_email'):
                    PersonEmailAddress.objects.create(
                        person=apoderado,
                        email_address=data.get('apoderado_email'),
                        ref_email_type_id=1
                    )
            
            return JsonResponse({
                'status': 'success',
                'message': 'Alumno registrado exitosamente',
                'data': {
                    'alumno_id': alumno.person_id
                }
            })
            
    except Exception as e:
        print('error en registro rapido alumno', e)
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
    
@require_http_methods(["GET"])
def obtener_alumnos(request):
    try:
        # Obtener la organización del usuario actual
        org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)

        # Obtener todos los alumnos de la organización
        alumnos_roles = OrganizationPersonRole.objects.filter(
            organization__child_relationships__parent_organization=org_role.organization,
            role_id=3  # Rol de alumno
        ).select_related('person', 'organization')

        alumnos_data = []
        for alumno_role in alumnos_roles:
            # Obtener el RUN o IPE del alumno
            identificador = PersonIdentifier.objects.filter(
                person=alumno_role.person,
                ref_person_identification_system_id__in=[51, 52]  # RUN o IPE
            ).first()

            # Obtener el email del alumno
            email = PersonEmailAddress.objects.filter(
                person=alumno_role.person
            ).first()

            # Obtener información del curso
            curso = Course.objects.filter(
                organization=alumno_role.organization
            ).first()

            alumno_data = {
                'id': alumno_role.person.person_id,
                'nombre': alumno_role.person.first_name,
                'apellido': f"{alumno_role.person.last_name}",
                'email': email.email_address if email else '',
                'identificador': identificador.identifier if identificador else '',
                'curso': curso.description if curso else '',
                'estado': 'Activo'  # Puedes ajustar esto según tu lógica de estados
            }
            alumnos_data.append(alumno_data)

        return JsonResponse({
            'status': 'success',
            'alumnos': alumnos_data
        })
    except Exception as e:
        print('Error al obtener alumnos:', e)
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
    

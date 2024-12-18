from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier
from django.db import transaction
from django.db.models import Subquery, OuterRef

#vista principal
def dashboard(request):
    return render(request, 'base.html')

@require_http_methods(["POST"])
@csrf_protect
def registro_rapido_alumno(request):
    try:
        with transaction.atomic():
            data = request.POST
            
            # Crear el alumno (Person)
            alumno = Person.objects.create(
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                second_last_name=data.get('second_last_name'),
                birthdate=data.get('birthdate'),
                ref_sex_id=data.get('ref_sex_id', 1),  # Default masculino
                ref_country_id=data.get('ref_country_id')
            )

            # Crear identificador (RUN o IPE)
            if data.get('run'):
                PersonIdentifier.objects.create(
                    person=alumno,
                    identifier=data.get('run'),
                    ref_person_identification_system_id=51  # ID para RUN
                )
            elif data.get('ipe'):
                PersonIdentifier.objects.create(
                    person=alumno,
                    identifier=data.get('ipe'),
                    ref_person_identification_system_id=52  # ID para IPE
                )

            # Asignar rol de estudiante
            OrganizationPersonRole.objects.create(
                person=alumno,
                organization_id=data.get('course_id'),  # ID del curso
                role_id=6  # ID para rol estudiante
            )

            # Si hay datos de apoderado, crear apoderado
            if any(key.startswith('apoderado_') for key in data.keys()):
                apoderado = Person.objects.create(
                    first_name=data.get('apoderado_first_name'),
                    last_name=data.get('apoderado_last_name'),
                    second_last_name=data.get('apoderado_second_last_name')
                )

                # RUN del apoderado
                if data.get('apoderado_run'):
                    PersonIdentifier.objects.create(
                        person=apoderado,
                        identifier=data.get('apoderado_run'),
                        ref_person_identification_system_id=51  # ID para RUN
                    )

                # Crear relación alumno-apoderado
                PersonRelationship.objects.create(
                    person=alumno,
                    related_person=apoderado,
                    ref_person_relationship_id=data.get('apoderado_relationship'),
                    is_primary=bool(data.get('apoderado_primary'))
                )

            return JsonResponse({
                'success': True,
                'message': 'Alumno registrado exitosamente',
                'student_id': alumno.person_id
            })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al registrar alumno: {str(e)}'
        })
    


from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from ceds_models.models import Person, PersonIdentifier, PersonEmailAddress, PersonTelephone, PersonAddress, OrganizationPersonRole
from django.contrib.auth.hashers import make_password

@csrf_protect
@require_http_methods(["POST"])
def nuevo_usuario(request):
    print('hello llegue')
    try:
        with transaction.atomic():
            # Crear Person (usuario base)
            person = Person.objects.create(
                first_name=request.POST['first_name'],
                last_name=request.POST['last_name'],
                is_active=request.POST['status'] == 'activo',
                password=make_password(request.POST['password'])
            )

            # Crear PersonIdentifier (RUN)
            PersonIdentifier.objects.create(
                person=person,
                identifier=request.POST['run'],
                ref_person_identification_system_id=51
            )

            # Crear PersonEmailAddress
            PersonEmailAddress.objects.create(
                person=person,
                email_address=request.POST['email'],
                ref_email_type_id=1
            )

            if request.POST.get('telefono'):
                PersonTelephone.objects.create(
                    person=person,
                    telephone_number=request.POST['telefono'],
                    primary_telephone_number_indicator=True,
                    ref_person_telephone_number_type_id=1
                )

            if request.POST.get('direccion'):
                PersonAddress.objects.create(
                    person=person,
                    street_number_and_name=request.POST['direccion'],
                    ref_state_id=1,
                    ref_country_id=1,
                    postal_code='00000'
                )

            # Asignar rol
            role_mapping = {
                'admin': 2,
                'profesor': 1,
                'secretaria': 2
            }

            OrganizationPersonRole.objects.create(
                organization_id=request.user.organizationpersonrole_set.first().organization_id,
                person=person,
                role_id=role_mapping[request.POST['role']]
            )

            return JsonResponse({
                'status': 'success',
                'message': 'Usuario creado exitosamente'
            })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

def content_view(request):
    print("\n=== Iniciando content_view ===")
    context = {}
    
    if request.user.is_authenticated:
        try:
            person = Person.objects.get(user=request.user)
            
            # Obtener la organización con cualquier rol
            organization_role = OrganizationPersonRole.objects.filter(
                person=person
            ).select_related('organization').first()
            
            if organization_role:
                organization = organization_role.organization
                
                # Obtener el RBD
                rbd = OrganizationIdentifier.objects.filter(
                    organization=organization,
                    ref_organization_identification_system_id=1
                ).values_list('identifier', flat=True).first()
                
                # Actualizar el contexto con la información completa
                context['organization'] = {
                    'name': organization.name,
                    'rbd': rbd,
                    'type': organization.ref_organization_type_id,
                    'role': organization_role.role_id
                }
                
                print("Contexto actualizado:", context)
            
        except Exception as e:
            print(f"Error al cargar datos: {str(e)}")
            context['error'] = str(e)
    
    return render(request, 'colegio/content.html', context)
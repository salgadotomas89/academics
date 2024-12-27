from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Course, K12Course, Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User
from django.db import transaction
from django.db.models import Subquery, OuterRef
from django.contrib.auth.models import User

#vista principal
def dashboard(request):
    context = {}
    if request.user.is_authenticated:
        try:
            person = Person.objects.get(user=request.user)
            context['user_full_name'] = f"{person.first_name} {person.last_name}"
        except Person.DoesNotExist:
            context['user_full_name'] = request.user.username
    return render(request, 'base.html', context)



from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from ceds_models.models import Person, PersonIdentifier, PersonEmailAddress, PersonTelephone, PersonAddress, OrganizationPersonRole
from django.contrib.auth.hashers import make_password

@csrf_protect
@require_http_methods(["POST"])
def nuevo_usuario(request):
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


                #obtener los cursos del establecimiento
                cursos = Course.objects.filter(
                    organization=organization
                ).select_related('organization')
                
                #recorrer los cursos e imprimi la informacion que agregamos en el modal de agregar curso
                print("\n=== Cursos del establecimiento ===")
                for curso in cursos:
                    print(f"\nCurso ID: {curso.organization}")
                    print(f"Nombre: {curso.description}")
                    print(f"Abreviación: {curso.subject_abbreviation}")
                    print(f"Minutos de instrucción: {curso.instructional_minutes}")
                    print(f"Créditos: {curso.credit_value}")
                    print(f"Certificación: {curso.certification_description}")
                    
                    # Obtener información del K12Course asociado
                    try:
                        k12_curso = K12Course.objects.get(organization=organization)
                        print(f"Código SCED: {k12_curso.sced_course_code}")
                        print(f"Rango de grados: {k12_curso.sced_grade_span}")
                        print(f"Departamento: {k12_curso.course_department_name}")
                        print(f"Curso académico principal: {'Sí' if k12_curso.core_academic_course else 'No'}")
                        print(f"Alineado con estándares: {'Sí' if k12_curso.course_aligned_with_standards else 'No'}")
                    except K12Course.DoesNotExist:
                        print("No hay información K12 asociada")
                    
                    print("-" * 50)

                
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



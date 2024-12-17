from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship
from django.db import transaction

# Create your views here.
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
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ceds_models.models import (
    Person, OrganizationPersonRole, Organization, 
    OrganizationIdentifier, OrganizationRelationship,
    Course, K12Course
)
from django.db import transaction

@login_required
def cursos(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            # Obtener la organización del usuario actual
            org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
            if not org_role:
                return JsonResponse({'error': 'Usuario no tiene organización asignada'}, 
                                 safe=False, 
                                 content_type='application/json')

            print("\n=== Listando cursos en vista cursos ===")
            print(f"Organización: {org_role.organization.name}")
                
            # Obtener las organizaciones de tipo curso relacionadas con la organización principal
            org_cursos = Organization.objects.filter(
                child_relationships__parent_organization=org_role.organization,
                ref_organization_type_id=21  # Tipo curso
            )
            
            # Obtener los cursos asociados a esas organizaciones
            cursos = Course.objects.filter(
                organization__in=org_cursos
            ).select_related('organization')
            
            print(f"Cursos encontrados: {cursos.count()}")
            
            # Obtener información adicional de cada curso
            cursos_data = []
            for curso in cursos:
                print(f"\nProcesando curso: {curso.description}")
                
                # Obtener el profesor jefe
                profesor_jefe = OrganizationPersonRole.objects.filter(
                    organization=curso.organization,
                    role_id=2  # Rol de profesor jefe
                ).select_related('person').first()
                
                # Obtener cantidad de alumnos
                cantidad_alumnos = OrganizationPersonRole.objects.filter(
                    organization=curso.organization,
                    role_id=3  # Rol de alumno
                ).count()
                
                # Obtener información del K12Course asociado
                try:
                    k12_curso = K12Course.objects.get(organization=curso.organization)
                    sced_code = k12_curso.sced_course_code
                    grade_span = k12_curso.sced_grade_span
                    departamento = k12_curso.course_department_name
                except K12Course.DoesNotExist:
                    sced_code = "N/A"
                    grade_span = "N/A"
                    departamento = "General"
                    
                # Obtener el identificador de la sala
                sala = OrganizationIdentifier.objects.filter(
                    organization=curso.organization,
                    ref_organization_identification_system_id=1
                ).values_list('identifier', flat=True).first() or 'Por asignar'
                
                curso_data = {
                    'id': curso.organization.organization_id,
                    'nombre': curso.description,
                    'profesor_jefe': f"{profesor_jefe.person.first_name} {profesor_jefe.person.last_name}" if profesor_jefe else "Sin asignar",
                    'cantidad_alumnos': cantidad_alumnos,
                    'sala': sala,
                    'modalidad': 'Regular',  # Esto podría obtenerse de otra relación si existe
                    'nivel': departamento,
                    'jornada': 'Jornada completa'  # Esto podría obtenerse de otra relación si existe
                }
                
                print(f"Datos del curso: {curso_data}")
                cursos_data.append(curso_data)

            response_data = {'cursos': cursos_data}
            print("Enviando respuesta JSON:", response_data)
            return JsonResponse(response_data, 
                              safe=False, 
                              content_type='application/json')
            
        except Exception as e:
            print(f"Error en vista cursos: {str(e)}")
            return JsonResponse({'error': str(e)}, 
                              status=500, 
                              safe=False, 
                              content_type='application/json')
    
    # Si no es una petición AJAX, renderizar el template
    return render(request, 'cursos.html')

@login_required
def obtener_rbd(request):
    print('obtener_rbd')
    try:
        person = Person.objects.get(user=request.user)
            
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

            
                
                
        
        return JsonResponse({'rbd': rbd })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def obtener_modalidades(request):
    try:
        # Obtener modalidades (RefOrganizationTypeId == 38)
        modalidades = Organization.objects.filter(
            ref_organization_type_id=38
        ).values('organization_id', 'name')
        
        return JsonResponse({
            'modalidades': [{'id': m['organization_id'], 'nombre': m['name']} for m in modalidades]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def obtener_jornadas(request):
    try:
        # Obtener jornadas (RefOrganizationTypeId == 39)
        jornadas = Organization.objects.filter(
            ref_organization_type_id=39
        ).values('organization_id', 'name')
        
        return JsonResponse({
            'jornadas': [{'id': j['organization_id'], 'nombre': j['name']} for j in jornadas]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def obtener_niveles(request):
    try:
        modalidad_id = request.GET.get('modalidad')
        if not modalidad_id:
            return JsonResponse({'error': 'Modalidad no especificada'}, status=400)

        # Obtener niveles (RefOrganizationTypeId == 40) relacionados con la modalidad
        niveles = Organization.objects.filter(
            ref_organization_type_id=40,
            organizationrelationship__parent_organization_id=modalidad_id
        ).values('organization_id', 'name')
        
        return JsonResponse({
            'niveles': [{'id': n['organization_id'], 'nombre': n['name']} for n in niveles]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def obtener_grados(request):
    try:
        nivel_id = request.GET.get('nivel')
        if not nivel_id:
            return JsonResponse({'error': 'Nivel no especificado'}, status=400)

        # Obtener grados (RefOrganizationTypeId == 46) relacionados con el nivel
        grados = Organization.objects.filter(
            ref_organization_type_id=46,
            organizationrelationship__parent_organization_id=nivel_id
        ).values('organization_id', 'name')
        
        return JsonResponse({
            'grados': [{'id': g['organization_id'], 'nombre': g['name']} for g in grados]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def crear_curso(request):
    try:
        with transaction.atomic():
            # Obtener la organización del usuario actual
            org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
            if not org_role:
                return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)

            # Obtener los datos del formulario
            nivel = request.POST.get('nivel')
            grado = request.POST.get('grado')
            letra = request.POST.get('letra')

            # Determinar el nombre del grado según el nivel
            nombre_grado = ''
            if nivel == '01':  # Parvularia
                nombre_grado = 'Kinder' if grado == '2' else 'Pre-Kinder'
            elif nivel == '02':  # Básica
                nombre_grado = f'{grado}º Básico'
            elif nivel in ['05', '07']:  # Media Regular
                nombre_grado = f'{grado}º Medio'
            elif nivel == '04':  # Especial
                nombre_grado = f'Nivel Básico {grado}'
            elif nivel == '03':  # Básica Adultos
                niveles = {
                    '1': 'Nivel 1 (1º a 4º)',
                    '2': 'Nivel 2 (5º a 6º)',
                    '3': 'Nivel 3 (7º a 8º)'
                }
                nombre_grado = niveles.get(grado, '')
            elif nivel in ['06', '08']:  # Media Adultos
                niveles = {
                    '1': 'Nivel 1 (1º y 2º)',
                    '2': 'Nivel 2 (3º y 4º)'
                }
                nombre_grado = niveles.get(grado, '')

            # Crear el nombre del curso
            curso_nombre = f"Curso {nombre_grado} {letra}"

            # Verificar si ya existe un curso con el mismo nombre en la organización
            curso_existente = Organization.objects.filter(
                child_relationships__parent_organization=org_role.organization,
                ref_organization_type_id=21,  # Tipo curso
                name=curso_nombre
            ).exists()

            if curso_existente:
                return JsonResponse({
                    'success': False,
                    'error': f'Ya existe un curso con el nombre "{curso_nombre}"'
                }, status=400)

            # Verificar si ya existe un curso con el mismo nivel, grado y letra
            cursos_mismo_nivel = Organization.objects.filter(
                child_relationships__parent_organization=org_role.organization,
                ref_organization_type_id=21  # Tipo curso
            ).filter(name__icontains=f"{nombre_grado} {letra}")

            if cursos_mismo_nivel.exists():
                return JsonResponse({
                    'success': False,
                    'error': f'Ya existe un curso de {nombre_grado} con la letra {letra}'
                }, status=400)

            # Si no existe, crear la nueva organización para el curso
            org_curso = Organization.objects.create(
                name=curso_nombre,
                short_name=curso_nombre,
                ref_organization_type_id=21  # Tipo curso
            )

            # Crear la relación entre la organización principal y el curso
            OrganizationRelationship.objects.create(
                parent_organization=org_role.organization,
                organization=org_curso,
                ref_organization_relationship_id=1  # Relación jerárquica entre organizaciones
            )

            # Crear el curso base
            course = Course.objects.create(
                organization=org_curso,  # Usar la nueva organización
                description=curso_nombre,
                subject_abbreviation='GEN',  # General
                sced_sequence_of_course='01',  # Primer curso
                instructional_minutes=45,  # 45 minutos por clase
                ref_course_level_characteristics_id=1,  # Regular
                ref_course_credit_unit_id=1,  # Créditos estándar
                credit_value=1.0,  # 1 crédito
                ref_instruction_language=1,  # Español
                certification_description='Curso regular',
                ref_course_applicable_education_level_id=2,  # K12
                repeatability_maximum_number=1  # Se puede repetir una vez
            )

            # Crear el curso K12
            k12_course = K12Course.objects.create(
                organization=org_curso,  # Usar la nueva organización
                high_school_course_requirement=True,
                ref_additional_credit_type_id=1,  # Crédito estándar
                available_carnegie_unit_credit=1.0,  # 1 unidad Carnegie
                ref_course_gpa_applicability_id=1,  # Aplicable al GPA
                core_academic_course=True,
                ref_curriculum_framework_type_id=1,  # Marco curricular estándar
                course_aligned_with_standards=True,
                ref_credit_type_earned_id=1,  # Crédito académico
                funding_program='Regular',
                family_consumer_sciences_course_ind=False,
                sced_course_code='01001',  # Código SCED para curso general
                sced_grade_span='0108',  # 1º a 8º grado
                ref_sced_course_level_id=1,  # Nivel regular
                ref_sced_course_subject_area_id=1,  # Área general
                ref_career_cluster_id=1,  # No aplica
                ref_blended_learning_model_type_id=1,  # Presencial
                ref_course_interaction_mode_id=1,  # Interacción directa
                ref_k12_end_of_course_requirement_id=1,  # Requisitos estándar
                ref_workbased_learning_opportunity_type_id=1,  # No aplica
                course_department_name='General'
            )

            return JsonResponse({
                'success': True,
                'message': 'Curso creado exitosamente'
            })

    except Exception as e:
        print(f"Error al crear curso: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def listar_cursos(request):
    try:
        # Obtener la organización del usuario actual
        org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'})
            
        # Obtener todos los cursos K12 del establecimiento
        cursos = K12Course.objects.filter(
            organization=org_role.organization
        ).select_related('organization')
        
        # Obtener información adicional de cada curso
        cursos_data = []
        for curso in cursos:
            # Obtener el profesor jefe
            profesor_jefe = OrganizationPersonRole.objects.filter(
                organization=curso.organization,
                role__ref_role_id=2  # Rol de profesor jefe
            ).select_related('person').first()
            
            # Obtener cantidad de alumnos
            cantidad_alumnos = OrganizationPersonRole.objects.filter(
                organization=curso.organization,
                role__ref_role_id=3  # Rol de alumno
            ).count()
            
            cursos_data.append({
                'id': curso.organization.id,
                'nombre': curso.organization.name,
                'profesor_jefe': f"{profesor_jefe.person.first_name} {profesor_jefe.person.last_name}" if profesor_jefe else "Sin asignar",
                'cantidad_alumnos': cantidad_alumnos,
                'sala': curso.organization.identifier or 'Por asignar'
            })
        
        return JsonResponse({'cursos': cursos_data})
        
    except Exception as e:
        return JsonResponse({'error': str(e)})

@login_required
def eliminar_curso(request, curso_id):
    try:
        with transaction.atomic():
            # Obtener la organización del curso
            org_curso = Organization.objects.get(organization_id=curso_id)
            
            # Verificar que el usuario tenga permiso para eliminar este curso
            org_role = OrganizationPersonRole.objects.filter(
                person__user=request.user
            ).first()
            
            if not org_role:
                return JsonResponse({
                    'success': False,
                    'error': 'No tienes permiso para eliminar este curso'
                }, status=403)
            
            # Verificar que el curso pertenezca a la organización del usuario
            curso_pertenece = OrganizationRelationship.objects.filter(
                parent_organization=org_role.organization,
                organization=org_curso
            ).exists()
            
            if not curso_pertenece:
                return JsonResponse({
                    'success': False,
                    'error': 'Este curso no pertenece a tu organización'
                }, status=403)
            
            # Eliminar el curso K12 asociado
            K12Course.objects.filter(organization=org_curso).delete()
            
            # Eliminar el curso base asociado
            Course.objects.filter(organization=org_curso).delete()
            
            # Eliminar las relaciones organizacionales
            OrganizationRelationship.objects.filter(organization=org_curso).delete()
            
            # Eliminar la organización del curso
            org_curso.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Curso eliminado exitosamente'
            })
            
    except Organization.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'El curso no existe'
        }, status=404)
    except Exception as e:
        print(f"Error al eliminar curso: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def editar_curso(request, curso_id):
    try:
        # Obtener la organización del usuario actual
        org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)
        
        # Obtener las personas con rol de profesor
        profesores = Person.objects.filter(
            organizationpersonrole__organization=org_role.organization,
            organizationpersonrole__role_id=1  # Rol de profesor
        ).select_related('user')

        # Imprimir el nombre de los profesores
        print("\n=== Lista de Profesores ===")
        for profesor in profesores:
            print(f"Profesor: {profesor.first_name} {profesor.last_name} - Email: {profesor.user.email if profesor.user else 'Sin email'}")
        print("===========================\n")

        # Obtener el curso
        curso = Course.objects.select_related('organization').get(organization__organization_id=curso_id)
        k12_curso = K12Course.objects.get(organization=curso.organization)

        if request.method == 'GET':
            # Extraer nivel y grado del nombre del curso
            nombre_partes = curso.description.split()
            letra = nombre_partes[-1]  # Última parte es la letra
            
            # Determinar nivel y grado basado en el nombre
            nivel = ''
            grado = ''
            
            if 'Básico' in curso.description:
                nivel = '02'  # Enseñanza Básica
                grado = nombre_partes[1][0]  # Primer carácter del número (ej: de "1º" toma "1")
            elif 'Medio' in curso.description:
                nivel = '05'  # Enseñanza Media
                grado = nombre_partes[1][0]
            elif 'Kinder' in curso.description:
                nivel = '01'  # Educación Parvularia
                grado = '2' if 'Kinder' in curso.description else '1'

            # Obtener el profesor jefe actual
            profesor_jefe_actual = OrganizationPersonRole.objects.filter(
                organization=curso.organization,
                role_id=2  # Rol de profesor jefe
            ).select_related('person').first()

            # Preparar lista de profesores para el select
            profesores_data = [{
                'id': profesor.person_id,
                'nombre': f"{profesor.first_name} {profesor.last_name}",
                'email': profesor.user.email if profesor.user else ''
            } for profesor in profesores]

            # Devolver los datos del curso
            return JsonResponse({
                'nivel': nivel,
                'grado': grado,
                'letra': letra,
                'profesores': profesores_data,
                'profesor_jefe_id': profesor_jefe_actual.person.person_id if profesor_jefe_actual else None
            })

        elif request.method == 'POST':
            # Obtener datos del formulario
            nivel = request.POST.get('nivel')
            grado = request.POST.get('grado')
            letra = request.POST.get('letra').upper()

            # Determinar el nombre del grado según el nivel
            nombre_grado = ''
            if nivel == '01':  # Parvularia
                nombre_grado = 'Kinder' if grado == '2' else 'Pre-Kinder'
            elif nivel == '02':  # Básica
                nombre_grado = f'{grado}º Básico'
            elif nivel == '05':  # Media
                nombre_grado = f'{grado}º Medio'

            # Crear el nuevo nombre del curso
            nuevo_nombre = f"Curso {nombre_grado} {letra}"

            # Verificar si ya existe otro curso con el mismo nombre
            curso_existente = Course.objects.filter(
                organization__child_relationships__parent_organization=org_role.organization,
                description=nuevo_nombre
            ).exclude(organization__organization_id=curso_id).exists()

            if curso_existente:
                return JsonResponse({
                    'error': f'Ya existe un curso con el nombre "{nuevo_nombre}"'
                }, status=400)

            # Actualizar el curso
            curso.description = nuevo_nombre
            curso.save()

            # Actualizar la organización
            curso.organization.name = nuevo_nombre
            curso.organization.short_name = nuevo_nombre
            curso.organization.save()

            return JsonResponse({
                'success': True,
                'message': 'Curso actualizado exitosamente'
            })

    except (Course.DoesNotExist, K12Course.DoesNotExist):
        return JsonResponse({'error': 'Curso no encontrado'}, status=404)
    except Exception as e:
        print(f"Error al editar curso: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
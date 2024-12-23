from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User
from django.db import transaction, OperationalError
from django.db.models import Subquery, OuterRef
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.decorators import login_required
import json
from django.db.models import Q
import time
# Create your views here.

# Definir el mapeo de roles a nivel de módulo
ROLE_MAPPING = {
    1: 'Profesor',
    2: 'Administrador',
    3: 'Administrador Maestro',
    4: 'Secretaria'
}

#vista donde se cargan los usuarios asociados a la organizacion del usuario logueado
def cargar_usuarios(request):
    try:
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Usuario no autenticado'}, status=401)

        usuario = Person.objects.get(user=request.user)
        org_role = OrganizationPersonRole.objects.filter(person=usuario).first()
        
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)
            
        organization = org_role.organization
        
        # Obtener parámetros de filtro
        search = request.GET.get('search', '').strip()
        rol = request.GET.get('rol', '')
        estado = request.GET.get('estado', '')
        
        # Query base
        usuarios = Person.objects.filter(
            organizationpersonrole__organization=organization
        )

        # Aplicar filtros
        if search:
            usuarios = usuarios.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) |
                Q(user__email__icontains=search)
            )

        if rol:
            usuarios = usuarios.filter(organizationpersonrole__role_id=rol)

        if estado:
            is_active = True if estado == 'activo' else False
            usuarios = usuarios.filter(user__is_active=is_active)

        # Continuar con las anotaciones existentes
        usuarios = usuarios.annotate(
            role_id=Subquery(
                OrganizationPersonRole.objects.filter(
                    person=OuterRef('pk'),
                    organization=organization
                ).values('role_id')[:1]
            ),
            email=Subquery(
                User.objects.filter(
                    person=OuterRef('pk')
                ).values('email')[:1]
            ),
            is_active=Subquery(
                User.objects.filter(
                    person=OuterRef('pk')
                ).values('is_active')[:1]
            )
        ).values(
            'person_id',
            'first_name',
            'last_name',
            'role_id',
            'email',
            'is_active'
        ).distinct()

        usuarios_list = list(usuarios)
        for usuario in usuarios_list:
            usuario['role_name'] = ROLE_MAPPING.get(usuario['role_id'], 'Desconocido')

        return JsonResponse({'usuarios': usuarios_list})

    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_protect
@require_http_methods(["POST"])
def crear_nuevo_usuario(request):
    max_attempts = 3
    attempt = 0
    
    while attempt < max_attempts:
        try:
            with transaction.atomic():
                # Verificar autenticación
                if not request.user.is_authenticated:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Usuario no autenticado'
                    }, status=401)

                # Obtener datos del formulario
                email = request.POST.get('email')
                password = request.POST.get('password')
                first_name = request.POST.get('first_name')
                last_name = request.POST.get('last_name')
                role = request.POST.get('role')

                # Validaciones básicas
                if not all([email, password, first_name, last_name, role]):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Todos los campos son requeridos'
                    }, status=400)

                # Obtener el usuario y su organización
                usuario_actual = Person.objects.get(user=request.user)
                org_role = OrganizationPersonRole.objects.filter(person=usuario_actual).first()
                
                if not org_role:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Usuario no tiene organización asignada'
                    }, status=400)

                # No permitir crear admin maestro desde aquí
                if role == 'admin_maestro':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Los administradores maestros solo pueden ser creados desde el módulo de colegios'
                    }, status=400)

                # Validar que el email no exista
                if User.objects.filter(email=email).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Ya existe un usuario con ese correo electrónico'
                    }, status=400)

                # Crear usuario de Django
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )

                # Crear persona y relaciones
                person = Person.objects.create(
                    user=user,
                    first_name=first_name,
                    last_name=last_name,
                    birthdate='2000-01-01',
                    ref_sex_id=1,
                    hispanic_latino_ethnicity=False,
                    ref_us_citizenship_status_id=1,
                    ref_state_of_residence_id=1,
                    ref_proof_of_residency_type_id=1,
                    ref_highest_education_level_completed_id=1,
                    ref_personal_information_verification_id=1
                )

                # Crear PersonEmailAddress
                PersonEmailAddress.objects.create(
                    person=person,
                    email_address=email,
                    ref_email_type_id=1  # ID para email principal
                )

                # Mapeo de roles
                role_mapping = {
                    'profesor': 1,          # Profesor
                    'admin': 2,             # Administrador común
                    'admin_maestro': 3,     # Administrador maestro
                    'secretaria': 4         # Secretaria
                }
                
                role_id = role_mapping.get(role)
                
                # Crear OrganizationPersonRole
                OrganizationPersonRole.objects.create(
                    organization=org_role.organization,
                    person=person,
                    role_id=role_id,
                    entry_date=timezone.now()
                )

                return JsonResponse({
                    'status': 'success',
                    'message': 'Usuario creado exitosamente'
                })

        except OperationalError as e:
            attempt += 1
            if attempt == max_attempts:
                print(f"Error después de {max_attempts} intentos: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Error temporal en el servidor, por favor intente nuevamente'
                }, status=503)
            time.sleep(0.5)  # Esperar medio segundo antes de reintentar
            
        except Exception as e:
            print(f"Error al crear usuario: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Error al crear usuario'
            }, status=500)

@login_required
@require_http_methods(["DELETE"])
def eliminar_usuario(request, user_id):
    try:
        usuario = Person.objects.get(pk=user_id)
        usuario.delete()
        return JsonResponse({'success': True, 'message': 'Usuario eliminado correctamente'})
    except Person.DoesNotExist:
        return JsonResponse({
            'success': False, 
            'message': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def cambiar_estado_usuario(request, user_id):
    try:
        data = json.loads(request.body)
        nuevo_estado = data.get('is_active')
        
        # Obtener el usuario por su person_id
        person = Person.objects.get(pk=user_id)
        if person.user:
            # Actualizar el estado del usuario
            person.user.is_active = nuevo_estado
            person.user.save()
            
            return JsonResponse({
                'success': True, 
                'message': f'Usuario {"activado" if nuevo_estado else "desactivado"} correctamente'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Usuario no tiene cuenta asociada'
            }, status=400)
            
    except Person.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@require_http_methods(["GET"])
def obtener_usuario(request, user_id):
    try:
        person = Person.objects.get(pk=user_id)
        org_role = OrganizationPersonRole.objects.filter(person=person).first()
        
        # Mapeo de roles para el modal de edición (sin admin_maestro)
        role_mapping = {
            1: 'profesor',
            2: 'admin',
            4: 'secretaria'
        }
        
        # Si es admin maestro, no permitimos cambiar su rol
        current_role = ''
        if org_role:
            if org_role.role_id == 3:  # Si es admin maestro
                current_role = 'admin_maestro'
            else:
                current_role = role_mapping.get(org_role.role_id, '')
        
        data = {
            'first_name': person.first_name,
            'last_name': person.last_name,
            'email': person.user.email if person.user else '',
            'role': current_role,
            'is_admin_maestro': org_role.role_id == 3 if org_role else False
        }
        
        return JsonResponse({
            'success': True,
            'usuario': data
        })
    except Person.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@require_http_methods(["POST"])
def actualizar_usuario(request, user_id):
    try:
        with transaction.atomic():
            person = Person.objects.get(pk=user_id)
            nuevo_rol = request.POST.get('role')
            
            # Si se está intentando cambiar a admin maestro
            if nuevo_rol == 'admin_maestro':
                org_role = OrganizationPersonRole.objects.filter(person=person).first()
                if org_role:
                    # Verificar si ya existe otro admin maestro
                    admin_maestro_exists = OrganizationPersonRole.objects.filter(
                        organization=org_role.organization,
                        role_id=3  # ID para admin maestro
                    ).exclude(person=person).exists()
                    
                    if admin_maestro_exists:
                        return JsonResponse({
                            'success': False,
                            'message': 'Ya existe un Administrador Maestro para esta organización'
                        }, status=400)

            # Actualizar datos básicos
            person.first_name = request.POST.get('first_name')
            person.last_name = request.POST.get('last_name')
            person.save()
            
            # Actualizar email
            email = request.POST.get('email')
            if person.user and email:
                # Verificar si el email ya existe en otro usuario
                existing_user = User.objects.filter(email=email).exclude(pk=person.user.pk).first()
                if existing_user:
                    return JsonResponse({
                        'success': False,
                        'message': 'El email ya está en uso por otro usuario'
                    }, status=400)
                
                person.user.email = email
                person.user.username = email
                person.user.save()
                
                # Actualizar también en PersonEmailAddress si existe
                email_address = PersonEmailAddress.objects.filter(person=person).first()
                if email_address:
                    email_address.email_address = email
                    email_address.save()
                else:
                    # Crear nuevo PersonEmailAddress si no existe
                    PersonEmailAddress.objects.create(
                        person=person,
                        email_address=email,
                        ref_email_type_id=1  # Asumiendo que 1 es el ID para email principal
                    )
            
            # Actualizar rol
            org_role = OrganizationPersonRole.objects.filter(person=person).first()
            if org_role:
                role_mapping = {
                    'profesor': 1,
                    'admin': 2,
                    'admin_maestro': 3,
                    'secretaria': 4
                }
                nuevo_rol = role_mapping.get(request.POST.get('role'))
                if nuevo_rol and org_role.role_id != nuevo_rol:
                    org_role.role_id = nuevo_rol
                    org_role.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Usuario actualizado correctamente'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

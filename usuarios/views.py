from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User
from django.db import transaction
from django.db.models import Subquery, OuterRef
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.decorators import login_required
import json
# Create your views here.


#vista donde se cargan los usuarios asociados a la organizacion del usuario logueado
def cargar_usuarios(request):
    print("cargando usuarios")
    try:
        #verifico que el usuario este autenticado
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Usuario no autenticado'
            }, status=401)

        # Usuario logueado
        usuario = Person.objects.get(user=request.user)
        
        # Busco la organización del usuario
        org_role = OrganizationPersonRole.objects.filter(person=usuario).first()
        #verifico que el usuario tenga una organizacion asignada
        if not org_role:
            return JsonResponse({
                'error': 'Usuario no tiene organización asignada'
            }, status=400)
            
        organization = org_role.organization
        
        # Busco los usuarios de la organización con información adicional
        usuarios = Person.objects.filter(
            organizationpersonrole__organization=organization
        ).annotate(
            role_id=Subquery(
                OrganizationPersonRole.objects.filter(
                    person=OuterRef('pk')
                ).values('role_id')[:1]
            ),
            email=Subquery(
                PersonEmailAddress.objects.filter(
                    person=OuterRef('pk')
                ).values('email_address')[:1]
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

        print(f"Usuarios encontrados: {list(usuarios)}")

        return JsonResponse({'usuarios': list(usuarios)})
    except Person.DoesNotExist:
        print("Error: Usuario no encontrado")
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_protect
@require_http_methods(["POST"])
def crear_nuevo_usuario(request):
    try:
        with transaction.atomic():
            # Verificar que el usuario esté autenticado
            if not request.user.is_authenticated:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Usuario no autenticado'
                }, status=401)

            # Obtener el usuario y su organización
            usuario_actual = Person.objects.get(user=request.user)
            org_role = OrganizationPersonRole.objects.filter(person=usuario_actual).first()
            
            if not org_role:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Usuario no tiene organización asignada'
                }, status=400)

            # Validar que el email no exista
            email = request.POST.get('email')
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Ya existe un usuario con ese correo electrónico'
                }, status=400)

            # Crear usuario de Django
            user = User.objects.create_user(
                username=email,
                email=email,
                password=request.POST.get('password'),
                first_name=request.POST.get('first_name'),
                last_name=request.POST.get('last_name'),
                is_active=True
            )

            # Crear persona
            person = Person.objects.create(
                user=user,
                first_name=request.POST.get('first_name'),
                last_name=request.POST.get('last_name'),
                birthdate='2000-01-01',  # Valor por defecto
                ref_sex_id=1,  # Valores por defecto según tu modelo
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

            # Mapeo de roles a IDs (invertimos el mapeo)
            role_mapping = {
                'profesor': 1,  # Asumiendo que 1 es el ID para profesor
                'admin': 2,     # Asumiendo que 2 es el ID para admin
                'secretaria': 3 # Asumiendo que 3 es el ID para secretaria
            }

            role = request.POST.get('role')
            role_id = role_mapping.get(role)

            if not role_id:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Rol no válido: {role}'
                }, status=400)

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

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
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
        
        # Mapeo de roles
        role_mapping = {
            1: 'profesor',
            2: 'admin',
            3: 'secretaria'
        }
        
        data = {
            'first_name': person.first_name,
            'last_name': person.last_name,
            'email': person.user.email if person.user else '',
            'role': role_mapping.get(org_role.role_id if org_role else None, ''),
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
                    'secretaria': 3
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

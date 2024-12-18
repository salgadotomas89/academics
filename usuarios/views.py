from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from ceds_models.models import Person, PersonIdentifier, PersonBirthplace, OrganizationPersonRole, PersonRelationship, OrganizationIdentifier, PersonEmailAddress, User
from django.db import transaction
from django.db.models import Subquery, OuterRef
from django.contrib.auth.models import User
# Create your views here.


#vista donde se cargan los usuarios asociados a la organizacion del usuario logueado
def cargar_usuarios(request):
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
        )

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

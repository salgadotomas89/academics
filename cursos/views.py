from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ceds_models.models import (
    Person, OrganizationPersonRole, Organization, 
    OrganizationIdentifier, OrganizationRelationship
)
from django.db import transaction

def cursos(request):
    
    
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

            # Crear el curso como una organización
            curso = Organization.objects.create(
                name=f"{request.POST['grado']} {request.POST['letra']}",
                ref_organization_type_id=21,  # Tipo curso
                short_name=f"{request.POST['grado']}{request.POST['letra']}"
            )

            # Crear las relaciones jerárquicas
            OrganizationRelationship.objects.create(
                organization=curso,
                parent_organization_id=request.POST['grado'],
                ref_organization_relationship_id=1  # Relación jerárquica
            )

            return JsonResponse({
                'success': True,
                'message': 'Curso creado exitosamente'
            })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


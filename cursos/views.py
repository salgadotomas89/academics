from django.shortcuts import render
from django.http import JsonResponse
from ceds_models.models import Person, OrganizationPersonRole
from django.contrib.auth.decorators import login_required

def cursos(request):
    return render(request, 'cursos.html')

@login_required
def obtener_profesores(request):
    try:
        # Obtener la organización del usuario actual
        org_role = OrganizationPersonRole.objects.filter(person__user=request.user).first()
        
        if not org_role:
            return JsonResponse({'error': 'Usuario no tiene organización asignada'}, status=400)
            
        # Obtener todos los profesores de la organización
        profesores = Person.objects.filter(
            organizationpersonrole__organization=org_role.organization,
            organizationpersonrole__role_id=1  # 1 es el ID para profesores
        ).values('person_id', 'first_name', 'last_name')
        
        return JsonResponse({
            'profesores': list(profesores)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


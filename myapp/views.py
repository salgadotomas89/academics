from email.message import EmailMessage
import json
import ssl
import certifi
from django.http import BadHeaderError, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from ceds_models import models
from twilio.rest import Client
from django.db.models import Subquery, OuterRef

from django.conf import settings
from django.contrib import messages
import json
import re
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.utils import timezone

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging

from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.db import transaction
from ceds_models.models import Organization, OrganizationIdentifier, OrganizationPersonRole, Person
from django.contrib.auth.models import User
from ceds_models.models import Person
from ceds_models.models import OrganizationPersonRole
from django.db.models import Subquery, OuterRef, Value, CharField
from django.db.models.functions import Concat
from django.db import models

logger = logging.getLogger(__name__)



def enviar_mensaje(numero_destino, mensaje):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        to=numero_destino,
        from_=settings.TWILIO_PHONE_NUMBER,
        body=mensaje
    )


def enviar_mensaje_view(request):
    # Código para obtener el número de destino y el mensaje desde el formulario o cualquier otra fuente
    numero_destino = '+56997966996'  # Reemplaza con el número de teléfono de destino
    mensaje = 'Mañana no hay clases, por haber una reunion de trabajdores'
    enviar_mensaje(numero_destino, mensaje)
    print('mensaje enviado')
    return render(request, 'mensajes.html')

def mensajes(request):
    return render(request, 'mensajes.html')

def home(request):
    context = {}
    if request.user.is_authenticated:
        # Si el usuario está autenticado, agregamos su nombre al contexto
        context['user_name'] = f"{request.user.first_name} {request.user.last_name}"
    return render(request, 'home.html', context)

def juego(request):
    message = Mail(
    from_email='salgadotomas@outlook.com',
    to_emails='salgadotomas@icloud.com',
    subject='Sending with Twilio SendGrid is Fun',
    html_content='<strong>and easy to do anywhere, even with Python</strong>')
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e)
        
    return render(request, 'juego.html')

def precios(request):
    return render(request, 'precios.html')

def seleccion_plan(request):
    return render(request, 'seleccion_plan.html')




@csrf_exempt
def contacto(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        text = request.POST.get('text')
        try:
            message_body = f"""
            Nombre: {name}
            Apellido: {last_name}
            Email: {email}
            Mensaje: {text}
            """
            message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails='salgadotomas@icloud.com',
                subject='Nuevo mensaje de contacto',
                html_content=f'<pre>{message_body}</pre>'
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            if response.status_code == 202:
                return JsonResponse({'message': 'Mensaje enviado exitosamente.', 'status': 'success'})
            else:
                return JsonResponse({'message': 'Error al enviar el mensaje. Por favor, intente más tarde.', 'status': 'error'}, status=500)
        except Exception as e:
            logger.error(f'Error en el envío del correo: {str(e)}')
            return JsonResponse({'message': 'Error al enviar el mensaje. Por favor, intente más tarde.', 'status': 'error'}, status=500)
    return render(request, 'contacto.html')

def validate_phone_number(phone):
    pattern = r'^\+?56?[2-9]\d{8}$'
    if not re.match(pattern, phone):
        raise ValidationError('Número de teléfono inválido')

def rate_limit(key, limit=5, period=5):
    now = timezone.now()
    cache_key = f'rate_limit:{key}:{now.minute // period}'
    count = cache.get(cache_key, 0)
    if count >= limit:
        return False, count
    cache.set(cache_key, count + 1, period)
    return True, count + 1

@csrf_exempt
def phone_contact(request):
    try:
        data = json.loads(request.body)
        phone = data.get('phone')

        if not phone:
            return JsonResponse({'message': 'Por favor, proporciona un número de teléfono.'}, status=400)
        
        try:
            validate_phone_number(phone)
        except ValidationError:
            return JsonResponse({'message': 'El número de teléfono proporcionado no es válido.'}, status=400)

        # Verificar la limitación de tasa
        allowed, count = rate_limit(request.META.get('REMOTE_ADDR', ''))
        if not allowed:
            return JsonResponse({
                'message': 'Has excedido el límite de solicitudes. Por favor, intenta de nuevo más tarde.',
                'blocked': True,
                'remainingTime': 5
            }, status=429)

        message = Mail(
                from_email=settings.DEFAULT_FROM_EMAIL,
                to_emails='salgadotomas@icloud.com',
                subject='Nuevo mensaje de contacto',
                html_content=f'<pre>{phone}</pre>'
            )
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code == 202:
                return JsonResponse({
                    'message': 'Gracias, hemos recibido tu número de teléfono. Nos pondremos en contacto contigo pronto.',
                    'success': True,
                    'remainingAttempts': 5 - count
                })
        else:
                return JsonResponse({'message': 'Error al enviar el mensaje. Por favor, intente más tarde.', 'status': 'error'}, status=500)

        

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Error en el formato de los datos enviados.'}, status=400)
    
    except Exception as e:
        print(f"Error processing phone number: {str(e)}")
        return JsonResponse({'message': 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.'}, status=500)

def periodo_prueba(request):

    return render(request, 'periodo_prueba.html')
    
def preguntas_frecuentes(request):

    return render(request, 'preguntas.html')

def nosotros(request):
    context = {
        'is_nosotros_page': True
    }
    return render(request, 'nosotros.html', context)


def artefactos(request):

    return render(request, 'artefactos.html')

def demo1(request):
    return render(request, 'demo1.html')

def colegios(request):
    # Verificar todos los roles existentes
    print("Todos los roles:")
    all_roles = OrganizationPersonRole.objects.all().values(
        'organization_id', 
        'person_id', 
        'role_id',
        'person__first_name',
        'person__last_name'
    )
    print(all_roles)

    # Verificar específicamente los roles con role_id=1
    print("\nRoles de administrador (role_id=1):")
    admin_roles = OrganizationPersonRole.objects.filter(role_id=1).values(
        'organization_id', 
        'person_id', 
        'role_id',
        'person__first_name',
        'person__last_name'
    )
    print(admin_roles)

    colegios = Organization.objects.filter(
        ref_organization_type_id=28
    ).annotate(
        rbd=Subquery(
            OrganizationIdentifier.objects.filter(
                organization=OuterRef('pk'),
                ref_organization_identification_system_id=1
            ).values('identifier')[:1]
        ),
        admin_name=Subquery(
            OrganizationPersonRole.objects.filter(
                organization=OuterRef('pk'),
                role_id=1
            ).annotate(
                full_name=Concat(
                    'person__first_name', 
                    Value(' '), 
                    'person__last_name',
                    output_field=models.CharField()
                )
            ).values('full_name')[:1]
        ),
        admin_email=Subquery(
            OrganizationPersonRole.objects.filter(
                organization=OuterRef('pk'),
                role_id=1
            ).values('person__user__email')[:1]
        )
    )

    # Obtener el total antes de convertir a lista
    total_colegios = colegios.count()
    colegios_list = list(colegios.values('pk', 'rbd', 'name', 'admin_name', 'admin_email'))

    # Obtener todas las personas para el selector de nuevo administrador
    personas = Person.objects.all().values('person_id', 'first_name', 'last_name')
    
    return render(request, 'colegios.html', {
        'colegios': colegios_list,
        'total_colegios': total_colegios,
        'personas': personas
    })

@csrf_protect
def crear_colegio(request):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Crear Organization
                organization = Organization.objects.create(
                    name=request.POST['nombre'],
                    ref_organization_type_id=28  # ID para School según CEDS
                )

                # Crear OrganizationIdentifier para el RBD
                OrganizationIdentifier.objects.create(
                    organization=organization,
                    identifier=request.POST['rbd'],
                    ref_organization_identification_system_id=1,  # ID para RBD
                    ref_organization_identifier_type_id=1  # Agregar este campo con un valor apropiado
                )

                return JsonResponse({
                    'status': 'success',
                    'message': 'Colegio registrado exitosamente'
                })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    }, status=405)

def crear_persona(request):
    if request.method == 'POST':
        try:
            print("\nDatos recibidos:")
            print("organization_id:", request.POST.get('organization_id'))
            print("email:", request.POST.get('email'))
            print("first_name:", request.POST.get('first_name'))
            print("last_name:", request.POST.get('last_name'))

            # Verificar si ya existe un usuario con ese email
            if User.objects.filter(email=request.POST['email']).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Ya existe un usuario con ese correo electrónico'
                })

            with transaction.atomic():
                # Crear el usuario de Django
                user = User.objects.create_user(
                    username=request.POST['email'],
                    email=request.POST['email'],
                    password=request.POST['password'],
                    first_name=request.POST['first_name'],
                    last_name=request.POST['last_name']
                )
                print("Usuario creado:", user.id)
                
                # Crear la persona y asociarla con el usuario
                person = Person.objects.create(
                    user=user,  # Aquí está la asociación con el usuario
                    first_name=request.POST['first_name'],
                    last_name=request.POST['last_name'],
                    birthdate='2000-01-01',
                    ref_sex_id=1,
                    hispanic_latino_ethnicity=False,
                    ref_us_citizenship_status_id=1,
                    ref_state_of_residence_id=1,
                    ref_proof_of_residency_type_id=1,
                    ref_highest_education_level_completed_id=1,
                    ref_personal_information_verification_id=1
                )
                print("Persona creada:", person.person_id)

                # Crear la relación con la organización
                organization = Organization.objects.get(pk=request.POST['organization_id'])
                print("Organización encontrada:", organization.pk)
                
                role = OrganizationPersonRole.objects.create(
                    organization=organization,
                    person=person,
                    role_id=1,  # ID para rol de administrador
                    entry_date=timezone.now()
                )
                print("\nRol creado:")
                print(f"- organization_id: {role.organization_id}")
                print(f"- person_id: {role.person_id}")
                print(f"- role_id: {role.role_id}")
                print(f"- entry_date: {role.entry_date}")
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Persona creada exitosamente'
                })
                
        except Exception as e:
            print("Error al crear persona:", str(e))
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })
    
    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    })

@csrf_protect
def cambiar_administrador(request):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                organization_id = request.POST['organization_id']
                new_admin_id = request.POST['new_admin_id']
                
                # Remover el rol de administrador actual
                OrganizationPersonRole.objects.filter(
                    organization_id=organization_id,
                    role_id=1
                ).delete()
                
                # Crear nuevo rol de administrador
                OrganizationPersonRole.objects.create(
                    organization_id=organization_id,
                    person_id=new_admin_id,
                    role_id=1,
                    entry_date=timezone.now()
                )
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Administrador cambiado exitosamente'
                })
                
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })
    
    return JsonResponse({
        'status': 'error',
        'message': 'Método no permitido'
    })

from email.message import EmailMessage
import json
import ssl
import certifi
from django.http import BadHeaderError, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from twilio.rest import Client

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
    return render(request, 'home.html')

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


import json
import re
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.utils import timezone

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
@require_POST
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

        # Aquí iría el código para guardar el número de teléfono en la base de datos
        # contact_request = ContactRequest.objects.create(phone_number=phone)

        return JsonResponse({
            'message': 'Gracias, hemos recibido tu número de teléfono. Nos pondremos en contacto contigo pronto.',
            'success': True,
            'remainingAttempts': 5 - count
        })

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
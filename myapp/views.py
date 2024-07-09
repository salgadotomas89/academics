from email.message import EmailMessage
import ssl
import certifi
from django.http import BadHeaderError, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from twilio.rest import Client

from django.conf import settings
from django.contrib import messages


import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail



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
        
    return render(request, 'juego.html')

def precios(request):
    return render(request, 'precios.html')

def seleccion_plan(request):
    return render(request, 'seleccion_plan.html')


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging

logger = logging.getLogger(__name__)

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
                from_email='salgadotomas@outlook.com',
                to_emails='salgadotomas@icloud.com',
                subject='Nuevo mensaje de contacto',
                html_content=f'<pre>{message_body}</pre>'
            )


            sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))

            response = sg.send(message)

            if response.status_code == 202:
                return JsonResponse({'message': 'Mensaje enviado exitosamente.'})
            else:
                logger.error(f"SendGrid responded with status code {response.status_code}")
                return JsonResponse({'message': 'Error al enviar el mensaje. Por favor, intente más tarde.'}, status=500)

        except Exception as e:
            logger.error(f'Error en el envío del correo: {str(e)}')
            return JsonResponse({'message': 'Error al enviar el mensaje. Por favor, intente más tarde.'}, status=500)

    return render(request, 'contacto.html')
    
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
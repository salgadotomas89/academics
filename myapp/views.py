from django.http import BadHeaderError, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from twilio.rest import Client

from django.conf import settings
from django.contrib import messages


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

@csrf_exempt
def contacto(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        text = request.POST.get('text')

        try:
            # Envía el correo electrónico
            subject = 'Formulario de contacto'
            message = f'Nombre: {name}\nApellido: {last_name}\nEmail: {email}\nMensaje: {text}'
            sender_email = settings.EMAIL_HOST_USER
            recipient_list = ['salgadotomas@icloud.com']  # Coloca aquí la dirección de correo a la que quieres enviar el formulario
            send_mail(subject, message, sender_email, recipient_list, fail_silently=False)
            
            return JsonResponse({'message': 'Mensaje enviado exitosamente.'})
        
        except BadHeaderError:
            return JsonResponse({'message': 'Error en el encabezado del mensaje.'}, status=500)
        
        except Exception as e:
            # Si ocurre cualquier otra excepción, puedes imprimir el mensaje de error para depuración
            print('Error en el envío del correo:', str(e))
            return JsonResponse({'message': 'Error al enviar el mensaje.'}, status=500)

    else:
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
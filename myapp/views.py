from django.http import BadHeaderError, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages

# Create your views here.


def home(request):
    return render(request, 'home.html')

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
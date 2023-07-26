from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages

# Create your views here.


def home(request):
    return render(request, 'home.html')


def contacto(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        text = request.POST.get('text')

        # Envía el correo electrónico
        subject = 'Formulario de contacto'
        message = f'Nombre: {name}\nApellido: {last_name}\nEmail: {email}\nMensaje: {text}'
        sender_email = settings.EMAIL_HOST_USER
        recipient_list = ['salgadotomas@icloud.com']  # Coloca aquí la dirección de correo a la que quieres enviar el formulario
        send_mail(subject, message, sender_email, recipient_list, fail_silently=False)

        # Mostrar mensaje de éxito
        messages.success(request, 'Mensaje enviado exitosamente.')

        # No redirecciones, sigue mostrando la página de contacto
        return render(request, 'contacto.html')
    else:
        return render(request, 'contacto.html')  
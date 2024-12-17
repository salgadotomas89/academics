from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        remember = request.POST.get('remember')

        try:
            user = authenticate(username=email, password=password)
            
            if user is not None:
                login(request, user)
                
                if not remember:
                    request.session.set_expiry(0)
                
                return redirect('home')
            else:
                messages.error(request, 'Correo o contraseña incorrectos')
        except User.DoesNotExist:
            messages.error(request, 'No existe una cuenta con ese correo electrónico')
        except Exception as e:
            messages.error(request, f'Error al iniciar sesión: {str(e)}')
    
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('home')
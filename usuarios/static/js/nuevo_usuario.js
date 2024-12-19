document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Nuevo Usuario JS');
    
    const nuevoUsuarioContent = document.getElementById('nuevoUsuarioContent');
    const saveUsuarioBtn = document.getElementById('saveUsuarioBtn');
    const modal = document.getElementById('nuevoUsuarioModal');
    
    console.log('URL para crear usuario:', nuevoUsuarioContent?.dataset?.crearUrl);
    
    if (!saveUsuarioBtn) {
        console.error('No se encontró el botón de guardar');
        return;
    }

    if (!nuevoUsuarioContent) {
        console.error('No se encontró el contenedor del modal');
        return;
    }

    saveUsuarioBtn.addEventListener('click', function(e) {
        console.log('Botón guardar clickeado');
        e.preventDefault();
        
        const form = document.getElementById('nuevoUsuarioForm');
        
        if (!form) {
            console.error('No se encontró el formulario');
            return;
        }
        
        if (form.checkValidity()) {
            console.log('Formulario válido, preparando envío');
            const formData = new FormData(form);

            // Log de datos del formulario
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Validar contraseñas
            if (formData.get('password') !== formData.get('confirm_password')) {
                alert('Las contraseñas no coinciden');
                return;
            }

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            if (!csrfToken) {
                console.error('No se encontró el token CSRF');
                return;
            }

            // Enviar datos
            console.log('Iniciando fetch a:', nuevoUsuarioContent.dataset.crearUrl);
            
            fetch(nuevoUsuarioContent.dataset.crearUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken.value
                }
            })
            .then(response => {
                console.log('Respuesta recibida:', response.status);
                if (!response.ok) {
                    throw new Error('Error al crear usuario. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                if (data.status === 'success') {
                    alert('Usuario creado exitosamente');
                    form.reset();
                    // Usar Bootstrap para cerrar el modal
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    modalInstance.hide();
                    // Recargar la tabla de usuarios usando la función global
                    if (typeof window.cargarUsuarios === 'function') {
                        window.cargarUsuarios();
                    } else {
                        console.error('La función cargarUsuarios no está disponible');
                    }
                } else {
                    throw new Error(data.message || 'Error al crear usuario');
                }
            })
            .catch(error => {
                console.error('Error completo:', error);
                console.error('Mensaje de error:', error.message);
                console.error('Stack trace:', error.stack);
                alert('Error al crear usuario: ' + error.message);
            });
        } else {
            console.log('Formulario inválido');
            form.reportValidity();
        }
    });
});

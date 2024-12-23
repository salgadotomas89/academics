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
                return response.json().then(data => {
                    if (data.status === 'success') {
                        return data;
                    } else {
                        // Si el servidor devuelve un error específico
                        throw new Error(data.message || 'Error al crear usuario');
                    }
                });
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Usuario creado exitosamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                form.reset();
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                if (typeof window.cargarUsuarios === 'function') {
                    window.cargarUsuarios();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message === 'Error temporal en el servidor, por favor intente nuevamente' 
                        ? error.message 
                        : 'Error al crear usuario. Por favor, intente nuevamente.',
                    confirmButtonText: 'Entendido'
                });
            });
        } else {
            console.log('Formulario inválido');
            form.reportValidity();
        }
    });
});

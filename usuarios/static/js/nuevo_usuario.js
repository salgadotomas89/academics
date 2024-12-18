document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar campos de profesor
    const roleSelect = document.getElementById('roleSelect');
    const profesorFields = document.getElementById('profesorFields');

    roleSelect.addEventListener('change', function() {
        profesorFields.style.display = this.value === 'profesor' ? 'block' : 'none';
    });

    // Manejar el envío del formulario
    document.getElementById('saveUsuarioBtn').addEventListener('click', function() {
        const form = document.getElementById('nuevoUsuarioForm');
        const formData = new FormData(form);

        // Validar contraseñas
        if (formData.get('password') !== formData.get('confirm_password')) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Enviar datos
        fetch('/main/crear/nuevo_usuario/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Usuario creado exitosamente');
                $('#nuevoUsuarioModal').modal('hide');
                // Recargar la tabla de usuarios si existe
                if (typeof reloadUsuariosTable === 'function') {
                    reloadUsuariosTable();
                }
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error al crear usuario: ' + error);
        });
    });
});

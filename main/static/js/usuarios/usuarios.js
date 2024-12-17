document.addEventListener('DOMContentLoaded', function() {
    // Manejador para el formulario de nuevo usuario
    const nuevoUsuarioForm = document.getElementById('nuevoUsuarioForm');
    const saveUsuarioBtn = document.getElementById('saveUsuarioBtn');
    const roleSelect = document.getElementById('roleSelect');
    const profesorFields = document.getElementById('profesorFields');

    // Mostrar/ocultar campos específicos de profesor según el rol seleccionado
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            if (profesorFields) {
                if (this.value === 'profesor') {
                    profesorFields.style.display = 'block';
                    // Hacer los campos de profesor requeridos
                    profesorFields.querySelectorAll('input').forEach(input => {
                        if (input.name === 'titulo' || input.name === 'institucion_titulo') {
                            input.required = true;
                        }
                    });
                } else {
                    profesorFields.style.display = 'none';
                    // Quitar el requerido de los campos de profesor
                    profesorFields.querySelectorAll('input').forEach(input => {
                        input.required = false;
                    });
                }
            }
        });
    }

    if (saveUsuarioBtn) {
        saveUsuarioBtn.addEventListener('click', function() {
            if (nuevoUsuarioForm.checkValidity()) {
                const formData = new FormData(nuevoUsuarioForm);
                // Aquí iría la lógica para guardar el nuevo usuario
                // Por ejemplo, una llamada AJAX al backend
                console.log('Guardando usuario...');
                
                // Ejemplo de validación de contraseñas
                if (formData.get('password') !== formData.get('confirm_password')) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                // Aquí iría el código para enviar los datos al servidor
            } else {
                nuevoUsuarioForm.reportValidity();
            }
        });
    }

    // Función para cargar usuarios
    function cargarUsuarios() {
        // Aquí iría la lógica para cargar los usuarios desde el backend
        // y mostrarlos en la tabla
    }

    // Manejadores para los filtros
    const searchUsuario = document.getElementById('searchUsuario');
    const filterRol = document.getElementById('filterRol');
    const filterEstado = document.getElementById('filterEstado');

    if (searchUsuario) {
        searchUsuario.addEventListener('input', function() {
            // Lógica para filtrar por búsqueda
        });
    }

    if (filterRol) {
        filterRol.addEventListener('change', function() {
            // Lógica para filtrar por rol
        });
    }

    if (filterEstado) {
        filterEstado.addEventListener('change', function() {
            // Lógica para filtrar por estado
        });
    }

    // Cargar usuarios inicialmente
    cargarUsuarios();
}); 
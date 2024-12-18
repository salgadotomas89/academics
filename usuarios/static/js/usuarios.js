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
        fetch('api/usuarios/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                return response.json();
            })
            .then(data => {
                if (data.usuarios) {
                    mostrarUsuariosEnTabla(data.usuarios);
                } else {
                    console.error('No se recibieron datos de usuarios');
                }
            })
            .catch(error => {
                console.error('Error completo:', error);
                console.error('Mensaje de error:', error.message);
                console.error('Stack trace:', error.stack);
                alert('Error al cargar los usuarios. Por favor, intente nuevamente.');
            });
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

function mostrarUsuariosEnTabla(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        
        // Mapeo de roles para mostrar texto legible
        const rolesMap = {
            1: 'Profesor',
            2: 'Administrador',
            3: 'Secretaria'
        };

        tr.innerHTML = `
            <td>${usuario.first_name || ''}</td>
            <td>${usuario.last_name || ''}</td>
            <td>${usuario.email || ''}</td>
            <td>${rolesMap[usuario.role_id] || 'No definido'}</td>
            <td>
                <span class="badge ${usuario.is_active === null ? 'bg-warning' : usuario.is_active ? 'bg-success' : 'bg-danger'}">
                    ${usuario.is_active === null ? 'Sin estado' : usuario.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarUsuario(${usuario.person_id})" 
                    title="Editar usuario">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${usuario.is_active ? 'btn-danger' : 'btn-success'}" 
                    onclick="cambiarEstadoUsuario(${usuario.person_id}, ${!usuario.is_active})"
                    title="${usuario.is_active ? 'Desactivar' : 'Activar'} usuario">
                    <i class="fas fa-${usuario.is_active ? 'times' : 'check'}"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Función para editar usuario (implementar más tarde)
function editarUsuario(userId) {
    console.log('Editar usuario:', userId);
    // Implementar lógica de edición
}

// Función para cambiar estado del usuario (implementar más tarde)
function cambiarEstadoUsuario(userId, nuevoEstado) {
    console.log('Cambiar estado usuario:', userId, 'nuevo estado:', nuevoEstado);
    // Implementar lógica de cambio de estado
} 
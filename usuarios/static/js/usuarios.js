// Declarar cargarUsuarios en el scope global
window.cargarUsuarios = function() {
    console.log("cargando usuarios");
    const usuariosContent = document.getElementById('usuariosContent');
    //obtenemos el url del atributo data que podemos agregar al elemento
    fetch(usuariosContent.dataset.cargarUrl)
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

    // Manejador para el formulario de nuevo usuario
    if (saveUsuarioBtn) {
        //agregamos el evento click al boton de guardar
        saveUsuarioBtn.addEventListener('click', function() {
            if (nuevoUsuarioForm.checkValidity()) {
                const formData = new FormData(nuevoUsuarioForm);
                // Aquí iría la lógica para guardar el nuevo usuario
                // una llamada AJAX al backend
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

    // Manejar el guardado de la edición
    const saveEditUsuarioBtn = document.getElementById('saveEditUsuarioBtn');
    if (saveEditUsuarioBtn) {
        saveEditUsuarioBtn.addEventListener('click', function() {
            const form = document.getElementById('editarUsuarioForm');
            if (form.checkValidity()) {
                const formData = new FormData(form);
                const userId = formData.get('user_id');
                
                fetch(`/usuarios/actualizar/${userId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al actualizar usuario');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal')).hide();
                        Swal.fire(
                            '¡Actualizado!',
                            'Usuario actualizado correctamente.',
                            'success'
                        );
                        cargarUsuarios(); // Recargar la tabla
                    } else {
                        throw new Error(data.message || 'Error al actualizar usuario');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire(
                        'Error',
                        'No se pudo actualizar el usuario. Por favor, intente nuevamente.',
                        'error'
                    );
                });
            } else {
                form.reportValidity();
            }
        });
    }

    // Manejar cambio de rol en edición
    const editRoleSelect = document.getElementById('editRoleSelect');
    if (editRoleSelect) {
        editRoleSelect.addEventListener('change', function() {
            const profesorFields = document.getElementById('editProfesorFields');
            if (this.value === 'profesor') {
                profesorFields.style.display = 'block';
                profesorFields.querySelectorAll('input').forEach(input => {
                    input.required = true;
                });
            } else {
                profesorFields.style.display = 'none';
                profesorFields.querySelectorAll('input').forEach(input => {
                    input.required = false;
                });
            }
        });
    }
});

// Función para mostrar usuarios en la tabla
function mostrarUsuariosEnTabla(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        
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
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="btn btn-sm btn-danger" 
                    onclick="confirmarEliminarUsuario(${usuario.person_id})"
                    title="Eliminar usuario">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Función para confirmar y eliminar usuario
function confirmarEliminarUsuario(userId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarUsuario(userId);
        }
    });
}

// Función para eliminar usuario
function eliminarUsuario(userId) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(`/usuarios/eliminar/${userId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar usuario');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            Swal.fire(
                '¡Eliminado!',
                'El usuario ha sido eliminado correctamente.',
                'success'
            );
            cargarUsuarios(); // Recargar la tabla
        } else {
            throw new Error(data.message || 'Error al eliminar usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire(
            'Error',
            'No se pudo eliminar el usuario. Por favor, intente nuevamente.',
            'error'
        );
    });
}

// Función para editar usuario
function editarUsuario(userId) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Obtener los datos del usuario
    fetch(`/usuarios/obtener/${userId}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener datos del usuario');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Llenar el formulario con los datos del usuario
            document.getElementById('editUserId').value = userId;
            document.getElementById('editFirstName').value = data.usuario.first_name;
            document.getElementById('editLastName').value = data.usuario.last_name;
            document.getElementById('editEmail').value = data.usuario.email;
            document.getElementById('editRoleSelect').value = data.usuario.role;
            
            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
            modal.show();
        } else {
            throw new Error(data.message || 'Error al obtener datos del usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire(
            'Error',
            'No se pudieron cargar los datos del usuario.',
            'error'
        );
    });
}

// Función para cambiar estado del usuario
function cambiarEstadoUsuario(userId, nuevoEstado) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} este usuario?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: nuevoEstado ? '#28a745' : '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: nuevoEstado ? 'Sí, activar' : 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/cambiar-estado/${userId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: nuevoEstado })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cambiar estado del usuario');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    Swal.fire(
                        '¡Actualizado!',
                        `El usuario ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`,
                        'success'
                    );
                    cargarUsuarios(); // Recargar la tabla
                } else {
                    throw new Error(data.message || 'Error al cambiar estado del usuario');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire(
                    'Error',
                    'No se pudo cambiar el estado del usuario. Por favor, intente nuevamente.',
                    'error'
                );
            });
        }
    });
} 
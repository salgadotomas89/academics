document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Obtener referencias a los elementos
    const usuariosLink = document.getElementById('usuariosLink');
    const usuariosContent = document.getElementById('usuariosContent');
    const defaultContent = document.getElementById('defaultContent');
    const alumnosContent = document.getElementById('alumnosContent');
    const cursosContent = document.getElementById('cursosContent');

    // Datos de ejemplo
    const usuariosEjemplo = [
        {
            id: 1,
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@escuela.com',
            rol: 'Profesor',
            estado: 'Activo'
        },
        {
            id: 2,
            nombre: 'María',
            apellido: 'González',
            email: 'maria.gonzalez@escuela.com',
            rol: 'Administrador',
            estado: 'Activo'
        },
        {
            id: 3,
            nombre: 'Carlos',
            apellido: 'Rodríguez',
            email: 'carlos.rodriguez@escuela.com',
            rol: 'Secretaria',
            estado: 'Inactivo'
        },
        {
            id: 4,
            nombre: 'Ana',
            apellido: 'López',
            email: 'ana.lopez@escuela.com',
            rol: 'Profesor',
            estado: 'Activo'
        },
        {
            id: 5,
            nombre: 'Pedro',
            apellido: 'Martínez',
            email: 'pedro.martinez@escuela.com',
            rol: 'Profesor',
            estado: 'Activo'
        }
    ];

    // Función para cargar los usuarios en la tabla
    function cargarUsuarios(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.email}</td>
                <td><span class="badge ${usuario.rol === 'Administrador' ? 'bg-danger' : 
                                      usuario.rol === 'Profesor' ? 'bg-primary' : 
                                      'bg-success'}"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    title="Nivel de acceso: ${usuario.rol}">${usuario.rol}</span></td>
                <td><span class="badge ${usuario.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}"
                    data-bs-toggle="tooltip" 
                    data-bs-placement="top" 
                    title="Estado actual del usuario">${usuario.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" 
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        title="Editar usuario">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top" 
                        title="Eliminar usuario">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Reinicializar los tooltips después de cargar el contenido
        const newTooltipTriggerList = [].slice.call(tbody.querySelectorAll('[data-bs-toggle="tooltip"]'));
        newTooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Función para mostrar una sección específica
    function mostrarSeccion(seccion) {
        // Ocultar todos los contenidos
        defaultContent.style.display = 'none';
        alumnosContent.style.display = 'none';
        cursosContent.style.display = 'none';
        usuariosContent.style.display = 'none';
        
        // Mostrar la sección seleccionada
        if (seccion) {
            const seccionContent = document.getElementById(seccion + 'Content');
            if (seccionContent) {
                seccionContent.style.display = 'block';
                // Guardar la sección actual en localStorage
                localStorage.setItem('seccionActual', seccion);
                
                // Si es la sección de usuarios, cargar los datos
                if (seccion === 'usuarios') {
                    cargarUsuarios(usuariosEjemplo);
                }
            }
        } else {
            defaultContent.style.display = 'block';
        }
    }

    // Agregar evento click al enlace de usuarios
    usuariosLink.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarSeccion('usuarios');
    });

    // Verificar si hay una sección guardada al cargar la página
    const seccionGuardada = localStorage.getItem('seccionActual');
    if (seccionGuardada) {
        mostrarSeccion(seccionGuardada);
    }

    // Funciones para los filtros
    window.aplicarFiltrosUsuarios = function() {
        const searchTerm = document.getElementById('searchUsuario').value.toLowerCase();
        const rolFiltro = document.getElementById('filterRol').value.toLowerCase();
        const estadoFiltro = document.getElementById('filterEstadoUsuario').value.toLowerCase();

        const usuariosFiltrados = usuariosEjemplo.filter(usuario => {
            const cumpleNombre = `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(searchTerm);
            const cumpleRol = !rolFiltro || usuario.rol.toLowerCase() === rolFiltro;
            const cumpleEstado = !estadoFiltro || usuario.estado.toLowerCase() === estadoFiltro;

            return cumpleNombre && cumpleRol && cumpleEstado;
        });

        cargarUsuarios(usuariosFiltrados);
    };

    window.limpiarFiltrosUsuarios = function() {
        // Limpiar los campos de filtro
        document.getElementById('searchUsuario').value = '';
        document.getElementById('filterRol').value = '';
        document.getElementById('filterEstadoUsuario').value = '';
        
        // Volver a cargar todos los usuarios
        cargarUsuarios(usuariosEjemplo);
    };

    window.guardarNuevoUsuario = function() {
        // Implementar la lógica para guardar un nuevo usuario
        const form = document.getElementById('nuevoUsuarioForm');
        const formData = new FormData(form);
        
        // Simular guardado
        console.log('Datos del nuevo usuario:', Object.fromEntries(formData));
        
        // Cerrar el modal después de guardar
        const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoUsuarioModal'));
        modal.hide();

        // Limpiar el formulario
        form.reset();

        // Recargar la tabla
        cargarUsuarios(usuariosEjemplo);
    };
}); 
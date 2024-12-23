// Estado global para los filtros
const filtrosUsuarios = {
    searchTimeout: null,
    currentFilters: {
        search: '',
        rol: '',
        estado: ''
    }
};

// Función para aplicar los filtros
function aplicarFiltros() {
    const url = new URL(document.querySelector('#usuariosContent').dataset.cargarUrl, window.location.origin);
    
    // Agregar los filtros actuales a la URL
    Object.entries(filtrosUsuarios.currentFilters).forEach(([key, value]) => {
        if (value) {
            url.searchParams.append(key, value);
        }
    });

    // Realizar la petición
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }
            return response.json();
        })
        .then(data => {
            if (data.usuarios) {
                mostrarUsuariosEnTabla(data.usuarios);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios filtrados', 'error');
        });
}

// Configurar los event listeners para los filtros
function inicializarFiltros() {
    // Filtro de búsqueda por texto
    const searchInput = document.getElementById('searchUsuario');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Limpiar el timeout anterior si existe
            if (filtrosUsuarios.searchTimeout) {
                clearTimeout(filtrosUsuarios.searchTimeout);
            }

            // Establecer un nuevo timeout para el debounce
            filtrosUsuarios.searchTimeout = setTimeout(() => {
                filtrosUsuarios.currentFilters.search = e.target.value;
                aplicarFiltros();
            }, 300); // Esperar 300ms después de que el usuario deje de escribir
        });
    }

    // Filtro de rol
    const filterRol = document.getElementById('filterRol');
    if (filterRol) {
        filterRol.addEventListener('change', (e) => {
            filtrosUsuarios.currentFilters.rol = e.target.value;
            aplicarFiltros();
        });
    }

    // Filtro de estado
    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
        filterEstado.addEventListener('change', (e) => {
            filtrosUsuarios.currentFilters.estado = e.target.value;
            aplicarFiltros();
        });
    }
}

// Función para limpiar todos los filtros
function limpiarFiltros() {
    // Resetear los valores de los campos
    document.getElementById('searchUsuario').value = '';
    document.getElementById('filterRol').value = '';
    document.getElementById('filterEstado').value = '';

    // Resetear el estado de los filtros
    filtrosUsuarios.currentFilters = {
        search: '',
        rol: '',
        estado: ''
    };

    // Recargar los usuarios
    aplicarFiltros();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltros();
}); 
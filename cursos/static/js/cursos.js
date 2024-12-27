// Manejador de eventos cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
    initializeCursos();
});

// Inicialización del módulo de cursos
function initializeCursos() {
    // Cargar datos iniciales
    console.log('inicializando cursos');
    loadCursos();

    // Event listeners para filtros
    document.getElementById('searchCurso')?.addEventListener('input', filterCursos);
    document.getElementById('filterNivel')?.addEventListener('change', filterCursos);

    // Event listeners para el modal de nuevo curso
    const modalidadSelect = document.querySelector('select[name="modalidad"]');
    const nivelSelect = document.querySelector('select[name="nivel"]');
    
    modalidadSelect?.addEventListener('change', function() {
        cargarNiveles();
    });
    
    nivelSelect?.addEventListener('change', function() {
        cargarGrados();
    });
}

// Carga y muestra la lista de cursos
async function loadCursos() {
    try {
        const response = await fetch('/cursos/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta no es JSON');
        }
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        const data = JSON.parse(responseText);
        if (data.error) {
            throw new Error(data.error);
        }
        displayCursos(data.cursos);
    } catch (error) {
        console.error('Error cargando cursos:', error);
        showAlert('Error al cargar los cursos: ' + error.message, 'danger');
    }
}

// Muestra los cursos en el contenedor
function displayCursos(cursos) {
    const container = document.getElementById('cursosContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (!cursos || cursos.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info" role="alert">
                    No hay cursos registrados.
                </div>
            </div>
        `;
        return;
    }

    cursos.forEach(curso => {
        container.appendChild(createCursoCard(curso));
    });
}

// Crea una tarjeta de curso
function createCursoCard(curso) {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-header bg-primary bg-opacity-10">
                <h5 class="card-title mb-0">${curso.nombre}</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <small class="text-muted">Modalidad</small>
                    <p class="mb-0">${curso.modalidad}</p>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Jornada</small>
                    <p class="mb-0">${curso.jornada}</p>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Nivel</small>
                    <p class="mb-0">${curso.nivel}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarCurso(${curso.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCurso(${curso.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return card;
}

// Filtra los cursos según los criterios seleccionados
function filterCursos() {
    const searchTerm = document.getElementById('searchCurso')?.value.toLowerCase() || '';
    const nivelFilter = document.getElementById('filterNivel')?.value || '';

    const cards = document.querySelectorAll('#cursosContainer .col-md-4');
    cards.forEach(card => {
        const curso = card.querySelector('.card');
        const nombre = curso.querySelector('.card-title').textContent.toLowerCase();
        const nivel = curso.querySelector('.card-body p:nth-child(3)').textContent;

        const matchSearch = nombre.includes(searchTerm);
        const matchNivel = !nivelFilter || nivel === nivelFilter;

        card.style.display = matchSearch && matchNivel ? '' : 'none';
    });
}

// Funciones de utilidad
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

// Funciones para editar y eliminar cursos
function editarCurso(id) {
    // Implementar edición de curso
    console.log('Editar curso:', id);
}

// Función para eliminar un curso
async function eliminarCurso(cursoId) {
    if (!confirm('¿Está seguro que desea eliminar este curso? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        // Obtener el token CSRF de la cookie
        const csrftoken = getCookie('csrftoken');
        
        const response = await fetch(`/cursos/eliminar/${cursoId}/`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Curso eliminado exitosamente', 'success');
            // Recargar la lista de cursos
            loadCursos();
        } else {
            throw new Error(data.error || 'Error al eliminar el curso');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar el curso: ' + error.message, 'danger');
    }
}

// Función para obtener el token CSRF de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
} 
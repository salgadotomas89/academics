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

// Función para cargar los niveles en el select
function cargarNivelesEdicion(selectElement) {
    const niveles = [
        { id: '01', nombre: 'Educación Parvularia' },
        { id: '02', nombre: 'Enseñanza Básica' },
        { id: '05', nombre: 'Enseñanza Media HC' }
    ];

    selectElement.innerHTML = '<option value="">Seleccione un nivel</option>';
    niveles.forEach(nivel => {
        const option = document.createElement('option');
        option.value = nivel.id;
        option.textContent = nivel.nombre;
        selectElement.appendChild(option);
    });
}

// Función para cargar los grados según el nivel seleccionado
function cargarGradosEdicion(nivelId, selectElement) {
    // Si no se proporciona un elemento select, intentar obtenerlo del DOM
    if (!selectElement) {
        selectElement = document.getElementById('editGrado');
        // Si aún no hay elemento, salir de la función
        if (!selectElement) return;
    }

    let grados = [];
    
    switch(nivelId) {
        case '01': // Parvularia
            grados = [
                { id: '1', nombre: 'Pre-Kinder' },
                { id: '2', nombre: 'Kinder' }
            ];
            break;
        case '02': // Básica
            grados = [
                { id: '1', nombre: '1º' },
                { id: '2', nombre: '2º' },
                { id: '3', nombre: '3º' },
                { id: '4', nombre: '4º' },
                { id: '5', nombre: '5º' },
                { id: '6', nombre: '6º' },
                { id: '7', nombre: '7º' },
                { id: '8', nombre: '8º' }
            ];
            break;
        case '05': // Media
            grados = [
                { id: '1', nombre: '1º' },
                { id: '2', nombre: '2º' },
                { id: '3', nombre: '3º' },
                { id: '4', nombre: '4º' }
            ];
            break;
    }

    selectElement.innerHTML = '<option value="">Seleccione un grado</option>';
    grados.forEach(grado => {
        const option = document.createElement('option');
        option.value = grado.id;
        option.textContent = grado.nombre;
        selectElement.appendChild(option);
    });
}

// Funciones para editar un curso
async function editarCurso(id) {
    try {
        // Obtener los datos del curso
        const response = await fetch(`/cursos/editar/${id}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del curso');
        }

        const data = await response.json();
        
        // Cargar los niveles en el select
        const nivelSelect = document.getElementById('editNivel');
        cargarNivelesEdicion(nivelSelect);
        
        // Establecer el nivel seleccionado
        nivelSelect.value = data.nivel;
        
        // Cargar los grados según el nivel
        const gradoSelect = document.getElementById('editGrado');
        cargarGradosEdicion(data.nivel, gradoSelect);
        
        // Establecer el grado y letra seleccionados
        gradoSelect.value = data.grado;
        document.getElementById('editLetra').value = data.letra;

        // Cargar los profesores en el select
        const profesorSelect = document.getElementById('editProfesorJefe');
        profesorSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
        data.profesores.forEach(profesor => {
            const option = document.createElement('option');
            option.value = profesor.id;
            option.textContent = profesor.nombre;
            profesorSelect.appendChild(option);
        });

        // Establecer el profesor jefe actual si existe
        if (data.profesor_jefe_id) {
            profesorSelect.value = data.profesor_jefe_id;
        }
        
        // Guardar el ID del curso
        document.getElementById('editCursoId').value = id;

        // Configurar el event listener para el cambio de nivel
        nivelSelect.addEventListener('change', function() {
            cargarGradosEdicion(this.value, gradoSelect);
        });

        // Abrir el modal
        const modal = new bootstrap.Modal(document.getElementById('editarCursoModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los datos del curso: ' + error.message, 'danger');
    }
}

// Función para actualizar un curso
async function actualizarCurso(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const cursoId = document.getElementById('editCursoId').value;
        
        const response = await fetch(`/cursos/editar/${cursoId}/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Cerrar el modal
            bootstrap.Modal.getInstance(document.getElementById('editarCursoModal')).hide();
            
            // Mostrar mensaje de éxito
            showAlert('Curso actualizado exitosamente', 'success');
            
            // Recargar la lista de cursos
            loadCursos();
        } else {
            throw new Error(data.error || 'Error al actualizar el curso');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al actualizar el curso: ' + error.message, 'danger');
    }
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
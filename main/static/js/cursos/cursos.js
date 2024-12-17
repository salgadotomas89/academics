// Manejador de eventos cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCursos();
});

// Inicialización del módulo de cursos
function initializeCursos() {
    // Cargar datos iniciales desde la configuración del colegio
    loadNivelesActivos();
    loadProfesores();
    loadSalasDisponibles();
    loadCursos();

    // Event listeners para filtros
    document.getElementById('searchCurso').addEventListener('input', filterCursos);
    document.getElementById('filterNivel').addEventListener('change', filterCursos);
    document.getElementById('filterProfesor').addEventListener('change', filterCursos);

    // Event listener para el formulario de nuevo curso
    const nivelSelect = document.querySelector('select[name="nivel"]');
    nivelSelect?.addEventListener('change', function() {
        updateGradoOptions(this.value);
    });
}

// Carga los niveles activos desde la configuración del colegio
async function loadNivelesActivos() {
    try {
        const response = await fetch('/api/colegio/niveles-activos/');
        const data = await response.json();
        updateSelectOptions('nivel', data);
    } catch (error) {
        console.error('Error cargando niveles:', error);
    }
}

// Actualiza las opciones de grado según el nivel seleccionado
async function updateGradoOptions(nivelId) {
    try {
        const response = await fetch(`/api/colegio/grados-activos/${nivelId}/`);
        const data = await response.json();
        updateSelectOptions('grado', data);
    } catch (error) {
        console.error('Error cargando grados:', error);
    }
}

// Carga las salas disponibles desde la configuración del colegio
async function loadSalasDisponibles() {
    try {
        const response = await fetch('/api/colegio/salas-disponibles/');
        const data = await response.json();
        updateSelectOptions('sala', data);
    } catch (error) {
        console.error('Error cargando salas:', error);
    }
}

// Guarda un nuevo curso
async function guardarNuevoCurso() {
    const form = document.getElementById('nuevoCursoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    try {
        const response = await fetch('/api/cursos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
            // Cerrar modal y actualizar lista
            bootstrap.Modal.getInstance(document.getElementById('nuevoCursoModal')).hide();
            loadCursos();
            showAlert('Curso creado exitosamente', 'success');
        } else {
            throw new Error('Error al crear el curso');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al crear el curso', 'danger');
    }
}

// Carga y muestra la lista de cursos
async function loadCursos() {
    try {
        const response = await fetch('/api/cursos/');
        const cursos = await response.json();
        displayCursos(cursos);
    } catch (error) {
        console.error('Error cargando cursos:', error);
        showAlert('Error al cargar los cursos', 'danger');
    }
}

// Muestra los cursos en el contenedor
function displayCursos(cursos) {
    const container = document.getElementById('cursosContainer');
    container.innerHTML = '';

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
                    <small class="text-muted">Profesor Jefe</small>
                    <p class="mb-0">${curso.profesor_jefe}</p>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Cantidad de Alumnos</small>
                    <p class="mb-0">${curso.cantidad_alumnos} estudiantes</p>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Sala</small>
                    <p class="mb-0">${curso.sala}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-${curso.estado === 'ACTIVO' ? 'success' : 'secondary'}">${curso.estado}</span>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editarCurso(${curso.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCurso(${curso.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="verHorario(${curso.id})">
                            <i class="fas fa-clock"></i>
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
    const searchTerm = document.getElementById('searchCurso').value.toLowerCase();
    const nivelFilter = document.getElementById('filterNivel').value;
    const profesorFilter = document.getElementById('filterProfesor').value;

    const cards = document.querySelectorAll('#cursosContainer .col-md-4');
    cards.forEach(card => {
        const curso = card.querySelector('.card');
        const nombre = curso.querySelector('.card-title').textContent.toLowerCase();
        const nivel = curso.dataset.nivel;
        const profesor = curso.querySelector('.card-body p').textContent;

        const matchSearch = nombre.includes(searchTerm);
        const matchNivel = !nivelFilter || nivel === nivelFilter;
        const matchProfesor = !profesorFilter || profesor === profesorFilter;

        card.style.display = matchSearch && matchNivel && matchProfesor ? '' : 'none';
    });
}

// Funciones de utilidad
function updateSelectOptions(selectName, options) {
    const select = document.querySelector(`select[name="${selectName}"]`);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Seleccionar...</option>';
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.id;
        optElement.textContent = option.nombre;
        select.appendChild(optElement);
    });
    if (currentValue) select.value = currentValue;
}

function showAlert(message, type) {
    // Implementar sistema de alertas
} 
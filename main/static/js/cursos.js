class CursosManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const cursosLink = document.getElementById('cursosLink');
        if (cursosLink) {
            cursosLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.mostrarSeccionCursos();
            });
        }
    }

    mostrarSeccionCursos() {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección de cursos
        const cursosContent = document.getElementById('cursosContent');
        if (cursosContent) {
            cursosContent.style.display = 'block';
            this.cargarCursos();
        }
    }

    cargarCursos() {
        // Simulación de datos
        const cursosEjemplo = [
            {
                id: 1,
                nombre: '1° Básico A',
                profesorJefe: 'Juan Pérez',
                cantidadAlumnos: 30,
                asignaturas: [
                    { nombre: 'Matemáticas', profesor: 'María González' },
                    { nombre: 'Lenguaje', profesor: 'Pedro Sánchez' }
                ]
            },
            // ... más cursos
        ];

        this.renderizarCursos(cursosEjemplo);
    }

    renderizarCursos(cursos) {
        const container = document.getElementById('cursosContainer');
        container.innerHTML = cursos.map(curso => this.generarTarjetaCurso(curso)).join('');
        this.inicializarTooltips();
    }

    generarTarjetaCurso(curso) {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="curso-card">
                    <div class="curso-header">
                        <h5 class="mb-0">${curso.nombre}</h5>
                    </div>
                    <div class="curso-body">
                        <div class="curso-stats">
                            <div class="stat-item">
                                <div class="small text-muted">Alumnos</div>
                                <div class="h5 mb-0">${curso.cantidadAlumnos}</div>
                            </div>
                            <div class="stat-item">
                                <div class="small text-muted">Asignaturas</div>
                                <div class="h5 mb-0">${curso.asignaturas.length}</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <strong>Profesor Jefe:</strong>
                            <span class="profesor-badge">
                                <i class="fas fa-user-tie"></i>
                                ${curso.profesorJefe}
                            </span>
                        </div>
                        <div class="asignatura-list">
                            <h6>Asignaturas:</h6>
                            ${this.generarListaAsignaturas(curso.asignaturas)}
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-primary" onclick="cursosManager.editarCurso(${curso.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-info" onclick="cursosManager.verDetalles(${curso.id})">
                                <i class="fas fa-eye"></i> Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generarListaAsignaturas(asignaturas) {
        return asignaturas.map(asignatura => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${asignatura.nombre}</span>
                <span class="profesor-badge">
                    <i class="fas fa-chalkboard-teacher"></i>
                    ${asignatura.profesor}
                </span>
            </div>
        `).join('');
    }

    editarCurso(cursoId) {
        // Implementar lógica de edición
    }

    verDetalles(cursoId) {
        // Implementar lógica para ver detalles
    }

    inicializarTooltips() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.cursosManager = new CursosManager();
}); 
// Funciones para la gestión de alumnos
class AlumnosManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const alumnosLink = document.getElementById('alumnosLink');
        if (alumnosLink) {
            alumnosLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.mostrarSeccionAlumnos();
            });
        }

        // Eventos para filtros
        const btnAplicarFiltros = document.querySelector('[data-action="aplicarFiltros"]');
        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', () => this.aplicarFiltros());
        }

        const btnLimpiarFiltros = document.querySelector('[data-action="limpiarFiltros"]');
        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', () => this.limpiarFiltros());
        }
    }

    mostrarSeccionAlumnos() {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección de alumnos
        const alumnosContent = document.getElementById('alumnosContent');
        if (alumnosContent) {
            alumnosContent.style.display = 'block';
            this.cargarAlumnos();
        }
    }

    cargarAlumnos(filtros = {}) {
        // Simular carga de datos con filtros
        const alumnosEjemplo = [
            { 
                id: 1, 
                nombre: 'Juan', 
                apellido: 'Pérez', 
                email: 'juan@ejemplo.com',
                grado: '1',
                seccion: 'A',
                estado: 'activo'
            },
            { 
                id: 2, 
                nombre: 'María', 
                apellido: 'García', 
                email: 'maria@ejemplo.com',
                grado: '2',
                seccion: 'B',
                estado: 'activo'
            }
        ];
        
        this.renderizarTablaAlumnos(alumnosEjemplo);
    }

    renderizarTablaAlumnos(alumnos) {
        const tbody = document.getElementById('alumnosTableBody');
        tbody.innerHTML = '';
        
        alumnos.forEach(alumno => {
            tbody.innerHTML += this.generarFilaAlumno(alumno);
        });

        this.inicializarTooltips();
    }

    generarFilaAlumno(alumno) {
        return `
            <tr>
                <td>${alumno.id}</td>
                <td>${alumno.nombre}</td>
                <td>${alumno.apellido}</td>
                <td>${alumno.email}</td>
                <td>${alumno.grado}° Grado</td>
                <td>Sección ${alumno.seccion}</td>
                <td>
                    <span class="badge ${alumno.estado === 'activo' ? 'bg-success' : 'bg-secondary'}"
                        data-bs-toggle="tooltip" data-bs-placement="top" 
                        title="Estado actual del alumno">
                        ${alumno.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" 
                        data-bs-toggle="tooltip" data-bs-placement="top" 
                        title="Editar información del alumno">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" 
                        data-bs-toggle="tooltip" data-bs-placement="top" 
                        title="Ver detalles del alumno">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                        data-bs-toggle="tooltip" data-bs-placement="top" 
                        title="Eliminar alumno">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    aplicarFiltros() {
        const filtros = {
            nombre: document.getElementById('searchNombre').value,
            grado: document.getElementById('filterGrado').value,
            seccion: document.getElementById('filterSeccion').value,
            estado: document.getElementById('filterEstado').value
        };
        this.cargarAlumnos(filtros);
    }

    limpiarFiltros() {
        document.getElementById('searchNombre').value = '';
        document.getElementById('filterGrado').value = '';
        document.getElementById('filterSeccion').value = '';
        document.getElementById('filterEstado').value = '';
        this.cargarAlumnos();
    }

    guardarNuevoAlumno() {
        const formData = new FormData(document.getElementById('nuevoAlumnoForm'));
        const data = Object.fromEntries(formData.entries());

        fetch('/api/alumnos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoAlumnoModal'));
                modal.hide();
                this.cargarAlumnos();
                alert('Alumno agregado exitosamente');
            } else {
                alert('Error al guardar el alumno: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al guardar el alumno');
        });
    }

    inicializarTooltips() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    getCookie(name) {
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.alumnosManager = new AlumnosManager();
}); 
// Manejador de eventos cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeHorarios();
});

// Inicialización del módulo de horarios
function initializeHorarios() {
    loadCursosForHorario();
    setupHorarioGrid();
    
    // Event listeners
    document.getElementById('horarioCursoSelect')?.addEventListener('change', loadHorario);
}

// Carga los cursos disponibles para el selector de horarios
async function loadCursosForHorario() {
    try {
        const response = await fetch('/api/cursos/');
        const cursos = await response.json();
        const select = document.getElementById('horarioCursoSelect');
        
        select.innerHTML = '<option value="">Seleccione un curso...</option>';
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando cursos:', error);
    }
}

// Configura la grilla del horario
function setupHorarioGrid() {
    const tbody = document.getElementById('horarioTableBody');
    const horasClase = getHorasClase();
    
    tbody.innerHTML = '';
    horasClase.forEach(hora => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="bg-light">${hora}</td>
            <td class="horario-cell" data-day="1" data-hour="${hora}"></td>
            <td class="horario-cell" data-day="2" data-hour="${hora}"></td>
            <td class="horario-cell" data-day="3" data-hour="${hora}"></td>
            <td class="horario-cell" data-day="4" data-hour="${hora}"></td>
            <td class="horario-cell" data-day="5" data-hour="${hora}"></td>
        `;
        tbody.appendChild(tr);
    });

    // Agregar event listeners a las celdas
    document.querySelectorAll('.horario-cell').forEach(cell => {
        cell.addEventListener('click', () => openAsignarClaseModal(cell));
    });
}

// Retorna las horas de clase
function getHorasClase() {
    return [
        '08:00 - 08:45',
        '08:45 - 09:30',
        '09:50 - 10:35',
        '10:35 - 11:20',
        '11:30 - 12:15',
        '12:15 - 13:00',
        '14:00 - 14:45',
        '14:45 - 15:30',
        '15:40 - 16:25',
        '16:25 - 17:10'
    ];
}

// Carga el horario de un curso específico
async function loadHorario() {
    const cursoId = document.getElementById('horarioCursoSelect').value;
    if (!cursoId) return;

    try {
        const response = await fetch(`/api/cursos/${cursoId}/horario/`);
        const horario = await response.json();
        displayHorario(horario);
    } catch (error) {
        console.error('Error cargando horario:', error);
    }
}

// Muestra el horario en la grilla
function displayHorario(horario) {
    // Limpiar horario actual
    document.querySelectorAll('.horario-cell').forEach(cell => {
        cell.innerHTML = '';
        cell.style.backgroundColor = '';
        cell.classList.remove('has-class');
    });

    // Mostrar clases en el horario
    horario.forEach(clase => {
        const cell = document.querySelector(
            `.horario-cell[data-day="${clase.dia}"][data-hour="${clase.hora}"]`
        );
        if (cell) {
            cell.innerHTML = `
                <div class="class-block" style="background-color: ${clase.color}">
                    <strong>${clase.asignatura}</strong><br>
                    <small>${clase.profesor}</small>
                </div>
            `;
            cell.classList.add('has-class');
        }
    });
}

// Abre el modal para asignar una clase
function openAsignarClaseModal(cell) {
    const modal = document.getElementById('asignarClaseModal');
    const day = cell.dataset.day;
    const hour = cell.dataset.hour;

    // Guardar información de la celda seleccionada
    document.getElementById('selectedDay').value = day;
    document.getElementById('selectedHour').value = hour;

    // Si ya hay una clase asignada, cargar sus datos
    if (cell.classList.contains('has-class')) {
        loadClaseData(cell);
        document.getElementById('btnEliminarClase').style.display = 'block';
    } else {
        document.getElementById('asignarClaseForm').reset();
        document.getElementById('btnEliminarClase').style.display = 'none';
    }

    // Mostrar el modal
    new bootstrap.Modal(modal).show();
}

// Guarda una clase en el horario
async function guardarClase() {
    const form = document.getElementById('asignarClaseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const cursoId = document.getElementById('horarioCursoSelect').value;
    const data = {
        curso_id: cursoId,
        dia: document.getElementById('selectedDay').value,
        hora: document.getElementById('selectedHour').value,
        asignatura_id: document.getElementById('asignaturaSelect').value,
        profesor_id: document.getElementById('profesorSelect').value,
        color: document.getElementById('colorSelect').value
    };

    try {
        const response = await fetch('/api/horarios/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('asignarClaseModal')).hide();
            loadHorario();
            showAlert('Clase asignada exitosamente', 'success');
        } else {
            throw new Error('Error al asignar la clase');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al asignar la clase', 'danger');
    }
}

// Limpia todo el horario
async function limpiarHorario() {
    const cursoId = document.getElementById('horarioCursoSelect').value;
    if (!cursoId) return;

    if (!confirm('¿Está seguro de que desea limpiar todo el horario?')) return;

    try {
        const response = await fetch(`/api/cursos/${cursoId}/horario/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadHorario();
            showAlert('Horario limpiado exitosamente', 'success');
        } else {
            throw new Error('Error al limpiar el horario');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al limpiar el horario', 'danger');
    }
}

// Función de utilidad para mostrar alertas
function showAlert(message, type) {
    // Implementar sistema de alertas
} 
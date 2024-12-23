function generarHorario() {
    const tbody = document.getElementById('horarioTableBody');
    const horasClase = [
        { inicio: '08:00', fin: '08:45' },
        { inicio: '08:45', fin: '09:30' },
        { inicio: '09:45', fin: '10:30' },
        { inicio: '10:30', fin: '11:15' },
        { inicio: '11:30', fin: '12:15' },
        { inicio: '12:15', fin: '13:00' },
        { inicio: '14:00', fin: '14:45' },
        { inicio: '14:45', fin: '15:30' }
    ];

    tbody.innerHTML = '';
    horasClase.forEach((hora, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="hora-column bg-light">
                <small>${hora.inicio}<br>-<br>${hora.fin}</small>
            </td>
            <td class="celda-horario" data-day="1" data-hour="${index}"></td>
            <td class="celda-horario" data-day="2" data-hour="${index}"></td>
            <td class="celda-horario" data-day="3" data-hour="${index}"></td>
            <td class="celda-horario" data-day="4" data-hour="${index}"></td>
            <td class="celda-horario" data-day="5" data-hour="${index}"></td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalAsignarClase(cell) {
    const modal = new bootstrap.Modal(document.getElementById('asignarClaseModal'));
    const day = cell.dataset.day;
    const hour = cell.dataset.hour;
    
    document.getElementById('selectedDay').value = day;
    document.getElementById('selectedHour').value = hour;

    // Mostrar botón de eliminar si la celda ya tiene una clase asignada
    const btnEliminar = document.getElementById('btnEliminarClase');
    btnEliminar.style.display = cell.hasAttribute('data-class') ? 'block' : 'none';

    if (cell.hasAttribute('data-class')) {
        // Cargar datos existentes
        const classData = JSON.parse(cell.getAttribute('data-class'));
        document.getElementById('asignaturaSelect').value = classData.asignatura;
        document.getElementById('profesorSelect').value = classData.profesor;
        document.getElementById('colorSelect').value = classData.color;
    } else {
        document.getElementById('asignarClaseForm').reset();
    }

    modal.show();
}

function guardarClase() {
    const day = document.getElementById('selectedDay').value;
    const hour = document.getElementById('selectedHour').value;
    const asignatura = document.getElementById('asignaturaSelect').value;
    const profesor = document.getElementById('profesorSelect').value;
    const color = document.getElementById('colorSelect').value;

    if (!asignatura || !profesor) {
        alert('Por favor complete todos los campos');
        return;
    }

    const cell = document.querySelector(`td[data-day="${day}"][data-hour="${hour}"]`);
    const classData = {
        asignatura: asignatura,
        profesor: profesor,
        color: color
    };

    cell.setAttribute('data-class', JSON.stringify(classData));
    cell.style.backgroundColor = color;
    cell.style.color = getContrastColor(color);
    cell.innerHTML = `
        <strong>${document.getElementById('asignaturaSelect').options[asignaturaSelect.selectedIndex].text}</strong><br>
        <small>${document.getElementById('profesorSelect').options[profesorSelect.selectedIndex].text}</small>
    `;

    bootstrap.Modal.getInstance(document.getElementById('asignarClaseModal')).hide();
}

function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1,2), 16);
    const g = parseInt(hexcolor.substr(3,2), 16);
    const b = parseInt(hexcolor.substr(5,2), 16);
    
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

function limpiarHorario() {
    if (confirm('¿Está seguro de querer limpiar todo el horario?')) {
        document.querySelectorAll('.celda-horario').forEach(cell => {
            cell.removeAttribute('data-class');
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.innerHTML = '';
        });
    }
}

function guardarHorario() {
    const curso = document.getElementById('horarioCursoSelect').value;
    if (!curso) {
        alert('Por favor seleccione un curso');
        return;
    }

    const horario = [];
    document.querySelectorAll('.celda-horario').forEach(cell => {
        if (cell.hasAttribute('data-class')) {
            horario.push({
                day: cell.dataset.day,
                hour: cell.dataset.hour,
                classData: JSON.parse(cell.getAttribute('data-class'))
            });
        }
    });

    // Aquí irá la lógica para guardar en el backend
    console.log('Horario a guardar:', horario);
    alert('Horario guardado correctamente');
}

// Inicializar el horario cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    generarHorario();

    // Event listener para celdas del horario
    document.getElementById('horarioTableBody').addEventListener('click', function(e) {
        const cell = e.target.closest('td');
        if (cell && !cell.classList.contains('hora-column')) {
            abrirModalAsignarClase(cell);
        }
    });
}); 
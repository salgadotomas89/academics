document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos cuando se abre el modal
    $('#nuevoCursoModal').on('show.bs.modal', function() {
        cargarDatosIniciales();
    });

    // Event listeners para los selects dependientes
    document.querySelector('select[name="modalidad"]').addEventListener('change', cargarNiveles);
    document.querySelector('select[name="nivel"]').addEventListener('change', cargarGrados);
});

function cargarDatosIniciales() {
    // Cargar año escolar
    const currentYear = new Date().getFullYear();
    document.querySelector('input[name="ano_escolar"]').value = currentYear;
    
    // Cargar RBD desde el backend
    fetch('/cursos/obtener-rbd/')
        .then(response => response.json())
        .then(data => {
            document.querySelector('input[name="rbd"]').value = data.rbd;
        })
        .catch(error => {
            console.error('Error al cargar RBD:', error);
        });

    // Cargar modalidades
    fetch('/cursos/obtener-modalidades/')
        .then(response => response.json())
        .then(data => {
            const selectModalidad = document.querySelector('select[name="modalidad"]');
            selectModalidad.innerHTML = '<option value="">Seleccionar...</option>';
            data.modalidades.forEach(modalidad => {
                const option = document.createElement('option');
                option.value = modalidad.id;
                option.textContent = modalidad.nombre;
                selectModalidad.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar modalidades:', error);
        });

    // Cargar jornadas
    fetch('/cursos/obtener-jornadas/')
        .then(response => response.json())
        .then(data => {
            const selectJornada = document.querySelector('select[name="jornada"]');
            selectJornada.innerHTML = '<option value="">Seleccionar...</option>';
            data.jornadas.forEach(jornada => {
                const option = document.createElement('option');
                option.value = jornada.id;
                option.textContent = jornada.nombre;
                selectJornada.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar jornadas:', error);
        });
}

function cargarNiveles() {
    const modalidad = document.querySelector('select[name="modalidad"]').value;
    if (!modalidad) return;
    
    fetch(`/cursos/obtener-niveles/?modalidad=${modalidad}`)
        .then(response => response.json())
        .then(data => {
            const selectNivel = document.querySelector('select[name="nivel"]');
            selectNivel.innerHTML = '<option value="">Seleccionar...</option>';
            data.niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.id;
                option.textContent = nivel.nombre;
                selectNivel.appendChild(option);
            });
            // Limpiar grados cuando cambia el nivel
            document.querySelector('select[name="grado"]').innerHTML = '<option value="">Seleccionar...</option>';
        })
        .catch(error => {
            console.error('Error al cargar niveles:', error);
        });
}

function cargarGrados() {
    const nivel = document.querySelector('select[name="nivel"]').value;
    if (!nivel) return;
    
    fetch(`/cursos/obtener-grados/?nivel=${nivel}`)
        .then(response => response.json())
        .then(data => {
            const selectGrado = document.querySelector('select[name="grado"]');
            selectGrado.innerHTML = '<option value="">Seleccionar...</option>';
            data.grados.forEach(grado => {
                const option = document.createElement('option');
                option.value = grado.id;
                option.textContent = grado.nombre;
                selectGrado.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar grados:', error);
        });
}

function guardarNuevoCurso() {
    const form = document.getElementById('nuevoCursoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    fetch('/cursos/crear/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            $('#nuevoCursoModal').modal('hide');
            // Recargar lista de cursos o actualizar tabla
            alert('Curso creado exitosamente');
        } else {
            alert(data.error || 'Error al crear el curso');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al crear el curso');
    });
} 
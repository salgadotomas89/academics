document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos cuando se abre el modal
    $('#nuevoCursoModal').on('show.bs.modal', function() {
        cargarDatosIniciales();
    });

    // Event listeners para los selects dependientes
    document.querySelector('select[name="modalidad"]').addEventListener('change', cargarNiveles);
    document.querySelector('select[name="jornada"]').addEventListener('change', cargarNiveles);
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
    const selectModalidad = document.querySelector('select[name="modalidad"]');
    selectModalidad.innerHTML = '<option value="">Seleccionar...</option>';
    const modalidades = [
        { id: 1, nombre: 'Regular' },
        { id: 2, nombre: 'Especial' },
        { id: 3, nombre: 'Adulto' }
    ];
    modalidades.forEach(modalidad => {
        const option = document.createElement('option');
        option.value = modalidad.id;
        option.textContent = modalidad.nombre;
        selectModalidad.appendChild(option);
    });
    
    // Seleccionar Regular por defecto
    selectModalidad.value = 1;

    // Cargar jornadas
    const selectJornada = document.querySelector('select[name="jornada"]');
    selectJornada.innerHTML = '<option value="">Seleccionar...</option>';
    const jornadas = [
        { id: 1, nombre: 'Jornada Mañana' },
        { id: 2, nombre: 'Jornada Tarde' },
        { id: 3, nombre: 'Jornada Completa' },
        { id: 4, nombre: 'Jornada Vespertina' }
    ];
    jornadas.forEach(jornada => {
        const option = document.createElement('option');
        option.value = jornada.id;
        option.textContent = jornada.nombre;
        selectJornada.appendChild(option);
    });
    
    // Seleccionar Jornada Completa por defecto
    selectJornada.value = 3;

    // Cargar niveles iniciales basados en la modalidad por defecto (Regular)
    cargarNiveles();
}

function cargarNiveles() {
    const modalidad = document.querySelector('select[name="modalidad"]').value;
    const jornada = document.querySelector('select[name="jornada"]').value;
    if (!modalidad || !jornada) return;
    
    const selectNivel = document.querySelector('select[name="nivel"]');
    selectNivel.innerHTML = '<option value="">Seleccionar...</option>';
    
    // Definir todos los niveles disponibles
    const niveles = [
        { id: '01', nombre: 'Educación Parvularia' },
        { id: '02', nombre: 'Enseñanza Básica Niños' },
        { id: '03', nombre: 'Educación Básica Adultos' },
        { id: '04', nombre: 'Educación Especial' },
        { id: '05', nombre: 'Enseñanza Media Humanístico Científica Jóvenes' },
        { id: '06', nombre: 'Educación Media Humanístico Científica Adultos' },
        { id: '07', nombre: 'Enseñanza Media Técnico Profesional y Artística, Jóvenes' },
        { id: '08', nombre: 'Educación Media Técnico Profesional y Artística, Adultos' }
    ];

    // Filtrar niveles según la modalidad y jornada
    let nivelesPermitidos = [];
    
    if (modalidad === '1') { // Regular
        if (jornada === '3') { // Jornada Completa
            nivelesPermitidos = niveles.filter(n => ['01', '02', '05', '07'].includes(n.id));
        } else if (jornada === '1' || jornada === '2') { // Mañana o Tarde
            nivelesPermitidos = niveles.filter(n => ['01', '02'].includes(n.id));
        }
    } else if (modalidad === '2') { // Especial
        if (jornada === '3') { // Jornada Completa
            nivelesPermitidos = niveles.filter(n => ['04'].includes(n.id));
        }
    } else if (modalidad === '3') { // Adulto
        if (jornada === '4') { // Vespertina
            nivelesPermitidos = niveles.filter(n => ['03', '06', '08'].includes(n.id));
        }
    }

    // Agregar los niveles filtrados al select
    nivelesPermitidos.forEach(nivel => {
        const option = document.createElement('option');
        option.value = nivel.id;
        option.textContent = `(${nivel.id}) ${nivel.nombre}`;
        selectNivel.appendChild(option);
    });

    // Seleccionar Enseñanza Básica Niños por defecto si está disponible
    if (nivelesPermitidos.some(n => n.id === '02')) {
        selectNivel.value = '02';
        // Cargar los grados correspondientes
        cargarGrados();
    } else {
        // Limpiar grados si no hay nivel seleccionado
        document.querySelector('select[name="grado"]').innerHTML = '<option value="">Seleccionar...</option>';
    }
}

function cargarGrados() {
    const nivel = document.querySelector('select[name="nivel"]').value;
    if (!nivel) return;
    
    const selectGrado = document.querySelector('select[name="grado"]');
    selectGrado.innerHTML = '<option value="">Seleccionar...</option>';

    // Definir los grados según el nivel
    let grados = [];
    
    switch(nivel) {
        case '01': // Educación Parvularia
            grados = [
                { id: 1, nombre: 'Pre-Kinder' },
                { id: 2, nombre: 'Kinder' }
            ];
            break;
        case '02': // Enseñanza Básica Niños
            grados = [
                { id: 1, nombre: '1º Básico' },
                { id: 2, nombre: '2º Básico' },
                { id: 3, nombre: '3º Básico' },
                { id: 4, nombre: '4º Básico' },
                { id: 5, nombre: '5º Básico' },
                { id: 6, nombre: '6º Básico' },
                { id: 7, nombre: '7º Básico' },
                { id: 8, nombre: '8º Básico' }
            ];
            break;
        case '03': // Educación Básica Adultos
            grados = [
                { id: 1, nombre: 'Nivel 1 (1º a 4º)' },
                { id: 2, nombre: 'Nivel 2 (5º a 6º)' },
                { id: 3, nombre: 'Nivel 3 (7º a 8º)' }
            ];
            break;
        case '04': // Educación Especial
            grados = [
                { id: 1, nombre: 'Nivel Básico 1' },
                { id: 2, nombre: 'Nivel Básico 2' },
                { id: 3, nombre: 'Nivel Básico 3' },
                { id: 4, nombre: 'Nivel Básico 4' }
            ];
            break;
        case '05': // Media HC Jóvenes
        case '07': // Media TP Jóvenes
            grados = [
                { id: 1, nombre: '1º Medio' },
                { id: 2, nombre: '2º Medio' },
                { id: 3, nombre: '3º Medio' },
                { id: 4, nombre: '4º Medio' }
            ];
            break;
        case '06': // Media HC Adultos
        case '08': // Media TP Adultos
            grados = [
                { id: 1, nombre: 'Nivel 1 (1º y 2º)' },
                { id: 2, nombre: 'Nivel 2 (3º y 4º)' }
            ];
            break;
    }

    // Agregar los grados al select
    grados.forEach(grado => {
        const option = document.createElement('option');
        option.value = grado.id;
        option.textContent = grado.nombre;
        selectGrado.appendChild(option);
    });
}

function guardarNuevoCurso() {
    const form = document.getElementById('nuevoCursoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    // Asegurarnos de que los IDs se envíen correctamente
    const modalidad = document.querySelector('select[name="modalidad"]').value;
    const jornada = document.querySelector('select[name="jornada"]').value;
    const nivel = document.querySelector('select[name="nivel"]').value;
    const grado = document.querySelector('select[name="grado"]').value;
    const letra = document.querySelector('input[name="letra"]').value;

    formData.set('modalidad', modalidad);
    formData.set('jornada', jornada);
    formData.set('nivel', nivel);
    formData.set('grado', grado);
    formData.set('letra', letra);
    
    fetch('/cursos/crear/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
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
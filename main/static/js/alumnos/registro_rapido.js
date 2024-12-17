document.addEventListener('DOMContentLoaded', function() {
    const nacionalidadSelect = document.getElementById('nacionalidadSelect');
    const tipoDocumentoContainer = document.getElementById('tipoDocumentoContainer');
    const tipoDocumentoSelect = document.getElementById('tipoDocumentoSelect');
    const runContainer = document.getElementById('runContainer');
    const ipeContainer = document.getElementById('ipeContainer');
    const runInput = document.getElementById('runInput');
    const ipeInput = document.getElementById('ipeInput');

    // Inicializar con nacionalidad chilena y RUN
    if (nacionalidadSelect.value === '1') {
        tipoDocumentoContainer.style.display = 'block';
        tipoDocumentoSelect.value = 'run';
        runContainer.style.display = 'block';
        runInput.required = true;
        ipeInput.required = false;
    }

    nacionalidadSelect.addEventListener('change', function() {
        const nacionalidad = this.value;
        const ipeInfo = document.getElementById('ipeInfo');
        
        // Mostrar/ocultar contenedor de tipo de documento
        tipoDocumentoContainer.style.display = nacionalidad ? 'block' : 'none';
        
        // Mostrar/ocultar información de IPE y configurar campos
        if (nacionalidad === '1') { // Chilena
            ipeInfo.style.display = 'none';
            tipoDocumentoSelect.value = 'run';
            runContainer.style.display = 'block';
            runInput.required = true;
            ipeInput.required = false;
        } else if (nacionalidad !== '') { // Cualquier otra nacionalidad
            ipeInfo.style.display = 'block';
            tipoDocumentoSelect.value = '';
            runContainer.style.display = 'none';
            ipeContainer.style.display = 'none';
            runInput.required = false;
            ipeInput.required = false;
        }
    });

    tipoDocumentoSelect.addEventListener('change', function() {
        const tipoDoc = this.value;
        
        // Ocultar ambos contenedores
        runContainer.style.display = 'none';
        ipeContainer.style.display = 'none';
        runInput.required = false;
        ipeInput.required = false;

        // Mostrar el contenedor correspondiente
        if (tipoDoc === 'run') {
            runContainer.style.display = 'block';
            runInput.required = true;
        } else if (tipoDoc === 'ipe') {
            ipeContainer.style.display = 'block';
            ipeInput.required = true;
        }
    });
});

function guardarRegistroRapido() {
    const form = document.getElementById('registroRapidoForm');
    
    // Validar campos del alumno (requeridos)
    const alumnoTab = document.getElementById('alumno-data');
    const alumnoInputs = alumnoTab.querySelectorAll('input[required], select[required]');
    let isValid = true;

    alumnoInputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            input.classList.add('is-invalid');
        }
    });

    if (!isValid) {
        // Mostrar tab de alumno si hay errores
        const alumnoTabTrigger = document.getElementById('alumno-tab');
        const tab = new bootstrap.Tab(alumnoTabTrigger);
        tab.show();
        return;
    }

    // Validar campos del apoderado (opcionales pero si se llenan deben ser válidos)
    const apoderadoTab = document.getElementById('apoderado-data');
    const apoderadoInputs = apoderadoTab.querySelectorAll('input:not([type="checkbox"]), select');
    let apoderadoValido = true;
    let hayDatosApoderado = false;

    apoderadoInputs.forEach(input => {
        if (input.value) {
            hayDatosApoderado = true;
            if (!input.checkValidity()) {
                apoderadoValido = false;
                input.classList.add('is-invalid');
            }
        }
    });

    if (!apoderadoValido) {
        // Mostrar tab de apoderado si hay errores
        const apoderadoTabTrigger = document.getElementById('apoderado-tab');
        const tab = new bootstrap.Tab(apoderadoTabTrigger);
        tab.show();
        return;
    }

    const formData = new FormData(form);
    
    // Si no hay datos de apoderado, eliminar esos campos del formData
    if (!hayDatosApoderado) {
        for (let key of Array.from(formData.keys())) {
            if (key.startsWith('apoderado_')) {
                formData.delete(key);
            }
        }
    }

    fetch('/api/alumnos/registro-rapido/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('registroRapidoModal'));
            modal.hide();
            mostrarNotificacion('Alumno registrado exitosamente', 'success');
            cargarAlumnos();
            form.reset();
            form.classList.remove('was-validated');
        } else {
            mostrarNotificacion(data.message || 'Error al registrar alumno', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al procesar la solicitud', 'error');
    });
}

// Función auxiliar para obtener el token CSRF
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
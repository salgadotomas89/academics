document.addEventListener('DOMContentLoaded', function() {
    initRegistroRapido();
});

function initRegistroRapido() {
    // Inicializar los selectores y campos
    const nacionalidadSelect = document.getElementById('nacionalidadSelect');
    const tipoDocumentoContainer = document.getElementById('tipoDocumentoContainer');
    const tipoDocumentoSelect = document.getElementById('tipoDocumentoSelect');
    const runContainer = document.getElementById('runContainer');
    const ipeContainer = document.getElementById('ipeContainer');
    const ipeInfo = document.getElementById('ipeInfo');

    // Evento para cambio de nacionalidad
    nacionalidadSelect.addEventListener('change', function() {
        tipoDocumentoContainer.style.display = this.value ? 'block' : 'none';
        if (this.value === '1') { // Chilena
            tipoDocumentoSelect.value = 'run';
            mostrarCampoIdentificacion('run');
        } else {
            tipoDocumentoSelect.value = '';
            ocultarCamposIdentificacion();
        }
    });

    // Evento para cambio de tipo de documento
    tipoDocumentoSelect.addEventListener('change', function() {
        mostrarCampoIdentificacion(this.value);
    });

    // Trigger inicial para nacionalidad chilena
    nacionalidadSelect.dispatchEvent(new Event('change'));
}

function mostrarCampoIdentificacion(tipo) {
    const runContainer = document.getElementById('runContainer');
    const ipeContainer = document.getElementById('ipeContainer');
    const ipeInfo = document.getElementById('ipeInfo');

    if (tipo === 'run') {
        runContainer.style.display = 'block';
        ipeContainer.style.display = 'none';
        ipeInfo.style.display = 'none';
    } else if (tipo === 'ipe') {
        runContainer.style.display = 'none';
        ipeContainer.style.display = 'block';
        ipeInfo.style.display = 'block';
    }
}

function ocultarCamposIdentificacion() {
    document.getElementById('runContainer').style.display = 'none';
    document.getElementById('ipeContainer').style.display = 'none';
    document.getElementById('ipeInfo').style.display = 'none';
}

function validarRUN(run) {
    // Implementar validación de RUN chileno
    return true; // Implementar lógica real de validación
}

function guardarRegistroRapido() {
    const form = document.getElementById('registroRapidoForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Realizar la petición AJAX
    fetch('/alumnos/registro-rapido/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Alumno registrado correctamente',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                // Cerrar el modal y actualizar la lista de alumnos
                const modal = bootstrap.Modal.getInstance(document.getElementById('registroRapidoModal'));
                modal.hide();
                // Aquí deberías llamar a la función que actualiza la tabla de alumnos
                actualizarTablaAlumnos();
            });
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ocurrió un error al registrar el alumno',
            confirmButtonText: 'Aceptar'
        });
    });
}

function actualizarTablaAlumnos() {
    // Implementar la lógica para actualizar la tabla de alumnos
    // Esta función debería hacer una petición AJAX para obtener la lista actualizada
} 
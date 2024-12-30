// Función para cargar los cursos en el select
function cargarCursos() {
    fetch('/alumnos/obtener-cursos/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const selectCurso = document.querySelector('select[name="course_id"]');
                // Limpiar opciones existentes
                selectCurso.innerHTML = '<option value="">Seleccionar...</option>';
                
                // Agregar los nuevos cursos
                data.cursos.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.id;
                    option.textContent = curso.nombre;
                    selectCurso.appendChild(option);
                });
            } else {
                console.error('Error al cargar los cursos:', data.message);
                mostrarAlerta('error', 'Error al cargar los cursos');
            }
        })
        .catch(error => {
            console.error('Error al cargar los cursos:', error);
            mostrarAlerta('error', 'Error al cargar los cursos');
        });
}

// Función para mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insertar la alerta al principio del formulario
    const form = document.getElementById('registroRapidoForm');
    form.insertBefore(alertaDiv, form.firstChild);
    
    // Remover la alerta después de 5 segundos
    setTimeout(() => alertaDiv.remove(), 5000);
}

// Función para guardar el registro rápido
function guardarRegistroRapido() {
    console.log('guardarRegistroRapido');
    const form = document.getElementById('registroRapidoForm');
    
    // Verificar si el formulario es válido
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        console.log('formulario no valido');
        
        // Identificar campos inválidos
        const invalidInputs = form.querySelectorAll(':invalid');
        console.log('Campos inválidos:', invalidInputs.length);
        invalidInputs.forEach(input => {
            console.log('Campo inválido:', input.name, 'Valor:', input.value, 'Validación:', input.validationMessage);
        });
        
        return;
    }

    console.log('formulario valido');
    // Recoger todos los datos del formulario
    const formData = new FormData(form);
    const data = {};
    
    // Convertir FormData a objeto JSON y mostrar los datos
    formData.forEach((value, key) => {
        // Solo incluir campos que tengan valor
        if (value) {
            data[key] = value;
            console.log('Campo:', key, 'Valor:', value);
        }
    });
    
    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[onclick="guardarRegistroRapido()"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    submitButton.disabled = true;
    
    console.log('enviando datos al servidor');
    // Enviar los datos al servidor
    fetch('/alumnos/registro-rapido/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('respuesta del servidor', data);
        if (data.status === 'success') {
            // Mostrar mensaje de éxito
            mostrarAlerta('success', 'Alumno registrado exitosamente');
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registroRapidoModal'));
            modal.hide();
            
            // Limpiar el formulario
            form.reset();
            form.classList.remove('was-validated');
            
            // Recargar la tabla de alumnos si existe
            if (typeof cargarTablaAlumnos === 'function') {
                cargarTablaAlumnos();
            }
        } else {
            // Mostrar mensaje de error
            mostrarAlerta('error', data.message || 'Error al guardar el alumno');
        }
    })
    .catch(error => {
        console.error('Error al guardar:', error);
        mostrarAlerta('error', 'Error al guardar el alumno');
    })
    .finally(() => {
        // Restaurar el botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// Cargar los cursos cuando se abre el modal
document.getElementById('registroRapidoModal').addEventListener('show.bs.modal', function (event) {
    cargarCursos();
    
    // Limpiar el formulario y las validaciones
    const form = document.getElementById('registroRapidoForm');
    form.reset();
    form.classList.remove('was-validated');
    
    // Limpiar alertas previas
    form.querySelectorAll('.alert').forEach(alert => alert.remove());
});

// Manejar la selección de nacionalidad
document.getElementById('nacionalidadSelect').addEventListener('change', function() {
    const tipoDocumentoContainer = document.getElementById('tipoDocumentoContainer');
    const tipoDocumentoSelect = document.getElementById('tipoDocumentoSelect');
    const runContainer = document.getElementById('runContainer');
    const ipeContainer = document.getElementById('ipeContainer');
    const ipeInfo = document.getElementById('ipeInfo');
    
    if (this.value === '1') { // Chilena
        tipoDocumentoContainer.style.display = 'block';
        tipoDocumentoSelect.value = 'run';
        runContainer.style.display = 'block';
        ipeContainer.style.display = 'none';
        ipeInfo.style.display = 'none';
    } else if (this.value) { // Otra nacionalidad
        tipoDocumentoContainer.style.display = 'block';
        tipoDocumentoSelect.value = 'ipe';
        runContainer.style.display = 'none';
        ipeContainer.style.display = 'block';
        ipeInfo.style.display = 'block';
    } else { // No seleccionado
        tipoDocumentoContainer.style.display = 'none';
        runContainer.style.display = 'none';
        ipeContainer.style.display = 'none';
        ipeInfo.style.display = 'none';
    }
});

// Manejar el cambio de tipo de documento
document.getElementById('tipoDocumentoSelect').addEventListener('change', function() {
    const runContainer = document.getElementById('runContainer');
    const ipeContainer = document.getElementById('ipeContainer');
    const ipeInfo = document.getElementById('ipeInfo');
    
    if (this.value === 'run') {
        runContainer.style.display = 'block';
        ipeContainer.style.display = 'none';
        ipeInfo.style.display = 'none';
    } else if (this.value === 'ipe') {
        runContainer.style.display = 'none';
        ipeContainer.style.display = 'block';
        ipeInfo.style.display = 'block';
    }
}); 
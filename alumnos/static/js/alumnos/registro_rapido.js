// Función para cargar los cursos en el select
function cargarCursos() {
    const selectCurso = document.querySelector('select[name="course_id"]');
    // Limpiar opciones existentes
    selectCurso.innerHTML = '<option value="">Seleccionar...</option>';
    
    fetch('/alumnos/obtener-cursos/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
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

// Función para validar el RUN del alumno
function validarRunAlumno(run) {
    const input = document.querySelector('input[name="run"]');
    const feedbackElement = input.nextElementSibling;

    // Limpieza inicial del input
    let valor = run.toString()
                  .trim()
                  .replace(/[^\dkK]/g, '') // Eliminar todo excepto números y K
                  .toUpperCase();
    
    // Validaciones básicas
    if (!valor) {
        limpiarValidacionRun(input, feedbackElement);
        return false;
    }

    // Extraer cuerpo y dígito verificador
    const dv = valor.slice(-1);
    const cuerpo = valor.slice(0, -1);

    // Validar longitud del cuerpo (7 u 8 dígitos)
    if (!/^\d+$/.test(cuerpo)) {
        mostrarErrorRun(input, feedbackElement, 'El RUN debe contener solo números');
        return false;
    }

    // Validar longitud total
    if (cuerpo.length < 7 || cuerpo.length > 8) {
        mostrarErrorRun(input, feedbackElement, 'El RUN debe tener entre 7 y 8 dígitos más el dígito verificador');
        return false;
    }

    // Validar dígito verificador
    if (!/[\dK]/.test(dv)) {
        mostrarErrorRun(input, feedbackElement, 'El dígito verificador debe ser un número o K');
        return false;
    }

    // Convertir a número y validar rango
    const rutNumero = parseInt(cuerpo, 10);
    if (rutNumero < 1000000) {
        mostrarErrorRun(input, feedbackElement, 'El RUN ingresado es demasiado bajo');
        return false;
    }
    if (rutNumero > 50000000) {
        mostrarErrorRun(input, feedbackElement, 'El RUN ingresado es demasiado alto');
        return false;
    }

    // Calcular dígito verificador esperado
    const dvEsperado = calcularDV(rutNumero);
    
    // Validar dígito verificador
    if (dv !== dvEsperado) {
        mostrarErrorRun(input, feedbackElement, 'El dígito verificador no es válido');
        return false;
    }

    // Formatear RUN
    const runFormateado = formatearRUN(cuerpo + dv);
    input.value = runFormateado;

    // RUN válido
    marcarRunValido(input, feedbackElement);
    return true;
}

// Función para validar el RUN del apoderado
function validarRunApoderado(run) {
    const input = document.querySelector('input[name="apoderado_run"]');
    const feedbackElement = input.nextElementSibling;

    if (!run) {
        limpiarValidacionRun(input, feedbackElement);
        return true; // El RUN del apoderado es opcional
    }

    // Usar la misma lógica de validación que para el alumno
    let valor = run.toString()
                  .trim()
                  .replace(/[^\dkK]/g, '')
                  .toUpperCase();
    
    const dv = valor.slice(-1);
    const cuerpo = valor.slice(0, -1);

    if (!/^\d+$/.test(cuerpo)) {
        mostrarErrorRun(input, feedbackElement, 'El RUN debe contener solo números');
        return false;
    }

    if (cuerpo.length < 7 || cuerpo.length > 8) {
        mostrarErrorRun(input, feedbackElement, 'El RUN debe tener entre 7 y 8 dígitos más el dígito verificador');
        return false;
    }

    if (!/[\dK]/.test(dv)) {
        mostrarErrorRun(input, feedbackElement, 'El dígito verificador debe ser un número o K');
        return false;
    }

    const rutNumero = parseInt(cuerpo, 10);
    if (rutNumero < 1000000 || rutNumero > 50000000) {
        mostrarErrorRun(input, feedbackElement, 'El RUN ingresado no está en el rango válido');
        return false;
    }

    const dvEsperado = calcularDV(rutNumero);
    if (dv !== dvEsperado) {
        mostrarErrorRun(input, feedbackElement, 'El dígito verificador no es válido');
        return false;
    }

    const runFormateado = formatearRUN(cuerpo + dv);
    input.value = runFormateado;
    marcarRunValido(input, feedbackElement);
    return true;
}

// Funciones auxiliares para la validación del RUN
function calcularDV(rutNumero) {
    const rutString = rutNumero.toString();
    let suma = 0;
    let multiplicador = 2;

    // Recorrer dígitos de derecha a izquierda
    for (let i = rutString.length - 1; i >= 0; i--) {
        suma += parseInt(rutString.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvEsperado = 11 - resto;

    if (dvEsperado === 11) return '0';
    if (dvEsperado === 10) return 'K';
    return dvEsperado.toString();
}

function formatearRUN(run) {
    let cuerpo = run.slice(0, -1);
    const dv = run.slice(-1);
    
    let formatted = '';
    if (cuerpo.length === 7) {
        formatted = cuerpo.substring(0, 1) + '.' +
                   cuerpo.substring(1, 4) + '.' +
                   cuerpo.substring(4);
    } else {
        formatted = cuerpo.substring(0, 2) + '.' +
                   cuerpo.substring(2, 5) + '.' +
                   cuerpo.substring(5);
    }
    
    return formatted + '-' + dv;
}

function mostrarErrorRun(input, feedbackElement, mensaje) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (feedbackElement) {
        feedbackElement.textContent = mensaje;
    }
}

function marcarRunValido(input, feedbackElement) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    if (feedbackElement) {
        feedbackElement.textContent = '';
    }
}

function limpiarValidacionRun(input, feedbackElement) {
    input.classList.remove('is-valid', 'is-invalid');
    if (feedbackElement) {
        feedbackElement.textContent = '';
    }
}

// Función para guardar el registro rápido
function guardarRegistroRapido() {
    const form = document.getElementById('registroRapidoForm');
    
    // Verificar si el formulario es válido
    if (!form.checkValidity()) {
        console.log('formulario no valido');
        form.classList.add('was-validated');
        return;
    }

    // Validar RUN según el tipo de documento seleccionado
    const tipoDocumento = document.querySelector('select[name="tipo_documento"]').value;
    if (tipoDocumento === 'run') {
        const runAlumno = document.querySelector('input[name="run"]').value;
        if (!validarRunAlumno(runAlumno)) {
            return;
        }
    }

    // Validar RUN del apoderado si está presente
    const runApoderado = document.querySelector('input[name="apoderado_run"]').value;
    if (runApoderado && !validarRunApoderado(runApoderado)) {
        return;
    }

    // Recoger datos del formulario
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (value.trim() !== '') {
            data[key] = value;
        }
    });
    
    // Mostrar indicador de carga
    const submitButton = document.querySelector('button[onclick="guardarRegistroRapido()"]');
    if (!submitButton) {
        console.error('No se encontró el botón de guardar');
        return;
    }
    
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    submitButton.disabled = true;

    console.log('enviando datos al servidor');
    
    // Enviar datos al servidor
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
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Alumno registrado exitosamente'
            });
            
            // Cerrar el modal y recargar la tabla
            const modal = bootstrap.Modal.getInstance(document.getElementById('registroRapidoModal'));
            modal.hide();
            cargarTablaAlumnos();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Error al registrar el alumno'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al registrar el alumno'
        });
    })
    .finally(() => {
        if (submitButton) {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar validación del RUN
    const runAlumnoInput = document.querySelector('input[name="run"]');
    if (runAlumnoInput) {
        runAlumnoInput.addEventListener('input', function(e) {
            validarRunAlumno(e.target.value);
        });
    }

    const runApoderadoInput = document.querySelector('input[name="apoderado_run"]');
    if (runApoderadoInput) {
        runApoderadoInput.addEventListener('input', function(e) {
            validarRunApoderado(e.target.value);
        });
    }

    // Cargar cursos al abrir el modal
    const modal = document.getElementById('registroRapidoModal');
    if (modal) {
        modal.addEventListener('show.bs.modal', function() {
            cargarCursos();
            // Limpiar el formulario
            const form = document.getElementById('registroRapidoForm');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
                // Limpiar validaciones de RUN
                const inputs = form.querySelectorAll('input[type="text"]');
                inputs.forEach(input => {
                    input.classList.remove('is-valid', 'is-invalid');
                    const feedbackElement = input.nextElementSibling;
                    if (feedbackElement) {
                        feedbackElement.textContent = '';
                    }
                });
            }
        });
    }
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
// Función para manejar el cambio de nacionalidad
function handleNacionalidadChange() {
    const nacionalidadSelect = document.querySelector('select[name="ref_country_id"]');
    const tipoDocumentoContainer = document.getElementById('tipoDocumentoContainer');
    const tipoDocumentoSelect = document.querySelector('select[name="tipo_documento"]');
    const ipeInput = document.querySelector('input[name="ipe"]');
    const runInput = document.querySelector('input[name="run"]');

    if (!nacionalidadSelect || !ipeInput || !runInput || !tipoDocumentoContainer || !tipoDocumentoSelect) {
        console.log('No se encontraron los elementos necesarios');
        return;
    }

    function updateFields(nacionalidad, tipoDoc) {
        console.log('Actualizando campos - Nacionalidad:', nacionalidad, 'Tipo Doc:', tipoDoc);
        
        if (nacionalidad === '2') { // Extranjero
            tipoDocumentoContainer.style.display = 'block';
            tipoDocumentoSelect.setAttribute('required', 'required');
            
            if (tipoDoc === 'ipe') {
                // Mostrar IPE, ocultar RUN
                ipeInput.removeAttribute('disabled');
                ipeInput.setAttribute('required', 'required');
                runInput.setAttribute('disabled', 'disabled');
                runInput.removeAttribute('required');
                runInput.value = '';
            } else if (tipoDoc === 'run') {
                // Mostrar RUN, ocultar IPE
                runInput.removeAttribute('disabled');
                runInput.setAttribute('required', 'required');
                ipeInput.setAttribute('disabled', 'disabled');
                ipeInput.removeAttribute('required');
                ipeInput.value = '';
            }
        } else if (nacionalidad === '1') { // Chileno
            // Ocultar selector de tipo de documento
            tipoDocumentoContainer.style.display = 'none';
            tipoDocumentoSelect.removeAttribute('required');
            tipoDocumentoSelect.value = '';
            
            // Mostrar solo RUN
            runInput.removeAttribute('disabled');
            runInput.setAttribute('required', 'required');
            ipeInput.setAttribute('disabled', 'disabled');
            ipeInput.removeAttribute('required');
            ipeInput.value = '';
        } else {
            // Caso default (ninguna selección)
            tipoDocumentoContainer.style.display = 'none';
            tipoDocumentoSelect.removeAttribute('required');
            runInput.setAttribute('disabled', 'disabled');
            ipeInput.setAttribute('disabled', 'disabled');
        }
    }

    // Manejar cambio de nacionalidad
    nacionalidadSelect.addEventListener('change', function() {
        console.log('Cambió la nacionalidad a:', this.value);
        updateFields(this.value, tipoDocumentoSelect.value);
    });

    // Manejar cambio de tipo de documento
    tipoDocumentoSelect.addEventListener('change', function() {
        console.log('Cambió el tipo de documento a:', this.value);
        updateFields(nacionalidadSelect.value, this.value);
    });

    // Verificar estado inicial
    updateFields(nacionalidadSelect.value, tipoDocumentoSelect.value);
}

// Función para validar el formato del IPE
function validarIPE(ipe) {
    const ipeRegex = /^[0-9]{12}$/;
    return ipeRegex.test(ipe);
}

// Función para manejar la validación del input IPE
function setupIPEValidation() {
    const ipeInput = document.querySelector('input[name="ipe"]');
    if (!ipeInput) {
        console.log('No se encontró el input IPE');
        return;
    }

    ipeInput.addEventListener('input', function() {
        // Remover caracteres no numéricos
        this.value = this.value.replace(/[^0-9]/g, '');

        // Validar longitud y formato
        const isValid = validarIPE(this.value);
        
        if (this.value) {
            if (isValid) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        } else {
            this.classList.remove('is-valid', 'is-invalid');
        }
    });
}

// Función para inicializar todas las validaciones
function initIPEValidations() {
    console.log('Inicializando validaciones IPE');
    handleNacionalidadChange();
    setupIPEValidation();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initIPEValidations);

// Hacer las funciones disponibles globalmente
window.validarIPE = validarIPE;
window.handleNacionalidadChange = handleNacionalidadChange;
window.setupIPEValidation = setupIPEValidation; 
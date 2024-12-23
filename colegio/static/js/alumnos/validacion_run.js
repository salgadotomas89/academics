/**
 * Validación y formateo de RUN chileno
 * Reglas:
 * 1. Debe tener 7 u 8 dígitos más dígito verificador
 * 2. El dígito verificador puede ser número o 'K'
 * 3. Formato final: XX.XXX.XXX-X
 * 4. Rango válido: 1.000.000 a 50.000.000
 */

function validarRUN(run) {
    const input = document.getElementById('runInput');
    const feedbackElement = input.nextElementSibling;

    // 1. Limpieza inicial del input
    let valor = run.toString()
                  .trim()
                  .replace(/[^\dkK]/g, '') // Eliminar todo excepto números y K
                  .toUpperCase();
    
    // 2. Validaciones básicas
    if (!valor) {
        limpiarValidacion();
        return false;
    }

    // 3. Extraer cuerpo y dígito verificador
    const dv = valor.slice(-1);
    const cuerpo = valor.slice(0, -1);

    // 4. Validar longitud del cuerpo (7 u 8 dígitos)
    if (!/^\d+$/.test(cuerpo)) {
        mostrarError('El RUN debe contener solo números');
        return false;
    }

    // Validar longitud total
    if (cuerpo.length < 7 || cuerpo.length > 8) {
        mostrarError('El RUN debe tener entre 7 y 8 dígitos más el dígito verificador');
        return false;
    }

    // 5. Validar dígito verificador
    if (!/[\dK]/.test(dv)) {
        mostrarError('El dígito verificador debe ser un número o K');
        return false;
    }

    // 6. Convertir a número y validar rango
    const rutNumero = parseInt(cuerpo, 10);
    if (rutNumero < 1000000) {
        mostrarError('El RUN ingresado es demasiado bajo');
        return false;
    }
    if (rutNumero > 50000000) {
        mostrarError('El RUN ingresado es demasiado alto');
        return false;
    }

    // 7. Calcular dígito verificador esperado
    const dvEsperado = calcularDV(rutNumero);
    
    // 8. Validar dígito verificador
    if (dv !== dvEsperado) {
        mostrarError('El dígito verificador no es válido');
        return false;
    }

    // 9. Formatear RUN
    const runFormateado = formatearRUN(cuerpo + dv);
    input.value = runFormateado;

    // 10. RUN válido
    marcarValido();
    return true;
}

/**
 * Calcula el dígito verificador de un RUN
 * @param {number} rutNumero - Número del RUT sin DV
 * @returns {string} Dígito verificador (0-9 o K)
 */
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

/**
 * Formatea un RUN en el formato X.XXX.XXX-X o XX.XXX.XXX-X
 * @param {string} run - RUN sin formato
 * @returns {string} RUN formateado
 */
function formatearRUN(run) {
    let cuerpo = run.slice(0, -1);
    const dv = run.slice(-1);
    
    // Formatear con puntos y guión según la longitud
    let formatted = '';
    
    if (cuerpo.length === 7) {
        // Formato X.XXX.XXX para RUTs de 7 dígitos
        formatted = cuerpo.substring(0, 1) + '.' +
                   cuerpo.substring(1, 4) + '.' +
                   cuerpo.substring(4);
    } else {
        // Formato XX.XXX.XXX para RUTs de 8 dígitos
        formatted = cuerpo.substring(0, 2) + '.' +
                   cuerpo.substring(2, 5) + '.' +
                   cuerpo.substring(5);
    }
    
    return formatted + '-' + dv;
}

/**
 * Muestra un mensaje de error y marca el input como inválido
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
    const input = document.getElementById('runInput');
    const feedbackElement = input.nextElementSibling;
    
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    if (feedbackElement) {
        feedbackElement.textContent = mensaje;
    }
}

/**
 * Marca el input como válido y limpia mensajes de error
 */
function marcarValido() {
    const input = document.getElementById('runInput');
    const feedbackElement = input.nextElementSibling;
    
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    
    if (feedbackElement) {
        feedbackElement.textContent = '';
    }
}

/**
 * Limpia las clases de validación del input
 */
function limpiarValidacion() {
    const input = document.getElementById('runInput');
    const feedbackElement = input.nextElementSibling;
    
    input.classList.remove('is-valid', 'is-invalid');
    
    if (feedbackElement) {
        feedbackElement.textContent = '';
    }
}

// Agregar listener para validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const runInput = document.getElementById('runInput');
    if (runInput) {
        runInput.addEventListener('input', function(e) {
            validarRUN(e.target.value);
        });
        
        runInput.addEventListener('blur', function(e) {
            if (!e.target.value) {
                mostrarError('El RUN es obligatorio');
            }
        });
    }
}); 
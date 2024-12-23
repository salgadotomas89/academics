// Manejador de eventos cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeColegioConfig();
});

// Inicialización del módulo de configuración
function initializeColegioConfig() {
    // Cargar datos iniciales
    loadRegiones();
    loadDirectores();
    loadSostenedores();
    loadColegioData();
    loadConfigAcademica();

    // Event listeners para formularios
    setupFormListeners();
    setupLocationHandlers();
}

// Carga los datos del colegio
async function loadColegioData() {
    try {
        const response = await fetch('/api/colegio/');
        const data = await response.json();
        fillColegioForms(data);
    } catch (error) {
        console.error('Error cargando datos del colegio:', error);
        showAlert('Error al cargar los datos del colegio', 'danger');
    }
}

// Carga los datos académicos
async function loadConfigAcademica() {
    try {
        const response = await fetch('/api/colegio/config-academica/');
        const data = await response.json();
        fillConfigAcademica(data);
    } catch (error) {
        console.error('Error cargando configuración académica:', error);
    }
}

// Llena los formularios con los datos del colegio
function fillColegioForms(data) {
    // Información básica
    const infoForm = document.getElementById('infoColegioForm');
    if (infoForm) {
        infoForm.rbd.value = data.rbd || '';
        infoForm.nombre_colegio.value = data.nombre || '';
        infoForm.nombre_corto.value = data.nombre_corto || '';
        infoForm.tipo_establecimiento.value = data.tipo_establecimiento || '';
        
        // Modalidades de enseñanza (multiple select)
        const modalidades = data.modalidades || [];
        Array.from(infoForm.modalidad.options).forEach(option => {
            option.selected = modalidades.includes(option.value);
        });

        infoForm.director.value = data.director_id || '';
        infoForm.sostenedor.value = data.sostenedor_id || '';
    }

    // Ubicación y contacto
    const ubicacionForm = document.getElementById('ubicacionContactoForm');
    if (ubicacionForm) {
        ubicacionForm.region.value = data.region_id || '';
        loadComunas(data.region_id).then(() => {
            ubicacionForm.comuna.value = data.comuna_id || '';
        });
        ubicacionForm.direccion.value = data.direccion || '';
        ubicacionForm.latitud.value = data.latitud || '';
        ubicacionForm.longitud.value = data.longitud || '';
        ubicacionForm.telefono.value = data.telefono || '';
        ubicacionForm.email.value = data.email || '';
        ubicacionForm.sitio_web.value = data.sitio_web || '';
        ubicacionForm.facebook.value = data.facebook_url || '';
        ubicacionForm.instagram.value = data.instagram_url || '';
        ubicacionForm.twitter.value = data.twitter_url || '';
    }

    // Configuración operativa
    const configForm = document.getElementById('configOperativaForm');
    if (configForm) {
        configForm.jornada_manana.checked = data.jornada_manana || false;
        configForm.jornada_tarde.checked = data.jornada_tarde || false;
        configForm.jornada_completa.checked = data.jornada_completa || false;
        configForm.regimen.value = data.regimen || '';
        configForm.estado.value = data.estado || 'ACTIVO';
    }
}

// Llena la configuración académica
function fillConfigAcademica(data) {
    // Marcar niveles y grados activos
    data.niveles?.forEach(nivel => {
        const nivelCheck = document.querySelector(`input[name="nivel_${nivel.codigo}"]`);
        if (nivelCheck) {
            nivelCheck.checked = nivel.activo;
            nivel.grados?.forEach(grado => {
                const gradoCheck = document.querySelector(`input[name="${nivel.codigo}_grados"][value="${grado}"]`);
                if (gradoCheck) gradoCheck.checked = true;
            });
        }
    });

    // Llenar tabla de salas
    const tablaSalas = document.getElementById('tablaSalas').querySelector('tbody');
    tablaSalas.innerHTML = '';
    data.salas?.forEach(sala => {
        tablaSalas.appendChild(createSalaRow(sala));
    });

    // Llenar tabla de especialidades TP
    const tablaEspecialidades = document.getElementById('tablaEspecialidades').querySelector('tbody');
    tablaEspecialidades.innerHTML = '';
    data.especialidades?.forEach(esp => {
        tablaEspecialidades.appendChild(createEspecialidadRow(esp));
    });
}

// Crea una fila para la tabla de salas
function createSalaRow(sala) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${sala.numero}</td>
        <td>${sala.capacidad}</td>
        <td>${sala.tipo}</td>
        <td>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" ${sala.activa ? 'checked' : ''}>
            </div>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editarSala(${sala.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="eliminarSala(${sala.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return tr;
}

// Crea una fila para la tabla de especialidades
function createEspecialidadRow(esp) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${esp.rama}</td>
        <td>${esp.sector}</td>
        <td>${esp.nombre}</td>
        <td>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" ${esp.activa ? 'checked' : ''}>
            </div>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editarEspecialidad(${esp.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="eliminarEspecialidad(${esp.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return tr;
}

// Configura los event listeners de los formularios
function setupFormListeners() {
    // Información básica
    const infoForm = document.getElementById('infoColegioForm');
    infoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveColegioInfo(new FormData(infoForm));
    });

    // Ubicación y contacto
    const ubicacionForm = document.getElementById('ubicacionContactoForm');
    ubicacionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveColegioUbicacion(new FormData(ubicacionForm));
    });

    // Configuración operativa
    const configForm = document.getElementById('configOperativaForm');
    configForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveColegioConfig(new FormData(configForm));
    });
}

// Manejo de ubicación
function setupLocationHandlers() {
    const regionSelect = document.querySelector('select[name="region"]');
    regionSelect?.addEventListener('change', function() {
        loadComunas(this.value);
    });
}

// Carga las regiones
async function loadRegiones() {
    try {
        const response = await fetch('/api/regiones/');
        const regiones = await response.json();
        updateSelectOptions('region', regiones);
    } catch (error) {
        console.error('Error cargando regiones:', error);
    }
}

// Carga las comunas según la región seleccionada
async function loadComunas(regionId) {
    if (!regionId) return;
    try {
        const response = await fetch(`/api/comunas/${regionId}/`);
        const comunas = await response.json();
        updateSelectOptions('comuna', comunas);
    } catch (error) {
        console.error('Error cargando comunas:', error);
    }
}

// Carga la lista de directores disponibles
async function loadDirectores() {
    try {
        const response = await fetch('/api/directores/');
        const directores = await response.json();
        updateSelectOptions('director', directores);
    } catch (error) {
        console.error('Error cargando directores:', error);
    }
}

// Carga la lista de sostenedores
async function loadSostenedores() {
    try {
        const response = await fetch('/api/sostenedores/');
        const sostenedores = await response.json();
        updateSelectOptions('sostenedor', sostenedores);
    } catch (error) {
        console.error('Error cargando sostenedores:', error);
    }
}

// Guarda la información básica del colegio
async function saveColegioInfo(formData) {
    try {
        const response = await fetch('/api/colegio/info/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
            showAlert('Información guardada exitosamente', 'success');
        } else {
            throw new Error('Error al guardar la información');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar la información', 'danger');
    }
}

// Guarda la información de ubicación y contacto
async function saveColegioUbicacion(formData) {
    try {
        const response = await fetch('/api/colegio/ubicacion/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
            showAlert('Ubicación y contacto guardados exitosamente', 'success');
        } else {
            throw new Error('Error al guardar la ubicación y contacto');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar la ubicación y contacto', 'danger');
    }
}

// Guarda la configuración operativa
async function saveColegioConfig(formData) {
    try {
        const response = await fetch('/api/colegio/config/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (response.ok) {
            showAlert('Configuración guardada exitosamente', 'success');
        } else {
            throw new Error('Error al guardar la configuración');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar la configuración', 'danger');
    }
}

// Funciones de utilidad
function updateSelectOptions(selectName, options) {
    const select = document.querySelector(`select[name="${selectName}"]`);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Seleccionar...</option>';
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.id;
        optElement.textContent = option.nombre;
        select.appendChild(optElement);
    });
    if (currentValue) select.value = currentValue;
}

function showAlert(message, type) {
    // Implementar sistema de alertas
} 
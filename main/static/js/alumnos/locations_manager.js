class LocationManager {
    constructor() {
        this.locations = null;
        this.initialized = false;
    }

    async loadLocations() {
        if (this.initialized) return;
        
        try {
            const response = await fetch('/static/data/chile_locations.json');
            if (!response.ok) {
                throw new Error('Error al cargar los datos de ubicaciones');
            }
            
            this.locations = await response.json();
            this.initializeSelects();
            this.initialized = true;
        } catch (error) {
            console.error('Error cargando ubicaciones:', error);
            // Mostrar mensaje de error al usuario
            alert('Error al cargar las ubicaciones. Por favor, recargue la página.');
        }
    }

    initializeSelects() {
        const regionSelect = document.getElementById('regionSelect');
        const comunaSelect = document.getElementById('ref_county_id');
        const ciudadInput = document.getElementById('city');

        // Limpiar selects
        regionSelect.innerHTML = '<option value="">Seleccionar...</option>';
        comunaSelect.innerHTML = '<option value="">Seleccionar...</option>';
        ciudadInput.value = '';

        // Poblar select de regiones
        this.locations.regiones.forEach(region => {
            const option = new Option(region.nombre, region.id);
            regionSelect.add(option);
        });

        // Eventos
        regionSelect.addEventListener('change', (e) => {
            comunaSelect.innerHTML = '<option value="">Seleccionar...</option>';
            ciudadInput.value = '';
            
            if (e.target.value) {
                const regionId = parseInt(e.target.value);
                this.updateComunas(regionId);
            }
        });

        comunaSelect.addEventListener('change', (e) => {
            ciudadInput.value = '';
            
            if (e.target.value && regionSelect.value) {
                const regionId = parseInt(regionSelect.value);
                const comunaId = parseInt(e.target.value);
                this.updateCiudad(regionId, comunaId);
            }
        });
    }

    updateComunas(regionId) {
        const comunaSelect = document.getElementById('ref_county_id');
        const region = this.locations.regiones.find(r => r.id === regionId);
        
        if (region) {
            region.comunas.forEach(comuna => {
                const option = new Option(comuna.nombre, comuna.id);
                comunaSelect.add(option);
            });
        }
    }

    updateCiudad(regionId, comunaId) {
        const ciudadInput = document.getElementById('city');
        const region = this.locations.regiones.find(r => r.id === regionId);
        
        if (region) {
            const comuna = region.comunas.find(c => c.id === comunaId);
            if (comuna) {
                ciudadInput.value = comuna.ciudad;
            }
        }
    }
}

// Crear una única instancia del LocationManager
const locationManager = new LocationManager();

// Inicializar cuando se abre el modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('nuevoAlumnoModal');
    modal.addEventListener('show.bs.modal', () => {
        locationManager.loadLocations();
    });
}); 
const ETNIAS = [
    { id: 1, nombre: "Mapuche" },
    { id: 2, nombre: "Aymara" },
    { id: 3, nombre: "Rapa Nui" },
    { id: 4, nombre: "Lican Antai" },
    { id: 5, nombre: "Quechua" },
    { id: 6, nombre: "Colla" },
    { id: 7, nombre: "Diaguita" },
    { id: 8, nombre: "Kawésqar" },
    { id: 9, nombre: "Yagán" },
    { id: 10, nombre: "Chango" },
    { id: 11, nombre: "No aplica" }
];

function cargarEtnias() {
    const selectEtnia = document.querySelector('select[name="ref_tribal_affiliation_id"]');
    if (!selectEtnia) return;

    // Mantener la opción por defecto
    selectEtnia.innerHTML = '<option value="">Seleccionar...</option>';
    
    // Agregar las opciones de etnias
    ETNIAS.forEach(etnia => {
        const option = document.createElement('option');
        option.value = etnia.id;
        option.textContent = etnia.nombre;
        selectEtnia.appendChild(option);
    });
}

// Cargar las etnias cuando el documento esté listo
document.addEventListener('DOMContentLoaded', cargarEtnias);

// Cargar las etnias cuando el modal se abra (por si es dinámico)
document.addEventListener('shown.bs.modal', function (event) {
    if (event.target.id === 'nuevoAlumnoModal') {
        cargarEtnias();
    }
}); 
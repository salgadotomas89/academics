document.addEventListener('DOMContentLoaded', function() {
    const apoderadosContainer = document.getElementById('apoderadosContainer');
    const btnAgregarApoderado = document.getElementById('btnAgregarApoderado');
    
    // Agregar primer apoderado al cargar
    if (apoderadosContainer.children.length === 0) {
        const template = apoderadosContainer.querySelector('.apoderado-form');
        if (!template) {
            agregarNuevoApoderado();
        }
    }

    // Evento para agregar nuevo apoderado
    btnAgregarApoderado.addEventListener('click', agregarNuevoApoderado);

    // Delegación de eventos para el botón eliminar
    apoderadosContainer.addEventListener('click', function(e) {
        if (e.target.closest('.eliminar-apoderado')) {
            const apoderadoForm = e.target.closest('.apoderado-form');
            if (apoderadosContainer.children.length > 1) {
                apoderadoForm.remove();
            } else {
                alert('Debe haber al menos un apoderado');
            }
        }
    });

    function agregarNuevoApoderado() {
        const template = apoderadosContainer.querySelector('.apoderado-form');
        const nuevoApoderado = template ? template.cloneNode(true) : null;
        
        if (nuevoApoderado) {
            // Limpiar valores
            nuevoApoderado.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(input => {
                input.value = '';
            });
            
            // Desmarcar checkboxes
            nuevoApoderado.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            apoderadosContainer.appendChild(nuevoApoderado);
            
            // Reinicializar tooltips si los hay
            if (typeof bootstrap !== 'undefined') {
                const tooltips = nuevoApoderado.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(element => {
                    new bootstrap.Tooltip(element);
                });
            }
        }
    }

    // Agregar validación para asegurar que al menos un apoderado esté autorizado para retiro
    function validarApoderados() {
        const forms = apoderadosContainer.querySelectorAll('.apoderado-form');
        let tieneAutorizado = false;
        let tienePrincipal = false;
        
        forms.forEach(form => {
            if (form.querySelector('[name="apoderado_authorized_pickup[]"]').checked) {
                tieneAutorizado = true;
            }
            if (form.querySelector('[name="apoderado_primary[]"]').checked) {
                tienePrincipal = true;
            }
        });
        
        if (!tieneAutorizado) {
            alert('Debe haber al menos un apoderado autorizado para retirar al estudiante');
            return false;
        }
        
        if (!tienePrincipal) {
            alert('Debe designar a un apoderado como principal');
            return false;
        }
        
        return true;
    }

    // Asegurar que solo un apoderado sea principal
    apoderadosContainer.addEventListener('change', function(e) {
        if (e.target.name === 'apoderado_primary[]' && e.target.checked) {
            const forms = apoderadosContainer.querySelectorAll('.apoderado-form');
            forms.forEach(form => {
                const checkbox = form.querySelector('[name="apoderado_primary[]"]');
                if (checkbox !== e.target) {
                    checkbox.checked = false;
                }
            });
        }
    });
}); 
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
            }
        })
        .catch(error => {
            console.error('Error al cargar los cursos:', error);
        });
}

// Cargar los cursos cuando se abre el modal
document.getElementById('registroRapidoModal').addEventListener('show.bs.modal', function (event) {
    cargarCursos();
});

// Función para guardar el registro rápido
function guardarRegistroRapido() {
    const form = document.getElementById('registroRapidoForm');
    
    // Verificar si el formulario es válido
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Recoger todos los datos del formulario
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
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
        if (data.status === 'success') {
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registroRapidoModal'));
            modal.hide();
            
            // Mostrar mensaje de éxito
            // Aquí puedes agregar tu código para mostrar una notificación de éxito
            
            // Recargar la tabla de alumnos si es necesario
            // cargarTablaAlumnos();
        } else {
            // Mostrar mensaje de error
            console.error('Error al guardar:', data.message);
        }
    })
    .catch(error => {
        console.error('Error al guardar:', error);
    });
} 
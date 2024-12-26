document.addEventListener('DOMContentLoaded', function() {
    // Cargar profesores cuando se abre el modal
    $('#nuevoCursoModal').on('show.bs.modal', cargarProfesores);
});

function cargarProfesores() {
    fetch('/cursos/obtener-profesores/')
        .then(response => response.json())
        .then(data => {
            const selectProfesor = document.querySelector('select[name="profesor_jefe"]');
            selectProfesor.innerHTML = '<option value="">Seleccionar...</option>';
            
            data.profesores.forEach(profesor => {
                const option = document.createElement('option');
                option.value = profesor.person_id;
                option.textContent = `${profesor.first_name} ${profesor.last_name}`;
                selectProfesor.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar profesores:', error);
            alert('Error al cargar la lista de profesores');
        });
} 
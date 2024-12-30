// Función para cargar la tabla de alumnos
function cargarTablaAlumnos() {
    const tbody = document.getElementById('alumnosTableBody');
    
    // Mostrar indicador de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </td>
        </tr>
    `;
    
    // Obtener los alumnos
    fetch('/alumnos/obtener-alumnos/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Limpiar la tabla
                tbody.innerHTML = '';
                
                // Agregar cada alumno a la tabla
                data.alumnos.forEach(alumno => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${alumno.identificador}</td>
                        <td>${alumno.nombre}</td>
                        <td>${alumno.apellido}</td>
                        <td>${alumno.email}</td>
                        <td>${alumno.curso}</td>
                        <td>${alumno.estado}</td>
                        <td>
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-primary" onclick="editarAlumno(${alumno.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger" onclick="eliminarAlumno(${alumno.id})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-info" onclick="verDetalles(${alumno.id})" title="Ver detalles">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Si no hay alumnos, mostrar mensaje
                if (data.alumnos.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center">No hay alumnos registrados</td>
                        </tr>
                    `;
                }
            } else {
                // Mostrar mensaje de error
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            Error al cargar los alumnos: ${data.message}
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">
                        Error al cargar los alumnos
                    </td>
                </tr>
            `;
        });
}

// Función para aplicar filtros
function aplicarFiltros() {
    const nombre = document.getElementById('searchNombre').value.toLowerCase();
    const grado = document.getElementById('filterGrado').value;
    const seccion = document.getElementById('filterSeccion').value;
    const estado = document.getElementById('filterEstado').value;
    
    const rows = document.querySelectorAll('#alumnosTableBody tr');
    
    rows.forEach(row => {
        const nombreText = row.cells[1].textContent.toLowerCase() + ' ' + row.cells[2].textContent.toLowerCase();
        const cursoText = row.cells[4].textContent.toLowerCase();
        const estadoText = row.cells[5].textContent.toLowerCase();
        
        const matchNombre = nombreText.includes(nombre);
        const matchGrado = !grado || cursoText.includes(grado);
        const matchSeccion = !seccion || cursoText.includes(seccion);
        const matchEstado = !estado || estadoText === estado.toLowerCase();
        
        row.style.display = (matchNombre && matchGrado && matchSeccion && matchEstado) ? '' : 'none';
    });
}

// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('searchNombre').value = '';
    document.getElementById('filterGrado').value = '';
    document.getElementById('filterSeccion').value = '';
    document.getElementById('filterEstado').value = '';
    
    const rows = document.querySelectorAll('#alumnosTableBody tr');
    rows.forEach(row => row.style.display = '');
}

// Cargar la tabla cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarTablaAlumnos();
}); 
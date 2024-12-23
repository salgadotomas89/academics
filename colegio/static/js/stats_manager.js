// Función para actualizar las estadísticas
function actualizarEstadisticas() {
    // Obtener el total de alumnos (ejemplo)
    const totalAlumnos = '325';
    
    // Actualizar todos los contadores
    document.getElementById('totalAlumnos').textContent = totalAlumnos;
    document.getElementById('sidebarTotalAlumnos').textContent = totalAlumnos;
    document.getElementById('asistenciaHoy').textContent = '92%';
    document.getElementById('totalCursos').textContent = '12';
    document.getElementById('promedioCurso').textContent = '27';
}

// Llamar a la función cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarEstadisticas();
    // Actualizar cada 5 minutos
    setInterval(actualizarEstadisticas, 300000);
}); 
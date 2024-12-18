document.addEventListener('DOMContentLoaded', function() {
    
    // Manejar el clic en el enlace de colegio
    document.getElementById('colegioLink').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // Mostrar la sección de colegio
        const colegioContent = document.getElementById('colegioContent');
        colegioContent.style.display = 'block';

        // Cargar el contenido desde la vista
        fetch('colegio/content/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                console.log('Contenido recibido:', html); // Para debug
                colegioContent.innerHTML = html;
            })
            .catch(error => {
                console.error('Error:', error);
                colegioContent.innerHTML = `<div class="alert alert-danger">Error al cargar el contenido: ${error}</div>`;
            });
    });
});
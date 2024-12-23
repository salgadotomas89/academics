document.addEventListener('DOMContentLoaded', function() {
    // Referencias a los elementos del menú
    const alumnosLink = document.getElementById('alumnosLink');
    const usuariosLink = document.getElementById('usuariosLink');
    const cursosLink = document.getElementById('cursosLink');
    const libroClasesLink = document.getElementById('libroClasesLink');
    const colegioLink = document.getElementById('colegioLink');

    // Referencias a las secciones de contenido
    const defaultContent = document.getElementById('defaultContent');
    const alumnosContent = document.getElementById('alumnosContent');
    const usuariosContent = document.getElementById('usuariosContent');
    const cursosContent = document.getElementById('cursosContent');
    const libroClasesContent = document.getElementById('libroClasesContent');
    const colegioContent = document.getElementById('colegioContent');

    // Función para ocultar todas las secciones
    function hideAllSections() {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.style.display = 'none');
    }

    // Función para mostrar una sección específica
    function showSection(sectionId) {
        hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            // Guardar la sección actual en localStorage
            localStorage.setItem('currentSection', sectionId);
        }
    }

    // Event listeners para los links del menú
    alumnosLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('alumnosContent');
    });

    usuariosLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('usuariosContent');
    });

    cursosLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('cursosContent');
    });

    libroClasesLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('libroClasesContent');
    });

    colegioLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('colegioContent');
    });

    // Toggle del sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Cargar la última sección activa al cargar la página
    const lastActiveSection = localStorage.getItem('currentSection');
    if (lastActiveSection) {
        showSection(lastActiveSection);
    } else {
        // Si no hay sección guardada, mostrar el contenido por defecto
        showSection('defaultContent');
    }
}); 
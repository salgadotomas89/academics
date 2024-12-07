document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Initialize lightgallery for the photo gallery
    lightGallery(document.getElementById('lightgallery'), {
        plugins: [],
        speed: 500
    });

    // Add animation to sections when they come into view
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Manejo del submenú
    var dropdownToggle = document.querySelector('.dropdown-toggle');
    var dropdownMenu = document.querySelector('.dropdown-menu');
    var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

    if (isTouch) {
        // En dispositivos táctiles, alternar el menú al hacer clic
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    } else {
        // En dispositivos no táctiles, mostrar/ocultar el menú al pasar el mouse
        dropdownToggle.parentElement.addEventListener('mouseenter', function() {
            dropdownMenu.classList.add('show');
        });
        dropdownToggle.parentElement.addEventListener('mouseleave', function() {
            dropdownMenu.classList.remove('show');
        });
    }
});
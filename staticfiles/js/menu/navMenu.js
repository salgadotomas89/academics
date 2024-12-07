document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.navbar-nav:not(.ml-auto) .nav-item');
    const menuBackground = document.querySelector('#menu-background-morph');
    const contactItem = document.querySelector('.navbar-nav .contact-item');
    const contactBackground = document.querySelector('#contact-background-morph');

    function handleHover(item, background) {
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 992) {
                // Efecto horizontal para pantallas grandes
                const itemRect = this.getBoundingClientRect();
                const navRect = this.closest('.navbar-nav').getBoundingClientRect();

                background.style.width = `${itemRect.width}px`;
                background.style.height = '70%';
                background.style.left = `${itemRect.left - navRect.left}px`;
                background.style.top = '50%';
                background.style.transform = 'translateY(-50%)';
            } else {
                // Efecto vertical para pantallas pequeñas
                const itemRect = this.getBoundingClientRect();
                const navRect = this.closest('.navbar-nav').getBoundingClientRect();

                background.style.width = '100%';
                background.style.height = `${itemRect.height}px`;
                background.style.left = '0';
                background.style.top = `${itemRect.top - navRect.top}px`;
                background.style.transform = 'none';
            }
            background.style.opacity = '1';
        });

        item.addEventListener('mouseleave', function() {
            background.style.opacity = '0';
        });
    }

    function resetBackgrounds() {
        menuBackground.style.opacity = '0';
        if (contactBackground) contactBackground.style.opacity = '0';
    }

    menuItems.forEach(item => handleHover(item, menuBackground));
    if (contactItem && contactBackground) {
        handleHover(contactItem, contactBackground);
    }

    // Reiniciar los fondos cuando se cambia el tamaño de la ventana
    window.addEventListener('resize', resetBackgrounds);
});
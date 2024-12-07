document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.image-selector');
    const image = document.getElementById('comunicados-image');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            buttons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Cambiar la imagen
            const newImage = this.dataset.image;
            image.src = `/static/images/${newImage}`;
        });
    });
    
    // Activar el primer botón por defecto
    buttons[0].classList.add('active');
}); 
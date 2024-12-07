document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in-element');

    function checkFade() {
        const triggerBottom = window.innerHeight * 0.8;

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.add('is-visible');
            }
        });
    }

    // Initial check
    checkFade();

    // Check on scroll
    window.addEventListener('scroll', checkFade);
});
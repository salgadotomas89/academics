class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            fadeElementSelector: '.fade-in-element',
            visibleClass: 'is-visible',
            triggerRatio: 0.8,
            ...options
        };
        this.fadeElements = document.querySelectorAll(this.options.fadeElementSelector);
        this.init();
    }

    init() {
        this.checkFade();
        window.addEventListener('scroll', () => this.checkFade());
    }

    checkFade() {
        const triggerBottom = window.innerHeight * this.options.triggerRatio;

        this.fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.add(this.options.visibleClass);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ScrollReveal();
});
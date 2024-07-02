class AnimatedHeader {
    constructor(options = {}) {
        this.options = {
            headerSelector: '.animated-header',
            wordSelector: '.word',
            ...options
        };
        this.header = document.querySelector(this.options.headerSelector);
        this.words = this.header.querySelectorAll(this.options.wordSelector);
        this.init();
    }

    init() {
        this.animateWords();
    }

    animateWords() {
        this.words.forEach((word, wordIndex) => {
            const letters = word.textContent.split('');
            word.textContent = '';
            letters.forEach((letter, letterIndex) => {
                const span = document.createElement('span');
                span.textContent = letter;
                word.appendChild(span);
                setTimeout(() => {
                    span.style.transform = 'translateY(0)';
                }, (wordIndex * 200) + (letterIndex * 50));
            });
        });

        setTimeout(() => {
            this.header.classList.add('animation-complete');
        }, this.words.length * 200 + 1000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new AnimatedHeader();
});
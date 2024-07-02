class WordChanger {
    constructor(options = {}) {
        this.options = {
            elementSelector: '.changing-word',
            words: ['enfocadas', 'creadas', 'diseñadas', 'desarrolladas', 'optimizadas', 'personalizadas'],
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#C3B1E1'],
            interval: 2000,
            ...options
        };
        this.element = document.querySelector(this.options.elementSelector);
        this.currentIndex = 0;
        if (this.element) {
            this.init();
        }
    }

    init() {
        this.changeWord();
    }

    changeWord() {
        this.currentIndex = (this.currentIndex + 1) % this.options.words.length;
        this.element.style.color = this.options.colors[this.currentIndex];
        this.element.textContent = this.options.words[this.currentIndex];
        setTimeout(() => this.changeWord(), this.options.interval);
    }
}

// No iniciamos automáticamente, permitimos que se inicie donde sea necesario
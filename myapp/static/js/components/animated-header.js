class AnimatedHeader {
    constructor(options = {}) {
        this.options = {
            headerSelector: '.animated-header',
            wordSelector: '.word',
            changingWordSelector: '.changing-word',
            alternativeWords: ['enfocadas', 'creadas', 'diseñadas', 'desarrolladas', 'optimizadas', 'personalizadas'],
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
            ...options
        };
        this.header = document.querySelector(this.options.headerSelector);
        this.words = this.header.querySelectorAll(this.options.wordSelector);
        this.changingWord = this.header.querySelector(this.options.changingWordSelector);
        this.currentWordIndex = 0;
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
            this.changeWord();
            this.header.classList.add('animation-complete');
        }, this.words.length * 200 + 1000);
    }

    changeWord() {
        this.currentWordIndex = (this.currentWordIndex + 1) % this.options.alternativeWords.length;
        this.changingWord.style.color = this.options.colors[this.currentWordIndex];
        this.changingWord.textContent = this.options.alternativeWords[this.currentWordIndex];
        setTimeout(() => this.changeWord(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new AnimatedHeader();
});
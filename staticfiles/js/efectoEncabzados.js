document.addEventListener('DOMContentLoaded', function() {
    const words = document.querySelectorAll('.word');
    const changingWord = document.querySelector('.changing-word');
    const alternativeWords = ['creadas', 'diseñadas', 'desarrolladas', 'optimizadas', 'personalizadas'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    let currentWordIndex = 0;

    // Animate words immediately on page load
    animateWords();

    function animateWords() {
        words.forEach((word, wordIndex) => {
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

        // Start changing words after all words have appeared
        setTimeout(changeWord, words.length * 200 + 1000);
    }

    function changeWord() {
        currentWordIndex = (currentWordIndex + 1) % alternativeWords.length;
        changingWord.style.color = colors[currentWordIndex];
        changingWord.textContent = alternativeWords[currentWordIndex];
        setTimeout(changeWord, 2000); // Change word every 2 seconds
    }
});
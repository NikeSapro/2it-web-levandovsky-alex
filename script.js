// Jednoduchá animace při scrollu
window.addEventListener('scroll', function() {
    const cards = document.querySelectorAll('.card');
    const scrollY = window.scrollY + window.innerHeight / 1.2;

    cards.forEach(card => {
        if(scrollY > card.offsetTop) {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }
    });
});
    
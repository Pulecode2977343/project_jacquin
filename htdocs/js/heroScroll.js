// Smooth scroll and hero fade-out effect
document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero-section');
    
    // Fade out hero on scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        
        if (scrollPosition > heroHeight * 0.3) {
            heroSection.classList.add('scrolled');
        } else {
            heroSection.classList.remove('scrolled');
        }
    });
});

/**
 * J.A.M 3D Tilt Effect
 * Replicates the Apple TV / refined holographic card effect.
 * Lightweight, zero-dependency.
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.bento-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', handleHover);
        card.addEventListener('mouseleave', resetCard);
    });

    function handleHover(e) {
        const card = this;
        const width = card.offsetWidth;
        const height = card.offsetHeight;
        
        // Get mouse position relative to card
        const rect = card.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate rotation (max +/- 15 deg)
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        // xPct is -0.5 (left) to 0.5 (right)
        // Rotate Y corresponds to horizontal movement (left/right tilts)
        // Rotate X corresponds to vertical movement (top/bottom tilts) - inverted sign
        const rotateY = xPct * 20; 
        const rotateX = yPct * -20; 

        // Update CSS variables for high performance transforms
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
        
        // Move sheen/glare effect
        // We map the mouse position to a background position %
        const sheenX = 50 + (xPct * 100);
        const sheenY = 50 + (yPct * 100);
        card.style.setProperty('--sheenX', `${sheenX}%`);
        card.style.setProperty('--sheenY', `${sheenY}%`);
    }

    function resetCard() {
        // Smoothly snap back to 0
        this.style.setProperty('--rotateX', '0deg');
        this.style.setProperty('--rotateY', '0deg');
        this.style.setProperty('--sheenX', '50%');
        this.style.setProperty('--sheenY', '50%');
    }
});

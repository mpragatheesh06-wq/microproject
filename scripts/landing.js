/* ===================================
   SMARTROUTE — LANDING PAGE SCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Particles generator
  const particleContainer = document.getElementById('bgParticles');
  if (particleContainer) {
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'bg-particle';
      const size = Math.random() * 4 + 2;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${Math.random() > 0.5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(124, 58, 237, 0.4)'};
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        box-shadow: 0 0 ${size * 2}px ${Math.random() > 0.5 ? '#EF4444' : '#7C3AED'};
        animation: floatParticle ${Math.random() * 10 + 10}s infinite ease-in-out ${Math.random() * 5}s;
      `;
      particleContainer.appendChild(particle);
    }
  }

  // Inject particle animation keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
      50% { transform: translateY(-80px) translateX(40px); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);

  // Navbar background change on scroll
  const mainNav = document.getElementById('mainNav');
  if (mainNav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }
    });
  }
});

const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
  menu.classList.toggle('open');
});

AOS.init({
  duration: 800,
  once: true,
  offset: 60,
});

// Hero reveal sequence for first impression
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.from('.eyebrow', { y: 18, opacity: 0, duration: 0.5 })
  .from('#hero-title', { y: 28, opacity: 0, duration: 0.7 }, '-=0.2')
  .from('.hero-sub', { y: 16, opacity: 0, duration: 0.55 }, '-=0.25')
  .from('.hero-cta-row .btn', { y: 14, opacity: 0, duration: 0.45, stagger: 0.08 }, '-=0.25')
  .from('.hero-card', { x: 26, opacity: 0, duration: 0.8 }, '-=0.55');

particlesJS('particles-bg', {
  particles: {
    number: { value: 55, density: { enable: true, value_area: 900 } },
    color: { value: ['#ffb703', '#2ec4b6', '#8ecae6'] },
    shape: { type: 'circle' },
    opacity: { value: 0.35 },
    size: { value: 3.2, random: true },
    line_linked: { enable: true, distance: 130, color: '#8ecae6', opacity: 0.2, width: 1 },
    move: { enable: true, speed: 1.3 }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' },
      resize: true
    },
    modes: {
      grab: { distance: 130, line_linked: { opacity: 0.35 } },
      push: { particles_nb: 3 }
    }
  },
  retina_detect: true
});

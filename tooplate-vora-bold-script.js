/*
Tooplate 2161 Vora Bold
https://www.tooplate.com/view/2161-vora-bold
Free HTML CSS Template
*/

/* CURSOR */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

(function loop() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button, .work__item, .service-row').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(2.2)';
    ring.style.borderColor = 'rgba(255,255,255,0.8)';
    dot.style.opacity = '0.3';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.borderColor = 'rgba(255,255,255,0.45)';
    dot.style.opacity = '1';
  });
});

/* SCROLL REVEAL */
const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 70);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

/* ACCORDION — services */
document.querySelectorAll('.service-row[data-svc]').forEach(row => {
  row.addEventListener('click', () => {
    const id    = row.dataset.svc;
    const panel = document.getElementById('svc-' + id);
    const isOpen = row.classList.contains('open');

    document.querySelectorAll('.service-row').forEach(r => r.classList.remove('open'));
    document.querySelectorAll('.service-panel').forEach(p => p.classList.remove('open'));

    if (!isOpen) {
      row.classList.add('open');
      panel.classList.add('open');
    }
  });
});

/* ACTIVE NAV */
const navLinks = document.querySelectorAll('.sidebar__nav a');
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

// ============================================================
//  main.js — Animations, reveal au scroll, formulaire de contact
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- ACTIVE NAV LINK on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"], .nav-links a[href="index.html#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));

  // --- REVEAL ON SCROLL ---
  const revealEls = document.querySelectorAll(
    '.activite-card, .stat-card, .actu-card, .apropos-text, .apropos-stats, .contact-info, .contact-form-wrap, .galerie-item, .inter-highlight'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // --- CONTACT FORM (mock submission) ---
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('form-notice');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;
      setTimeout(() => {
        notice.textContent = '✅ Message envoyé ! Nous vous répondrons sous 48h.';
        notice.style.color = 'var(--green-mid)';
        form.reset();
        btn.textContent = 'Envoyer le message';
        btn.disabled = false;
      }, 1200);
    });
  }
});

// ============================================================
//  layout.js — Injecte le header et le footer sur toutes les pages
// ============================================================

const NAV_HTML = `
<header class="site-header" id="site-header">
  <nav class="nav-container">
    <a href="index.html" class="nav-logo">
      <img src="images/logo_ufolep.png" alt="UFOLEP 86" />
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html#apropos">À propos</a></li>
      <li><a href="index.html#activites">Activités</a></li>
      <li><a href="index.html#interventions">Interventions</a></li>
      <li><a href="index.html#galerie">Galerie</a></li>
      <li class="nav-dropdown">
        <a href="#" class="nav-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
          Missions <span class="nav-chevron">▾</span>
        </a>
        <ul class="nav-dropdown-menu">
          <li><a href="rapport-activites.html"><span class="dm-icon">📊</span>Rapport d'activités</a></li>
          <li><a href="insertion-sport.html"><span class="dm-icon">🤝</span>Insertion par le sport</a></li>
          <li><a href="mission-locale.html"><span class="dm-icon">🌾</span>Mission locale &amp; rurale</a></li>
          <li><a href="pjj-milieu-carceral.html"><span class="dm-icon">⚖️</span>PJJ &amp; milieu carcéral</a></li>
          <li><a href="esport.html"><span class="dm-icon">🎮</span>Esport</a></li>
        </ul>
      </li>
      <li><a href="index.html#contact" class="nav-cta">Nous rejoindre</a></li>
    </ul>
  </nav>
</header>`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <img src="images/logo_ufolep.png" alt="UFOLEP 86" class="footer-logo" />
      <p>Tous les sports, autrement.<br />Vienne – Nouvelle-Aquitaine</p>
    </div>
    <nav class="footer-nav">
      <strong>Association</strong>
      <a href="index.html#apropos">À propos</a>
      <a href="index.html#activites">Activités</a>
      <a href="index.html#galerie">Galerie</a>
      <a href="index.html#contact">Contact</a>
    </nav>
    <nav class="footer-nav">
      <strong>Nos missions</strong>
      <a href="rapport-activites.html">Rapport d'activités</a>
      <a href="insertion-sport.html">Insertion par le sport</a>
      <a href="mission-locale.html">Mission locale &amp; rurale</a>
      <a href="pjj-milieu-carceral.html">PJJ &amp; milieu carcéral</a>
      <a href="esport.html">Esport</a>
    </nav>
    <div class="footer-copy">
      <p>© 2025 UFOLEP 86 · Tous droits réservés</p>
      <p>Fédération affiliée à la <a href="https://www.ufolep.org" target="_blank" rel="noopener">Ligue de l'Enseignement</a></p>
      <p style="margin-top:0.5rem;"><a href="admin/" style="opacity:0.5;">Espace administration</a></p>
    </div>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('site-header-placeholder');
  if (headerPlaceholder) headerPlaceholder.outerHTML = NAV_HTML;

  const footerPlaceholder = document.getElementById('site-footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.outerHTML = FOOTER_HTML;

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || href === './' + currentPage) {
      a.classList.add('active');
      a.closest('.nav-dropdown')?.querySelector('.nav-dropdown-toggle')?.classList.add('active');
    }
  });

  initNav();
});

function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  document.querySelectorAll('.nav-dropdown-toggle').forEach(t => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      const li = t.closest('.nav-dropdown');
      li.classList.toggle('open');
      t.setAttribute('aria-expanded', li.classList.contains('open'));
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
}

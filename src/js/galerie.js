// ============================================================
//  galerie.js — Portefeuille d'images dynamique + lightbox
// ============================================================

(function () {
  const API_BASE = (window.UFOLEP_CONFIG && window.UFOLEP_CONFIG.API_BASE) || '/api';
  let allPhotos = [];
  let currentFilter = 'Tout';
  let lightboxIndex = 0;
  let filteredPhotos = [];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function buildFilters(photos) {
    const cats = ['Tout', ...new Set(photos.map(p => p.categorie || 'Général'))];
    const wrap = document.getElementById('galerie-filters');
    if (!wrap) return;

    wrap.innerHTML = cats.map(cat => `
      <button class="galerie-filter-btn ${cat === currentFilter ? 'active' : ''}" data-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `).join('');

    wrap.querySelectorAll('.galerie-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.cat;
        wrap.querySelectorAll('.galerie-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const grid = document.getElementById('galerie-grid');
    if (!grid) return;

    filteredPhotos = currentFilter === 'Tout'
      ? allPhotos
      : allPhotos.filter(p => (p.categorie || 'Général') === currentFilter);

    if (!filteredPhotos.length) {
      grid.innerHTML = `<div class="galerie-empty">Aucune photo dans cette catégorie pour le moment.</div>`;
      return;
    }

    grid.innerHTML = filteredPhotos.map((photo, i) => {
      // Variation de tailles pour effet "masonry" léger (toutes les 7 photos environ)
      let sizeClass = '';
      if (i % 9 === 0) sizeClass = 'wide';
      else if (i % 9 === 4) sizeClass = 'tall';

      const src = photo.thumb_path || photo.image_path;
      return `
        <div class="galerie-item ${sizeClass}" data-index="${i}">
          <img src="${src}" alt="${escapeHtml(photo.titre || '')}" loading="lazy" />
          <div class="galerie-item-overlay"><span>${escapeHtml(photo.titre || '')}</span></div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.galerie-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(Number(el.dataset.index)));
    });
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    updateLightboxContent();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const photo = filteredPhotos[lightboxIndex];
    if (!photo) return;
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = photo.image_path;
    img.alt = photo.titre || '';
    caption.textContent = [photo.titre, photo.description].filter(Boolean).join(' — ');
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + filteredPhotos.length) % filteredPhotos.length;
    updateLightboxContent();
  }

  function initLightbox() {
    const mount = document.getElementById('lightbox-mount');
    if (!mount) return;

    mount.outerHTML = `
      <div class="lightbox" id="lightbox">
        <button class="lightbox-close" id="lightbox-close">✕</button>
        <button class="lightbox-prev" id="lightbox-prev">‹</button>
        <img id="lightbox-img" src="" alt="" />
        <button class="lightbox-next" id="lightbox-next">›</button>
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    `;

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightbox-next').addEventListener('click', () => navigateLightbox(1));
    document.getElementById('lightbox').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      const lb = document.getElementById('lightbox');
      if (!lb?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  async function loadGallery() {
    const grid = document.getElementById('galerie-grid');
    if (!grid) return;

    try {
      const res = await fetch(`${API_BASE}/galerie`);
      if (!res.ok) throw new Error('Erreur API');
      allPhotos = await res.json();
      filteredPhotos = allPhotos;
      buildFilters(allPhotos);
      renderGrid();
    } catch (err) {
      grid.innerHTML = `<div class="galerie-empty">Impossible de charger la galerie.<br/><span style="opacity:0.6;font-size:0.8rem;">Vérifiez que l'API est bien démarrée.</span></div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('galerie-grid')) return;
    initLightbox();
    loadGallery();
  });
})();

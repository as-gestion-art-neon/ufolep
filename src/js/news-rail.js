// ============================================================
//  news-rail.js — Bandeau d'actualités vertical sticky
//  Récupère les actualités depuis l'API et les injecte dans le DOM
// ============================================================

(function () {
  const API_BASE = (window.UFOLEP_CONFIG && window.UFOLEP_CONFIG.API_BASE) || '/api';

  const RAIL_HTML = `
    <aside class="news-rail" id="news-rail">
      <div class="news-rail-header">
        <h3><span class="news-rail-dot"></span>Actualités</h3>
        <button class="news-rail-toggle" id="news-rail-close" aria-label="Fermer">✕</button>
      </div>
      <div class="news-rail-list" id="news-rail-list">
        <div class="news-rail-empty">Chargement…</div>
      </div>
      <div class="news-rail-footer">
        <a href="#actualites">Voir toutes les actualités →</a>
      </div>
    </aside>
    <button class="news-rail-fab" id="news-rail-fab" aria-label="Ouvrir les actualités">
      📰
      <span class="fab-badge" id="news-rail-badge" style="display:none;"></span>
    </button>
  `;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function timeAgo(dateStr) {
    try {
      const date = new Date(dateStr.replace(' ', 'T') + 'Z');
      const diffMs = Date.now() - date.getTime();
      const diffH = Math.floor(diffMs / 3600000);
      if (diffH < 1) return "À l'instant";
      if (diffH < 24) return `Il y a ${diffH} h`;
      const diffJ = Math.floor(diffH / 24);
      if (diffJ < 30) return `Il y a ${diffJ} j`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  }

  function renderItem(item) {
    const thumb = item.image_path
      ? `<img src="${item.image_path}" alt="" loading="lazy" />`
      : '📰';
    return `
      <div class="news-rail-item">
        <div class="news-rail-thumb">${thumb}</div>
        <div class="news-rail-body">
          <span class="news-rail-tag">${escapeHtml(item.tag || 'Info')}</span>
          <h4>${escapeHtml(item.titre)}</h4>
          <time>${escapeHtml(item.date_evenement || timeAgo(item.created_at))}</time>
        </div>
      </div>
    `;
  }

  async function loadNews() {
    const list = document.getElementById('news-rail-list');
    const badge = document.getElementById('news-rail-badge');
    if (!list) return;

    try {
      const res = await fetch(`${API_BASE}/actualites`);
      if (!res.ok) throw new Error('Erreur API');
      const items = await res.json();

      if (!items.length) {
        list.innerHTML = `<div class="news-rail-empty">Aucune actualité pour le moment.</div>`;
        return;
      }

      list.innerHTML = items.map(renderItem).join('');

      if (badge) {
        badge.textContent = items.length > 9 ? '9+' : items.length;
        badge.style.display = 'flex';
      }

      // Mettre à jour aussi la section "actualités" pleine page si présente
      renderActuSection(items);
    } catch (err) {
      list.innerHTML = `<div class="news-rail-empty">Impossible de charger les actualités.<br/><span style="opacity:0.6;font-size:0.75rem;">Vérifiez que l'API est bien démarrée.</span></div>`;
    }
  }

  function renderActuSection(items) {
    const grid = document.getElementById('actu-grid-dynamic');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `<div class="actu-empty">Aucune actualité publiée pour le moment.</div>`;
      return;
    }

    grid.innerHTML = items.slice(0, 6).map((item, i) => `
      <article class="actu-card ${i === 0 ? 'featured' : ''}">
        ${item.image_path ? `<img src="${item.image_path}" alt="${escapeHtml(item.titre)}" loading="lazy" />` : ''}
        <div class="actu-tag">${escapeHtml(item.tag || 'Info')}</div>
        <time>${escapeHtml(item.date_evenement || timeAgo(item.created_at))}</time>
        <h3>${escapeHtml(item.titre)}</h3>
        <p>${escapeHtml(item.extrait || item.contenu || '')}</p>
      </article>
    `).join('');
  }

  function initToggle() {
    const rail = document.getElementById('news-rail');
    const fab = document.getElementById('news-rail-fab');
    const closeBtn = document.getElementById('news-rail-close');

    fab?.addEventListener('click', () => rail.classList.add('open'));
    closeBtn?.addEventListener('click', () => rail.classList.remove('open'));

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1280 && rail?.classList.contains('open')) {
        if (!e.target.closest('.news-rail') && !e.target.closest('.news-rail-fab')) {
          rail.classList.remove('open');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('news-rail-mount');
    if (!mount) return;

    mount.outerHTML = RAIL_HTML;
    document.body.classList.add('has-news-rail');

    initToggle();
    loadNews();
  });
})();

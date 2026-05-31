// UFOLEP SPA Router + UI helpers

const API = '/api';

function isLoggedIn() {
  return window.__loggedIn === true;
}

function setLoggedIn(val) {
  window.__loggedIn = val;
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Check session
  fetch(API + '/auth/session')
    .then(r => r.json())
    .then(data => {
      setLoggedIn(data.authenticated);
    })
    .catch(() => setLoggedIn(false));

  // SPA Router
  handleRoute();
  window.addEventListener('popstate', handleRoute);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.page-link');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('data-href');
      if (href) {
        window.history.pushState({}, '', href);
        handleRoute();
        // Close mobile nav
        if (nav) nav.classList.remove('open');
      }
    }
  });
});

async function handleRoute() {
  const path = window.location.pathname;
  const contentEl = document.getElementById('mainContent');
  if (!contentEl) return;

  // Auth guard
  if (path === '/admin' && !isLoggedIn()) {
    renderLogin(contentEl);
    return;
  }

  if (path === '/admin') {
    await renderAdmin(contentEl);
    return;
  }

  if (path === '/contact') {
    renderContact(contentEl);
    return;
  }

  // Sport detail pages
  const sportMatch = path.match(/^\/sport\/([\w-]+)$/);
  if (sportMatch) {
    await renderSportDetail(contentEl, sportMatch[1]);
    return;
  }

  renderHome(contentEl);
}

// ===== HOME PAGE =====
async function renderHome(el) {
  const sports = [
    { slug: 'vtt', name: 'VTT' },
    { slug: 'cyclosport', name: 'Cyclosport' },
    { slug: 'cyclo-cross', name: 'Cyclo-cross' },
    { slug: 'tir-a-l-arc', name: 'Tir à l\'arc' },
    { slug: 'moto', name: 'Moto' },
    { slug: 'football', name: 'Football' },
    { slug: 'ping-pong', name: 'Ping Pong' },
    { slug: 'ape', name: 'A.P.E' },
    { slug: 'yoga-qigong', name: 'Yoga & Qi-Gong' },
    { slug: 'volley-ball', name: 'Volley-Ball' },
    { slug: 'karting', name: 'Karting piste' },
    { slug: 'kart-cross', name: 'Kart cross' },
    { slug: 'e-sport', name: 'E-Sport' },
  ];

  let html = `
    <section class="hero">
      <h1>UFOLEP Beaulieu-sur-Layon</h1>
      <p>Faire du sport, c'est comme la famille : on s'implique pour le meilleur et pour le pire… mais on reste !</p>
    </section>

    <h2 class="sports-section-title">Nos Sports</h2>
    <div class="sports-grid">
  `;

  for (const s of sports) {
    html += `
      <a href="/sport/${s.slug}" class="page-link sport-card" data-href="/sport/${s.slug}">
        <div class="sport-logo-placeholder">${s.name.charAt(0)}</div>
        <h3>${s.name}</h3>
      </a>`;
  }

  html += `
    </div>

    <section class="content-section">
      <h2>L'UFOLEP, c'est quoi ?</h2>
      <p>L'UFOLEP (Union Française d'Œuvres Laïques d'Éducation Physique) est un mouvement sportif associatif qui promeut la pratique sportive pour tous, dans un esprit de convivialité, d'éducation et de solidarité.</p>
      <p>Nous croyons que le sport est un levier d'épanouissement personnel et de lien social. C'est pourquoi nous proposons une offre sportive diversifiée et ouverte à tous, quel que soit l'âge, le sexe ou le niveau.</p>
    </section>

    <section class="content-section">
      <h2>Engagés pour la mixité et l'inclusion</h2>
      <p>Nous militons et agissons pour une présence féminine équilibrée dans le sport. La mixité est un enrichissement pour tous et nous veillons à ce que chacune et chacun se sente accueilli·e et valorisé·e.</p>
    </section>

    <section class="content-section">
      <h2>La parole aux familles</h2>
      <p>Le témoignage des enfants et de leurs parents est très encourageant ! Une ambiance bienveillante, des activités adaptées et des moments de partage : c'est ce que vit Théo, l'un de nos jeunes adhérents, et sa famille.</p>
    </section>
  `;

  el.innerHTML = html;
  setActiveNav();
}

// ===== SPORT DETAIL PAGE =====
async function renderSportDetail(el, slug) {
  const sportData = SPORTS_DATA[slug];
  if (!sportData) {
    el.innerHTML = `<div class="content-section"><p>Sport non trouvé.</p><a href="/" class="page-link" data-href="/">← Retour à l'accueil</a></div>`;
    return;
  }

  let images = [];
  try {
    const res = await fetch(API + '/uploads');
    const all = await res.json();
    images = all.filter(img => img.sport === sportData.imageKey);
  } catch(e) {}

  let galleryHtml = '';
  if (images.length > 0) {
    galleryHtml = `<h3>Photos</h3><div class="image-gallery">`;
    for (const img of images) {
      galleryHtml += `<img src="/images/uploads/${img.sport}/${img.filename}" alt="${img.alt || ''}" onclick="openLightbox(this.src)">`;
    }
    galleryHtml += `</div>`;
  }

  let pdfHtml = '';
  if (sportData.pdf) {
    pdfHtml = `
      <h3>Documents</h3>
      <div class="pdf-viewer">
        <iframe src="${sportData.pdf}"></iframe>
      </div>
    `;
  }

  el.innerHTML = `
    <div class="sport-detail">
      <a href="/" class="page-link back-link" data-href="/">← Retour à l'accueil</a>
      <div class="sport-detail-header">
        <h1>${sportData.name}</h1>
      </div>
      <div class="sport-detail-body">
        ${sportData.content || ''}
        ${galleryHtml}
        ${pdfHtml}
      </div>
    </div>
    <div id="lightbox" class="lightbox" onclick="closeLightbox()"><img src=""></div>
  `;

  setActiveNav();
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.querySelector('img').src = src;
    lb.classList.add('active');
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
}

// ===== CONTACT PAGE =====
function renderContact(el) {
  el.innerHTML = `
    <div class="content-section">
      <h2>Contact</h2>
      <p>N'hésitez pas à nous contacter pour toute question ou inscription.</p>
      <div class="contact-grid">
        <div class="contact-info">
          <p><span class="icon">📍</span> Rue de Nantes, 49470 Beaulieu-sur-Layon</p>
          <p><span class="icon">📧</span> <a href="mailto:ufolep.beaulieu@gmail.com">ufolep.beaulieu@gmail.com</a></p>
          <p><span class="icon">📱</span> <a href="https://www.facebook.com/ufolep.candes" target="_blank">Facebook</a></p>
          <p><span class="icon">📞</span> 06 75 37 54 78</p>
        </div>
        <form class="contact-form" id="contactForm">
          <label for="cf-name">Nom</label>
          <input type="text" id="cf-name" name="name" required>
          <label for="cf-email">Email</label>
          <input type="email" id="cf-email" name="email" required>
          <label for="cf-message">Message</label>
          <textarea id="cf-message" name="message" required></textarea>
          <button type="submit" class="btn btn-primary">Envoyer</button>
          <div class="form-message" id="cf-msg"></div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('cf-msg');
    const body = {
      name: document.getElementById('cf-name').value,
      email: document.getElementById('cf-email').value,
      message: document.getElementById('cf-message').value,
    };
    try {
      const res = await fetch(API + '/uploads/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        msgEl.className = 'form-message success';
        msgEl.textContent = 'Message envoyé ! Merci.';
        e.target.reset();
      } else {
        msgEl.className = 'form-message error';
        msgEl.textContent = data.error || 'Erreur';
      }
    } catch(err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = 'Erreur de connexion';
    }
  });

  setActiveNav('/contact');
}

// ===== ADMIN =====
function renderLogin(el) {
  el.innerHTML = `
    <div class="admin-container">
      <form class="login-form" id="loginForm">
        <h2>Administration</h2>
        <input type="password" id="loginPassword" placeholder="Mot de passe" required>
        <button type="submit" class="btn btn-primary">Se connecter</button>
        <div class="form-message" id="loginMsg"></div>
      </form>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('loginMsg');
    const pw = document.getElementById('loginPassword').value;
    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.ok) {
        setLoggedIn(true);
        await renderAdmin(el);
      } else {
        msgEl.className = 'form-message error';
        msgEl.textContent = data.error || 'Erreur';
      }
    } catch(err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = 'Erreur de connexion';
    }
  });
}

async function renderAdmin(el) {
  if (!isLoggedIn()) {
    renderLogin(el);
    return;
  }

  let imagesList = '';
  try {
    const res = await fetch(API + '/uploads');
    const imgs = await res.json();
    for (const img of imgs) {
      imagesList += `
        <li>
          <img src="/images/uploads/${img.sport}/${img.filename}" class="img-preview">
          <div class="img-info">
            <div class="filename">${img.original_name}</div>
            <div class="meta">${img.sport} — ${new Date(img.created_at).toLocaleDateString('fr-FR')}</div>
          </div>
          <button class="btn btn-danger delete-img" data-id="${img.id}">Supprimer</button>
        </li>`;
    }
  } catch(e) {
    imagesList = '<li>Impossible de charger les images</li>';
  }

  let contactsList = '<li>Aucun message</li>';

  el.innerHTML = `
    <div class="admin-container">
      <div class="admin-section">
        <h2>Importer une image</h2>
        <form class="upload-form" id="uploadForm" enctype="multipart/form-data">
          <select name="sport" id="uploadSport" required>
            <option value="">-- Sport --</option>
            <option value="vtt">VTT</option>
            <option value="cyclosport">Cyclosport</option>
            <option value="cyclo-cross">Cyclo-cross</option>
            <option value="tir-a-l-arc">Tir à l'arc</option>
            <option value="moto">Moto</option>
            <option value="football">Football</option>
            <option value="ping-pong">Ping Pong</option>
            <option value="ape">A.P.E</option>
            <option value="yoga-qigong">Yoga & Qi-Gong</option>
            <option value="volley-ball">Volley-Ball</option>
            <option value="karting">Karting</option>
            <option value="kart-cross">Kart cross</option>
            <option value="e-sport">E-Sport</option>
          </select>
          <input type="text" name="alt" id="uploadAlt" placeholder="Texte alternatif (optionnel)">
          <input type="file" name="image" id="uploadFile" accept="image/*" required>
          <button type="submit" class="btn btn-primary">Importer</button>
          <div class="form-message" id="uploadMsg"></div>
        </form>
      </div>

      <div class="admin-section">
        <h2>Modifier le mot de passe</h2>
        <form class="upload-form" id="passwordForm">
          <input type="password" name="currentPassword" id="curPw" placeholder="Mot de passe actuel" required>
          <input type="password" name="newPassword" id="newPw" placeholder="Nouveau mot de passe" required>
          <button type="submit" class="btn btn-primary">Changer</button>
          <div class="form-message" id="pwMsg"></div>
        </form>
      </div>

      <div class="admin-section">
        <h2>Images importées (${imagesList.includes('Impossible') ? '' : 'Gérer')}</h2>
        <ul class="image-list" id="imageList">
          ${imagesList}
        </ul>
      </div>

      <div class="admin-section">
        <h2>Messages contact</h2>
        <ul class="contact-list" id="contactsList">
          ${contactsList}
        </ul>
      </div>

      <button class="btn btn-danger" id="logoutBtn">Se déconnecter</button>
    </div>
  `;

  // Upload handler
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('uploadMsg');
    const fd = new FormData(e.target);
    try {
      const res = await fetch(API + '/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        msgEl.className = 'form-message success';
        msgEl.textContent = 'Image importée !';
        e.target.reset();
        setTimeout(() => renderAdmin(el), 1000);
      } else {
        msgEl.className = 'form-message error';
        msgEl.textContent = data.error || 'Erreur';
      }
    } catch(err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = 'Erreur de connexion';
    }
  });

  // Delete handler
  document.getElementById('imageList').addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-img');
    if (!btn) return;
    if (!confirm('Supprimer cette image ?')) return;
    const id = btn.dataset.id;
    try {
      await fetch(API + '/uploads/' + id, { method: 'DELETE' });
      renderAdmin(el);
    } catch(err) {}
  });

  // Password change
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('pwMsg');
    try {
      const res = await fetch(API + '/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: document.getElementById('curPw').value,
          newPassword: document.getElementById('newPw').value,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        msgEl.className = 'form-message success';
        msgEl.textContent = 'Mot de passe changé !';
        e.target.reset();
      } else {
        msgEl.className = 'form-message error';
        msgEl.textContent = data.error;
      }
    } catch(err) {
      msgEl.className = 'form-message error';
      msgEl.textContent = 'Erreur';
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch(API + '/auth/logout', { method: 'POST' });
    setLoggedIn(false);
    window.location.href = '/';
  });

  setActiveNav('/admin');
}

// ===== ACTIVE NAV LINK =====
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.page-link').forEach(a => {
    a.classList.remove('active');
  });
}

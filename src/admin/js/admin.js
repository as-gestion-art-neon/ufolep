// ============================================================
//  admin.js — Logique de l'interface d'administration UFOLEP 86
// ============================================================

const API_BASE = (window.UFOLEP_CONFIG && window.UFOLEP_CONFIG.API_BASE) || '/api';
const TOKEN_KEY = 'ufolep86_admin_token';
const USER_KEY = 'ufolep86_admin_user';

let currentActu = null;
let currentPhotoId = null;

// ============================================================
//  Utilitaires
// ============================================================
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    showLogin();
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ============================================================
//  Authentification
// ============================================================
function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'grid';
  const username = localStorage.getItem(USER_KEY) || 'admin';
  document.getElementById('admin-username').textContent = username;
  loadActualites();
  loadGalerie();
}

async function checkAuth() {
  const token = getToken();
  if (!token) { showLogin(); return; }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showApp();
    } else {
      clearToken();
      showLogin();
    }
  } catch {
    showLogin();
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Identifiants incorrects');

    setToken(data.token);
    localStorage.setItem(USER_KEY, data.username);
    showApp();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  showLogin();
});

// ============================================================
//  Navigation entre vues
// ============================================================
document.querySelectorAll('.admin-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${view}`).style.display = 'block';
  });
});

// Fermeture des modales
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', () => closeModal(el.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ============================================================
//  ACTUALITÉS — Liste
// ============================================================
async function loadActualites() {
  const list = document.getElementById('actu-list');
  list.innerHTML = `<div class="admin-loading">Chargement…</div>`;

  try {
    const items = await apiFetch('/actualites/admin/all');
    if (!items.length) {
      list.innerHTML = `<div class="admin-empty">Aucune actualité. Cliquez sur "+ Nouvelle actualité" pour commencer.</div>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="admin-list-item" data-id="${item.id}">
        <div class="admin-list-thumb">
          ${item.image_path ? `<img src="${item.image_path}" alt="" />` : '📰'}
        </div>
        <div class="admin-list-body">
          <span class="admin-list-tag">${escapeHtml(item.tag || 'Info')}</span>
          <h4>${escapeHtml(item.titre)}</h4>
          <p>${escapeHtml(item.extrait || '')}</p>
        </div>
        <span class="admin-list-meta">${escapeHtml(item.date_evenement || '')}</span>
        <span class="status-badge ${item.publie ? 'published' : 'draft'}">${item.publie ? 'Publiée' : 'Brouillon'}</span>
        <div class="admin-list-actions">
          <button class="btn-icon edit-actu" data-id="${item.id}" title="Modifier">✏️</button>
          <button class="btn-icon delete-actu" data-id="${item.id}" title="Supprimer">🗑️</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.edit-actu').forEach(btn => {
      btn.addEventListener('click', () => editActualite(items.find(i => i.id == btn.dataset.id)));
    });
    list.querySelectorAll('.delete-actu').forEach(btn => {
      btn.addEventListener('click', () => deleteActualite(btn.dataset.id));
    });
  } catch (err) {
    list.innerHTML = `<div class="admin-empty">Erreur : ${escapeHtml(err.message)}</div>`;
  }
}

function resetActuForm() {
  currentActu = null;
  document.getElementById('actu-id').value = '';
  document.getElementById('actu-titre').value = '';
  document.getElementById('actu-tag').value = 'Info';
  document.getElementById('actu-date').value = '';
  document.getElementById('actu-extrait').value = '';
  document.getElementById('actu-contenu').value = '';
  document.getElementById('actu-image').value = '';
  document.getElementById('actu-image-preview').innerHTML = '';
  document.getElementById('actu-ordre').value = 0;
  document.getElementById('actu-publie').checked = true;
  document.getElementById('actu-form-error').textContent = '';
}

document.getElementById('btn-new-actu').addEventListener('click', () => {
  resetActuForm();
  document.getElementById('actu-modal-title').textContent = 'Nouvelle actualité';
  openModal('actu-modal');
});

function editActualite(item) {
  currentActu = item;
  document.getElementById('actu-modal-title').textContent = 'Modifier l\'actualité';
  document.getElementById('actu-id').value = item.id;
  document.getElementById('actu-titre').value = item.titre || '';
  document.getElementById('actu-tag').value = item.tag || 'Info';
  document.getElementById('actu-date').value = item.date_evenement || '';
  document.getElementById('actu-extrait').value = item.extrait || '';
  document.getElementById('actu-contenu').value = item.contenu || '';
  document.getElementById('actu-ordre').value = item.ordre || 0;
  document.getElementById('actu-publie').checked = !!item.publie;
  document.getElementById('actu-image').value = '';
  document.getElementById('actu-image-preview').innerHTML = item.image_path
    ? `<img src="${item.image_path}" alt="" />` : '';
  document.getElementById('actu-form-error').textContent = '';
  openModal('actu-modal');
}

document.getElementById('actu-image').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById('actu-image-preview');
  if (!file) { preview.innerHTML = ''; return; }
  const reader = new FileReader();
  reader.onload = (ev) => { preview.innerHTML = `<img src="${ev.target.result}" alt="" />`; };
  reader.readAsDataURL(file);
});

document.getElementById('actu-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('actu-form-error');
  errorEl.textContent = '';

  const id = document.getElementById('actu-id').value;
  const formData = new FormData();
  formData.append('titre', document.getElementById('actu-titre').value);
  formData.append('tag', document.getElementById('actu-tag').value || 'Info');
  formData.append('date_evenement', document.getElementById('actu-date').value);
  formData.append('extrait', document.getElementById('actu-extrait').value);
  formData.append('contenu', document.getElementById('actu-contenu').value);
  formData.append('ordre', document.getElementById('actu-ordre').value || 0);
  formData.append('publie', document.getElementById('actu-publie').checked ? '1' : '0');

  const imageFile = document.getElementById('actu-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  const submitBtn = document.getElementById('actu-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enregistrement…';

  try {
    await apiFetch(id ? `/actualites/${id}` : '/actualites', {
      method: id ? 'PUT' : 'POST',
      body: formData,
    });
    closeModal('actu-modal');
    showToast(id ? 'Actualité mise à jour ✅' : 'Actualité créée ✅');
    loadActualites();
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enregistrer';
  }
});

async function deleteActualite(id) {
  if (!confirm('Supprimer définitivement cette actualité ?')) return;
  try {
    await apiFetch(`/actualites/${id}`, { method: 'DELETE' });
    showToast('Actualité supprimée');
    loadActualites();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
//  GALERIE — Liste + upload
// ============================================================
let galerieCache = [];

async function loadGalerie() {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = `<div class="admin-loading">Chargement…</div>`;

  try {
    galerieCache = await apiFetch('/galerie/admin/all');
    if (!galerieCache.length) {
      grid.innerHTML = `<div class="admin-empty">Aucune photo. Glissez-déposez des images ou cliquez sur "+ Ajouter des photos".</div>`;
      return;
    }

    grid.innerHTML = galerieCache.map(photo => `
      <div class="admin-photo-item" data-id="${photo.id}">
        <img src="${photo.thumb_path || photo.image_path}" alt="${escapeHtml(photo.titre || '')}" loading="lazy" />
        <span class="admin-photo-status ${photo.publie ? '' : 'draft'}"></span>
        <div class="admin-photo-item-overlay"><span>${escapeHtml(photo.titre || 'Sans titre')}</span></div>
      </div>
    `).join('');

    grid.querySelectorAll('.admin-photo-item').forEach(el => {
      el.addEventListener('click', () => editPhoto(Number(el.dataset.id)));
    });
  } catch (err) {
    grid.innerHTML = `<div class="admin-empty">Erreur : ${escapeHtml(err.message)}</div>`;
  }
}

function editPhoto(id) {
  const photo = galerieCache.find(p => p.id === id);
  if (!photo) return;
  currentPhotoId = id;

  document.getElementById('photo-id').value = photo.id;
  document.getElementById('photo-titre').value = photo.titre || '';
  document.getElementById('photo-description').value = photo.description || '';
  document.getElementById('photo-categorie').value = photo.categorie || '';
  document.getElementById('photo-publie').checked = !!photo.publie;
  document.getElementById('photo-modal-preview').innerHTML = `<img src="${photo.image_path}" alt="" />`;
  document.getElementById('photo-form-error').textContent = '';
  openModal('photo-modal');
}

document.getElementById('photo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('photo-form-error');
  errorEl.textContent = '';

  const id = document.getElementById('photo-id').value;
  const body = new URLSearchParams();
  body.append('titre', document.getElementById('photo-titre').value);
  body.append('description', document.getElementById('photo-description').value);
  body.append('categorie', document.getElementById('photo-categorie').value || 'Général');
  body.append('publie', document.getElementById('photo-publie').checked ? '1' : '0');

  try {
    await apiFetch(`/galerie/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    closeModal('photo-modal');
    showToast('Photo mise à jour ✅');
    loadGalerie();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('photo-delete-btn').addEventListener('click', async () => {
  if (!currentPhotoId) return;
  if (!confirm('Supprimer définitivement cette photo ?')) return;
  try {
    await apiFetch(`/galerie/${currentPhotoId}`, { method: 'DELETE' });
    closeModal('photo-modal');
    showToast('Photo supprimée');
    loadGalerie();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ---- Upload (clic + drag & drop) ----
const uploadInput = document.getElementById('photo-upload-input');
const uploadZone = document.getElementById('upload-zone');

document.getElementById('btn-upload-photos').addEventListener('click', () => uploadInput.click());
uploadZone.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', () => {
  if (uploadInput.files.length) uploadPhotos(uploadInput.files);
});

['dragenter', 'dragover'].forEach(evt => {
  uploadZone.addEventListener(evt, (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
});
['dragleave', 'drop'].forEach(evt => {
  uploadZone.addEventListener(evt, (e) => { e.preventDefault(); uploadZone.classList.remove('dragover'); });
});
uploadZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  if (files.length) uploadPhotos(files);
});

async function uploadPhotos(fileList) {
  const formData = new FormData();
  Array.from(fileList).forEach(file => formData.append('images', file));

  showToast(`Envoi de ${fileList.length} photo(s)…`);

  try {
    await apiFetch('/galerie', { method: 'POST', body: formData });
    showToast('Photos ajoutées avec succès ✅');
    uploadInput.value = '';
    loadGalerie();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
//  Init
// ============================================================
checkAuth();

// ============================================================
//  map.js — Carte interactive des lieux d'intervention UFOLEP 86
//  Leaflet.js + OpenStreetMap
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map-vienne');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map-vienne', {
    center: [46.58, 0.34],
    zoom: 9,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  mapEl.addEventListener('click', () => map.scrollWheelZoom.enable(), { once: true });

  const iconPrimary = L.divIcon({
    className: '',
    html: `<div class="map-marker primary"><svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 6.63 8 16 8 16s8-9.37 8-16c0-4.42-3.58-8-8-8z" fill="#1a3a2a"/>
      <circle cx="12" cy="8" r="3.5" fill="white"/>
    </svg></div>`,
    iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -38],
  });

  const iconAccent = L.divIcon({
    className: '',
    html: `<div class="map-marker accent"><svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 6.63 8 16 8 16s8-9.37 8-16c0-4.42-3.58-8-8-8z" fill="#c0392b"/>
      <circle cx="12" cy="8" r="3.5" fill="white"/>
    </svg></div>`,
    iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -46],
  });

  const communes = [
    { nom: 'Poitiers', lat: 46.5802, lng: 0.3404, icon: iconAccent, details: ['Beaulieu', 'Couronneries', 'St Eloi', '3 Cités', 'Centre-Ville'] },
    { nom: 'Chatellerault', lat: 46.8181, lng: 0.5473, icon: iconAccent, details: ['Les Renardières', 'Lac', 'Ozon', 'Chateauneuf'] },
    { nom: 'Loudun', lat: 47.0103, lng: 0.0808, icon: iconPrimary, details: [] },
    { nom: 'Les Ormes', lat: 46.9364, lng: 0.4933, icon: iconPrimary, details: [] },
    { nom: 'Lencloître', lat: 46.8228, lng: 0.3342, icon: iconPrimary, details: [] },
    { nom: 'Mirebeau', lat: 46.7825, lng: 0.1906, icon: iconPrimary, details: [] },
    { nom: 'Neuville', lat: 46.6939, lng: 0.2514, icon: iconPrimary, details: [] },
    { nom: 'Vouillé', lat: 46.6439, lng: 0.1669, icon: iconPrimary, details: [] },
    { nom: 'Migné-Auxances', lat: 46.6261, lng: 0.2897, icon: iconPrimary, details: [] },
    { nom: 'Vouneuil-sous-Biard', lat: 46.5731, lng: 0.2706, icon: iconPrimary, details: [] },
    { nom: 'Buxerolles', lat: 46.6003, lng: 0.3394, icon: iconPrimary, details: [] },
    { nom: 'St Benoît', lat: 46.5478, lng: 0.3556, icon: iconPrimary, details: [] },
    { nom: 'Iteuil', lat: 46.5092, lng: 0.3389, icon: iconPrimary, details: [] },
    { nom: 'Marcay', lat: 46.4989, lng: 0.2794, icon: iconPrimary, details: [] },
    { nom: 'Lusignan', lat: 46.4328, lng: 0.1231, icon: iconPrimary, details: [] },
    { nom: 'Vivonne', lat: 46.4233, lng: 0.2631, icon: iconPrimary, details: [] },
    { nom: 'La Villedieu-du-Clain', lat: 46.4428, lng: 0.3428, icon: iconPrimary, details: [] },
    { nom: 'Gencay', lat: 46.3706, lng: 0.3456, icon: iconPrimary, details: [] },
    { nom: 'Verrières', lat: 46.3781, lng: 0.4194, icon: iconPrimary, details: [] },
    { nom: 'Civaux', lat: 46.4478, lng: 0.6581, icon: iconPrimary, details: [] },
    { nom: 'Lussac', lat: 46.4028, lng: 0.7242, icon: iconPrimary, details: [] },
    { nom: "L'Isle Jourdain", lat: 46.2342, lng: 0.6758, icon: iconPrimary, details: [] },
    { nom: 'Civray', lat: 46.1503, lng: 0.2956, icon: iconPrimary, details: [] },
  ];

  communes.forEach(c => {
    const hasDetails = c.details.length > 0;
    const detailsHtml = hasDetails
      ? `<ul class="map-popup-list">${c.details.map(d => `<li>${d}</li>`).join('')}</ul>`
      : '';

    const popup = L.popup({ maxWidth: 220, className: 'ufolep-popup' }).setContent(`
      <div class="map-popup">
        <strong class="map-popup-title">${c.nom}</strong>
        ${hasDetails ? `<span class="map-popup-sub">Quartiers d'intervention</span>` : ''}
        ${detailsHtml}
      </div>
    `);

    L.marker([c.lat, c.lng], { icon: c.icon }).bindPopup(popup).addTo(map);
  });

  document.querySelectorAll('.inter-tags span, .inter-highlight strong').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const nom = el.textContent.trim();
      const found = communes.find(c => c.nom.toLowerCase() === nom.toLowerCase());
      if (found) map.flyTo([found.lat, found.lng], 12, { duration: 1 });
    });
  });
});

/* ==========================================================================
   Sri Anjali Travels — shared UI: icon set, mobile nav, toasts, url helpers
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- icon set (24x24, stroked with currentColor) ---------- */
  var P = {
    car: '<path d="M5 16h14"/><path d="M3 16v-4.2a2 2 0 0 1 1.4-1.9L7 9l1.8-3.1A2.2 2.2 0 0 1 10.7 4.8h6.6c.8 0 1.5.4 1.9 1.1L21 9l1.6.9A2 2 0 0 1 23 11.6V16"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
    bus: '<path d="M4 17V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11"/><path d="M4 11h16M9 4v7M15 4v7M4 17h16"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/>',
    users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7.5" r="3.5"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16 4.13a3.5 3.5 0 0 1 0 6.74"/>',
    seat: '<path d="M19 9.5V6.5A2.5 2.5 0 0 0 16.5 4h-9A2.5 2.5 0 0 0 5 6.5v3"/><path d="M3 11.5v4.5A2 2 0 0 0 5 18h14a2 2 0 0 0 2-2v-4.5a2 2 0 0 0-4 0V13H7v-1.5a2 2 0 0 0-4 0z"/><path d="M6 18v2.5M18 18v2.5"/>',
    bag: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18"/>',
    snow: '<path d="M12 2.5v19M9.6 4.9 12 7.3l2.4-2.4M9.6 19.1 12 16.7l2.4 2.4"/><path d="m3.8 7.3 16.4 9.4M4.6 10.6 3.5 7.4l3.3-.9M19.4 13.4l1.1 3.2-3.3.9"/><path d="M20.2 7.3 3.8 16.7M17.2 6.5l3.3.9-1.1 3.2M6.8 17.5l-3.3-.9 1.1-3.2"/>',
    pin: '<path d="M20 10.5c0 5.2-8 11-8 11s-8-5.8-8-11a8 8 0 1 1 16 0z"/><circle cx="12" cy="10.5" r="2.8"/>',
    phone: '<path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6 2 2 0 0 1 2-2.2h2.6a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1l-1.1 1.1a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    whatsapp: '<path d="M3.5 20.5l1.3-4.2A8.3 8.3 0 1 1 8 19.4l-4.5 1.1z"/><path d="M9 9.2c0 3 2.4 5.3 5.3 5.3.5 0 1-.4 1-1v-.8l-1.7-.7-.8.9a4.6 4.6 0 0 1-2-2l.9-.8-.7-1.7h-.9c-.6 0-1 .4-1 1z"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l8.2 5.6a1.5 1.5 0 0 0 1.6 0L21 6.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    check: '<path d="M20 6.5 9.5 17 4 11.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9.2"/><path d="M8.2 12.2l2.6 2.6 5-5.2"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.3-7.5 9.5-4.4-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
    rupee: '<path d="M6.5 4h11M6.5 8.5h11M6.5 13h4.2a4.5 4.5 0 0 0 0-9"/><path d="M6.5 13 15 21"/>',
    route: '<circle cx="6" cy="18.5" r="2.6"/><circle cx="18" cy="5.5" r="2.6"/><path d="M8.6 18.5H15a3.6 3.6 0 0 0 0-7.2H9a3.6 3.6 0 0 1 0-7.2h6.4"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.7 1.1-5.9L3.5 9.7l5.9-.8z"/>',
    plane: '<path d="M10.5 20.5l1.5-5 5.5 3.2 2-1.6-3.7-5.6 3.4-3.4a2.1 2.1 0 0 0-3-3l-3.4 3.4L7.2 4.8 5.6 6.8l3.2 5.5-5 1.5-1.3-1.6-1.3 1.6 2.6 2.6L6.4 19l1.6-1.3z"/>',
    building: '<path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><path d="M14 10h4a2 2 0 0 1 2 2v9M2 21h20M7.5 8h3M7.5 12h3M7.5 16h3M17 14v.01M17 17.5v.01"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 13.5h2a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 6 19.5H5.5A1.5 1.5 0 0 1 4 18z"/><path d="M20 13.5h-2a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5c1.7 0 2-1.4 2-3z"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8L7 21l5-2.4 5 2.4-1.5-7.2"/>',
    heart: '<path d="M12 20.5C6.5 16.9 3 13.9 3 10.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 9 2.7c0 3.6-3.5 6.6-9 10.2z"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    edit: '<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L12.5 14 9 15l1-3.5z"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-13.7-5.2L3 9"/><path d="M4 13a8 8 0 0 0 13.7 5.2L21 15"/><path d="M3 5v4h4M21 19v-4h-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    tag: '<path d="M20.5 12.5 12 21l-9-9V3h9z"/><circle cx="7.5" cy="7.5" r="1.6"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.4 5.3 3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5l-2.4-7.7A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.9 1.3z"/>',
    trending: '<path d="M3 17.5 9.5 11l4 4L21 7.5"/><path d="M15.5 7.5H21v5.5"/>',
    download: '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    clipboard: '<rect x="4.5" y="4.5" width="15" height="16.5" rx="2"/><path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7"/><path d="m8.8 13.4 2.2 2.2 4.2-4.4"/>',
    facebook: '<path d="M17.5 2.5h-2.8a4.7 4.7 0 0 0-4.7 4.7v2.8H7.2v3.9h2.8v7.6h3.9v-7.6h2.8l.8-3.9h-3.6V7.5c0-.6.4-1.1 1-1.1h2.6z"/>',
    instagram: '<rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none"/>',
    road: '<path d="M4.5 21 7.2 3M19.5 21 16.8 3M12 3.5v3.2M12 10.4v3.2M12 17.3v3.2"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    quote: '<path d="M9.5 6.5C6.9 7.6 5 10 5 13v4.5h5.5V11H8c.2-1.4 1-2.3 2.4-3zM19 6.5C16.4 7.6 14.5 10 14.5 13v4.5H20V11h-2.5c.2-1.4 1-2.3 2.4-3z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z"/>',
    wallet: '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h11.5A1.5 1.5 0 0 1 19 6.5v2"/><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M20.5 12h-3.2a2 2 0 0 0 0 4h3.2"/>',
    key: '<circle cx="8" cy="14" r="4.5"/><path d="m11.4 11 8.1-8.1M17 5.4l2.2 2.2M14.6 7.8l2.2 2.2"/>',
    doc: '<path d="M6.5 2.8h7.2L18.5 7.6v12.6a1.6 1.6 0 0 1-1.6 1.6H6.5a1.6 1.6 0 0 1-1.6-1.6V4.4a1.6 1.6 0 0 1 1.6-1.6z"/><path d="M13.4 2.8v5h5.1M8.4 12.6h6M8.4 16.2h3.6"/>'
  };

  function iconSVG(name) {
    var d = P[name];
    if (!d) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* Replace every <span class="ico" data-ico="name"></span> with its glyph. */
  function hydrateIcons(root) {
    var nodes = (root || document).querySelectorAll('[data-ico]');
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.dataset.icoDone === '1') return;
      var svg = iconSVG(el.getAttribute('data-ico'));
      if (svg) { el.innerHTML = svg; el.dataset.icoDone = '1'; }
    });
  }

  /* ---------- mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(message) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    /* restart the CSS transition */
    void el.offsetWidth;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------- url helpers ---------- */
  function params() {
    var out = {};
    var q = window.location.search.replace(/^\?/, '');
    if (!q) return out;
    q.split('&').forEach(function (pair) {
      if (!pair) return;
      var bits = pair.split('=');
      out[decodeURIComponent(bits[0])] = decodeURIComponent((bits[1] || '').replace(/\+/g, ' '));
    });
    return out;
  }
  function query(obj) {
    return Object.keys(obj)
      .filter(function (k) { return obj[k] !== undefined && obj[k] !== null && obj[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]); })
      .join('&');
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Marks the current page in both nav bars. */
  function markActiveNav() {
    var here = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll('.nav a, .mobile-nav a'), function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0].toLowerCase();
      if (href === here) a.setAttribute('aria-current', 'page');
    });
  }

  window.UI = {
    icon: iconSVG,
    hydrateIcons: hydrateIcons,
    toast: toast,
    params: params,
    query: query,
    esc: esc
  };

  document.addEventListener('DOMContentLoaded', function () {
    hydrateIcons(document);
    initNav();
    markActiveNav();
    var year = document.querySelectorAll('[data-year]');
    Array.prototype.forEach.call(year, function (el) { el.textContent = new Date().getFullYear(); });
  });
})();

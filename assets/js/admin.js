/* ==========================================================================
   Admin panel — dashboard, per-KM rate management, enquiry list
   Data lives in localStorage (see data.js); swap for an API when going live.
   ========================================================================== */
(function () {
  'use strict';

  var STATUSES = ['New', 'Contacted', 'Closed'];
  var filter = { q: '', status: 'all' };

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    var list = SA.getEnquiries();
    var counts = { New: 0, Contacted: 0, Closed: 0 };
    list.forEach(function (e) { if (counts[e.status] !== undefined) counts[e.status]++; });

    var value = list.reduce(function (sum, e) {
      return sum + SA.quote(e.vehicleId, e.tripType, e.distance,
        { days: e.days, nights: e.nights }).total;
    }, 0);

    var recent = list.slice(0, 5).map(enquiryRow).join('');

    document.getElementById('tab-dashboard').innerHTML =
      '<div class="kpi">' +
        kpi('inbox', 'Total Enquiries', list.length) +
        kpi('sparkle', 'New', counts.New) +
        kpi('checkCircle', 'Contacted', counts.Contacted) +
        kpi('trending', 'Pipeline Value', SA.money(value)) +
      '</div>' +

      '<h2 class="mt-24" style="font-size:16px">Recent Enquiries</h2>' +
      '<div class="table-scroll mt-12">' +
        '<table class="table">' +
          '<thead><tr><th>Ref No.</th><th>Name</th><th>Phone</th><th>Vehicle</th>' +
          '<th>Date</th><th>Fare</th><th>Status</th></tr></thead>' +
          '<tbody>' + (recent || emptyRow(7)) + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function kpi(icon, label, value) {
    return '<div class="kpi__card">' +
      '<div class="k"><span class="ico ico--sm" data-ico="' + icon + '"></span>' + label + '</div>' +
      '<div class="v">' + value + '</div>' +
    '</div>';
  }

  function emptyRow(cols) {
    return '<tr><td colspan="' + cols + '" class="muted" style="text-align:center;padding:24px">No enquiries yet.</td></tr>';
  }

  function enquiryRow(e) {
    var v = SA.vehicle(e.vehicleId);
    var fare = SA.quote(e.vehicleId, e.tripType, e.distance,
      { days: e.days, nights: e.nights }).total;
    return '<tr>' +
      '<td style="font-weight:600">' + UI.esc(e.ref) + '</td>' +
      '<td>' + UI.esc(e.name) + '</td>' +
      '<td>' + UI.esc(e.phone) + '</td>' +
      '<td>' + UI.esc(v ? v.name : '—') + '</td>' +
      '<td>' + SA.prettyDate(e.date) + '</td>' +
      '<td>' + SA.money(fare) + '</td>' +
      '<td>' + badge(e.status) + '</td>' +
    '</tr>';
  }

  function badge(status) {
    var cls = status === 'Contacted' ? 'badge--contacted' : (status === 'Closed' ? 'badge--closed' : 'badge--new');
    return '<span class="badge ' + cls + '">' + UI.esc(status) + '</span>';
  }

  /* ---------- rates ---------- */
  function renderRates() {
    var rates = SA.getRates();
    var rows = SA.VEHICLES.map(function (v) {
      return '<tr>' +
        '<td style="font-weight:600">' + UI.esc(v.name) + '<div class="small muted" style="font-weight:400">' +
          UI.esc(v.seats) + '</div></td>' +
        '<td><input class="rate-input" type="number" min="1" max="999" step="1" ' +
          'data-rate="' + v.id + '" data-kind="local" value="' + rates[v.id].local + '" ' +
          'aria-label="' + UI.esc(v.name) + ' local rate"></td>' +
        '<td><input class="rate-input" type="number" min="1" max="999" step="1" ' +
          'data-rate="' + v.id + '" data-kind="outstation" value="' + rates[v.id].outstation + '" ' +
          'aria-label="' + UI.esc(v.name) + ' outstation rate"></td>' +
        '<td class="muted">' + SA.money(rates[v.id].local * 50) + ' / 50 KM</td>' +
      '</tr>';
    }).join('');

    document.getElementById('tab-rates').innerHTML =
      '<h2 style="font-size:16px">Per KM Rates</h2>' +
      '<p class="small muted mt-8">Change a rate and press <strong>Update Rates</strong>. ' +
        'New rates apply immediately across the fare calculator, vehicle pages and booking form.</p>' +
      '<div class="table-scroll mt-16">' +
        '<table class="table">' +
          '<thead><tr><th>Vehicle</th><th>Local (₹/KM)</th><th>Outstation (₹/KM)</th><th>Local example</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="mt-16" style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn--gold" type="button" id="saveRates">Update Rates</button>' +
        '<button class="btn btn--ghost" type="button" id="resetRates">' +
          '<span class="ico ico--sm" data-ico="refresh"></span> Reset to defaults</button>' +
      '</div>';

    document.getElementById('saveRates').addEventListener('click', function () {
      var next = SA.getRates();
      var bad = false;
      Array.prototype.forEach.call(document.querySelectorAll('[data-rate]'), function (input) {
        var val = Number(input.value);
        if (!(val > 0)) { bad = true; return; }
        next[input.getAttribute('data-rate')][input.getAttribute('data-kind')] = val;
      });
      if (bad) { UI.toast('Rates must be greater than zero.'); return; }
      SA.saveRates(next);
      refreshAll();
      UI.toast('Rates updated.');
    });

    document.getElementById('resetRates').addEventListener('click', function () {
      SA.resetRates();
      refreshAll();
      UI.toast('Rates reset to defaults.');
    });
  }

  /* ---------- charges (minimum KM, driver allowances) ---------- */
  var CHARGE_FIELDS = [
    { key: 'minKmPerDay', label: 'Minimum KM per day — cars', unit: 'KM',
      hint: 'Chargeable floor for each day of an outstation hire (sedan, MPV, SUV).' },
    { key: 'minKmPerDayLarge', label: 'Minimum KM per day — minibus', unit: 'KM',
      hint: 'Larger vehicles usually carry a higher daily floor.' },
    { key: 'driverBata', label: 'Driver allowance (bata)', unit: '₹ / day',
      hint: 'Paid per day of the hire for daytime running.' },
    { key: 'nightBata', label: 'Night allowance', unit: '₹ / night',
      hint: 'Added for each night the driver runs between 10 PM and 6 AM.' },
    { key: 'extraHourRate', label: 'Extra hour — local packages', unit: '₹ / hour',
      hint: 'Charged beyond a 4/40, 8/80 or 12/120 hourly package.' }
  ];

  function renderCharges() {
    var c = SA.getCharges();
    var rows = CHARGE_FIELDS.map(function (f) {
      return '<tr>' +
        '<td style="white-space:normal"><strong>' + f.label + '</strong>' +
          '<div class="small muted" style="font-weight:400">' + f.hint + '</div></td>' +
        '<td><input class="rate-input" type="number" min="0" max="9999" step="1" ' +
          'data-charge="' + f.key + '" value="' + c[f.key] + '" aria-label="' + f.label + '"></td>' +
        '<td class="muted">' + f.unit + '</td>' +
      '</tr>';
    }).join('');

    /* Show what the current settings mean for a concrete trip. */
    var sample = SA.quote('sedan', 'outstation', 350, { days: 2, nights: 1 });

    document.getElementById('tab-charges').innerHTML =
      '<h2 style="font-size:16px">Outstation Charges</h2>' +
      '<p class="small muted mt-8">An outstation bill is distance plus a daily minimum plus the ' +
        'driver&rsquo;s allowance. These settings drive the fare calculator, the booking summary ' +
        'and the route cards on the homepage.</p>' +

      '<div class="note mt-16"><span class="ico" data-ico="info"></span>' +
        '<span><strong style="color:var(--navy)">These are placeholder figures</strong>, typical of ' +
        'the trade rather than confirmed Sri Anjali terms. Set your real numbers here before the ' +
        'site goes live.</span></div>' +

      '<div class="table-scroll mt-16">' +
        '<table class="table"><thead><tr><th>Charge</th><th>Value</th><th>Unit</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
      '</div>' +

      '<div class="mt-16" style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn--gold" type="button" id="saveCharges">Update Charges</button>' +
        '<button class="btn btn--ghost" type="button" id="resetCharges">' +
          '<span class="ico ico--sm" data-ico="refresh"></span> Reset to defaults</button>' +
      '</div>' +

      '<h3 class="mt-24" style="font-size:15px">Worked example</h3>' +
      '<p class="small muted mt-8">Compact sedan, 2-day outstation trip covering 350 KM, ' +
        'one night running after 10 PM:</p>' +
      '<div class="spec-wrap mt-12"><table class="spec"><tbody>' +
        '<tr><th scope="row">Distance charged</th><td>' + sample.chargeableKm + ' KM' +
          (sample.minApplied ? ' <span class="muted">(minimum applied)</span>' : '') + '</td></tr>' +
        '<tr><th scope="row">Running</th><td>' + SA.money(sample.distanceFare) + '</td></tr>' +
        '<tr><th scope="row">Driver allowance</th><td>' + SA.money(sample.bata) + '</td></tr>' +
        '<tr><th scope="row">Night allowance</th><td>' + SA.money(sample.nightBata) + '</td></tr>' +
        '<tr><th scope="row"><strong>Total</strong></th><td><strong>' +
          SA.money(sample.total) + '</strong></td></tr>' +
      '</tbody></table></div>' +
      '<p class="small muted mt-12">Toll, parking and state permit are extra at cost and are not ' +
        'part of this figure.</p>';

    document.getElementById('saveCharges').addEventListener('click', function () {
      var next = SA.getCharges();
      var bad = false;
      Array.prototype.forEach.call(document.querySelectorAll('[data-charge]'), function (input) {
        var val = Number(input.value);
        if (!(val >= 0) || input.value === '') { bad = true; return; }
        next[input.getAttribute('data-charge')] = val;
      });
      if (bad) { UI.toast('Charges cannot be blank or negative.'); return; }
      SA.saveCharges(next);
      refreshAll();
      UI.toast('Charges updated.');
    });

    document.getElementById('resetCharges').addEventListener('click', function () {
      SA.resetCharges();
      refreshAll();
      UI.toast('Charges reset to defaults.');
    });
  }

  /* ---------- enquiries ---------- */
  function renderEnquiries() {
    var list = SA.getEnquiries().filter(function (e) {
      if (filter.status !== 'all' && e.status !== filter.status) return false;
      if (!filter.q) return true;
      var hay = (e.ref + ' ' + e.name + ' ' + e.phone).toLowerCase();
      return hay.indexOf(filter.q.toLowerCase()) !== -1;
    });

    var rows = list.map(function (e) {
      var v = SA.vehicle(e.vehicleId);
      var fare = SA.quote(e.vehicleId, e.tripType, e.distance,
      { days: e.days, nights: e.nights }).total;
      var options = STATUSES.map(function (s) {
        return '<option value="' + s + '"' + (s === e.status ? ' selected' : '') + '>' + s + '</option>';
      }).join('');
      return '<tr>' +
        '<td style="font-weight:600">' + UI.esc(e.ref) + '</td>' +
        '<td>' + UI.esc(e.name) + '</td>' +
        '<td><a href="tel:' + UI.esc(e.phone) + '">' + UI.esc(e.phone) + '</a></td>' +
        '<td>' + UI.esc(v ? v.name : '—') + '</td>' +
        '<td>' + SA.tripLabel(e.tripType) + '</td>' +
        '<td>' + UI.esc(e.distance) + ' KM</td>' +
        '<td>' + SA.prettyDate(e.date) + '</td>' +
        '<td>' + SA.money(fare) + '</td>' +
        '<td><select class="select" style="padding:5px 26px 5px 8px;font-size:12.5px" ' +
          'data-status-for="' + UI.esc(e.ref) + '">' + options + '</select></td>' +
      '</tr>';
    }).join('');

    document.getElementById('tab-enquiries').innerHTML =
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between">' +
        '<h2 style="font-size:16px">All Enquiries <span class="muted small">(' + list.length + ')</span></h2>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<input class="input" id="enqSearch" type="search" placeholder="Search ref, name or phone" ' +
            'style="width:220px" value="' + UI.esc(filter.q) + '">' +
          '<select class="select" id="enqStatus" style="width:150px">' +
            '<option value="all">All statuses</option>' +
            STATUSES.map(function (s) {
              return '<option value="' + s + '"' + (filter.status === s ? ' selected' : '') + '>' + s + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="table-scroll mt-16">' +
        '<table class="table">' +
          '<thead><tr><th>Ref No.</th><th>Name</th><th>Phone</th><th>Vehicle</th><th>Trip</th>' +
          '<th>Distance</th><th>Date</th><th>Fare</th><th>Status</th></tr></thead>' +
          '<tbody>' + (rows || emptyRow(9)) + '</tbody>' +
        '</table>' +
      '</div>';

    var search = document.getElementById('enqSearch');
    search.addEventListener('input', function () {
      filter.q = search.value;
      var pos = search.selectionStart;
      renderEnquiries();
      var next = document.getElementById('enqSearch');
      next.focus();
      try { next.setSelectionRange(pos, pos); } catch (err) {}
    });

    document.getElementById('enqStatus').addEventListener('change', function (e) {
      filter.status = e.target.value;
      renderEnquiries();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-status-for]'), function (sel) {
      sel.addEventListener('change', function () {
        SA.setEnquiryStatus(sel.getAttribute('data-status-for'), sel.value);
        renderDashboard();
        UI.hydrateIcons(document);
        UI.toast('Status updated.');
      });
    });
  }

  /* ---------- tabs ---------- */
  var TABS = ['dashboard', 'rates', 'charges', 'enquiries'];

  /* A rate or charge change moves every figure on the page, so redraw the lot. */
  function refreshAll() {
    renderDashboard();
    renderRates();
    renderCharges();
    renderEnquiries();
    UI.hydrateIcons(document);
  }

  function showTab(name) {
    TABS.forEach(function (t) {
      document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.admin-tabs button'), function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-tab') === name ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    refreshAll();

    document.querySelector('.admin-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (!b) return;
      showTab(b.getAttribute('data-tab'));
    });

    var start = UI.params().tab;
    showTab(TABS.indexOf(start) !== -1 ? start : 'dashboard');
  });
})();

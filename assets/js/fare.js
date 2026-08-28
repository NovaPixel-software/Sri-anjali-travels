/* ==========================================================================
   Fare calculator — compare-all and guided (one vehicle at a time) views
   ========================================================================== */
(function () {
  'use strict';

  var state = {
    trip: 'local', mode: 'compare', km: 50, days: 1, nights: 0, index: 0,
    pkg: '8-80'   // local hires default to the full-day package
  };

  var elDistance, elResults, elTripSeg, elModeSeg, elDays, elNights, elExtras;
  var elPkgWrap, elPkgChips;

  function readInitialState() {
    var p = UI.params();
    if (p.type === 'outstation' || p.type === 'local') state.trip = p.type;
    if (p.mode === 'guided') state.mode = 'guided';
    var km = Number(p.km);
    /* an explicit distance in the URL means a custom run, not a package */
    if (km > 0) { state.km = km; state.pkg = 'custom'; }
    /* otherwise a local visit starts on its default package, so the distance
       must come from that package rather than the generic default */
    else if (state.trip === 'local') {
      var pkg = currentPackage();
      if (pkg) state.km = pkg.km;
    }
    if (Number(p.days) > 0) state.days = Math.round(Number(p.days));
    if (Number(p.nights) > 0) state.nights = Math.round(Number(p.nights));
    if (p.v) {
      SA.VEHICLES.forEach(function (v, i) { if (v.id === p.v) state.index = i; });
    }
  }

  function syncSeg(seg, attr, value) {
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', b.getAttribute(attr) === value ? 'true' : 'false');
    });
  }

  function bookingHref(vehicleId) {
    return 'booking.html?' + UI.query({
      v: vehicleId, type: state.trip, km: state.km,
      days: state.trip === 'outstation' ? state.days : '',
      nights: state.trip === 'outstation' && state.nights > 0 ? state.nights : ''
    });
  }

  function opts() {
    return { days: state.days, nights: state.nights };
  }

  function currentPackage() {
    if (state.trip !== 'local' || state.pkg === 'custom') return null;
    var found = null;
    SA.HOURLY_PACKAGES.forEach(function (p) { if (p.id === state.pkg) found = p; });
    return found;
  }

  /* Local packages: chips for 4/8/12 hours plus a custom-distance escape hatch.
     Choosing a package just sets the distance, so the fare maths is unchanged. */
  function buildPackageChips() {
    if (!elPkgChips) return;
    var chips = SA.HOURLY_PACKAGES.map(function (p) {
      return '<button class="chip" type="button" data-pkg="' + p.id + '">' +
        p.label + '</button>';
    }).join('') +
      '<button class="chip" type="button" data-pkg="custom">Custom distance</button>';
    elPkgChips.innerHTML = chips;

    elPkgChips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pkg]');
      if (!b) return;
      state.pkg = b.getAttribute('data-pkg');
      var pkg = currentPackage();
      if (pkg) { state.km = pkg.km; elDistance.value = pkg.km; }
      syncPackageChips();
      render();
    });
  }

  function syncPackageChips() {
    if (!elPkgChips) return;
    Array.prototype.forEach.call(elPkgChips.querySelectorAll('button'), function (b) {
      b.classList.toggle('chip--on', b.getAttribute('data-pkg') === state.pkg);
    });
    /* a package fixes the distance, so the field becomes read-only */
    var pkg = currentPackage();
    if (elDistance) {
      elDistance.readOnly = !!pkg;
      elDistance.classList.toggle('is-locked', !!pkg);
    }
  }

  /* Itemised build-up, so the customer sees where each rupee comes from. */
  function breakdownHTML(q) {
    var rows = [
      ['Distance charged', q.chargeableKm + ' KM × ₹' + q.rate, SA.money(q.distanceFare)]
    ];
    if (q.tripType === 'outstation') {
      if (q.bata) {
        rows.push(['Driver allowance', q.days + ' day' + (q.days > 1 ? 's' : ''), SA.money(q.bata)]);
      }
      if (q.nightBata) {
        rows.push(['Night allowance', q.nights + ' night' + (q.nights > 1 ? 's' : ''), SA.money(q.nightBata)]);
      }
    }

    var body = rows.map(function (r) {
      return '<tr><th scope="row">' + r[0] + '<div class="small muted" style="font-weight:400">' +
        r[1] + '</div></th><td style="text-align:right">' + r[2] + '</td></tr>';
    }).join('');

    var minNote = q.minApplied
      ? '<div class="note mt-12"><span class="ico" data-ico="info"></span><span>Your route is ' +
          q.enteredKm + ' KM, but a ' + q.days + '-day hire bills a minimum of ' +
          q.minKmPerDay + ' KM per day, so ' + q.chargeableKm + ' KM is charged. ' +
          'Travel further and you pay for the actual distance instead.</span></div>'
      : '';

    return '<div class="spec-wrap mt-12"><table class="spec"><tbody>' + body +
      '<tr><th scope="row" style="background:var(--navy-050)"><strong>Total</strong></th>' +
      '<td style="text-align:right;font-weight:600;font-size:16px">' + SA.money(q.total) + '</td></tr>' +
      '</tbody></table></div>' + minNote;
  }

  function renderEmpty() {
    elResults.innerHTML =
      '<div class="note"><span class="ico" data-ico="info"></span>' +
      '<span>Enter a trip distance above to see fares for every vehicle.</span></div>';
    UI.hydrateIcons(elResults);
  }

  function renderCompare() {
    var list = SA.quotes(state.trip, state.km, opts());
    var rows = list.map(function (q, i) {
      return '<a class="fare-row' + (i === 0 ? ' is-best' : '') + '" href="' + bookingHref(q.vehicle.id) + '">' +
        '<img src="' + q.vehicle.img + '" alt="">' +
        '<div>' +
          '<div class="fare-row__name">' + UI.esc(q.vehicle.name) +
            (i === 0 ? '<span class="tag-best">Lowest</span>' : '') + '</div>' +
          '<div class="fare-row__sub">' + UI.esc(q.vehicle.seats) + ' · ' + UI.esc(q.vehicle.example) + '</div>' +
        '</div>' +
        '<div class="fare-row__amt">' +
          '<div class="v">' + SA.money(q.fare) + '</div>' +
          '<div class="r">' + SA.rate(q.rate) + '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    elResults.innerHTML =
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px">' +
        '<h2 style="font-size:17px">Fares (' + SA.tripLabel(state.trip) + ')</h2>' +
        '<span class="small muted">Sorted by lowest fare</span>' +
      '</div>' +
      '<div class="fare-list">' + rows + '</div>' +
      compareFootnote(list);
  }

  function compareFootnote(list) {
    if (state.trip !== 'outstation') {
      var pkg = currentPackage();
      if (pkg) {
        return '<p class="small muted mt-12">' + pkg.label + ' package within Bengaluru city. ' +
          'Beyond the package, extra KM are charged at the same per-KM rate and each extra hour ' +
          'at ₹' + SA.getCharges().extraHourRate + '. Tap a vehicle to book it.</p>';
      }
      return '<p class="small muted mt-12">Showing fares for ' + state.km +
        ' KM within Bengaluru city. Tap a vehicle to book it.</p>';
    }
    var q = list[0].detail;
    var bits = [];
    if (q.minApplied) {
      bits.push('a minimum of ' + q.minKmPerDay + ' KM per day (' + q.chargeableKm +
        ' KM charged instead of ' + q.enteredKm + ')');
    } else {
      bits.push(q.chargeableKm + ' KM of running');
    }
    bits.push('driver allowance for ' + q.days + ' day' + (q.days > 1 ? 's' : ''));
    if (q.nights > 0) {
      bits.push('night allowance for ' + q.nights + ' night' + (q.nights > 1 ? 's' : ''));
    }
    return '<p class="small muted mt-12">Each total covers ' + bits.join(', ') +
      '. Switch to <strong>Guided</strong> for the full itemised build-up.</p>';
  }

  function renderGuided() {
    var v = SA.VEHICLES[state.index];
    var q = SA.quote(v.id, state.trip, state.km, opts());
    var rate = q.rate;
    var fare = q.total;
    var dots = SA.VEHICLES.map(function (_, i) {
      return '<i class="' + (i === state.index ? 'on' : '') + '"></i>';
    }).join('');

    elResults.innerHTML =
      '<div class="guided">' +
        '<div class="guided__nav">' +
          '<button class="btn btn--ghost btn--sm" type="button" id="gPrev">' +
            '<span class="ico ico--sm" data-ico="arrowLeft"></span> Prev</button>' +
          '<div class="guided__dots">' + dots + '</div>' +
          '<button class="btn btn--ghost btn--sm" type="button" id="gNext">Next ' +
            '<span class="ico ico--sm" data-ico="arrowRight"></span></button>' +
        '</div>' +

        '<div class="card card--pad" style="text-align:center">' +
          '<img src="' + v.img + '" alt="' + UI.esc(v.name) + '" style="height:64px;width:auto;margin:0 auto 10px">' +
          '<h2 style="font-size:20px">' + UI.esc(v.name) + '</h2>' +
          '<div class="small" style="color:var(--gold);font-weight:600">' + UI.esc(v.seats) + '</div>' +
          '<div class="small muted">' + UI.esc(v.example) + '</div>' +
        '</div>' +

        '<div class="fare-hero">' +
          '<div class="k">Fare for ' + state.km + ' KM (' + SA.tripLabel(state.trip) + ')</div>' +
          '<div class="v">' + SA.money(fare) + '</div>' +
          '<div class="r">' + SA.rate(rate) + '</div>' +
        '</div>' +

        breakdownHTML(q) +

        '<a class="btn btn--navy btn--block btn--lg" href="' + bookingHref(v.id) + '">Book / Enquire Now</a>' +
        '<p class="center small muted">Vehicle ' + (state.index + 1) + ' of ' + SA.VEHICLES.length + '</p>' +
      '</div>';

    document.getElementById('gPrev').addEventListener('click', function () {
      state.index = (state.index - 1 + SA.VEHICLES.length) % SA.VEHICLES.length;
      render();
    });
    document.getElementById('gNext').addEventListener('click', function () {
      state.index = (state.index + 1) % SA.VEHICLES.length;
      render();
    });
  }

  function render() {
    if (elExtras) elExtras.classList.toggle('hidden', state.trip !== 'outstation');
    if (elPkgWrap) elPkgWrap.classList.toggle('hidden', state.trip !== 'local');
    syncPackageChips();
    if (!(state.km > 0)) { renderEmpty(); return; }
    if (state.mode === 'guided') renderGuided(); else renderCompare();
    UI.hydrateIcons(elResults);
  }

  document.addEventListener('DOMContentLoaded', function () {
    elDistance = document.getElementById('distance');
    elResults = document.getElementById('results');
    elTripSeg = document.getElementById('tripSeg');
    elModeSeg = document.getElementById('modeSeg');
    elDays = document.getElementById('days');
    elNights = document.getElementById('nights');
    elExtras = document.getElementById('outstationExtras');
    elPkgWrap = document.getElementById('localPackages');
    elPkgChips = document.getElementById('pkgChips');
    buildPackageChips();

    readInitialState();
    elDistance.value = state.km;
    elDays.value = state.days;
    elNights.value = state.nights;

    elDays.addEventListener('input', function () {
      state.days = Math.max(1, Math.round(Number(elDays.value) || 1));
      render();
    });
    elNights.addEventListener('input', function () {
      state.nights = Math.max(0, Math.round(Number(elNights.value) || 0));
      render();
    });
    syncSeg(elTripSeg, 'data-trip', state.trip);
    syncSeg(elModeSeg, 'data-mode', state.mode);

    elTripSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-trip]');
      if (!b) return;
      state.trip = b.getAttribute('data-trip');
      /* returning to local with a package selected restores that package's KM */
      var pkg = currentPackage();
      if (pkg) { state.km = pkg.km; elDistance.value = pkg.km; }
      syncSeg(elTripSeg, 'data-trip', state.trip);
      render();
    });

    elModeSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]');
      if (!b) return;
      state.mode = b.getAttribute('data-mode');
      syncSeg(elModeSeg, 'data-mode', state.mode);
      render();
    });

    elDistance.addEventListener('input', function () {
      var km = Number(elDistance.value);
      state.km = km > 0 ? km : 0;
      render();
    });

    buildPresets();
    syncFaqFigures();
    render();
  });

  /* The FAQ quotes concrete numbers — read them from the live settings so they
     can never contradict what the calculator above just charged. */
  function syncFaqFigures() {
    var c = SA.getCharges();
    var set = function (id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('faqMinCar', c.minKmPerDay);
    set('faqMinBus', c.minKmPerDayLarge);
    set('faqBata', '₹' + c.driverBata);
    set('faqNight', '₹' + c.nightBata);
  }

  /* Quick-fill chips: a few local distances plus the popular outstation runs. */
  function buildPresets() {
    var host = document.getElementById('presetKm');
    if (!host) return;

    /* local hires are picked with the package chips above, so these are the
       outstation round trips only */
    var presets = [].concat(SA.ROUTES.map(function (r) {
      var days = r.days || SA.suggestedDays(r.km);
      return {
        label: r.to + ' · ' + r.km + ' KM' + (days > 1 ? ' · ' + days + ' days' : ''),
        km: r.km, trip: 'outstation', days: days
      };
    }));

    host.innerHTML = presets.map(function (p, i) {
      return '<button class="chip" type="button" data-i="' + i + '">' + UI.esc(p.label) + '</button>';
    }).join('');

    host.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var p = presets[Number(b.getAttribute('data-i'))];
      state.km = p.km;
      state.trip = p.trip;
      state.pkg = 'custom';
      state.days = p.days || 1;
      state.nights = 0;
      elDistance.value = p.km;
      elDays.value = state.days;
      elNights.value = 0;
      syncSeg(elTripSeg, 'data-trip', state.trip);
      render();
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
})();

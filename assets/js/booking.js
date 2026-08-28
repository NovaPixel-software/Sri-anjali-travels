/* ==========================================================================
   Booking / enquiry form — live trip summary, validation, stored enquiry
   ========================================================================== */
(function () {
  'use strict';

  var form, elVehicle, elTrip, elKm, elDate, elName, elPhone, elNotes, elTerms, elSummary;
  var elPickup, elDrop, elTime, elDays, elNights, elExtras, elKmHint;

  function setInvalid(fieldId, invalid) {
    var f = document.getElementById(fieldId);
    if (f) f.classList.toggle('is-invalid', !!invalid);
  }

  function currentTrip() {
    return elTrip.value === 'outstation' ? 'outstation' : 'local';
  }

  function renderSummary() {
    var v = SA.vehicle(elVehicle.value) || SA.VEHICLES[0];
    var trip = currentTrip();
    var km = Number(elKm.value);
    var q = SA.quote(v.id, trip, km, { days: elDays.value, nights: elNights.value });

    var when = elDate.value ? SA.prettyDate(elDate.value) : '—';
    if (elDate.value && elTime.value) when += ', ' + prettyTime(elTime.value);

    var route = (elPickup.value.trim() || '—') + ' → ' + (elDrop.value.trim() || '—');

    var html =
      row('car', 'Vehicle', UI.esc(v.name), UI.esc(v.example)) +
      row('route', 'Trip Type', SA.tripLabel(trip),
        trip === 'outstation' ? q.days + ' day' + (q.days > 1 ? 's' : '') : '') +
      row('pin', 'Route', UI.esc(route), '') +
      row('calendar', 'Pickup', UI.esc(when), '');

    if (km > 0) {
      html += row('road', 'Distance charged', q.chargeableKm + ' KM',
        q.minApplied ? 'you entered ' + q.enteredKm + ' KM' : '');
      html += row('rupee', 'Running', SA.money(q.distanceFare), q.chargeableKm + ' KM × ₹' + q.rate);
      if (q.bata) {
        html += row('key', 'Driver allowance', SA.money(q.bata),
          q.days + ' day' + (q.days > 1 ? 's' : ''));
      }
      if (q.nightBata) {
        html += row('clock', 'Night allowance', SA.money(q.nightBata),
          q.nights + ' night' + (q.nights > 1 ? 's' : ''));
      }
    } else {
      html += row('road', 'Distance', '—', '');
    }

    html +=
      '<div class="summary__row total">' +
        '<span class="ico" data-ico="wallet"></span>' +
        '<span class="k">Estimated Total</span>' +
        '<span><span class="v">' + (km > 0 ? SA.money(q.total) : '—') + '</span>' +
        '<span class="sub" style="display:block">' + SA.rate(q.rate) + '</span></span>' +
      '</div>';

    elSummary.innerHTML = html;
    UI.hydrateIcons(elSummary);
  }

  /* The whole enquiry as a WhatsApp message, so the customer sends us everything
     in one go and we can reply with a confirmed fare. */
  function whatsappLink(e) {
    var v = SA.vehicle(e.vehicleId);
    var q = SA.quote(e.vehicleId, e.tripType, e.distance, { days: e.days, nights: e.nights });

    var lines = [
      'Hello Sri Anjali Travels, I would like to book a trip.',
      '',
      'Reference: ' + e.ref,
      'Name: ' + e.name,
      'Phone: ' + e.phone,
      'Vehicle: ' + (v ? v.name + ' (' + v.seats + ')' : e.vehicleId),
      'Trip: ' + SA.tripLabel(e.tripType) +
        (e.tripType === 'outstation' ? ' round trip, ' + q.days + ' day' + (q.days > 1 ? 's' : '') : ''),
      'Pickup: ' + e.pickup,
      'Drop: ' + e.drop,
      'When: ' + SA.prettyDate(e.date) + (e.time ? ' at ' + prettyTime(e.time) : ''),
      'Distance: ' + e.distance + ' KM' +
        (q.minApplied ? ' (charged ' + q.chargeableKm + ' KM on the daily minimum)' : ''),
      'Estimated fare: ' + SA.money(q.total) + ' (+ toll, parking, permit at cost)'
    ];
    if (e.notes) lines.push('Notes: ' + e.notes);
    lines.push('', 'Please confirm the fare and the vehicle.');

    return 'https://wa.me/' + SA.BRAND.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function prettyTime(hhmm) {
    var bits = String(hhmm).split(':');
    var h = Number(bits[0]);
    var m = bits[1] || '00';
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + m + ' ' + suffix;
  }

  function row(icon, key, value, sub) {
    return '<div class="summary__row">' +
      '<span class="ico" data-ico="' + icon + '"></span>' +
      '<span class="k">' + key + '</span>' +
      '<span><span class="v">' + value + '</span>' +
      (sub ? '<span class="sub" style="display:block">' + sub + '</span>' : '') +
      '</span></div>';
  }

  function validate() {
    var ok = true;

    var pickupOk = elPickup.value.trim().length >= 3;
    setInvalid('f-from', !pickupOk);
    ok = ok && pickupOk;

    var dropOk = elDrop.value.trim().length >= 3;
    setInvalid('f-to', !dropOk);
    ok = ok && dropOk;

    var timeOk = !!elTime.value;
    setInvalid('f-time', !timeOk);
    ok = ok && timeOk;

    var nameOk = elName.value.trim().length >= 2;
    setInvalid('f-name', !nameOk);
    ok = ok && nameOk;

    var phoneOk = /^[6-9]\d{9}$/.test(elPhone.value.trim());
    setInvalid('f-phone', !phoneOk);
    ok = ok && phoneOk;

    var dateOk = !!elDate.value;
    setInvalid('f-date', !dateOk);
    ok = ok && dateOk;

    var kmOk = Number(elKm.value) > 0;
    setInvalid('f-km', !kmOk);
    ok = ok && kmOk;

    var termsOk = elTerms.checked;
    setInvalid('f-terms', !termsOk);
    ok = ok && termsOk;

    return ok;
  }

  document.addEventListener('DOMContentLoaded', function () {
    form = document.getElementById('bookingForm');
    elVehicle = document.getElementById('vehicle');
    elTrip = document.getElementById('tripType');
    elKm = document.getElementById('km');
    elDate = document.getElementById('date');
    elPickup = document.getElementById('pickup');
    elDrop = document.getElementById('drop');
    elTime = document.getElementById('time');
    elDays = document.getElementById('days');
    elNights = document.getElementById('nights');
    elExtras = document.getElementById('outstationExtras');
    elKmHint = document.getElementById('kmHint');
    elName = document.getElementById('name');
    elPhone = document.getElementById('phone');
    elNotes = document.getElementById('notes');
    elTerms = document.getElementById('terms');
    elSummary = document.getElementById('summary');

    elVehicle.innerHTML = SA.VEHICLES.map(function (v) {
      return '<option value="' + v.id + '">' + UI.esc(v.name + ' · ' + v.seats + ' · ' + v.example) + '</option>';
    }).join('');

    /* Prefill from the fare calculator / vehicle page. */
    var p = UI.params();
    if (p.v && SA.vehicle(p.v)) elVehicle.value = p.v;
    if (p.type === 'outstation' || p.type === 'local') elTrip.value = p.type;
    if (Number(p.km) > 0) elKm.value = Number(p.km);
    if (Number(p.days) > 0) elDays.value = Math.round(Number(p.days));
    if (Number(p.nights) > 0) elNights.value = Math.round(Number(p.nights));
    if (p.to) elDrop.value = p.to;
    if (p.from) elPickup.value = p.from;
    if (p.time) elTime.value = p.time;

    /* Travel date cannot be in the past; default to today. */
    var today = new Date();
    var iso = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    elDate.min = iso;
    elDate.value = (p.date && p.date >= iso) ? p.date : iso;

    ['change', 'input'].forEach(function (evt) {
      [elVehicle, elTrip, elKm, elDate, elTime, elPickup, elDrop, elDays, elNights]
        .forEach(function (el) { el.addEventListener(evt, renderSummary); });
    });

    /* Days and the minimum-KM floor only apply to outstation hires. */
    function syncTripType() {
      var out = currentTrip() === 'outstation';
      elExtras.classList.toggle('hidden', !out);
      elKmHint.textContent = out
        ? 'Total running distance including the return leg — the vehicle has to come back.'
        : 'Total distance you expect to cover during the hire.';
    }
    elTrip.addEventListener('change', syncTripType);
    syncTripType();

    elPhone.addEventListener('input', function () {
      elPhone.value = elPhone.value.replace(/\D/g, '').slice(0, 10);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var bad = form.querySelector('.is-invalid input, .is-invalid select');
        if (bad) bad.focus();
        UI.toast('Please check the highlighted fields.');
        return;
      }

      var v = SA.vehicle(elVehicle.value);
      var trip = currentTrip();
      var km = Number(elKm.value);

      var enquiry = {
        ref: SA.nextRef(),
        name: elName.value.trim(),
        phone: elPhone.value.trim(),
        vehicleId: v.id,
        tripType: trip,
        pickup: elPickup.value.trim(),
        drop: elDrop.value.trim(),
        distance: km,
        days: trip === 'outstation' ? Math.max(1, Math.round(Number(elDays.value) || 1)) : 1,
        nights: trip === 'outstation' ? Math.max(0, Math.round(Number(elNights.value) || 0)) : 0,
        date: elDate.value,
        time: elTime.value,
        notes: elNotes.value.trim(),
        status: 'New',
        createdAt: new Date().toISOString()
      };

      SA.addEnquiry(enquiry);

      /* Booking goes straight to WhatsApp. The enquiry is still saved first so
         it reaches the admin panel even if the visitor never sends the message.
         Opened inside the submit gesture so it is not treated as a popup; if the
         browser blocks it anyway, the confirmation page repeats the link. */
      window.open(whatsappLink(enquiry), '_blank', 'noopener');
      window.location.href = 'confirmation.html?ref=' + encodeURIComponent(enquiry.ref);
    });

    renderSummary();
  });
})();

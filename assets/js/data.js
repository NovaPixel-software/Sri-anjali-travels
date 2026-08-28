/* ==========================================================================
   Sri Anjali Travels — data layer
   Vehicles, per-km rates, enquiry storage and formatting helpers.
   Rates & enquiries persist in localStorage so the Admin Panel can edit them.
   ========================================================================== */
window.SA = (function () {
  'use strict';

  var RATES_KEY = 'sa_rates_v1';
  var CHARGES_KEY = 'sa_charges_v1';
  var ENQ_KEY = 'sa_enquiries_v1';
  var SEQ_KEY = 'sa_ref_seq_v1';

  var BRAND = {
    name: 'Sri Anjali Travels',
    tagline: 'Safe Journeys • Happy Memories • Divine Blessings',
    phone: '+91 12345 67890',
    phoneDial: '+911234567890',
    whatsapp: '911234567890',
    email: 'info@srianjalitravels.com',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '123, New Street, Bengaluru - 560 001, Karnataka, India'
  };

  var VEHICLES = [
    {
      id: 'sedan',
      name: 'Compact Sedan',
      seats: '4 Seater',
      example: 'Swift Dzire or similar',
      img: 'assets/img/veh-sedan.png',
      seatCount: '4 Seats',
      blurb: 'Light on the pocket and easy through city traffic — our most booked ride for airport runs and short trips.',
      features: ['Air Conditioned', 'Comfortable Seats', 'Ample Luggage Space'],
      specs: {
        'Seating Capacity': '4 Seater',
        'Fuel Type': 'Petrol',
        'Transmission': 'Manual',
        'AC': 'Yes',
        'Luggage Capacity': '2 Bags',
        'Best For': 'City Rides, Airport Transfers'
      }
    },
    {
      id: 'mpv',
      name: 'MPV',
      seats: '6 Seater',
      example: 'Innova or similar',
      img: 'assets/img/veh-mpv.png',
      seatCount: '6 Seats',
      blurb: 'Roomy, smooth and steady on long drives — the family favourite for outstation journeys.',
      features: ['Air Conditioned', 'Comfortable Seats', 'Ample Luggage Space'],
      specs: {
        'Seating Capacity': '6 Seater',
        'Fuel Type': 'Diesel',
        'Transmission': 'Manual',
        'AC': 'Yes',
        'Luggage Capacity': '5 Bags',
        'Best For': 'Family Trips, Outstation'
      }
    },
    {
      id: 'suv',
      name: 'SUV',
      seats: '6-7 Seater',
      example: 'Ertiga or similar',
      img: 'assets/img/veh-suv.png',
      seatCount: '6-7 Seats',
      blurb: 'Higher ground clearance and extra seats — ideal for hill stations and mixed road conditions.',
      features: ['Air Conditioned', 'Comfortable Seats', 'Ample Luggage Space'],
      specs: {
        'Seating Capacity': '6-7 Seater',
        'Fuel Type': 'Diesel',
        'Transmission': 'Manual',
        'AC': 'Yes',
        'Luggage Capacity': '4 Bags',
        'Best For': 'Hill Stations, Group Travel'
      }
    },
    {
      id: 'minibus',
      name: 'Minibus',
      seats: '12-16 Seater',
      example: 'Tempo Traveller or similar',
      img: 'assets/img/veh-minibus.png',
      seatCount: '12-16 Seats',
      blurb: 'Travel together without splitting the group — built for pilgrimages, weddings and corporate outings.',
      features: ['Air Conditioned', 'Comfortable Seats', 'Ample Luggage Space'],
      specs: {
        'Seating Capacity': '12-16 Seater',
        'Fuel Type': 'Diesel',
        'Transmission': 'Manual',
        'AC': 'Yes',
        'Luggage Capacity': '12 Bags',
        'Best For': 'Group Tours, Pilgrimage, Events'
      }
    }
  ];

  /* Popular outstation runs from Bengaluru. Distances are round-trip figures,
     since an outstation vehicle has to come back. Fares are derived live from
     the current rates, so an admin rate change updates these cards too. */
  var ROUTE_GROUPS = [
    { id: 'hills', label: 'Hill Stations', ico: 'compass' },
    { id: 'weekend', label: 'Weekend Getaways', ico: 'sparkle' },
    { id: 'pilgrimage', label: 'Pilgrimage &amp; Heritage', ico: 'heart' },
    { id: 'cities', label: 'Metro &amp; Cities', ico: 'building' }
  ];

  /* Round-trip road distances from Bengaluru, with the number of days the trip
     realistically takes. `days` is set per route rather than derived from the
     minimum-KM floor: how long a journey takes and what it bills as a minimum
     are different things. Mysuru is 290 KM round trip but a comfortable single
     day, and pricing it as two would simply overcharge.
     Anything leaving Karnataka needs a state entry permit — flagged in the note. */
  var ROUTES = [
    { to: 'Nandi Hills', km: 120, days: 1, group: 'hills', note: 'Sunrise run · back by lunch' },
    { to: 'Chikkamagaluru', km: 490, days: 2, group: 'hills', note: 'Coffee country · overnight stay' },
    { to: 'Coorg', km: 520, days: 2, group: 'hills', note: 'Madikeri &amp; Abbey Falls' },
    { to: 'Ooty', km: 540, days: 2, group: 'hills', note: 'Tamil Nadu · state permit applies' },

    { to: 'Mysuru', km: 290, days: 1, group: 'weekend', note: 'Palace city · comfortable day trip' },
    { to: 'Wayanad', km: 560, days: 2, group: 'weekend', note: 'Kerala · state permit applies' },
    { to: 'Pondicherry', km: 620, days: 2, group: 'weekend', note: 'Coastal · state permit applies' },

    { to: 'Shravanabelagola', km: 300, days: 1, group: 'pilgrimage', note: 'Jain heritage · day return' },
    { to: 'Tirupati', km: 500, days: 2, group: 'pilgrimage', note: 'Andhra Pradesh · permit applies' },
    { to: 'Dharmasthala', km: 580, days: 2, group: 'pilgrimage', note: 'Temple town · overnight' },
    { to: 'Hampi', km: 680, days: 3, group: 'pilgrimage', note: 'UNESCO ruins · sightseeing days' },

    { to: 'Mangaluru', km: 700, days: 2, group: 'cities', note: 'Coastal Karnataka · Shiradi ghat' },
    { to: 'Chennai', km: 700, days: 2, group: 'cities', note: 'Tamil Nadu · state permit applies' },
    { to: 'Hyderabad', km: 1140, days: 3, group: 'cities', note: 'Telangana · permit applies' }
  ];

  /* ------------------------------------------------------------------------
     Commercial terms beyond the per-KM rate.

     An outstation trip is not simply distance x rate. Across the Indian cab
     trade the bill is built from three parts, and a calculator that ignores
     the last two under-quotes a multi-day trip badly:

       1. distance    - chargeable KM x per-KM rate
       2. minimum KM  - each day of the hire bills a floor number of KM,
                        because the vehicle is committed to you all day
       3. driver bata - the driver's daily allowance, plus a night allowance
                        when the trip runs through the small hours

     PLACEHOLDERS: the figures below are typical of the trade, NOT confirmed
     Sri Anjali numbers. Set them from the Admin Panel (Charges tab) before
     going live, or the site will quote customers terms you have not agreed to.
     ------------------------------------------------------------------------ */
  var DEFAULT_CHARGES = {
    minKmPerDay: 250,        // cars: chargeable floor per day of an outstation hire
    minKmPerDayLarge: 300,   // minibus / tempo traveller floor
    driverBata: 300,         // per day, daytime running
    nightBata: 300,          // added per night when driving between 10 PM and 6 AM
    extraHourRate: 150       // beyond a local hourly package
  };

  /* Local hourly packages — the standard way city hires are sold. */
  var HOURLY_PACKAGES = [
    { id: '4-40', label: '4 hrs / 40 KM', hours: 4, km: 40, note: 'Half-day city use' },
    { id: '8-80', label: '8 hrs / 80 KM', hours: 8, km: 80, note: 'Full working day' },
    { id: '12-120', label: '12 hrs / 120 KM', hours: 12, km: 120, note: 'Long day or event' }
  ];

  var DEFAULT_RATES = {
    sedan: { local: 12, outstation: 11 },
    mpv: { local: 15, outstation: 14 },
    suv: { local: 18, outstation: 17 },
    minibus: { local: 25, outstation: 24 }
  };

  var SEED_ENQUIRIES = [
    { ref: 'SAT25052601', name: 'Karthik', phone: '9876543210', vehicleId: 'mpv', tripType: 'outstation', distance: 180, date: '2025-05-26', notes: '', status: 'New', createdAt: '2025-05-26T09:12:00' },
    { ref: 'SAT25052602', name: 'Priya', phone: '8765432109', vehicleId: 'suv', tripType: 'local', distance: 60, date: '2025-05-26', notes: 'Airport pickup at 6 AM', status: 'Contacted', createdAt: '2025-05-26T10:40:00' },
    { ref: 'SAT25052603', name: 'Rajesh', phone: '9098765432', vehicleId: 'sedan', tripType: 'local', distance: 45, date: '2025-05-26', notes: '', status: 'New', createdAt: '2025-05-26T14:05:00' },
    { ref: 'SAT25052504', name: 'Vijay', phone: '8012345678', vehicleId: 'minibus', tripType: 'outstation', distance: 320, date: '2025-05-25', notes: 'Temple tour, 14 passengers', status: 'Contacted', createdAt: '2025-05-25T17:30:00' }
  ];

  /* ---------- storage ---------- */
  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getRates() {
    var stored = read(RATES_KEY, null);
    var out = {};
    VEHICLES.forEach(function (v) {
      var d = DEFAULT_RATES[v.id];
      var s = stored && stored[v.id] ? stored[v.id] : {};
      out[v.id] = {
        local: Number(s.local) > 0 ? Number(s.local) : d.local,
        outstation: Number(s.outstation) > 0 ? Number(s.outstation) : d.outstation
      };
    });
    return out;
  }
  function saveRates(rates) { return write(RATES_KEY, rates); }
  function resetRates() {
    try { window.localStorage.removeItem(RATES_KEY); } catch (e) {}
    return getRates();
  }

  function getCharges() {
    var stored = read(CHARGES_KEY, null) || {};
    var out = {};
    Object.keys(DEFAULT_CHARGES).forEach(function (k) {
      var v = Number(stored[k]);
      out[k] = v >= 0 && stored[k] !== undefined && stored[k] !== '' ? v : DEFAULT_CHARGES[k];
    });
    return out;
  }
  function saveCharges(charges) { return write(CHARGES_KEY, charges); }
  function resetCharges() {
    try { window.localStorage.removeItem(CHARGES_KEY); } catch (e) {}
    return getCharges();
  }

  function getEnquiries() {
    var stored = read(ENQ_KEY, null);
    if (!stored) { write(ENQ_KEY, SEED_ENQUIRIES); return SEED_ENQUIRIES.slice(); }
    return stored;
  }
  function saveEnquiries(list) { return write(ENQ_KEY, list); }
  function addEnquiry(entry) {
    var list = getEnquiries();
    list.unshift(entry);
    saveEnquiries(list);
    return entry;
  }
  function findEnquiry(ref) {
    var list = getEnquiries();
    for (var i = 0; i < list.length; i++) { if (list[i].ref === ref) return list[i]; }
    return null;
  }
  function setEnquiryStatus(ref, status) {
    var list = getEnquiries();
    for (var i = 0; i < list.length; i++) {
      if (list[i].ref === ref) { list[i].status = status; break; }
    }
    saveEnquiries(list);
  }

  /* ---------- reference numbers: SAT + YYMMDD + running number ---------- */
  function nextRef() {
    var d = new Date();
    var stamp = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    var seq = read(SEQ_KEY, null);
    var n = (seq && seq.stamp === stamp) ? seq.n + 1 : 1;
    write(SEQ_KEY, { stamp: stamp, n: n });
    return 'SAT' + stamp + pad(n);
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* ---------- lookups & maths ---------- */
  function vehicle(id) {
    for (var i = 0; i < VEHICLES.length; i++) { if (VEHICLES[i].id === id) return VEHICLES[i]; }
    return null;
  }
  function rateFor(id, tripType) {
    var r = getRates()[id];
    if (!r) return 0;
    return tripType === 'outstation' ? r.outstation : r.local;
  }
  function fareFor(id, tripType, km) {
    var distance = Number(km);
    if (!(distance > 0)) return 0;
    return Math.round(rateFor(id, tripType) * distance);
  }
  /* Minimum chargeable KM for one day of an outstation hire. */
  function minKmFor(vehicleId) {
    var c = getCharges();
    return vehicleId === 'minibus' ? c.minKmPerDayLarge : c.minKmPerDay;
  }

  /* A sensible default number of days for a given round-trip distance, based on
     the same minimum-KM floor the fare uses. Callers can always override. */
  function suggestedDays(km, vehicleId) {
    var distance = Number(km) || 0;
    return Math.max(1, Math.ceil(distance / minKmFor(vehicleId || 'sedan')));
  }

  /* Full itemised quote. `opts` = { days, nights } and only matters outstation.
     Returns every line separately so the UI can show the customer the build-up
     rather than one opaque number. */
  function quote(vehicleId, tripType, km, opts) {
    opts = opts || {};
    var rate = rateFor(vehicleId, tripType);
    var charges = getCharges();
    var distance = Number(km) > 0 ? Number(km) : 0;

    if (tripType !== 'outstation') {
      return {
        tripType: 'local', rate: rate, enteredKm: distance, chargeableKm: distance,
        days: 1, nights: 0, minKmPerDay: 0, minApplied: false,
        distanceFare: Math.round(rate * distance),
        bata: 0, nightBata: 0,
        total: Math.round(rate * distance)
      };
    }

    var days = Math.max(1, Math.round(Number(opts.days) || 1));
    var nights = Math.max(0, Math.round(Number(opts.nights) || 0));
    var minPerDay = minKmFor(vehicleId);
    var floor = minPerDay * days;
    var chargeableKm = Math.max(distance, floor);

    var distanceFare = Math.round(rate * chargeableKm);
    var bata = charges.driverBata * days;
    var nightBata = charges.nightBata * nights;

    return {
      tripType: 'outstation', rate: rate, enteredKm: distance, chargeableKm: chargeableKm,
      days: days, nights: nights, minKmPerDay: minPerDay,
      minApplied: chargeableKm > distance,
      distanceFare: distanceFare, bata: bata, nightBata: nightBata,
      total: distanceFare + bata + nightBata
    };
  }

  /* Price a local hourly package: the package KM at the local rate. */
  function packageQuote(vehicleId, pkgId) {
    var pkg = null;
    HOURLY_PACKAGES.forEach(function (p) { if (p.id === pkgId) pkg = p; });
    if (!pkg) return null;
    var rate = rateFor(vehicleId, 'local');
    return {
      pkg: pkg, rate: rate,
      total: Math.round(rate * pkg.km),
      extraKmRate: rate,
      extraHourRate: getCharges().extraHourRate
    };
  }

  /* All vehicles priced for a trip, cheapest first. */
  function quotes(tripType, km, opts) {
    return VEHICLES.map(function (v) {
      var q = quote(v.id, tripType, km, opts);
      return { vehicle: v, rate: q.rate, fare: q.total, detail: q };
    }).sort(function (a, b) { return a.fare - b.fare; });
  }

  /* ---------- formatting ---------- */
  function money(n) {
    var num = Number(n) || 0;
    try { return '₹ ' + num.toLocaleString('en-IN'); }
    catch (e) { return '₹ ' + num; }
  }
  function rate(n) { return '₹' + n + ' / KM'; }
  function tripLabel(t) { return t === 'outstation' ? 'Outstation' : 'Local'; }
  function prettyDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2);
  }

  return {
    BRAND: BRAND,
    VEHICLES: VEHICLES,
    ROUTES: ROUTES,
    ROUTE_GROUPS: ROUTE_GROUPS,
    HOURLY_PACKAGES: HOURLY_PACKAGES,
    DEFAULT_CHARGES: DEFAULT_CHARGES,
    getCharges: getCharges,
    saveCharges: saveCharges,
    resetCharges: resetCharges,
    minKmFor: minKmFor,
    suggestedDays: suggestedDays,
    quote: quote,
    packageQuote: packageQuote,
    DEFAULT_RATES: DEFAULT_RATES,
    vehicle: vehicle,
    getRates: getRates,
    saveRates: saveRates,
    resetRates: resetRates,
    rateFor: rateFor,
    fareFor: fareFor,
    quotes: quotes,
    getEnquiries: getEnquiries,
    addEnquiry: addEnquiry,
    findEnquiry: findEnquiry,
    setEnquiryStatus: setEnquiryStatus,
    nextRef: nextRef,
    money: money,
    rate: rate,
    tripLabel: tripLabel,
    prettyDate: prettyDate
  };
})();

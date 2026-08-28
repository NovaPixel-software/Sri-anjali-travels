# Sri Anjali Travels — website

Static, dependency-free website built from the Sri Anjali Travels design mockup.
Plain HTML, CSS and JavaScript — no build step, no framework, no npm install.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```powershell
python -m http.server 5173
# then open http://localhost:5173
```

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, fleet, how booking works, why book with us, CTA |
| `vehicles.html` | Fleet list with features and starting rates |
| `vehicle.html?v=mpv` | Vehicle details — specs plus a live fare estimator |
| `fare-calculator.html` | Fare calculator — Local/Outstation × Compare All/Guided |
| `booking.html?v=mpv&type=local&km=50` | Enquiry form with a live trip summary |
| `confirmation.html?ref=SAT...` | Thank-you page with reference number and trip recap |
| `about.html` | Who we are, stats, services |
| `contact.html` | Phone / WhatsApp / email / address, service areas |
| `admin.html` | Dashboard, rates management, enquiry list |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms & conditions |

Pages link to each other with query strings, so a fare quote carries the vehicle,
trip type and distance straight into the booking form.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#00294D` | Headings, primary buttons, header bars |
| `--gold` | `#DAA017` | Accents, primary CTA, active states |
| `--mist` | `#F5F7FA` | Page background, table headers |
| `--white` | `#FFFFFF` | Cards and panels |
| `--grey` | `#687280` | Secondary text |

Typography is Poppins (400 / 500 / 600) from Google Fonts, with a system
sans-serif fallback stack.

## Shared header and footer

The header and footer are **not duplicated in every page**. `assets/js/chrome.js`
holds one definition of both and renders them into the `<div id="siteHeader">` /
`<div id="siteFooter">` placeholders each page carries. Change a nav link, a
service, a service area or a phone number there and it updates across all eleven
pages at once. Load order matters: `data.js` → `app.js` → `chrome.js`, all at the
end of `<body>`, so the chrome exists before `app.js` hydrates icons on
`DOMContentLoaded`.

The trade-off is that nav and footer links are JS-rendered. That is fine for this
site (fleet lists, fares and forms already need JS), but if search visibility of
footer links matters later, inline the output of `chrome.js` into each page at
build time.

## Images

`design/` holds the reference mockups this site was built from. Raster assets
were cut out of them at full resolution, so the rendered page matches the design:

| Asset | Source |
| --- | --- |
| `assets/img/logo-mark.png` | `design/logo-source.png` — the real transparent logo, trimmed to its bounding box |
| `assets/img/hero-scene.png` | hero band of `design/home-reference.png` |
| `assets/img/veh-*.png` | the four fleet cards of `design/home-reference.png` |
| `assets/img/scene-about.png` | mountain-road section of the hero photo |
| `assets/img/scene-contact.png` | winding-road section of the hero photo |

The logo is a true transparent PNG, so the same file sits on the white header and
the navy footer. For the vehicle photos, near-white pixels were flattened to pure
`#FFFFFF` so the cutouts sit seamlessly on white cards.

`line-hills.svg` (the faint watermark behind page titles), the gold hero wave,
the footer lotus and every UI icon (defined in `assets/js/app.js`) are
hand-written SVG. Nothing loads from a third-party host except the webfont.

The About and Contact photos are crops of different regions of the same hero
photograph, since that is the only high-resolution photography in the reference
sheets. **Replacing these two with your own photos of your actual vehicles is
the single highest-value upgrade to this site** — keep the filenames and nothing
else needs to change.

To swap in real photography later, drop replacements in with the same filenames —
no code changes needed. `design/` is reference material and does not need to be
deployed.

## Fares

An outstation bill is **not** distance x rate. It is built from three parts, and
the site models all three:

1. **Distance** — chargeable KM x the per-KM rate for that vehicle
2. **Minimum KM per day** — each day of an outstation hire bills a floor, because
   the vehicle is committed to you all day
3. **Driver allowance (bata)** — a daily amount, plus a night allowance for any
   night the driver runs between 10 PM and 6 AM

Toll, parking and state permit sit outside the quoted fare and are billed at cost.
Local trips are simply distance x rate with no minimum and no bata.

`SA.quote(vehicleId, tripType, km, { days, nights })` in `assets/js/data.js` is
the single source of truth and returns every line separately, so the calculator,
booking summary, confirmation page, admin tables and homepage route cards can
all show the same itemised build-up.

Default per-KM rates (from the original mockup):

| Vehicle | Local | Outstation |
| --- | --- | --- |
| Compact Sedan | Rs 12 | Rs 11 |
| MPV | Rs 15 | Rs 14 |
| SUV | Rs 18 | Rs 17 |
| Minibus | Rs 25 | Rs 24 |

Editing rates in the Admin Panel overrides these and takes effect everywhere
immediately — vehicle rows, fare calculator, booking summary and the route
cards on the homepage all read the same live values.

### Charges you MUST set before launch

`DEFAULT_CHARGES` in `assets/js/data.js` (editable in Admin → **Charges**) ships
with figures that are **typical of the trade, not confirmed Sri Anjali terms**:

| Setting | Placeholder | What it does |
| --- | --- | --- |
| `minKmPerDay` | 250 KM | Daily chargeable floor, cars |
| `minKmPerDayLarge` | 300 KM | Daily chargeable floor, minibus |
| `driverBata` | Rs 300 / day | Driver's daily allowance |
| `nightBata` | Rs 300 / night | Added for running 10 PM – 6 AM |
| `extraHourRate` | Rs 150 / hour | Beyond a local hourly package |

**The 250 KM/day default is a long-haul convention.** It suits most Bengaluru
outstation runs, which are long enough to clear it on their own, but it still
swamps short hops — a 120 KM Nandi Hills round trip prices on the floor, not on
its actual distance. Every affected route card says
so on its face ("Billed on the 250 KM/day minimum, not 100 KM") rather than
quietly showing a flat number — but the real fix is to set your own figure, or to
drop the minimum to 0 if you bill short trips on actual distance.

Popular routes (`ROUTES` in `assets/js/data.js`) are round-trip distances from
Bengaluru grouped into hill stations, weekend getaways, pilgrimage & heritage
and cities,
priced off the current sedan outstation rate plus the driver allowance.

## Data storage — read before going live

The admin panel is a **front-end demo**. Rates and enquiries are kept in the
visitor's own browser via `localStorage`:

- A submitted enquiry is visible only in the browser that submitted it.
- Rate changes made in the admin panel apply only to that browser.
- Nothing is emailed, texted or sent to a server.

Before launch, replace the storage functions in `assets/js/data.js`
(`getRates` / `saveRates` / `getEnquiries` / `addEnquiry` / `setEnquiryStatus`)
with API calls, add real authentication to `admin.html`, and post the booking
form to a backend that notifies your team.

Placeholder contact details (`+91 12345 67890`, `info@srianjalitravels.com`,
the New Street address) come from the mockup and need replacing with the real
ones — they appear in every page footer, in `contact.html`, and in `BRAND`
inside `assets/js/data.js`.

## File layout

```
index.html  vehicles.html  vehicle.html  fare-calculator.html
booking.html  confirmation.html  about.html  contact.html  admin.html
privacy.html  terms.html
assets/
  css/styles.css     design tokens + every component
  js/data.js         vehicles, rates, enquiry storage, formatting
  js/app.js          icon set, mobile nav, toasts, URL helpers
  js/fare.js         fare calculator
  js/booking.js      enquiry form
  js/chrome.js       shared header + footer
  js/admin.js        admin panel
  img/              logo, vehicle photos, scene illustrations
design/             the two reference mockups (not deployed)
```

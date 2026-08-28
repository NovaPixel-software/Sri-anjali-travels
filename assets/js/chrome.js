/* ==========================================================================
   Sri Anjali Travels — site chrome (header + footer)
   Rendered from one definition so every page stays in step. Runs synchronously
   at the end of <body>, before app.js hydrates icons on DOMContentLoaded.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.SA ? SA.BRAND : {};
  var WA = 'https://wa.me/' + (B.whatsapp || '');

  var NAV = [
    { href: 'index.html', label: 'Home' },
    { href: 'vehicles.html', label: 'Vehicles' },
    { href: 'fare-calculator.html', label: 'Fare Calculator' },
    { href: 'about.html', label: 'About Us' },
    { href: 'contact.html', label: 'Contact Us' }
  ];

  var SERVICES = [
    { ico: 'car', label: 'Local Travel', href: 'vehicles.html' },
    { ico: 'road', label: 'Outstation Trips', href: 'fare-calculator.html?type=outstation' },
    { ico: 'plane', label: 'Airport Transfers', href: 'booking.html' },
    { ico: 'bag', label: 'Corporate Travel', href: 'contact.html' }
  ];

  var AREAS = ['Bengaluru', 'Mysuru', 'Tumakuru', 'Hassan', 'Mandya'];

  function headerHTML() {
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '">' + n.label + '</a>';
    }).join('');

    return '' +
      '<header class="site-header">' +
        '<div class="wrap site-header__inner">' +
          '<a class="logo" href="index.html">' +
            '<img class="logo__mark" src="assets/img/logo-mark.png" alt="" width="360" height="364">' +
            '<span class="logo__text">' +
              '<span class="logo__name">Sri <em>Anjali</em></span><br>' +
              '<span class="logo__sub">Travels</span>' +
            '</span>' +
          '</a>' +
          '<nav class="nav" aria-label="Primary">' + links + '</nav>' +
          '<a class="btn btn--navy nav-cta" href="booking.html">' +
            '<span class="ico ico--sm" data-ico="phone"></span>' +
            '<span class="cta-label">Book Now</span></a>' +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobileNav" ' +
            'aria-label="Open menu"><span></span></button>' +
        '</div>' +
        '<div class="mobile-nav" id="mobileNav">' + links +
          '<a href="booking.html">Book / Enquire</a>' +
        '</div>' +
      '</header>';
  }

  function footerHTML() {
    var quick = NAV.map(function (n) {
      return '<li><a href="' + n.href + '">' + n.label + '</a></li>';
    }).join('');

    var services = SERVICES.map(function (s) {
      return '<li><a href="' + s.href + '">' +
        '<span class="ico ico--sm" data-ico="' + s.ico + '"></span>' + s.label + '</a></li>';
    }).join('');

    var areas = AREAS.map(function (a) {
      return '<li><span class="ico ico--sm" data-ico="pin"></span>' + a + '</li>';
    }).join('') +
      '<li><a href="contact.html" style="padding-left:24px">… and more</a></li>';

    return '' +
      '<footer class="site-footer">' +
        '<div class="wrap">' +
          '<div class="footer-grid">' +

            '<div class="footer-brand">' +
              '<div class="logo logo--footer">' +
                '<img class="logo__mark" src="assets/img/logo-mark.png" alt="" width="360" height="364">' +
                '<span class="logo__text">' +
                  '<span class="logo__name">Sri <em>Anjali</em></span><br>' +
                  '<span class="logo__sub">Travels</span>' +
                '</span>' +
              '</div>' +
              '<p>Reliable travel partner for local &amp; outstation trips. Comfortable rides, ' +
                'transparent fares and memorable journeys.</p>' +
              '<div class="socials">' +
                '<a href="' + WA + '" target="_blank" rel="noopener" aria-label="WhatsApp">' +
                  '<span class="ico ico--sm" data-ico="whatsapp"></span></a>' +
                '<a href="tel:' + B.phoneDial + '" aria-label="Call us">' +
                  '<span class="ico ico--sm" data-ico="phone"></span></a>' +
                '<a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">' +
                  '<span class="ico ico--sm" data-ico="facebook"></span></a>' +
                '<a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">' +
                  '<span class="ico ico--sm" data-ico="instagram"></span></a>' +
              '</div>' +
            '</div>' +

            '<div><h4>Quick Links</h4><ul class="flinks">' + quick + '</ul></div>' +
            '<div><h4>Our Services</h4><ul class="flinks flinks--ico">' + services + '</ul></div>' +
            '<div><h4>Service Areas</h4><ul class="flinks flinks--ico">' + areas + '</ul></div>' +

            '<div><h4>Contact Us</h4><ul class="flinks flinks--ico">' +
              '<li><a href="tel:' + B.phoneDial + '">' +
                '<span class="ico ico--sm" data-ico="phone"></span>' + B.phone + '</a></li>' +
              '<li><a href="' + WA + '" target="_blank" rel="noopener">' +
                '<span class="ico ico--sm" data-ico="whatsapp"></span>' + B.phone + '</a></li>' +
              '<li><a href="mailto:' + B.email + '">' +
                '<span class="ico ico--sm" data-ico="mail"></span>' + B.email + '</a></li>' +
              '<li><span class="ico ico--sm" data-ico="pin"></span>' +
                '<span>123, New Street,<br>Bengaluru - 560 001,<br>Karnataka, India</span></li>' +
            '</ul></div>' +

          '</div>' +

          '<div class="footer-bottom">' +
            '<p><span>© <span data-year>2026</span> Sri Anjali Travels. All Rights Reserved.</span>' +
              '<span class="dot">|</span><a href="privacy.html">Privacy Policy</a>' +
              '<span class="dot">|</span><a href="terms.html">Terms &amp; Conditions</a></p>' +
            '<svg class="lotus" viewBox="0 0 240 34" fill="none" stroke="#DAA017" ' +
              'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M4 22h66M170 22h66" opacity=".5"/>' +
              '<path d="M74 22c2.6-1.6 5.4-2 8-1.4M166 22c-2.6-1.6-5.4-2-8-1.4" opacity=".7"/>' +
              '<path d="M120 4c-5 5.4-7.6 11.6-7.6 18.6M120 4c5 5.4 7.6 11.6 7.6 18.6"/>' +
              '<path d="M112.4 22.6c-2.4-6.6-7-11.4-13-13.8-.9 6.9 1.2 12.9 6 17.4"/>' +
              '<path d="M127.6 22.6c2.4-6.6 7-11.4 13-13.8.9 6.9-1.2 12.9-6 17.4"/>' +
              '<path d="M105.4 26.2c-4.8-3.9-10.5-5.7-16.8-5.1 3 5.4 7.5 8.7 13.5 9.6"/>' +
              '<path d="M134.6 26.2c4.8-3.9 10.5-5.7 16.8-5.1-3 5.4-7.5 8.7-13.5 9.6"/>' +
              '<path d="M102 30.4h36"/>' +
            '</svg>' +
          '</div>' +

        '</div>' +
      '</footer>' +

      '<a class="fab" href="' + WA + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
        '<span class="ico" data-ico="whatsapp"></span></a>';
  }

  function mount(id, html) {
    var host = document.getElementById(id);
    if (host) host.outerHTML = html;
  }

  mount('siteHeader', headerHTML());
  mount('siteFooter', footerHTML());
})();

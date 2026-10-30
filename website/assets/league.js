/* The Game Up League - motion layer.
   Progressive enhancement only: without GSAP, Lenis, or with reduced motion the page is complete. */
(function () {
  'use strict';
  var d = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);

  // 1. Emoji out of headings and labels: same words, cleaner look. Only text nodes are touched.
  var EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{FE0F}\u{200D}]/gu;
  d.querySelectorAll('.card h3,.tlPanelTitle,.flipHintChip,#turf .card p,.contactValue').forEach(function (el) {
    var walker = d.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) n.nodeValue = n.nodeValue.replace(EMOJI, '').replace(/^\s+/, '');
  });

  // 2. Smooth, inertial scroll on desktop. Touch keeps the browser's own scrolling.
  var lenis = null;
  if (!reduced && hasGSAP && window.Lenis && hoverFine) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      var target = d.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    });
  }

  // 3. Text roll on links and buttons: the label slides up and a copy takes its place.
  d.querySelectorAll('.links a,.mobileMenu a,.btn,.tlFooterLinks a').forEach(function (el) {
    var onlyText = Array.prototype.every.call(el.childNodes, function (n) { return n.nodeType === 3; });
    var txt = el.textContent.trim();
    if (!onlyText || !txt || el.querySelector('.roll')) return;
    el.setAttribute('aria-label', txt);
    var roll = d.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 2; i++) {
      var s = d.createElement('span');
      s.textContent = txt;
      roll.appendChild(s);
    }
    el.textContent = '';
    el.appendChild(roll);
  });

  // 4. Section headlines: words rise out of masks as they enter.
  if (!reduced && hasGSAP) {
    d.querySelectorAll('main .section-head h2').forEach(function (h) {
      var walker = d.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var frag = d.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
          var w = d.createElement('span'); w.className = 'w';
          var wi = d.createElement('span'); wi.className = 'wi'; wi.textContent = p;
          w.appendChild(wi); frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      });
      var words = h.querySelectorAll('.wi');
      if (words.length) {
        gsap.from(words, { yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.07,
          scrollTrigger: { trigger: h, start: 'top 90%', toggleActions: 'play none none none' } });
      }
    });

    // Big photographs ease in as they arrive: a quick curtain, then a slow settle.
    d.querySelectorAll('.trophyGlowImg').forEach(function (img) {
      gsap.from(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.08, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: img, start: 'top 88%', toggleActions: 'play none none none' }, clearProps: 'clipPath,scale' });
    });
    d.querySelectorAll('#gallery img').forEach(function (img) {
      gsap.from(img, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: img, start: 'top 88%', toggleActions: 'play none none none' }, clearProps: 'clipPath' });
      gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Headlines drift a little as you scroll past them.
    d.querySelectorAll('main .section-head h2').forEach(function (h2) {
      gsap.fromTo(h2, { x: -18 }, { x: 18, ease: 'none',
        scrollTrigger: { trigger: h2, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // 5. Slanted page wipe when heading to the registration pages.
  if (!reduced && hasGSAP) {
    var wipe = d.createElement('div');
    wipe.className = 'wipe';
    wipe.setAttribute('aria-hidden', 'true');
    d.body.appendChild(wipe);
    var open = 'polygon(-40% 0,-40% 0,-60% 100%,-60% 100%)';
    var cover = 'polygon(0 0,140% 0,100% 100%,-40% 100%)';
    window.addEventListener('pageshow', function (e) { if (e.persisted) gsap.set(wipe, { clipPath: open }); });
    d.querySelectorAll('a[href="register.html"],a[href="register-team.html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank') return;
        e.preventDefault();
        gsap.to(wipe, { clipPath: cover, duration: 0.55, ease: 'power3.inOut', onComplete: function () { window.location.href = a.href; } });
      });
    });
  }

  // 6. Hub: the logo and a gold spotlight follow the pointer (desktop only).
  var hub = d.getElementById('timeline');
  if (hub && hoverFine && !reduced) {
    var hubRaf = 0;
    hub.addEventListener('pointermove', function (e) {
      if (hubRaf) return;
      hubRaf = requestAnimationFrame(function () {
        var r = hub.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        hub.style.setProperty('--px', ((nx - 0.5) * 2).toFixed(3));
        hub.style.setProperty('--py', ((ny - 0.5) * 2).toFixed(3));
        hub.style.setProperty('--mx', (nx * 100).toFixed(1) + '%');
        hub.style.setProperty('--my', (ny * 100).toFixed(1) + '%');
        hubRaf = 0;
      });
    }, { passive: true });
  }

  // 7. Photo and roster cards tilt in 3D with a foil sheen (desktop only). Uses the individual
  //    rotate/scale properties so existing transform animations keep working.
  var TILT = '.championChip,.leaderCard';
  if (hoverFine && !reduced) {
    var cur = null;
    var reset = function (el) { el.style.rotate = ''; el.style.scale = ''; };
    d.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest(TILT) : null;
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      if (!el.classList.contains('tiltable')) {
        el.classList.add('tiltable');
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        if (el.parentElement) el.parentElement.style.perspective = '900px';
        var h = d.createElement('span');
        h.className = 'holo'; h.setAttribute('aria-hidden', 'true');
        el.appendChild(h);
      }
      var r = el.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      var a = Math.min(1, Math.hypot(nx, ny)) * 8;
      if (a > 0.05) el.style.rotate = (-ny).toFixed(3) + ' ' + nx.toFixed(3) + ' 0 ' + a.toFixed(2) + 'deg';
      el.style.scale = '1.03';
      el.style.setProperty('--hx', ((nx + 1) * 50).toFixed(1) + '%');
      el.style.setProperty('--hy', ((ny + 1) * 50).toFixed(1) + '%');
    }, { passive: true });
    d.documentElement.addEventListener('mouseleave', function () { if (cur) reset(cur); cur = null; });
  }

  // 8. Registration pages: headline, price and notice move into a sticky side column on desktop.
  var regC = d.querySelector('.reg .wrap > .container');
  if (regC) {
    var h1 = regC.querySelector('h1');
    var box = regC.querySelector('.offerBox,.feeBox');
    var notice = regC.querySelector('.notice');
    if (h1 && box) {
      var side = d.createElement('aside');
      side.className = 'regSide';
      regC.insertBefore(side, h1);
      [h1, h1.nextElementSibling && h1.nextElementSibling.classList.contains('sub') ? h1.nextElementSibling : null, box, notice]
        .forEach(function (el) { if (el) side.appendChild(el); });
    }
  }

  if (hasGSAP) {
    ScrollTrigger.refresh();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();

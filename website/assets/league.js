/* The Game Up League - motion layer.
   Direction: monumental type, physical scroll, text-roll hovers, video reels, a pinned sideways journey.
   Everything is progressive enhancement: without GSAP, Lenis or with reduced motion the page is
   complete and readable, the journey becomes a native swipe row and reels become static cards. */
(function () {
  'use strict';
  var d = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var wideFine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches;
  var saver = !!(navigator.connection && navigator.connection.saveData);

  // 1. Smooth, inertial scroll on desktop. Touch keeps the browser's own native scrolling.
  var lenis = null;
  if (!reduced && hasGSAP && window.Lenis) {
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

  // 2. Text roll: labels slide up and a copy takes their place on hover or focus.
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

  // 3. Section headlines: words rise out of masks as they enter.
  if (!reduced && hasGSAP) {
    d.querySelectorAll('main .section-head h2').forEach(function (h) {
      var walker = d.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var parts = n.nodeValue.split(/(\s+)/);
        var frag = d.createDocumentFragment();
        parts.forEach(function (p) {
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
  }

  // 4. Reels. Touch: portrait cards that play when on screen. Desktop: a clip floats beside the pointer.
  var rows = d.querySelectorAll('.reelRow');
  var canVideo = rows.length && !reduced && !saver;
  if (canVideo && !wideFine) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target.querySelector('video');
        if (!v) return;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.45, rootMargin: '0px 120px' });
    rows.forEach(function (r) { io.observe(r); });
  } else if (canVideo && wideFine) {
    var pv = d.createElement('div');
    pv.className = 'reelPreview';
    pv.setAttribute('aria-hidden', 'true');
    var pvv = d.createElement('video');
    pvv.muted = true; pvv.loop = true; pvv.setAttribute('playsinline', '');
    pv.appendChild(pvv);
    d.body.appendChild(pv);
    var px = 0, py = 0, qx = 0, qy = 0, active = false;
    d.addEventListener('pointermove', function (e) { qx = e.clientX + 36; qy = e.clientY - 150; }, { passive: true });
    (function loop() {
      px += (qx - px) * 0.16; py += (qy - py) * 0.16;
      pv.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        var src = r.getAttribute('data-src');
        if (pvv.getAttribute('src') !== src) pvv.src = src;
        var p = pvv.play(); if (p && p.catch) p.catch(function () {});
        pv.classList.add('on'); active = true;
      });
      r.addEventListener('mouseleave', function () { pv.classList.remove('on'); active = false; pvv.pause(); });
    });
  }

  // 5. Journey: pin the section and slide the seasons sideways as you scroll.
  var journey = d.getElementById('journey');
  var track = journey && journey.querySelector('.jtrack');
  if (journey && track && hasGSAP && !reduced) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    journey.classList.add('pinned');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: journey, start: 'top top', end: function () { return '+=' + dist(); },
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    var bar = journey.querySelector('.jbar i');
    if (bar) gsap.fromTo(bar, { scaleX: 0.2 }, { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: journey, start: 'top top', end: function () { return '+=' + dist(); }, scrub: true,
        invalidateOnRefresh: true } });
  }

  // 6. Collectible cards: pointer tilt with a foil sheen (desktop only). Uses the individual
  //    rotate/scale properties so existing transform animations keep working.
  var TILT = '.leaderCard,.ownerCard,.mascotCard,.matchDayCard';
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
      var a = Math.min(1, Math.hypot(nx, ny)) * 9;
      if (a > 0.05) el.style.rotate = (-ny).toFixed(3) + ' ' + nx.toFixed(3) + ' 0 ' + a.toFixed(2) + 'deg';
      el.style.scale = '1.04';
      el.style.setProperty('--hx', ((nx + 1) * 50).toFixed(1) + '%');
      el.style.setProperty('--hy', ((ny + 1) * 50).toFixed(1) + '%');
    }, { passive: true });
    d.documentElement.addEventListener('mouseleave', function () { if (cur) reset(cur); cur = null; });
  }

  // Heights shift once pins and word masks exist, and again when images land.
  if (hasGSAP) {
    ScrollTrigger.refresh();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();

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
  var startLenis = function () {
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
  };
  if (!reduced && hasGSAP && hoverFine) {
    if (window.Lenis) startLenis();
    else {
      var ls = d.createElement('script');
      ls.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
      ls.onload = startLenis;
      d.head.appendChild(ls);
    }
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
        gsap.from(words, { yPercent: 45, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity',
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
    if (hoverFine) d.querySelectorAll('main .section-head h2').forEach(function (h2) {
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

  // 11. More motion. Transform and opacity only; waits for the content it animates; the page stays
  //     fully visible if any of it fails.
  if (!reduced && hasGSAP) {
    // The navigation bar arrives with the page.
    gsap.from('.navCenter,.hamburgerBtn', { y: -22, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, delay: 0.1, clearProps: 'transform,opacity' });

    // A gold line sweeps across the top edge of each section as it arrives.
    d.querySelectorAll('.section').forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 88%', once: true, onEnter: function () { sec.classList.add('sec-in'); } });
    });

    // The hub logo drifts up and shrinks a touch as you scroll away from the first screen.
    var hubLogo = d.querySelector('.shineLogo');
    if (hubLogo) gsap.to(hubLogo, { y: -50, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top top', end: 'bottom top', scrub: true } });

    // Things the page draws itself (champions, cards, contact rows) arrive one after another.
    var staged = function (sel, from) {
      var els = d.querySelectorAll(sel);
      if (!els.length) return;
      try {
        gsap.set(els, from);
        ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, x: 0, scale: 1, rotationY: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true, clearProps: 'transform,opacity' });
        } });
      } catch (e) { gsap.set(els, { clearProps: 'all' }); }
    };
    var tries = 0;
    (function stage() {
      var ready = d.querySelector('.championChip') && d.querySelector('.flipCard') && d.querySelector('.contactRow');
      if (!ready && ++tries < 40) { setTimeout(stage, 100); return; }
      staged('.championsGrid .championChip', { opacity: 0, y: 60, scale: 0.94 });
      staged('.flipCard', { opacity: 0, y: 70, rotationY: -30, transformPerspective: 900 });
      staged('.contactRow', { opacity: 0, x: -30 });

      // The sponsor, award and player strips surge while you scroll and settle when you stop. Two cheap
      // updates per scroll burst (start and stop), not one per frame, so phones stay smooth.
      var tracks = d.querySelectorAll('.marqueeTrack');
      if (tracks.length) {
        var rate = { v: 1 };
        var apply = function () {
          tracks.forEach(function (t) { t.getAnimations().forEach(function (an) { an.playbackRate = rate.v; }); });
        };
        var surging = false, stopTimer = 0;
        window.addEventListener('scroll', function () {
          if (!surging) {
            surging = true;
            gsap.to(rate, { v: 3, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: apply });
          }
          clearTimeout(stopTimer);
          stopTimer = setTimeout(function () {
            surging = false;
            gsap.to(rate, { v: 1, duration: 1.2, ease: 'power2.out', overwrite: true, onUpdate: apply });
          }, 140);
        }, { passive: true });
      }

      // Swipe rows keep the card in the middle in focus; the others step back.
      var flipRow = d.getElementById('flipCardRow');
      if (flipRow && 'IntersectionObserver' in window) {
        var fo = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.target.classList.toggle('inview', e.intersectionRatio > 0.6); });
        }, { root: flipRow, threshold: [0, 0.6, 1] });
        flipRow.querySelectorAll('.flipCard').forEach(function (c) { fo.observe(c); });
        flipRow.classList.add('focusrow');
      }
      ScrollTrigger.refresh();
    })();
  }

  // 12. Touch feel: a ripple spreads from where you tap buttons and hub rows.
  if (!reduced) {
    d.addEventListener('pointerdown', function (e) {
      var t = e.target.closest && e.target.closest('.btn,form button,a.tlItem');
      if (!t) return;
      var r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
      var rip = d.createElement('span');
      rip.className = 'ripple';
      rip.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.appendChild(rip);
      setTimeout(function () { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 700);
    }, { passive: true });
  }

  // 9. Warm the images people are about to scroll to, plus the whole RELOADED section, in the
  //    background once the page has settled. Skipped on data saver and slow connections, and for
  //    the rarely opened Season 1 archive, so nobody pays for pictures they will not see.
  d.querySelectorAll('img').forEach(function (img) { img.decoding = 'async'; });
  (function () {
    var conn = navigator.connection || {};
    var slow = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') || conn.effectiveType === '3g';
    if (slow || !hoverFine) return;
    var queue = function (list) {
      var i = 0;
      (function next() {
        for (var n = 0; i < list.length && n < 4; n++) list[i++].loading = 'eager';
        if (i < list.length) setTimeout(next, 200);
      })();
    };
    var lazy = function () { return Array.prototype.filter.call(d.querySelectorAll('img[loading="lazy"]'), function (img) { return !img.closest('#season1'); }); };
    // Stage 1: pictures on the homepage itself, once the page has finished loading and the browser is idle.
    var warmHome = function () { queue(lazy().filter(function (img) { return !img.closest('#season2'); })); };
    // Stage 2: the RELOADED posters, a few seconds later, so they are ready the moment someone opens it.
    var warmReloaded = function () { queue(lazy().filter(function (img) { return img.closest('#season2'); })); };
    var go = function () {
      (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(warmHome, { timeout: 3000 });
      setTimeout(warmHome, 4000);
      setTimeout(warmReloaded, 5000);
    };
    if (d.readyState === 'complete') go(); else window.addEventListener('load', go);
  })();

  // 10. The logo animation starts after everything else has loaded; until then the sharp poster shows.
  //     Not downloaded at all for reduced motion or data saver.
  (function () {
    var v = d.getElementById('journeyLogoVideo');
    if (!v) return;
    var conn = navigator.connection || {};
    if (reduced || conn.saveData) return;
    var start = function () {
      var src = v.querySelector('source[data-src]');
      if (!src) return;
      src.src = src.getAttribute('data-src');
      v.load();
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    };
    if (d.readyState === 'complete') start(); else window.addEventListener('load', start);
  })();

  if (hasGSAP) {
    ScrollTrigger.refresh();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();

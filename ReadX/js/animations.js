/* ============================================================
   js/animations.js — READX MOTION SYSTEM
   Scroll reveals · count-ups · animated fills · hero preview
   Fully defensive: every selector null-checked, works without
   ReadXData, honours prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ---------- 1. Scroll reveal [data-reveal] ---------- */
  function initReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (REDUCED) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in-view');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < items.length; j++) items[j].classList.add('in-view');
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var k = 0; k < entries.length; k++) {
          var entry = entries[k];
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            if (delay) el.style.transitionDelay = delay + 'ms';
            el.classList.add('in-view');
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );

    for (var m = 0; m < items.length; m++) io.observe(items[m]);
  }

  /* ---------- 2. Count-up [data-count] ---------- */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    var duration = 1400;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var raw = el.textContent || '';
      var match = raw.match(/[^0-9.,%-]+$/);
      var suffix = match ? match[0] : '';
      var decimals = (el.getAttribute('data-count-decimals') != null)
        ? parseInt(el.getAttribute('data-count-decimals'), 10)
        : (String(target).indexOf('.') > -1 ? 1 : 0);
      var start = null;

      function format(value) {
        var fixed = decimals ? value.toFixed(decimals) : Math.round(value).toString();
        return fixed + suffix;
      }

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = easeOutExpo(p);
        el.textContent = format(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (REDUCED) {
      for (var i = 0; i < els.length; i++) {
        var t = parseFloat(els[i].getAttribute('data-count'));
        if (!isNaN(t)) els[i].textContent = t + (els[i].textContent.match(/[^0-9.,%-]+$/) || [''])[0];
      }
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < els.length; j++) animate(els[j]);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) {
            animate(entries[k].target);
            io.unobserve(entries[k].target);
          }
        }
      },
      { threshold: 0.4 }
    );

    for (var m = 0; m < els.length; m++) io.observe(els[m]);
  }

  /* ---------- 3. Animated bar fills [data-fill] ---------- */
  function initFills() {
    var els = document.querySelectorAll('[data-fill]');
    if (!els.length) return;

    function fill(el) {
      var value = parseFloat(el.getAttribute('data-fill'));
      if (isNaN(value)) return;
      var delay = parseInt(el.getAttribute('data-fill-delay') || '0', 10);
      if (delay) el.style.transitionDelay = delay + 'ms';
      el.style.width = Math.min(Math.max(value, 0), 100) + '%';
    }

    if (REDUCED || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) {
        els[i].style.transition = 'none';
        fill(els[i]);
      }
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) {
            fill(entries[k].target);
            io.unobserve(entries[k].target);
          }
        }
      },
      { threshold: 0.3 }
    );

    for (var m = 0; m < els.length; m++) io.observe(els[m]);
  }

  /* ---------- 4. Hero reading preview [data-preview] ---------- */
  function initHeroPreview() {
    var stage = document.querySelector('[data-preview]');
    if (!stage) return;

    var sentences = stage.querySelectorAll('.sentence');
    var band = stage.querySelector('[data-preview-band]');
    var fill = stage.querySelector('[data-preview-progress]');
    var counter = stage.querySelector('[data-preview-count]');
    var total = sentences.length;

    if (!total) return;

    if (REDUCED) {
      if (band) band.style.opacity = '0';
      if (fill) fill.style.width = '0%';
      return;
    }

    var index = 0;
    var msPerSentence = 2600;
    var progress = 0;
    var last = performance.now();

    function positionBand(el) {
      var y = el.offsetTop + el.offsetHeight / 2;
      var stageH = stage.clientHeight;
      band.style.top = y + 'px';
      band.style.opacity = '1';
    }

    function step(now) {
      if (now - last >= msPerSentence) {
        last = now;
        index = (index + 1) % total;
        var s = sentences[index];
        for (var i = 0; i < total; i++) {
          sentences[i].classList.toggle('preview-active', i === index);
          sentences[i].classList.toggle('preview-done', i < index || (index === 0 && i === total - 1));
        }
        positionBand(s);
        if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      }
      var targetPct = total > 1 ? ((index + 0.5) / total) * 100 : 0;
      progress += (targetPct - progress) * 0.045;
      if (fill) fill.style.width = progress.toFixed(2) + '%';
      requestAnimationFrame(step);
    }

    positionBand(sentences[0]);
    sentences[0].classList.add('preview-active');
    if (counter) counter.textContent = '01';
    requestAnimationFrame(step);
  }

  /* ---------- boot ---------- */
  function init() {
    initReveals();
    initCounters();
    initFills();
    initHeroPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

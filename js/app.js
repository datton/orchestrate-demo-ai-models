/* Page behaviour (Full-Stack owns this file) */
(function () {
  'use strict';

  // Everything here is optional polish: without JS the text is fully readable.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // Glow colours come from the designer's tokens (css/tokens.css).
  var cs = getComputedStyle(document.documentElement);
  var GLOW_A = cs.getPropertyValue('--glow-primary').trim() || '0 0 8px #22e1ff';
  var GLOW_B = cs.getPropertyValue('--glow-accent').trim() || '0 0 8px #ff4fb0';

  // Wrap each word of a heading in a span (spaces stay as plain text, so the
  // heading still reads normally to assistive technology).
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    return words.map(function (w, i) {
      var span = document.createElement('span');
      span.textContent = w;
      span.style.display = 'inline-block';
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return span;
    });
  }

  // Headings: each word slams in from alternating sides, then a glow pulse settles.
  function animateHeading(h, delay) {
    var words = splitWords(h);
    words.forEach(function (span, i) {
      var side = i % 2 ? 1 : -1;
      span.animate([
        { opacity: 0, transform: 'translate(' + side * 90 + 'px, 40px) rotate(' + side * 6 + 'deg) scale(1.6)', filter: 'blur(14px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' }
      ], { duration: 900, delay: delay + i * 140, easing: EASE, fill: 'backwards' });
    });
    h.animate([
      { textShadow: 'none' },
      { textShadow: GLOW_B + ', ' + GLOW_A, offset: 0.45 },
      { textShadow: GLOW_A }
    ], { duration: 1600, delay: delay + 300, easing: 'ease-in-out' });
    // Hand over to the designer's looping neon pulse once the entrance is done.
    setTimeout(function () { h.classList.add('fx-neon'); }, delay + 1900);
  }

  // Body blocks: fly up from far below with a skew, fade and de-blur, staggered.
  function animateBlock(el, i) {
    var left = i % 2 === 0;
    el.animate([
      { opacity: 0, transform: 'translate(' + (left ? -60 : 60) + 'px, 90px) skewY(4deg)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ], { duration: 1000, delay: 350 + Math.min(i, 10) * 120, easing: EASE, fill: 'backwards' });
  }

  function animateChapter(chapter) {
    Array.prototype.forEach.call(chapter.children, function (el, i) {
      if (/^H[12]$/.test(el.tagName)) animateHeading(el, 0);
      else animateBlock(el, i);
    });
  }

  // Hero plays straight away; other chapters play as they scroll into view.
  var hero = document.getElementById('hero');
  if (hero) animateChapter(hero);

  var seen = new WeakSet();
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      animateChapter(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('main .chapter:not(#hero)').forEach(function (c) { observer.observe(c); });

  // Main title: wide letter-spacing that tightens as it fades in.
  var h1 = document.getElementById('hero-title');
  if (h1) {
    setTimeout(function () { h1.classList.add('fx-glitch'); }, 2500);
    h1.animate([
      { letterSpacing: '0.35em', opacity: 0.2 },
      { letterSpacing: 'normal', opacity: 1 }
    ], { duration: 1600, easing: EASE });
  }
})();

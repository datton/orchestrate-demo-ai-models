/* Page behaviour (Full-Stack owns this file) */
(function () {
  'use strict';

  // Everything here is optional polish: without JS the text is fully readable.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  // Fade and lift each chapter's content in as it scrolls into view.
  // The hero is already in view, so it is left alone.
  var chapters = document.querySelectorAll('main .chapter:not(#hero)');
  var seen = new WeakSet();

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      var blocks = entry.target.children;
      Array.prototype.forEach.call(blocks, function (el, i) {
        el.animate(
          [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
          { duration: 600, delay: Math.min(i, 8) * 70, easing: 'ease-out', fill: 'backwards' }
        );
      });
    });
  }, { threshold: 0.15 });

  chapters.forEach(function (c) { observer.observe(c); });

  // Hero headline: a short letter-spacing settle, text only.
  var h1 = document.getElementById('hero-title');
  if (h1) {
    h1.animate(
      [{ opacity: 0, letterSpacing: '0.12em' }, { opacity: 1, letterSpacing: 'normal' }],
      { duration: 900, easing: 'ease-out' }
    );
  }
})();

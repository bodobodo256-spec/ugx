/* ═══════════════════════════════════════════════════
   UGANDA SEXY BABES — Main JavaScript
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Age Gate ── */
  const AGE_KEY = 'usb_age_verified';

  function initAgeGate() {
    if (sessionStorage.getItem(AGE_KEY)) return;

    const gate    = document.getElementById('ageGate');
    const overlay = document.getElementById('ageGateOverlay');
    const enterBtn = document.getElementById('ageGateEnter');

    if (!gate) return;

    gate.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    enterBtn.addEventListener('click', function () {
      sessionStorage.setItem(AGE_KEY, '1');
      gate.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  /* ── Mobile Drawer ── */
  function initMobileDrawer() {
    const toggle  = document.getElementById('menuToggle');
    const drawer  = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const close   = document.getElementById('drawerClose');

    if (!toggle || !drawer) return;

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', openDrawer);
    if (close)   close.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* ── Location Sidebar Toggle ── */
  function initLocationToggle() {
    const btn  = document.getElementById('locationToggle');
    const list = document.getElementById('locationList');
    if (!btn || !list) return;

    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      list.hidden = expanded;
    });
  }

  /* ── Sticky Header Shadow ── */
  function initStickyHeader() {
    const desktopHeader = document.getElementById('site-header');
    const mobileHeader  = document.getElementById('mobile-site-header');

    function onScroll() {
      const scrolled = window.scrollY > 10;
      if (desktopHeader) desktopHeader.style.boxShadow = scrolled
        ? '0 4px 30px rgba(0,0,0,0.7)'
        : '0 2px 20px rgba(0,0,0,0.5)';
      if (mobileHeader) mobileHeader.style.boxShadow = scrolled
        ? '0 4px 30px rgba(0,0,0,0.7)'
        : 'none';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Search ── */
  function initSearch() {
    const forms = document.querySelectorAll('.search-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('.search-input');
        const query = (input && input.value.trim()) || '';
        if (query) {
          // In a real site, redirect to search results page
          console.log('Searching for:', query);
          // window.location.href = 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  /* ── Card Hover: WhatsApp Popup ── */
  function initCardActions() {
    document.querySelectorAll('.action-whatsapp').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // WhatsApp links open in new tab (already set in HTML)
      });
    });
  }

  /* ── Lazy-ish fade in for card images ── */
  function initImageFade() {
    if (!('IntersectionObserver' in window)) return;

    const imgs = document.querySelectorAll('.card-photo[loading="lazy"]');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    imgs.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', function () { img.style.opacity = '1'; });
        observer.observe(img);
      }
    });
  }

  /* ── Load More (Demo) ── */
  function initLoadMore() {
    const btn = document.querySelector('.btn-load-more');
    if (!btn) return;

    btn.addEventListener('click', function () {
      btn.textContent = 'Loading…';
      btn.disabled = true;
      // Simulate loading delay
      setTimeout(function () {
        btn.textContent = 'No more babes to load';
        btn.style.opacity = '0.5';
      }, 1200);
    });
  }

  /* ── Filter Button (Demo) ── */
  function initFilters() {
    const btn = document.querySelector('.btn-filter');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const orig = btn.textContent;
      btn.textContent = 'Filtering…';
      setTimeout(function () { btn.textContent = orig; }, 800);
    });
  }

  /* ── Smooth scroll for anchor links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Init all ── */
  document.addEventListener('DOMContentLoaded', function () {
    initAgeGate();
    initMobileDrawer();
    initLocationToggle();
    initStickyHeader();
    initSearch();
    initCardActions();
    initImageFade();
    initLoadMore();
    initFilters();
    initSmoothScroll();
  });

})();

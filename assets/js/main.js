/* ============================================================
   VIASTECH — main.js
   - Lenis smooth scroll (optional, no-op if not loaded)
   - Reveal animations via IntersectionObserver (CSS-driven)
   - Counters animés via IntersectionObserver
   - GSAP timeline pour le hero + parallax
   - Nav scrolled state + progress bar
   - Active section tracking via IntersectionObserver
   - Drawer mobile + lightbox galerie
   ============================================================ */
(() => {
  'use strict';

  // No-JS class flip
  document.documentElement.classList.remove('no-js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ready = (cb) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', cb, { once: true })
    : cb();

  // Wait for GSAP (Lenis is optional)
  const onReady = (cb) => {
    let tries = 0;
    const tick = () => {
      tries++;
      if (window.gsap && window.ScrollTrigger) cb();
      else if (tries > 600) cb(); // fallback ~10s
      else requestAnimationFrame(tick);
    };
    tick();
  };

  ready(() => onReady(init));

  function init() {
    const { gsap, ScrollTrigger, Lenis } = window;

    /* ── Smooth scroll (Lenis) — optionnel ───────────────── */
    let lenis = null;
    if (!reduce && typeof Lenis === 'function') {
      try {
        lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.5,
        });
        if (gsap) {
          if (ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add((time) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
        } else {
          (function raf(time){ lenis.raf(time); requestAnimationFrame(raf); })();
        }
      } catch (e) {
        lenis = null;
      }
    }

    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    // Anchors
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(target, { offset: -70, duration: 1.4 });
            } else {
              const top = target.getBoundingClientRect().top + window.scrollY - 70;
              window.scrollTo({ top, behavior: 'smooth' });
            }
            // close mobile drawer
            document.querySelector('[data-drawer]')?.classList.remove('is-open');
            const burg = document.querySelector('[data-burger]');
            if (burg) {
              burg.classList.remove('is-open');
              burg.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
          }
        }
      });
    });

    /* ── Nav scrolled + progress bar (RAF tick) ──────────── */
    const nav = document.querySelector('[data-nav]');
    const progress = document.querySelector('.progress-bar span');
    let lastY = -1;
    function rafScroll() {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y !== lastY) {
        lastY = y;
        if (nav) nav.classList.toggle('is-scrolled', y > 30);
        if (progress) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = Math.min(100, (y / Math.max(1, max)) * 100);
          progress.style.width = pct + '%';
        }
      }
      requestAnimationFrame(rafScroll);
    }
    rafScroll();

    /* ── Burger / drawer mobile ──────────────────────────── */
    const burger = document.querySelector('[data-burger]');
    const drawer = document.querySelector('[data-drawer]');
    if (burger && drawer) {
      burger.addEventListener('click', () => {
        const open = drawer.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open);
        drawer.setAttribute('aria-hidden', !open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (lenis) open ? lenis.stop() : lenis.start();
      });
    }

    /* ── Reveal au scroll (IntersectionObserver) ─────────── */
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObs.observe(el));

    /* ── Compteurs animés ────────────────────────────────── */
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const to = parseFloat(el.dataset.to || '0');
          const suffix = el.dataset.suffix || '';
          const start = performance.now();
          const dur = 1500;
          const animate = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            const v = to * eased;
            el.textContent =
              (v >= 1000 ? Math.round(v).toLocaleString('fr-FR') : Math.round(v)) + suffix;
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          counterObs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll('[data-counter]').forEach((el) => counterObs.observe(el));

    /* ── Active section tracking (IntersectionObserver) ──── */
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav__menu a[href^="#"]');
    const setActive = (id) => {
      navLinks.forEach((l) => {
        const target = l.getAttribute('href').slice(1);
        l.classList.toggle('is-active', target === id);
      });
    };
    if (navLinks.length) {
      const sectionObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
      );
      sections.forEach((s) => sectionObs.observe(s));
    }

    /* ── Hero title : reveal ligne par ligne (GSAP) ──────── */
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && gsap && !reduce) {
      const lines = heroTitle.querySelectorAll('.hero__line');
      gsap.set(lines, { yPercent: 110, opacity: 0 });
      gsap.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        ease: 'expo.out',
        delay: 0.25,
      });
    }

    /* ── Hero parallax léger ─────────────────────────────── */
    const heroMedia = document.querySelector('.hero__media img');
    if (heroMedia && gsap && ScrollTrigger && !reduce) {
      gsap.to(heroMedia, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    /* ── Atelier media : parallax doux ───────────────────── */
    const atelierMedia2 = document.querySelector('.atelier__media-2');
    if (atelierMedia2 && gsap && ScrollTrigger && !reduce) {
      gsap.to(atelierMedia2, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.atelier',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    /* ── Lightbox ────────────────────────────────────────── */
    const lb = document.querySelector('[data-lightbox]');
    if (lb) {
      const lbImg = lb.querySelector('img');
      const lbCap = lb.querySelector('[data-lightbox-caption]');
      const closeBtn = lb.querySelector('[data-lightbox-close]');
      const prevBtn = lb.querySelector('[data-lightbox-prev]');
      const nextBtn = lb.querySelector('[data-lightbox-next]');
      let group = [];
      let index = 0;

      const open = (items, i = 0) => {
        group = items;
        index = i;
        render();
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
      };
      const close = () => {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      };
      const render = () => {
        if (!group.length) return;
        const item = group[index];
        lbImg.src = item.src;
        lbImg.alt = item.alt || '';
        if (lbCap) lbCap.textContent = `${index + 1} / ${group.length}`;
      };
      const next = () => { index = (index + 1) % group.length; render(); };
      const prev = () => { index = (index - 1 + group.length) % group.length; render(); };

      closeBtn?.addEventListener('click', close);
      nextBtn?.addEventListener('click', next);
      prevBtn?.addEventListener('click', prev);
      lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
      document.addEventListener('keydown', (e) => {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
      });

      // Galeries véhicules (pages détail)
      document.querySelectorAll('[data-gallery]').forEach((gal) => {
        const links = gal.querySelectorAll('a[data-lightbox-src]');
        const items = [...links].map((a) => ({
          src: a.dataset.lightboxSrc,
          alt: a.dataset.lightboxAlt || '',
        }));
        links.forEach((a, i) => {
          a.addEventListener('click', (e) => { e.preventDefault(); open(items, i); });
        });
      });
    }

    /* ── Video lazy-load (autres que hero) ───────────────── */
    // Détection save-data / cellular
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = conn && (conn.saveData === true);
    const slowConn = conn && /^(slow-2g|2g)$/.test(conn.effectiveType || '');

    const lazyVideos = document.querySelectorAll('video[data-lazy-video]');
    if (lazyVideos.length) {
      if (reduce || saveData || slowConn) {
        // On ne charge pas les vidéos : on garde le poster
        lazyVideos.forEach((v) => v.removeAttribute('autoplay'));
      } else {
        const vidObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const v = entry.target;
              v.querySelectorAll('source[data-src]').forEach((s) => {
                s.src = s.dataset.src;
                s.removeAttribute('data-src');
              });
              v.load();
              v.play().catch(() => {/* autoplay refusé : poster reste */});
              vidObs.unobserve(v);
            });
          },
          { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
        );
        lazyVideos.forEach((v) => vidObs.observe(v));
      }
    }

    /* ── Hero video : pause hors écran pour économiser CPU ── */
    const heroVid = document.querySelector('[data-hero-video]');
    if (heroVid) {
      if (reduce || saveData) {
        heroVid.pause();
        heroVid.removeAttribute('autoplay');
      } else {
        const heroObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) heroVid.play().catch(() => {});
              else heroVid.pause();
            });
          },
          { threshold: 0.05 }
        );
        heroObs.observe(heroVid);
      }
    }

    /* ── Footer year ─────────────────────────────────────── */
    document.querySelectorAll('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));

    /* ── Hover tilt léger sur les vehicle cards (desktop) ── */
    if (window.matchMedia('(hover:hover)').matches && !reduce && gsap) {
      document.querySelectorAll('.vehicle').forEach((card) => {
        const img = card.querySelector('.vehicle__media img');
        if (!img) return;
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(img, { x: x * 14, y: y * 10, duration: 0.6, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(img, { x: 0, y: 0, duration: 0.7, ease: 'power3.out' });
        });
      });
    }

    /* ── Refresh ScrollTrigger après chargement images ───── */
    if (ScrollTrigger) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }
})();

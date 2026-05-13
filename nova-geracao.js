/* =========================================================
   NOVA GERAÇÃO — Grêmio Estudantil
   nova-geracao.js — interações & animações
   ========================================================= */
(function(){
  'use strict';

  /* -------------------------------------------------------
     REVEAL ON SCROLL — IntersectionObserver
  ------------------------------------------------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-x').forEach(el => revealIO.observe(el));

  /* Stagger delays on grouped items */
  document.querySelectorAll('.cards').forEach(group => {
    [...group.children].forEach((c, i) => {
      c.style.transitionDelay = (i * 120) + 'ms';
    });
  });
  document.querySelectorAll('.proposals__meta').forEach(group => {
    [...group.children].forEach((c, i) => {
      c.style.transitionDelay = (i * 100) + 'ms';
    });
  });

  /* -------------------------------------------------------
     SCROLL PROGRESS BAR
  ------------------------------------------------------- */
  const bar = document.querySelector('.scroll-progress');
  let ticking = false;
  function updateProgress(){
    const h = document.documentElement;
    const top = h.scrollTop || document.body.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (top / max) * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){ requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });

  /* -------------------------------------------------------
     MOUSE TILT — Hero logo art
  ------------------------------------------------------- */
  function tilt(el, max){
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateY(${(x*max).toFixed(2)}deg) rotateX(${(-y*max).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }
  document.querySelectorAll('[data-tilt]').forEach(el => tilt(el, 6));

  /* -------------------------------------------------------
     CUSTOM CURSOR (desktop only)
  ------------------------------------------------------- */
  if (matchMedia('(hover:hover)').matches){
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function loop(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll('a, button, .card, .hero__art, .nav a').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* -------------------------------------------------------
     FLOATING SHAPES — abstract stars / diamonds drifting
  ------------------------------------------------------- */
  function spawnFloater(){
    const types = ['floater--star', 'floater--diamond', 'floater--ring'];
    const type = types[Math.floor(Math.random() * types.length)];
    const f = document.createElement('div');
    f.className = 'floater ' + type;
    const startX = Math.random() * window.innerWidth;
    const dur = 9000 + Math.random() * 8000;
    const drift = (Math.random() - 0.5) * 240;
    const rot = (Math.random() - 0.5) * 720;
    const scale = 0.6 + Math.random() * 1.1;
    f.style.left = startX + 'px';
    f.style.top = '-30px';
    f.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
    document.body.appendChild(f);

    const start = performance.now();
    function step(t){
      const e = (t - start) / dur;
      if (e >= 1){ f.remove(); return; }
      const y = e * (window.innerHeight + 60);
      const x = Math.sin(e * Math.PI * 2) * drift;
      f.style.transform =
        `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale}) rotate(${(e*rot).toFixed(1)}deg)`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  let floaterTimer = null;
  function startFloaters(){
    if (floaterTimer) return;
    floaterTimer = setInterval(spawnFloater, 4500);
    setTimeout(spawnFloater, 800);
    setTimeout(spawnFloater, 2400);
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches){
    startFloaters();
  }

  /* -------------------------------------------------------
     SECTION ID HIGHLIGHT in NAV
  ------------------------------------------------------- */
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length){
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const id = '#' + e.target.id;
          navLinks.forEach(a => a.classList.toggle('is-current',
            a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => navIO.observe(s));
  }

  /* -------------------------------------------------------
     KEYBOARD shortcut "g" to jump back to top
  ------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g' && !e.target.matches('input,textarea')){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* -------------------------------------------------------
     COUNT UP on stats when in view
  ------------------------------------------------------- */
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const dur = 1100;
      const start = performance.now();
      function step(t){
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toString().padStart(2,'0');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      statsIO.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => statsIO.observe(el));

  /* -------------------------------------------------------
     LIGHT MARQUEE pause on hover
  ------------------------------------------------------- */
  document.querySelectorAll('.marquee__track, .band__row').forEach(track => {
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  });

  /* -------------------------------------------------------
     HAMBURGER MENU — toggle mobile nav
  ------------------------------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu   = document.querySelector('.nav');
  if (navToggle && navMenu){
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

})();

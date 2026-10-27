/*
  Interações do site. Sem dependências: tudo funciona sem este arquivo
  (o conteúdo aparece completo e a abertura mostra a imagem); com ele,
  entram o vídeo, o movimento, o menu e os links de contato configurados.
*/
(function () {
  'use strict';

  var root = document.documentElement;
  window.__siteReady = true;

  // Se a proteção do <head> já revelou o conteúdo (script lento), não ocultamos de novo.
  var animate = root.classList.contains('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 960px)');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ----------------------------------------------------------------------
     Cabeçalho: ganha fundo ao rolar e marca a seção atual
     ---------------------------------------------------------------------- */
  var header = $('[data-header]');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 24);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.site-nav a');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ----------------------------------------------------------------------
     Menu em tela cheia (celular e tablet)
     ---------------------------------------------------------------------- */
  var menuToggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  var menuLabel = $('.menu-toggle__label', menuToggle);
  var outside = [$('main'), $('.site-footer'), $('.skip-link')];
  var closeTimer;

  function setInert(on) {
    outside.forEach(function (el) {
      if (!el) return;
      if (on) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function openMenu() {
    clearTimeout(closeTimer);
    menu.hidden = false;
    // força o layout antes da transição de entrada
    void menu.offsetWidth;
    menu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuLabel.textContent = 'Fechar';
    root.classList.add('menu-open');
    setInert(true);
    document.addEventListener('keydown', onMenuKey);
    var first = $('a', menu);
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuLabel.textContent = 'Menu';
    root.classList.remove('menu-open');
    setInert(false);
    document.removeEventListener('keydown', onMenuKey);
    closeTimer = setTimeout(function () { menu.hidden = true; }, reduceMotion.matches ? 0 : 450);
    if (returnFocus) menuToggle.focus();
  }

  function onMenuKey(e) {
    if (e.key === 'Escape') {
      closeMenu(true);
      return;
    }
    if (e.key !== 'Tab') return;
    // mantém o foco entre o logo, o botão do menu e os links
    var items = [$('.brand', header), menuToggle].concat($$('a', menu));
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && i === items.length - 1) {
      e.preventDefault();
      items[0].focus();
    }
  }

  menuToggle.addEventListener('click', function () {
    if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
    else openMenu();
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { closeMenu(false); });
  });
  $('.brand', header).addEventListener('click', function () { closeMenu(false); });
  wide.addEventListener('change', function (e) { if (e.matches) closeMenu(false); });

  /* ----------------------------------------------------------------------
     Entradas ao rolar
     ---------------------------------------------------------------------- */
  var revealEls = $$('[data-reveal], [data-reveal-media]');

  function revealAll(els) { els.forEach(function (el) { el.classList.add('is-in'); }); }

  if (!animate || !('IntersectionObserver' in window)) {
    revealAll(revealEls);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      // elementos que entram juntos aparecem em sequência curta, na ordem do documento
      var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      batch.forEach(function (el, i) {
        el.style.setProperty('--d', Math.min(i, 5) * 90 + 'ms');
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Abertura: texto e vídeo
     O vídeo roda uma vez, sem som, e para no último quadro — a composição
     aprovada. Ele não tem um ponto de emenda sem salto, por isso não fica
     em loop; o botão no canto permite pausar e rever.
     ---------------------------------------------------------------------- */
  var hero = $('[data-hero]');
  var video = $('[data-hero-video]');
  var toggle = $('[data-video-toggle]');
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var saveData = !!connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
  var useVideo = !!video && !reduceMotion.matches && !saveData;
  var videoLoaded = false;
  var userPaused = false;
  var heroVisible = true;

  var labels = { playing: 'Pausar animação', paused: 'Reproduzir animação', ended: 'Rever animação' };

  function setState(state) {
    toggle.setAttribute('data-state', state);
    toggle.setAttribute('aria-label', labels[state]);
  }

  function loadVideo() {
    if (videoLoaded) return;
    videoLoaded = true;
    $$('source[data-src]', video).forEach(function (s) { s.src = s.getAttribute('data-src'); });
    video.muted = true;
    video.preload = 'auto';
    video.load();
  }

  function playVideo() {
    loadVideo();
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      // reprodução automática bloqueada (modo economia de energia, por exemplo): fica a imagem
      p.catch(function () { setState('paused'); });
    }
  }

  function startHero() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-ready');
        if (useVideo && heroVisible) playVideo();
      });
    });
  }

  if (useVideo) {
    toggle.hidden = false;
    setState('playing');

    video.addEventListener('playing', function () {
      video.classList.add('is-playing');
      setState('playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) setState('paused');
    });
    video.addEventListener('ended', function () { setState('ended'); });
    // Sem vídeo (arquivos ausentes ou formato sem suporte), a imagem continua e o botão sai.
    // Ao ler a página, o navegador já testa os <source> ainda sem endereço e dispara erros neles;
    // por isso só contam os erros depois do carregamento, e só quando nenhuma fonte serviu.
    video.addEventListener('error', function () {
      if (!videoLoaded) return;
      if (!video.error && video.networkState !== video.NETWORK_NO_SOURCE) return;
      toggle.hidden = true;
      video.classList.remove('is-playing');
    }, true);

    toggle.addEventListener('click', function () {
      if (video.ended) {
        userPaused = false;
        video.currentTime = 0;
        playVideo();
      } else if (video.paused) {
        userPaused = false;
        playVideo();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      // fora da tela o vídeo pausa; ao voltar, continua de onde estava
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!videoLoaded || video.ended) return;
        if (!heroVisible) {
          if (!video.paused) video.pause();
        } else if (!userPaused) {
          playVideo();
        }
      }, { threshold: 0.1 }).observe(hero);
    }
  }

  if (animate && document.fonts && document.fonts.ready) {
    // espera as fontes (no máximo 700 ms) para o título não mudar de forma durante a entrada
    var started = false;
    var go = function () { if (!started) { started = true; startHero(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 700);
  } else {
    startHero();
  }

  /* ----------------------------------------------------------------------
     Contato: WhatsApp e Instagram configurados em <section data-contact>
     ---------------------------------------------------------------------- */
  var contact = $('[data-contact]');
  if (contact) {
    var phone = (contact.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
    var message = contact.getAttribute('data-whatsapp-text') || '';
    var insta = (contact.getAttribute('data-instagram') || '').replace(/^@/, '').trim();

    if (phone.length >= 12) {
      var waUrl = 'https://wa.me/' + phone + (message ? '?text=' + encodeURIComponent(message) : '');
      $$('[data-whatsapp-link]').forEach(function (a) {
        a.href = waUrl;
        a.target = '_blank';
        a.rel = 'noopener';
      });
      // 55 + DDD + número → (DDD) número
      var local = phone.slice(2);
      var pretty = '(' + local.slice(0, 2) + ') ' + local.slice(2, local.length - 4) + '-' + local.slice(-4);
      $$('[data-whatsapp-display]').forEach(function (dd) {
        dd.textContent = '';
        var link = document.createElement('a');
        link.href = waUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = pretty;
        dd.appendChild(link);
      });
    } else if (window.console) {
      console.info('WhatsApp ainda não configurado: preencha data-whatsapp em <section data-contact> (ver README).');
    }

    if (insta) {
      $$('[data-instagram-display]').forEach(function (dd) {
        dd.textContent = '';
        var link = document.createElement('a');
        link.href = 'https://www.instagram.com/' + encodeURIComponent(insta) + '/';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = '@' + insta;
        dd.appendChild(link);
      });
    }
  }

  /* ----------------------------------------------------------------------
     Ano no rodapé
     ---------------------------------------------------------------------- */
  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

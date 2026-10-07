/*
  Interações do site. Sem dependências: tudo funciona sem este arquivo
  (o conteúdo aparece completo); com ele, entram o movimento e os controles.
*/
(function () {
  'use strict';

  var root = document.documentElement;
  window.__siteReady = true;

  // Se a proteção do <head> já revelou o conteúdo (script lento), não ocultamos de novo.
  var animate = root.classList.contains('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 900px)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function scrollBehavior() { return reduceMotion.matches ? 'auto' : 'smooth'; }

  /* ----------------------------------------------------------------------
     Cabeçalho: muda de aparência ao rolar e marca a seção atual
     ---------------------------------------------------------------------- */
  var header = $('[data-header]');
  var ticking = false;
  var scrollHandlers = [];

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 24);
      scrollHandlers.forEach(function (fn) { fn(y); });
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
    // mantém o foco entre o botão do menu e os links
    var items = [menuToggle].concat($$('a', menu));
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
  $('.wordmark', header).addEventListener('click', function () { closeMenu(false); });
  wide.addEventListener('change', function (e) { if (e.matches) closeMenu(false); });

  /* ----------------------------------------------------------------------
     Entradas ao rolar
     ---------------------------------------------------------------------- */
  var hero = $('.hero');
  var revealEls = $$('[data-reveal]').filter(function (el) { return !hero.contains(el); });

  function revealAll(els) { els.forEach(function (el) { el.classList.add('is-in'); }); }

  if (!animate || !('IntersectionObserver' in window)) {
    revealAll(revealEls);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      // elementos que entram juntos aparecem em sequência curta
      var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      batch.forEach(function (el, i) {
        el.style.setProperty('--d', Math.min(i, 5) * 90 + 'ms');
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Abertura: título, fotografia e vídeo
     ---------------------------------------------------------------------- */
  function startHero() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-loaded');
        revealAll($$('[data-reveal]', hero));
      });
    });
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

  var video = $('[data-hero-video]');
  var videoToggle = $('[data-video-toggle]');
  var videoLabel = $('.media-toggle__label', videoToggle);
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var slowNetwork = !!connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
  var autoplay = !reduceMotion.matches && !slowNetwork;
  var userPaused = !autoplay;
  var videoLoaded = false;
  var heroVisible = true;

  function setPausedUI(paused) {
    videoToggle.classList.toggle('is-paused', paused);
    videoLabel.textContent = paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
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
      // reprodução automática bloqueada: fica a fotografia e o botão para reproduzir
      p.catch(function () { setPausedUI(true); });
    }
  }

  if (video && videoToggle) {
    videoToggle.hidden = false;
    setPausedUI(!autoplay);

    video.addEventListener('playing', function () {
      video.classList.add('is-playing');
      setPausedUI(false);
    });
    video.addEventListener('pause', function () { setPausedUI(true); });
    video.addEventListener('error', function () { videoToggle.hidden = true; }, true);

    videoToggle.addEventListener('click', function () {
      if (video.paused) {
        userPaused = false;
        playVideo();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      // pausa fora da tela para poupar bateria e processamento
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible) {
          if (!video.paused) video.pause();
        } else if (!userPaused) {
          playVideo();
        }
      }, { threshold: 0.05 }).observe($('.hero__media'));
    } else if (autoplay) {
      playVideo();
    }
  }

  /* ----------------------------------------------------------------------
     Movimento ligado à rolagem (somente telas largas e sem preferência
     por movimento reduzido)
     ---------------------------------------------------------------------- */
  var heroMedia = $('[data-hero-media]');
  var heroIntro = $('.hero__intro');

  function heroScroll(y) {
    if (!animate || reduceMotion.matches || !wide.matches || !finePointer.matches) {
      heroMedia.style.transform = '';
      heroIntro.style.transform = '';
      return;
    }
    var h = hero.offsetHeight || 1;
    if (y > h) return;
    var p = Math.min(Math.max(y / h, 0), 1);
    heroMedia.style.transform = 'translate3d(0,' + (p * 7).toFixed(2) + '%,0) scale(' + (1 + p * 0.07).toFixed(4) + ')';
    heroIntro.style.transform = 'translate3d(0,' + (p * -48).toFixed(1) + 'px,0)';
  }
  scrollHandlers.push(heroScroll);
  heroScroll(window.scrollY || 0);

  /* ----------------------------------------------------------------------
     Coleção
     ---------------------------------------------------------------------- */
  var collection = $('[data-collection]');
  if (collection) {
    var models = $$('.model', collection);
    var previews = $$('[data-preview]', collection);

    var selectModel = function (id) {
      models.forEach(function (m) {
        var on = m.getAttribute('data-model') === id;
        m.classList.toggle('is-active', on);
        $('[data-model-select]', m).setAttribute('aria-expanded', String(on));
      });
      previews.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-preview') === id);
      });
    };

    models.forEach(function (m) {
      $('[data-model-select]', m).addEventListener('click', function () {
        selectModel(m.getAttribute('data-model'));
      });
    });
  }

  /* ----------------------------------------------------------------------
     Em detalhe: pontos na imagem ligados à lista
     ---------------------------------------------------------------------- */
  var figure = $('[data-figure]');
  if (figure) {
    var hotspots = $$('.hotspot', figure);
    var points = $$('.point');

    hotspots.forEach(function (h, i) { h.style.setProperty('--i', i); });

    var activate = function (n) {
      hotspots.forEach(function (h) { h.classList.toggle('is-active', h.getAttribute('data-point') === n); });
      points.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-point') === n); });
    };

    hotspots.forEach(function (h) {
      var n = h.getAttribute('data-point');
      h.addEventListener('click', function () {
        activate(n);
        var item = points.filter(function (p) { return p.getAttribute('data-point') === n; })[0];
        if (item && !wide.matches) item.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
      });
      h.addEventListener('focus', function () { activate(n); });
      h.addEventListener('mouseenter', function () { activate(n); });
    });

    points.forEach(function (p) {
      p.addEventListener('mouseenter', function () { activate(p.getAttribute('data-point')); });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        figure.classList.add('is-in');
        obs.disconnect();
        // depois da entrada, as respostas ao cursor não devem herdar o atraso escalonado
        setTimeout(function () {
          hotspots.forEach(function (h) { h.classList.add('was-shown'); });
        }, 1400);
      }, { threshold: 0.35 }).observe(figure);

      // ao rolar pela lista, o ponto no centro da tela acende na imagem
      var pointObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) activate(e.target.getAttribute('data-point'));
        });
      }, { rootMargin: '-48% 0px -48% 0px' });
      points.forEach(function (p) { pointObserver.observe(p); });
    } else {
      figure.classList.add('is-in');
    }
  }

  /* ----------------------------------------------------------------------
     Links "Pedir informações": preenchem o modelo no formulário
     ---------------------------------------------------------------------- */
  var form = $('[data-contact-form]');
  var modelSelect = form ? form.elements.modelo : null;
  var subjectSelect = form ? form.elements.assunto : null;

  $$('[data-ask-model]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!modelSelect) return;
      modelSelect.value = a.getAttribute('data-ask-model');
      if (subjectSelect) subjectSelect.value = 'Informações sobre um modelo';
    });
  });

  /* ----------------------------------------------------------------------
     Formulário de atendimento
     ---------------------------------------------------------------------- */
  if (form) {
    var statusEl = $('[data-form-status]', form);
    var submitBtn = $('[data-submit]', form);
    var submitLabel = $('[data-submit-label]', form);
    var submitted = false;
    var busy = false;

    var rules = {
      nome: function (v) { return v.trim().length >= 2 ? '' : 'Informe seu nome.'; },
      email: function (v) {
        v = v.trim();
        if (!v) return 'Informe seu e-mail.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Confira o e-mail: parece incompleto.';
      },
      telefone: function (v) {
        var digits = v.replace(/\D/g, '');
        if (!digits) return '';
        return digits.length >= 10 && digits.length <= 13 ? '' : 'Confira o telefone, com DDD.';
      },
      mensagem: function (v) { return v.trim().length >= 2 ? '' : 'Escreva sua mensagem.'; },
      consentimento: function (v, el) { return el.checked ? '' : 'Para enviar, autorize o uso dos dados.'; }
    };

    var showError = function (name, msg) {
      var el = form.elements[name];
      var field = el.closest('.field');
      var out = $('[data-error-for="' + name + '"]', form);
      field.classList.toggle('is-invalid', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (out) out.textContent = msg;
    };

    var validate = function (name) {
      var el = form.elements[name];
      var msg = rules[name](el.value, el);
      showError(name, msg);
      return msg;
    };

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener('blur', function () { if (submitted || el.value) validate(name); });
      el.addEventListener('input', function () {
        if (el.closest('.field').classList.contains('is-invalid')) validate(name);
      });
      el.addEventListener('change', function () {
        if (el.type === 'checkbox' && submitted) validate(name);
      });
    });

    var setStatus = function (kind, text, placeholder) {
      statusEl.className = 'form__status' + (kind ? ' is-' + kind : '');
      statusEl.textContent = text;
      if (placeholder) {
        var ph = document.createElement('span');
        ph.className = 'ph';
        ph.textContent = placeholder;
        statusEl.appendChild(document.createTextNode(' '));
        statusEl.appendChild(ph);
      }
    };

    var setBusy = function (on) {
      busy = on;
      submitBtn.setAttribute('aria-disabled', on ? 'true' : 'false');
      submitLabel.textContent = on ? 'Enviando…' : 'Enviar solicitação';
    };

    var preferredChannel = function () {
      var checked = $('input[name="preferencia"]:checked', form);
      return checked ? checked.value.toLowerCase() : 'e-mail';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      submitted = true;

      // campo invisível preenchido: envio automatizado, descartado em silêncio
      if (form.elements.empresa && form.elements.empresa.value) {
        form.reset();
        setStatus('success', 'Mensagem enviada.');
        return;
      }

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (validate(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        setStatus('error', 'Revise os campos indicados.');
        firstInvalid.focus();
        return;
      }

      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      var email = (form.getAttribute('data-email') || '').trim();
      var data = new FormData(form);
      data.delete('empresa');

      if (endpoint) {
        setBusy(true);
        setStatus('', 'Enviando sua mensagem…');
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var channel = preferredChannel();
            form.reset();
            submitted = false;
            setStatus('success', 'Mensagem enviada. A equipe responderá por ' + channel + '.');
          })
          .catch(function () {
            setStatus('error', 'Não foi possível enviar agora. Tente novamente em instantes.');
          })
          .then(function () { setBusy(false); });
        return;
      }

      if (email) {
        var lines = [
          'Nome: ' + data.get('nome'),
          'E-mail: ' + data.get('email'),
          'Telefone: ' + (data.get('telefone') || '—'),
          'Modelo: ' + (modelSelect.options[modelSelect.selectedIndex].text),
          'Prefere resposta por: ' + data.get('preferencia'),
          '',
          data.get('mensagem')
        ];
        window.location.href = 'mailto:' + encodeURIComponent(email) +
          '?subject=' + encodeURIComponent(data.get('assunto')) +
          '&body=' + encodeURIComponent(lines.join('\n'));
        setStatus('success', 'Abrimos seu aplicativo de e-mail com a mensagem pronta. Se nada aconteceu, escreva para ' + email + '.');
        return;
      }

      setStatus('error', 'O envio ainda não está configurado neste site.', '[Definir o destino do formulário — ver README]');
      if (window.console) console.warn('Formulário sem destino: preencha data-endpoint ou data-email em <form data-contact-form>.');
    });
  }

  /* ----------------------------------------------------------------------
     Ano no rodapé
     ---------------------------------------------------------------------- */
  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/*
  Interações do site. Sem dependências: tudo funciona sem este arquivo
  (o conteúdo aparece completo e a abertura mostra a imagem); com ele,
  entram o vídeo, o movimento, o menu, o formulário de pedido e os contatos.
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
  var revealEls = $$('[data-reveal]');

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

  // O texto da abertura já entrou pelo CSS; o vídeo começa assim que este script roda, por
  // cima da imagem do primeiro quadro, que está na tela desde o início.
  if (useVideo && heroVisible) playVideo();

  /* ----------------------------------------------------------------------
     Contato: dados preenchidos no <body> (ver comentário no HTML)
     Os canais vazios não aparecem, nem na seção de pedido nem no rodapé.
     ---------------------------------------------------------------------- */
  var body = document.body;
  var phone = (body.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
  var hasPhone = phone.length >= 12;
  var insta = (body.getAttribute('data-instagram') || '').replace(/^@/, '').trim();
  var address = (body.getAttribute('data-endereco') || '').trim();
  var hours = (body.getAttribute('data-horario') || '').trim();

  function waUrl(text) {
    return 'https://wa.me/' + phone + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function outLink(href, text) {
    var a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
  }

  var footerContact = $('[data-footer-contact]');
  function showChannel(name, href, text) {
    var row = $('[data-channel="' + name + '"]');
    var dd = $('dd', row);
    dd.appendChild(href ? outLink(href, text) : document.createTextNode(text));
    row.hidden = false;
    $('[data-channels]').hidden = false;
    // no rodapé, só os canais de conversa
    if (name === 'whatsapp' || name === 'instagram') {
      if (footerContact.childNodes.length) footerContact.appendChild(document.createTextNode(' · '));
      footerContact.appendChild(outLink(href, (name === 'whatsapp' ? 'WhatsApp ' : 'Instagram ') + text));
      footerContact.hidden = false;
    }
  }

  if (hasPhone) {
    // 55 + DDD + número → (DDD) número
    var local = phone.slice(2);
    var pretty = '(' + local.slice(0, 2) + ') ' + local.slice(2, local.length - 4) + '-' + local.slice(-4);
    var hello = 'Olá! Gostaria de fazer uma encomenda.';
    showChannel('whatsapp', waUrl(hello), pretty);
    $$('[data-whatsapp-link]').forEach(function (a) {
      a.href = waUrl(hello);
      a.target = '_blank';
      a.rel = 'noopener';
      a.hidden = false;
    });
  }
  if (insta) showChannel('instagram', 'https://www.instagram.com/' + encodeURIComponent(insta) + '/', '@' + insta);
  if (address) showChannel('endereco', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address), address);
  if (hours) showChannel('horario', null, hours);

  /* ----------------------------------------------------------------------
     Formulário de pedido
     Valida os campos, monta a mensagem e abre o WhatsApp da confeitaria. O
     pedido só é enviado quando a pessoa confirma no próprio WhatsApp — a
     página diz exatamente isso, sem anunciar um envio que não aconteceu.
     ---------------------------------------------------------------------- */
  var form = $('[data-order-form]');
  if (form) {
    var statusEl = $('[data-order-status]', form);
    var submitBtn = $('.order-form__submit', form);
    var productSelect = form.elements.produto;
    var dateInput = form.elements.data;
    var submitted = false;

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date();
    var todayIso = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    dateInput.min = todayIso;

    var rules = {
      produto: function (v) { return v ? '' : 'Escolha o que você quer encomendar.'; },
      data: function (v) {
        if (!v) return 'Informe para quando é o pedido.';
        return v < todayIso ? 'Escolha uma data a partir de hoje.' : '';
      },
      pessoas: function (v, el) {
        if (!v && !el.validity.badInput) return '';
        var n = Number(v);
        return el.validity.badInput || !Number.isInteger(n) || n < 1 || n > 2000 ? 'Informe um número de pessoas válido.' : '';
      },
      nome: function (v) { return v.trim().length >= 2 ? '' : 'Informe seu nome.'; }
    };

    var setStatus = function (kind, text, fieldsError) {
      statusEl.className = 'order-form__status' + (kind ? ' is-' + kind : '');
      statusEl.textContent = text;
      statusEl.toggleAttribute('data-fields-error', !!fieldsError);
    };

    var showError = function (name, msg) {
      var el = form.elements[name];
      el.closest('.field').classList.toggle('is-invalid', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      $('[data-error-for="' + name + '"]', form).textContent = msg;
    };

    var validate = function (name) {
      var el = form.elements[name];
      var msg = rules[name](el.value, el);
      showError(name, msg);
      // corrigido o último campo, o aviso geral de erro sai também
      if (!msg && statusEl.hasAttribute('data-fields-error') && !$('.field.is-invalid', form)) setStatus('', '');
      return msg;
    };

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      el.addEventListener('blur', function () { if (submitted || el.value) validate(name); });
      el.addEventListener('input', function () {
        if (el.closest('.field').classList.contains('is-invalid')) validate(name);
      });
      el.addEventListener('change', function () { if (submitted) validate(name); });
    });

    var buildMessage = function () {
      var d = dateInput.value.split('-');
      var lines = [
        'Olá! Gostaria de fazer uma encomenda.',
        '',
        'Pedido: ' + productSelect.value,
        'Para: ' + d[2] + '/' + d[1] + '/' + d[0]
      ];
      if (form.elements.pessoas.value) lines.push('Pessoas: ' + Number(form.elements.pessoas.value));
      var details = form.elements.detalhes.value.trim();
      if (details) lines.push('Detalhes: ' + details);
      lines.push('Nome: ' + form.elements.nome.value.trim());
      return lines.join('\n');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn.getAttribute('aria-disabled') === 'true') return;
      submitted = true;
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (validate(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        setStatus('error', 'Confira os campos indicados.', true);
        firstInvalid.focus();
        return;
      }

      if (!hasPhone) {
        setStatus('error', 'Os pedidos pelo WhatsApp ainda não estão ativos neste site.');
        if (window.console) console.warn('Formulário de pedido sem destino: preencha data-whatsapp no <body> (ver README).');
        return;
      }

      var url = waUrl(buildMessage());
      // sem 'noopener' na chamada: com ele, window.open sempre devolve null
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url; // bloqueador de janelas: abre na própria página
      setStatus('success', 'Abrimos o WhatsApp com o seu pedido. Confira e toque em enviar para a confeitaria receber.');
      submitBtn.setAttribute('aria-disabled', 'true');
      setTimeout(function () { submitBtn.removeAttribute('aria-disabled'); }, 2000);
    });

    // botões dos produtos: chegam ao formulário com o item já escolhido
    $$('[data-order]').forEach(function (a) {
      a.addEventListener('click', function () {
        productSelect.value = a.getAttribute('data-order');
        if (submitted) validate('produto');
        productSelect.focus({ preventScroll: true });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Ano no rodapé
     ---------------------------------------------------------------------- */
  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

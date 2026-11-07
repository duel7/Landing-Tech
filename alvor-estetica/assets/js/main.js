/*
  Alvor — interações da página (sem dependências).

  - links de WhatsApp com mensagem por tratamento
  - cabeçalho, menu do celular e link da seção atual
  - entrada da abertura e revelações ao rolar
  - tratamentos: foto fixa que acompanha a lista (computador) e carrossel (celular)
  - perguntas frequentes com abertura suave
  - botão flutuante de WhatsApp

  Sem JavaScript, o conteúdo aparece completo e todos os links funcionam.
*/
(function () {
  'use strict';

  window.__alvorReady = true;

  // Número demonstrativo. Troque aqui e nos links do index.html (procure por wa.me).
  var WHATSAPP = '5511900000000';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop = window.matchMedia('(min-width: 1024px)');
  var hasIO = 'IntersectionObserver' in window;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* WhatsApp -------------------------------------------------------------- */

  $$('a[href*="wa.me/"]').forEach(function (a) {
    var text = a.getAttribute('data-wa-text');
    if (text) {
      a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    } else {
      a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + WHATSAPP);
    }
  });

  /* Cabeçalho ------------------------------------------------------------- */

  var header = $('[data-header]');
  var ticking = false;

  function updateHeader() {
    ticking = false;
    if (header) header.classList.toggle('is-scrolled', header.getBoundingClientRect().top <= 0 && window.scrollY > 8);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  updateHeader();

  /* Menu do celular ------------------------------------------------------- */

  var menu = $('[data-menu]');
  var toggle = $('[data-menu-toggle]');
  var toggleLabel = $('[data-menu-label]');
  var closeTimer = null;

  function menuFocusables() {
    return [toggle].concat($$('a', menu));
  }

  function openMenu() {
    if (!menu || !toggle) return;
    window.clearTimeout(closeTimer);
    root.style.setProperty('--menu-top', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    $$('.menu__list li', menu).forEach(function (li, i) { li.style.setProperty('--i', i); });
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (toggleLabel) toggleLabel.textContent = 'Fechar';
    root.classList.add('menu-open');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    });
  }

  function closeMenu(returnFocus) {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggleLabel) toggleLabel.textContent = 'Menu';
    root.classList.remove('menu-open');
    closeTimer = window.setTimeout(function () { menu.hidden = true; }, reduceMotion.matches ? 0 : 400);
    if (returnFocus) toggle.focus();
  }

  if (menu && toggle) {
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') closeMenu(false);
      else openMenu();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') {
        closeMenu(true);
        return;
      }
      if (e.key === 'Tab') {
        var items = menuFocusables();
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    desktop.addEventListener('change', function (e) {
      if (e.matches) closeMenu(false);
    });
  }

  /* Seção atual na navegação ---------------------------------------------- */

  var navLinks = $$('[data-nav]');
  if (hasIO && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle('is-current', a === link); });
        } else if (link.classList.contains('is-current')) {
          link.classList.remove('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* Entrada da abertura --------------------------------------------------- */

  function start() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { root.classList.add('is-loaded'); });
    });
  }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { window.setTimeout(r, 700); })]).then(start, start);

  /* Revelações ao rolar --------------------------------------------------- */

  var reveals = $$('[data-reveal]');
  if (hasIO && !reduceMotion.matches) {
    // Elementos irmãos entram em sequência curta.
    reveals.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--d', Math.min(index, 4) * 90 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Tratamentos ----------------------------------------------------------- */

  var section = $('[data-treatments]');
  if (section) {
    var items = $$('[data-treatment]', section);
    var stageImgs = $$('[data-stage-img]', section);
    var stageNum = $('[data-stage-num]', section);
    var track = $('[data-track]', section);
    var current = $('[data-track-current]', section);
    var prev = $('[data-track-prev]', section);
    var next = $('[data-track-next]', section);
    var activeKey = items.length ? items[0].getAttribute('data-treatment') : null;

    var setActive = function (key) {
      if (!key || key === activeKey) return;
      activeKey = key;
      items.forEach(function (item, i) {
        var on = item.getAttribute('data-treatment') === key;
        item.classList.toggle('is-active', on);
        if (on && stageNum) stageNum.textContent = pad(i + 1);
      });
      stageImgs.forEach(function (img) {
        img.classList.toggle('is-active', img.getAttribute('data-stage-img') === key);
      });
    };

    // Computador: passar o mouse, focar ou rolar até um tratamento troca a foto.
    items.forEach(function (item) {
      var key = item.getAttribute('data-treatment');
      item.addEventListener('mouseenter', function () { if (desktop.matches) setActive(key); });
      item.addEventListener('focusin', function () { if (desktop.matches) setActive(key); });
    });

    if (hasIO) {
      var listObserver = new IntersectionObserver(function (entries) {
        if (!desktop.matches) return;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.getAttribute('data-treatment'));
        });
      }, { rootMargin: '-42% 0px -52% 0px' });
      items.forEach(function (item) { listObserver.observe(item); });
    }

    // Links que apontam para um tratamento (faixa de anúncio).
    $$('[data-treatment-link]').forEach(function (link) {
      link.addEventListener('click', function () {
        var key = link.getAttribute('data-treatment-link');
        setActive(key);
        if (!desktop.matches && track) {
          var target = $('[data-treatment="' + key + '"]', track);
          if (target) {
            window.setTimeout(function () {
              track.scrollTo({ left: target.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
            }, 450);
          }
        }
      });
    });

    // Celular e tablet: carrossel com contador e botões.
    if (track && items.length) {
      var step = function () {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
        return items[0].getBoundingClientRect().width + gap;
      };

      var updateTrack = function () {
        if (desktop.matches) return;
        var max = track.scrollWidth - track.clientWidth;
        var index = Math.round(track.scrollLeft / step());
        if (track.scrollLeft >= max - 4) index = items.length - 1;
        index = Math.max(0, Math.min(items.length - 1, index));
        if (current) current.textContent = pad(index + 1);
        if (prev) prev.disabled = track.scrollLeft <= 4;
        if (next) next.disabled = track.scrollLeft >= max - 4;
        setActive(items[index].getAttribute('data-treatment'));
      };

      var trackTicking = false;
      track.addEventListener('scroll', function () {
        if (!trackTicking) {
          trackTicking = true;
          window.requestAnimationFrame(function () { trackTicking = false; updateTrack(); });
        }
      }, { passive: true });

      var behavior = function () { return reduceMotion.matches ? 'auto' : 'smooth'; };
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: behavior() }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: behavior() }); });

      window.addEventListener('resize', updateTrack);
      updateTrack();
    }
  }

  /* Depoimentos: no celular a lista rola para os lados e precisa de foco pelo teclado. */

  $$('.testimonials__list').forEach(function (list) {
    var sync = function () {
      if (list.scrollWidth > list.clientWidth + 1) list.setAttribute('tabindex', '0');
      else list.removeAttribute('tabindex');
    };
    sync();
    window.addEventListener('resize', sync);
  });

  /* Perguntas frequentes -------------------------------------------------- */

  $$('.faq__item').forEach(function (details) {
    var summary = $('summary', details);
    var answer = $('.faq__answer', details);
    if (!summary || !answer || !answer.animate) return;
    var animation = null;

    summary.addEventListener('click', function (e) {
      if (reduceMotion.matches) return;
      e.preventDefault();
      if (animation) animation.cancel();

      if (!details.open) {
        details.open = true;
        var h = answer.scrollHeight;
        animation = answer.animate(
          [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
          { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        animation.onfinish = function () { animation = null; };
      } else {
        var from = answer.offsetHeight;
        details.classList.add('is-closing');
        animation = answer.animate(
          [{ height: from + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 320, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' }
        );
        animation.onfinish = function () {
          details.open = false;
          details.classList.remove('is-closing');
          animation = null;
        };
        animation.oncancel = function () { details.classList.remove('is-closing'); };
      }
    });
  });

  /* WhatsApp flutuante ---------------------------------------------------- */

  // Fica escondido enquanto a foto ou os botões da abertura estão na tela
  // e quando o bloco de agendamento já aparece.
  var float = $('[data-wa-float]');
  var watched = $$('.hero__visual, .hero__actions, .closing');
  if (float && hasIO && watched.length) {
    var onScreen = watched.map(function () { return true; });
    float.classList.add('is-hidden');
    var floatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        onScreen[watched.indexOf(entry.target)] = entry.isIntersecting;
      });
      float.classList.toggle('is-hidden', onScreen.some(Boolean));
    }, { rootMargin: '0px 0px -10% 0px' });
    watched.forEach(function (el) { floatObserver.observe(el); });
  }
})();

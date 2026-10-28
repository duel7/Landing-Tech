/*
  Interações do site. Sem dependências. Sem este arquivo o conteúdo aparece completo
  (cardápio, preços, contato); com ele, entram o pedido, o cento e o movimento.
*/
(function () {
  'use strict';

  var root = document.documentElement;
  window.__siteReady = true;

  // Se a proteção do <head> já revelou o conteúdo (script lento), não ocultamos de novo.
  var animate = root.classList.contains('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 900px)');
  var LOJA = window.LOJA || {};

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function scrollBehavior() { return reduceMotion.matches ? 'auto' : 'smooth'; }

  function icon(id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function formatMoney(n) { return money.format(n); }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  // Preço vem de <data class="price" value="6.50">. Vazio = preço ainda não definido.
  function readPrice(el) {
    if (!el) return null;
    var v = parseFloat(el.value);
    return isFinite(v) && v > 0 ? v : null;
  }

  var announcer = $('[data-announce]');
  function announce(text) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(function () { announcer.textContent = text; }, 60);
  }

  function popIn(el) {
    if (!el || reduceMotion.matches) return;
    el.classList.remove('is-popping');
    void el.offsetWidth;
    el.classList.add('is-popping');
  }

  /* ----------------------------------------------------------------------
     Cabeçalho e menu do celular
     ---------------------------------------------------------------------- */
  var header = $('[data-header]');
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 8);
    });
  }, { passive: true });

  var nav = $('[data-nav]');
  var menuToggle = $('[data-menu-toggle]');

  function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Menu');
    nav.classList.toggle('is-open', open);
    if (open) document.addEventListener('keydown', onMenuKey);
    else document.removeEventListener('keydown', onMenuKey);
  }

  function onMenuKey(e) {
    if (e.key === 'Escape') {
      setMenu(false);
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener('click', function () {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
  });
  wide.addEventListener('change', function () { setMenu(false); });

  /* ----------------------------------------------------------------------
     Entradas ao rolar
     ---------------------------------------------------------------------- */
  var revealEls = $$('[data-reveal]');

  if (!animate || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      // elementos que entram juntos aparecem em sequência curta
      var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      batch.forEach(function (el, i) {
        el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Loja: aberto agora, WhatsApp e mapa (dados em loja.js)
     ---------------------------------------------------------------------- */
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  function minutes(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function hourLabel(hhmm) { var p = hhmm.split(':'); return +p[0] + 'h' + (p[1] !== '00' ? p[1] : ''); }

  // Usa o relógio de quem visita: a loja atende a própria região.
  function storeStatus(now) {
    var h = LOJA.horarios || {};
    if (!Object.keys(h).length) return null;
    var day = now.getDay();
    var min = now.getHours() * 60 + now.getMinutes();
    var today = h[day];
    if (today && min >= minutes(today[0]) && min < minutes(today[1])) {
      return { open: true, text: 'Aberto agora · fecha às ' + hourLabel(today[1]) };
    }
    if (today && min < minutes(today[0])) {
      return { open: false, text: 'Fechado · abre hoje às ' + hourLabel(today[0]) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (h[d]) return { open: false, text: 'Fechado · abre ' + (i === 1 ? 'amanhã' : DIAS[d]) + ' às ' + hourLabel(h[d][0]) };
    }
    return { open: false, text: 'Fechado' };
  }

  var statusEls = $$('[data-store-status]');
  function renderStoreStatus() {
    var s = storeStatus(new Date());
    if (!s) return; // horários não configurados: fica o marcador do HTML
    statusEls.forEach(function (el) {
      el.innerHTML = '<span class="status-dot' + (s.open ? ' is-open' : '') + '" aria-hidden="true"></span>' + esc(s.text);
    });
  }
  if (statusEls.length) {
    renderStoreStatus();
    setInterval(renderStoreStatus, 60000);
  }

  function whatsappUrl(text) {
    return 'https://wa.me/' + String(LOJA.whatsapp).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  if (LOJA.whatsapp) {
    $$('[data-whatsapp-link]').forEach(function (a) {
      a.href = whatsappUrl('Olá! Quero fazer um pedido.');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  $$('[data-maps-link]').forEach(function (a) {
    if (LOJA.mapa) {
      a.href = LOJA.mapa;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '#contato';
    }
  });

  /* ----------------------------------------------------------------------
     Pedido: estado guardado no navegador, compartilhado entre as páginas
     ---------------------------------------------------------------------- */
  var KEY = 'mania-de-salgado:pedido';

  function validLine(l) {
    return l && typeof l.id === 'string' && typeof l.name === 'string' &&
      typeof l.qty === 'number' && l.qty > 0 && l.qty < 1000 &&
      (l.price === null || typeof l.price === 'number');
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(data) ? data.filter(validLine) : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* navegação privada: o pedido vale só nesta página */ }
  }

  var cart = load();
  var catalog = {};

  function findLine(id) { return cart.filter(function (l) { return l.id === id; })[0]; }
  function itemCount() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }

  // null quando algum item ainda não tem preço definido
  function cartTotal() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].price === null) return null;
      total += cart[i].price * cart[i].qty;
    }
    return total;
  }

  function setQty(id, qty) {
    var line = findLine(id);
    if (qty <= 0) {
      cart = cart.filter(function (l) { return l.id !== id; });
    } else if (line) {
      line.qty = Math.min(qty, 999);
    } else if (catalog[id]) {
      cart.push({ id: id, name: catalog[id].name, price: catalog[id].price, qty: qty });
    }
    commit();
  }

  var lastCount = itemCount();
  function commit() {
    save();
    renderCart();
  }

  /* Produtos: botão de adicionar e quantidade em cada cartão */
  var buys = [];

  $$('[data-product]').forEach(function (el) {
    var id = el.getAttribute('data-product');
    var name = $('.product__name', el).textContent.trim();
    catalog[id] = { name: name, price: readPrice($('data.price', el)) };

    var buy = document.createElement('div');
    buy.className = 'buy';
    buy.innerHTML =
      '<button class="btn-add" type="button" data-add>' + icon('i-plus') + '<span>Adicionar</span></button>' +
      '<div class="qty" role="group" data-qty hidden>' +
        '<button class="qty__btn" type="button" data-dec>' + icon('i-minus') + '</button>' +
        '<output class="qty__n" data-n>1</output>' +
        '<button class="qty__btn" type="button" data-inc>' + icon('i-plus') + '</button>' +
      '</div>';
    $('.product__foot', el).appendChild(buy);

    var b = {
      id: id,
      add: $('[data-add]', buy),
      qty: $('[data-qty]', buy),
      n: $('[data-n]', buy),
      dec: $('[data-dec]', buy),
      inc: $('[data-inc]', buy)
    };
    b.add.setAttribute('aria-label', 'Adicionar ' + name + ' ao pedido');
    b.qty.setAttribute('aria-label', name + ', quantidade no pedido');
    b.dec.setAttribute('aria-label', 'Diminuir quantidade de ' + name);
    b.inc.setAttribute('aria-label', 'Aumentar quantidade de ' + name);

    b.add.addEventListener('click', function () {
      setQty(id, 1);
      popIn(b.qty);
      b.inc.focus();
      announce('Adicionado ao pedido: ' + name + '.');
    });
    b.inc.addEventListener('click', function () {
      var line = findLine(id);
      setQty(id, (line ? line.qty : 0) + 1);
      announce(name + ': ' + findLine(id).qty + ' no pedido.');
    });
    b.dec.addEventListener('click', function () {
      var line = findLine(id);
      var next = (line ? line.qty : 1) - 1;
      setQty(id, next);
      if (next <= 0) {
        popIn(b.add);
        b.add.focus();
        announce('Retirado do pedido: ' + name + '.');
      } else {
        announce(name + ': ' + next + ' no pedido.');
      }
    });

    buys.push(b);
  });

  // Atualiza nome e preço dos itens salvos com o que está na página agora
  cart.forEach(function (l) {
    if (catalog[l.id]) {
      l.name = catalog[l.id].name;
      l.price = catalog[l.id].price;
    }
  });

  /* Gaveta do pedido */
  var drawer = $('[data-drawer]');
  var panel = $('.drawer__panel', drawer);
  var linesEl = $('[data-cart-lines]', drawer);
  var emptyEl = $('[data-cart-empty]', drawer);
  var totalEl = $('[data-cart-total]', drawer);
  var countEls = $$('[data-cart-count]');
  var cartBar = $('[data-cart-bar]');
  var openers = $$('[data-cart-open]');
  var checkout = $('[data-checkout]', drawer);
  var dateField = $('[data-field-date]', drawer);
  var drawerOpen = false;

  function lineHTML(l) {
    var unit = l.price === null ? '' : formatMoney(l.price) + (l.festa ? '' : ' cada');
    var detail = l.detail ? esc(l.detail) : esc(unit);
    var total = l.price === null ? 'a confirmar' : formatMoney(l.price * l.qty);
    return '<li data-line="' + esc(l.id) + '">' +
      '<p class="line__name">' + esc(l.name) + '</p>' +
      '<p class="line__total">' + total + '</p>' +
      (detail ? '<p class="line__detail">' + detail + '</p>' : '') +
      '<div class="line__actions">' +
        '<div class="qty" role="group" aria-label="' + esc(l.name) + ', quantidade">' +
          '<button class="qty__btn" type="button" data-action="dec" aria-label="Diminuir quantidade">' + icon('i-minus') + '</button>' +
          '<output class="qty__n">' + l.qty + '</output>' +
          '<button class="qty__btn" type="button" data-action="inc" aria-label="Aumentar quantidade">' + icon('i-plus') + '</button>' +
        '</div>' +
        '<button class="line__remove" type="button" data-action="remove">Remover<span class="sr-only"> ' + esc(l.name) + '</span></button>' +
      '</div>' +
    '</li>';
  }

  function renderCart() {
    var count = itemCount();
    var total = cartTotal();

    buys.forEach(function (b) {
      var line = findLine(b.id);
      b.add.hidden = !!line;
      b.qty.hidden = !line;
      if (line) b.n.textContent = line.qty;
    });

    countEls.forEach(function (el) {
      el.hidden = count === 0;
      el.textContent = count;
      if (count > lastCount && !reduceMotion.matches) {
        el.classList.remove('is-bumping');
        void el.offsetWidth;
        el.classList.add('is-bumping');
      }
    });
    openers.forEach(function (b) {
      if (b.classList.contains('cart-btn')) {
        b.setAttribute('aria-label', count ? 'Pedido, ' + plural(count, 'item', 'itens') : 'Pedido vazio');
      }
    });
    lastCount = count;

    if (cartBar) {
      cartBar.hidden = count === 0 || drawerOpen;
      document.body.classList.toggle('has-cart-bar', !cartBar.hidden);
      $('[data-cart-count-text]', cartBar).textContent = plural(count, 'item', 'itens');
      $('[data-cart-total-text]', cartBar).textContent = total === null ? '' : formatMoney(total);
    }

    // a lista é redesenhada: guardamos o foco para devolvê-lo ao mesmo controle
    var active = document.activeElement;
    var focusLine = active && active.closest ? active.closest('[data-line]') : null;
    var focusKey = focusLine ? [focusLine.getAttribute('data-line'), active.getAttribute('data-action')] : null;

    drawer.classList.toggle('is-empty', count === 0);
    emptyEl.hidden = count !== 0;
    linesEl.innerHTML = cart.map(lineHTML).join('');
    totalEl.textContent = total === null ? 'a confirmar' : formatMoney(total);
    dateField.hidden = !cart.some(function (l) { return l.festa; });

    if (focusKey) {
      var target = $('[data-line="' + focusKey[0] + '"] [data-action="' + focusKey[1] + '"]', linesEl);
      if (target) target.focus();
      else panel.focus();
    }
  }

  linesEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.closest('[data-line]').getAttribute('data-line');
    var line = findLine(id);
    if (!line) return;
    var action = btn.getAttribute('data-action');
    var next = action === 'inc' ? line.qty + 1 : action === 'dec' ? line.qty - 1 : 0;
    setQty(id, next);
    if (next <= 0) announce('Retirado do pedido: ' + line.name + '.');
  });

  var outside = [$('.skip-link'), header, $('main'), $('.site-footer'), cartBar];
  var closeTimer;
  var returnFocus;

  function focusables() {
    return $$('a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select', panel)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden]'); });
  }

  function onDrawerKey(e) {
    if (e.key === 'Escape') {
      closeDrawer(true);
      return;
    }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && i === items.length - 1) {
      e.preventDefault();
      items[0].focus();
    }
  }

  function openDrawer() {
    if (drawerOpen) return;
    clearTimeout(closeTimer);
    setMenu(false);
    drawerOpen = true;
    returnFocus = document.activeElement;
    drawer.hidden = false;
    void drawer.offsetWidth; // força o layout antes da transição de entrada
    drawer.classList.add('is-open');
    root.classList.add('drawer-open');
    outside.forEach(function (el) { if (el) el.setAttribute('inert', ''); });
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    document.addEventListener('keydown', onDrawerKey);
    renderCart();
    panel.focus();
  }

  function closeDrawer(restoreFocus) {
    if (!drawerOpen) return;
    drawerOpen = false;
    drawer.classList.remove('is-open');
    root.classList.remove('drawer-open');
    outside.forEach(function (el) { if (el) el.removeAttribute('inert'); });
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.removeEventListener('keydown', onDrawerKey);
    closeTimer = setTimeout(function () { drawer.hidden = true; }, reduceMotion.matches ? 0 : 400);
    renderCart();
    if (restoreFocus && returnFocus && document.contains(returnFocus) && !returnFocus.closest('[hidden]')) returnFocus.focus();
  }

  openers.forEach(function (b) { b.addEventListener('click', openDrawer); });
  $$('[data-drawer-close]', drawer).forEach(function (el) {
    // o link "ver cardápio" fecha a gaveta e segue para a âncora
    el.addEventListener('click', function () { closeDrawer(el.tagName !== 'A'); });
  });

  // pedido alterado em outra aba
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    cart = load();
    renderCart();
  });

  /* Envio pelo WhatsApp */
  var sendStatus = $('[data-send-status]', drawer);
  var addressField = $('[data-field-address]', checkout);

  function setFieldError(name, msg) {
    var input = checkout.elements[name];
    input.closest('.field').classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('[data-error-for="' + name + '"]', checkout).textContent = msg;
  }

  function setSendStatus(kind, text, placeholder) {
    sendStatus.className = 'drawer__status' + (kind ? ' is-' + kind : '');
    sendStatus.textContent = text;
    if (placeholder) {
      var ph = document.createElement('span');
      ph.className = 'ph';
      ph.textContent = placeholder;
      sendStatus.appendChild(document.createTextNode(' '));
      sendStatus.appendChild(ph);
    }
  }

  function isoToday() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dateLabel(iso) {
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return p[2] + '/' + p[1] + '/' + p[0] + ' (' + d.toLocaleDateString('pt-BR', { weekday: 'long' }) + ')';
  }

  checkout.elements.data.min = isoToday();

  function syncDelivery() {
    addressField.hidden = checkout.elements.recebimento.value !== 'entrega';
  }
  $$('input[name="recebimento"]', checkout).forEach(function (r) { r.addEventListener('change', syncDelivery); });
  syncDelivery();

  ['endereco', 'data'].forEach(function (name) {
    checkout.elements[name].addEventListener('input', function () { setFieldError(name, ''); });
  });

  function orderMessage(form) {
    var total = cartTotal();
    var lines = cart.map(function (l) {
      var text = '• ' + l.qty + ' × ' + l.name;
      if (l.detail) text += ': ' + l.detail;
      if (l.price !== null) text += ' — ' + formatMoney(l.price * l.qty);
      return text;
    });
    var out = ['Olá, Mania de Salgado! Quero fazer um pedido:', ''].concat(lines, [
      '',
      'Subtotal: ' + (total === null ? 'a confirmar' : formatMoney(total)),
      form.recebimento === 'entrega' ? 'Entrega em: ' + form.endereco : 'Vou retirar no balcão.'
    ]);
    if (form.data) out.push('Data da festa: ' + dateLabel(form.data));
    if (form.obs) out.push('Observações: ' + form.obs);
    return out.join('\n');
  }

  checkout.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cart.length) return;

    var form = {
      recebimento: checkout.elements.recebimento.value,
      endereco: checkout.elements.endereco.value.trim(),
      data: dateField.hidden ? '' : checkout.elements.data.value,
      obs: checkout.elements.obs.value.trim()
    };

    var firstInvalid = null;
    var addressMsg = form.recebimento === 'entrega' && form.endereco.length < 6 ? 'Informe o endereço para a entrega.' : '';
    var dateMsg = !dateField.hidden && !form.data ? 'Informe a data da festa.' :
      (form.data && form.data < isoToday() ? 'Escolha uma data a partir de hoje.' : '');
    setFieldError('endereco', addressMsg);
    setFieldError('data', dateMsg);
    if (addressMsg) firstInvalid = checkout.elements.endereco;
    else if (dateMsg) firstInvalid = checkout.elements.data;
    if (firstInvalid) {
      setSendStatus('error', 'Falta uma informação para enviar o pedido.');
      firstInvalid.focus();
      return;
    }

    if (!LOJA.whatsapp) {
      setSendStatus('error', 'O envio ainda não está configurado neste site.', '[Número do WhatsApp em assets/js/loja.js — ver README]');
      if (window.console) console.warn('Pedido sem destino: preencha LOJA.whatsapp em assets/js/loja.js.');
      return;
    }

    var url = whatsappUrl(orderMessage(form));
    var win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    setSendStatus('success', 'Abrimos o WhatsApp com o pedido escrito. Falta só enviar a mensagem.');
  });

  /* ----------------------------------------------------------------------
     Bandeja: 100 pontos, um por salgado
     ---------------------------------------------------------------------- */
  // os tons claros vêm antes do rosa forte, que fica reservado para o 4º sabor
  var COLORS = ['var(--gold)', 'var(--rose-soft)', 'var(--gold-soft)', 'var(--rose)'];

  function buildTray(tray, size) {
    var html = '';
    for (var i = 0; i < size; i++) html += '<span class="tray__dot"></span>';
    tray.innerHTML = html;
    return $$('.tray__dot', tray);
  }

  // groups: [{ qty, color }]; os pontos novos entram em sequência
  function paintTray(dots, groups, from) {
    var i = 0;
    groups.forEach(function (g) {
      for (var k = 0; k < g.qty && i < dots.length; k++, i++) {
        var dot = dots[i];
        dot.style.setProperty('--c', g.color);
        if (!dot.classList.contains('is-filled') && i >= from && !reduceMotion.matches) {
          dot.style.setProperty('--d', (i - from) * 7 + 'ms');
          dot.classList.add('is-new');
        }
        dot.classList.add('is-filled');
      }
    });
    for (; i < dots.length; i++) dots[i].classList.remove('is-filled', 'is-new');
  }

  var demo = $('[data-tray-demo]');
  if (demo) {
    var demoDots = buildTray(demo, 100);
    var demoFill = function () {
      paintTray(demoDots, [
        { qty: 50, color: COLORS[0] },
        { qty: 25, color: COLORS[1] },
        { qty: 25, color: COLORS[2] }
      ], 0);
    };
    if (animate && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        setTimeout(demoFill, 250);
      }, { threshold: 0.4 }).observe(demo);
    } else {
      demoFill();
    }
  }

  /* ----------------------------------------------------------------------
     Monte seu cento
     ---------------------------------------------------------------------- */
  var builder = $('[data-builder]');
  if (builder) {
    var step = parseInt(builder.getAttribute('data-step'), 10) || 25;
    var maxFlavors = parseInt(builder.getAttribute('data-max-flavors'), 10) || 4;
    var tray = $('[data-tray]', builder);
    var bStatus = $('[data-builder-status]', builder);
    var addBtn = $('[data-builder-add]', builder);
    var size = 100;
    var dots = buildTray(tray, size);
    var picks = []; // na ordem em que foram escolhidos: { flavor, qty, color }

    var pickOf = function (flavor) { return picks.filter(function (p) { return p.flavor === flavor; })[0]; };
    var chosen = function () { return picks.reduce(function (n, p) { return n + p.qty; }, 0); };
    var freeColor = function () {
      var used = picks.map(function (p) { return p.color; });
      return COLORS.filter(function (c) { return used.indexOf(c) === -1; })[0] || COLORS[picks.length % COLORS.length];
    };

    var flavors = $$('[data-flavor]', builder).map(function (li) {
      var name = li.getAttribute('data-flavor');
      var qty = document.createElement('div');
      qty.className = 'qty';
      qty.setAttribute('role', 'group');
      qty.setAttribute('aria-label', name);
      qty.innerHTML =
        '<button class="qty__btn" type="button" data-dec>' + icon('i-minus') + '</button>' +
        '<output class="qty__n" data-n>0</output>' +
        '<button class="qty__btn" type="button" data-inc>' + icon('i-plus') + '</button>';
      li.appendChild(qty);
      var f = { name: name, li: li, n: $('[data-n]', qty), dec: $('[data-dec]', qty), inc: $('[data-inc]', qty) };
      f.dec.setAttribute('aria-label', 'Menos ' + step + ' de ' + name);
      f.inc.setAttribute('aria-label', 'Mais ' + step + ' de ' + name);
      f.inc.addEventListener('click', function () { change(name, step); });
      f.dec.addEventListener('click', function () { change(name, -step); });
      return f;
    });

    var setBuilderStatus = function (text, isError) {
      bStatus.textContent = text;
      bStatus.classList.toggle('is-error', !!isError);
    };

    var describe = function () {
      var n = chosen();
      if (n === 0) return 'Escolha os sabores.';
      if (n < size) return n + ' de ' + size + '. Faltam ' + (size - n) + '.';
      return 'Pronto: ' + size + ' salgados.';
    };

    var renderBuilder = function (from) {
      var n = chosen();
      flavors.forEach(function (f) {
        var p = pickOf(f.name);
        f.li.classList.toggle('is-chosen', !!p);
        if (p) f.li.style.setProperty('--c', p.color);
        f.n.textContent = p ? p.qty : 0;
        f.dec.setAttribute('aria-disabled', String(!p));
        f.inc.setAttribute('aria-disabled', String(n >= size || (!p && picks.length >= maxFlavors)));
      });
      paintTray(dots, picks, from);
      addBtn.setAttribute('aria-disabled', String(n !== size));
    };

    var change = function (name, delta) {
      var p = pickOf(name);
      var n = chosen();
      if (delta > 0) {
        if (n + delta > size) {
          setBuilderStatus((size === 100 ? 'O cento' : 'O meio cento') + ' já está completo. Tire um sabor para trocar.', true);
          return;
        }
        if (!p && picks.length >= maxFlavors) {
          setBuilderStatus('Até ' + maxFlavors + ' sabores por pedido de festa.', true);
          return;
        }
        if (p) p.qty += delta;
        else picks.push({ flavor: name, qty: delta, color: freeColor() });
      } else {
        if (!p) return;
        p.qty += delta;
        if (p.qty <= 0) picks = picks.filter(function (x) { return x !== p; });
      }
      renderBuilder(n);
      setBuilderStatus(describe());
    };

    $$('input[name="tamanho"]', builder).forEach(function (r) {
      r.addEventListener('change', function () {
        size = parseInt(r.value, 10);
        // ao reduzir, o excesso sai dos últimos sabores escolhidos
        var over = chosen() - size;
        for (var i = picks.length - 1; i >= 0 && over > 0; i--) {
          var cut = Math.min(over, picks[i].qty);
          picks[i].qty -= cut;
          over -= cut;
        }
        picks = picks.filter(function (p) { return p.qty > 0; });
        dots = buildTray(tray, size);
        $$('[data-size-price]', builder).forEach(function (el) {
          el.hidden = el.getAttribute('data-size-price') !== String(size);
        });
        renderBuilder(0);
        setBuilderStatus(describe());
      });
    });

    addBtn.addEventListener('click', function () {
      var n = chosen();
      if (n !== size) {
        setBuilderStatus(n === 0 ? 'Escolha os sabores primeiro.' : 'Faltam ' + (size - n) + ' para completar.', true);
        return;
      }
      cart.push({
        id: 'festa-' + Date.now().toString(36),
        name: size === 100 ? 'Cento' : 'Meio cento',
        detail: picks.map(function (p) { return p.qty + ' ' + p.flavor; }).join(', '),
        price: readPrice($('[data-size-price="' + size + '"] data.price', builder)),
        qty: 1,
        festa: true
      });
      commit();
      announce((size === 100 ? 'Cento' : 'Meio cento') + ' adicionado ao pedido.');
      picks = [];
      renderBuilder(0);
      setBuilderStatus('Adicionado ao pedido. Monte outro, se quiser.');
      openDrawer();
    });

    renderBuilder(0);
  }

  /* ----------------------------------------------------------------------
     Cardápio: categoria atual nos atalhos
     ---------------------------------------------------------------------- */
  var chipList = $('.chips__list');
  if (chipList && 'IntersectionObserver' in window) {
    var chips = $$('.chip', chipList);
    var markChip = function (id) {
      chips.forEach(function (c) {
        var on = c.getAttribute('href') === '#' + id;
        if (on) {
          c.setAttribute('aria-current', 'true');
          // no celular, mantém o atalho atual visível na faixa
          var left = c.offsetLeft - (chipList.clientWidth - c.offsetWidth) / 2;
          chipList.scrollTo({ left: Math.max(0, left), behavior: scrollBehavior() });
        } else {
          c.removeAttribute('aria-current');
        }
      });
    };
    var chipObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) markChip(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.menu-section[id]').forEach(function (s) { chipObserver.observe(s); });
    // no topo da página nenhuma categoria está marcada
    var pageHead = $('.page-head');
    if (pageHead) chipObserver.observe(pageHead);
  }

  /* ----------------------------------------------------------------------
     Início
     ---------------------------------------------------------------------- */
  if (location.hash === '#pedido') openDrawer();
  renderCart();

  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

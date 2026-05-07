(function () {
  'use strict';

  var API = window.CF_CHATBOT_API || 'https://cf-chatbot.hiraya.digital';
  var STORAGE_KEY = 'cf_chatbot_session';
  var MAX_INPUT = 2000;
  var PREMIUM_TAGS = { CPH: 1, ROU: 1, UMRP: 1 };

  // ----- Orb factory -----
  function buildOrb(size) {
    var cls = 'cf-orb cf-orb--' + (size || 'md') + ' cf-orb--idle';
    var orb = document.createElement('div');
    orb.className = cls;
    orb.setAttribute('data-orb', '');
    orb.innerHTML = '<div class="cf-orb__frame"><div class="cf-orb__glow"></div><div class="cf-orb__ring"></div><div class="cf-orb__shimmer"></div><div class="cf-orb__core"></div></div>';
    return orb;
  }
  function orbSetState(orbEl, state) {
    if (!orbEl) return;
    orbEl.classList.remove('cf-orb--idle', 'cf-orb--thinking', 'cf-orb--responding');
    orbEl.classList.add('cf-orb--' + (state || 'idle'));
  }
  function orbSetStateAll(root, state) {
    if (!root) return;
    root.querySelectorAll('[data-orb]').forEach(function (o) { orbSetState(o, state); });
    if (window.CFApex && typeof window.CFApex.setState === 'function') {
      window.CFApex.setState(state);
    }
  }
  window.CFOrb = { build: buildOrb, setState: orbSetState };

  // ----- Global (cross-instance) state -----
  var state = {
    sessionId: localStorage.getItem(STORAGE_KEY) || null,
    messageCount: 0,
    leadPrompted: false,
    sending: false,         // widget-level /chat concurrency gate
    lastMode: 'discovery',  // used by the consultation guard below
    proAddInFlight: 0,      // concurrent /cart/add.js requests in the Pro UI
    proCurrentBatchId: 0,   // bumps when a new Pro batch renders; stale responses are ignored
    modalEl: null,          // singleton image modal
  };

  function hasPremiumTag() {
    var tags = window.CF_CHATBOT_CUSTOMER_TAGS || (window.wcp_customer && window.wcp_customer.tags) || [];
    if (typeof tags === 'string') tags = tags.split(',');
    for (var i = 0; i < tags.length; i++) {
      if (PREMIUM_TAGS[String(tags[i]).trim()]) return true;
    }
    return false;
  }

  // ----- UI primitives -----
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function money(v) {
    var n = Number(v);
    if (!isFinite(n) || n <= 0) return '';
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatReply(text) {
    var safe = escapeHtml(text);
    return safe.split(/\n\n+/).map(function (para) {
      var lines = para.split('\n');
      if (lines.every(function (l) { return /^\s*[-*]\s+/.test(l); })) {
        return '<ul style="margin:4px 0;padding-left:18px">' + lines.map(function (l) { return '<li>' + l.replace(/^\s*[-*]\s+/, '') + '</li>'; }).join('') + '</ul>';
      }
      return '<p style="margin:0 0 6px">' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function productCard(p) {
    return el('a', { class: 'cf-msg__product', href: p.url, target: '_blank', rel: 'noopener' }, [
      el('img', { src: p.image_url || 'https://via.placeholder.com/54', alt: '', loading: 'lazy' }),
      el('div', {}, [
        el('div', { class: 'cf-msg__product-title' }, [p.title]),
        money(p.price) ? el('div', { class: 'cf-msg__product-price' }, [money(p.price)]) : null,
      ]),
    ]);
  }

  // ----- Image modal singleton (for Pro cards) -----
  function ensureModal() {
    if (state.modalEl && document.body.contains(state.modalEl)) return state.modalEl;
    var m = el('div', { class: 'cf-pro-modal', role: 'dialog', 'aria-modal': 'true' });
    var inner = el('div', { class: 'cf-pro-modal__inner' });
    var img = el('img', { class: 'cf-pro-modal__img', alt: '' });
    var close = el('button', { class: 'cf-pro-modal__close', type: 'button', 'aria-label': 'Close' }, ['×']);
    close.addEventListener('click', function () { m.classList.remove('is-open'); });
    m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('is-open'); });
    inner.appendChild(img); inner.appendChild(close); m.appendChild(inner);
    document.body.appendChild(m);
    state.modalEl = m;
    return m;
  }
  function openImageModal(src, alt) {
    var m = ensureModal();
    var img = m.querySelector('.cf-pro-modal__img');
    img.src = src || '';
    img.alt = alt || '';
    m.classList.add('is-open');
  }

  // ----- Chat instance -----
  function createChat(mountEl, opts) {
    opts = opts || {};

    var body = el('div', { class: 'cf-chatbot__body' });
    var quick = el('div', { class: 'cf-chatbot__quick' }, [
      quickBtn('Find Equipment', 'I need help finding kitchen equipment'),
      quickBtn('Plan My Kitchen', 'Help me plan a restaurant kitchen'),
      bookBtn('📅 Book a Call'),
    ]);

    function bookBtn(label) {
      return el('button', { class: 'cf-chatbot__quick-btn cf-chatbot__quick-btn--cta', type: 'button', onclick: function () { showBookingForm(); } }, [label]);
    }

    var input = el('input', { class: 'cf-chatbot__input', type: 'text', maxlength: MAX_INPUT, placeholder: 'Ask about kitchen equipment…', autocomplete: 'off' });
    var sendBtn = el('button', { class: 'cf-chatbot__send', type: 'submit', 'aria-label': 'Send' });
    sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    var form = el('form', { class: 'cf-chatbot__form' }, [input, sendBtn]);

    mountEl.appendChild(body);
    mountEl.appendChild(quick);
    mountEl.appendChild(form);

    function quickBtn(label, text) {
      return el('button', { class: 'cf-chatbot__quick-btn', type: 'button', onclick: function () { send(text); } }, [label]);
    }

    function addMsg(role, html) {
      var wrap = el('div', { class: 'cf-msg cf-msg--' + role });
      var bubble = el('div', { class: 'cf-msg__bubble', html: html });
      wrap.appendChild(bubble);
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      return wrap;
    }

    // Hard guard: the widget refuses to render legacy productCards if the
    // last response declared consultation mode. Belt-and-suspenders for the
    // server-side invariant.
    function addProducts(wrap, products) {
      if (state.lastMode === 'consultation') return;
      if (!products || !products.length) return;
      var list = el('div', { class: 'cf-msg__products' });
      products.forEach(function (p) { list.appendChild(productCard(p)); });
      wrap.appendChild(list);
      body.scrollTop = body.scrollHeight;
    }

    function addTyping() {
      var w = el('div', { class: 'cf-msg cf-msg--assistant cf-msg--typing' });
      w.appendChild(el('div', { class: 'cf-msg__bubble', html: '<span class="cf-dot"></span><span class="cf-dot"></span><span class="cf-dot"></span>' }));
      body.appendChild(w); body.scrollTop = body.scrollHeight;
      return w;
    }

    // ----- Quick-reply chips (used by Consultation + pause-offer) -----
    function renderQuickReplies(wrap, replies, onPick, opts2) {
      opts2 = opts2 || {};
      var row = el('div', { class: 'cf-chips' });
      (replies || []).forEach(function (r) {
        var b = el('button', { class: 'cf-chip', type: 'button' }, [r.label || r.value]);
        b.addEventListener('click', function () {
          row.querySelectorAll('.cf-chip').forEach(function (x) { x.disabled = true; });
          onPick(r.value);
        });
        row.appendChild(b);
      });
      wrap.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }

    // ----- Booking slot chips (GET /calendar-slots -> render) -----
    function renderBookingSlots(wrap) {
      var loading = el('div', { class: 'cf-chips cf-chips--loading' }, ['Loading slots…']);
      wrap.appendChild(loading);
      fetch(API + '/calendar-slots?days=5').then(function (r) { return r.json(); }).then(function (data) {
        loading.remove();
        if (!data.slots || !data.slots.length) {
          wrap.appendChild(el('p', { class: 'cf-chips__empty' }, ['No slots available. Please call (408) 673-9999.']));
          return;
        }
        var row = el('div', { class: 'cf-chips cf-chips--slots' });
        data.slots.forEach(function (s) {
          var b = el('button', { class: 'cf-chip cf-chip--slot', type: 'button' }, [s.label]);
          b.addEventListener('click', function () {
            row.querySelectorAll('.cf-chip').forEach(function (x) { x.disabled = true; });
            showConsultationBookingForm(wrap, s);
          });
          row.appendChild(b);
        });
        wrap.appendChild(row);
      }).catch(function () {
        loading.remove();
        wrap.appendChild(el('p', { class: 'cf-chips__empty' }, ['Could not load slots. Please call (408) 673-9999.']));
      });
    }

    function showConsultationBookingForm(parentWrap, slot) {
      var w = el('div', { class: 'cf-lead cf-lead--booking' });
      w.innerHTML = '<div class="cf-lead__title">Confirm your call</div><div class="cf-lead__sub">' + escapeHtml(slot.label) + '</div>';
      var nameI = el('input', { type: 'text', placeholder: 'Full name', autocomplete: 'name', required: 'required' });
      var emailI = el('input', { type: 'email', placeholder: 'Email (required)', autocomplete: 'email', required: 'required' });
      var phoneI = el('input', { type: 'tel', placeholder: 'Phone (required)', autocomplete: 'tel', required: 'required' });
      var notesI = el('input', { type: 'text', placeholder: 'Anything you want the specialist to prep? (optional)' });
      var skip = el('button', { class: 'cf-lead__skip', type: 'button', onclick: function () { w.remove(); } }, ['Cancel']);
      var submit = el('button', { class: 'cf-lead__submit', type: 'button' }, ['Confirm booking']);
      submit.addEventListener('click', function () {
        if (!nameI.value.trim()) { nameI.focus(); return; }
        if (!emailI.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value)) { emailI.focus(); return; }
        if (!phoneI.value.trim()) { phoneI.focus(); return; }
        submit.disabled = true; submit.textContent = 'Booking…';
        fetch(API + '/calendar-slots/book', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: state.sessionId, slot_start: slot.start, slot_end: slot.end,
            name: nameI.value, email: emailI.value, phone: phoneI.value, notes: notesI.value,
          })
        }).then(function (r) { return r.json(); }).then(function (data) {
          if (data && data.ok) {
            w.remove();
            addMsg('assistant', '<p>✅ Booked! A specialist will call you at <b>' + escapeHtml(slot.label) + '</b>. You\'ll also get a confirmation email.</p>');
            state.leadPrompted = true;
          } else {
            submit.disabled = false; submit.textContent = 'Confirm booking';
            addMsg('assistant', '<p>That slot just got taken. Pick another?</p>');
          }
        }).catch(function () {
          submit.disabled = false; submit.textContent = 'Confirm booking';
        });
      });
      w.appendChild(nameI); w.appendChild(emailI); w.appendChild(phoneI); w.appendChild(notesI);
      w.appendChild(el('div', { class: 'cf-lead__actions' }, [skip, submit]));
      parentWrap.appendChild(w); body.scrollTop = body.scrollHeight;
    }

    // ----- Consultation dispatcher -----
    function renderConsultationUI(wrap, ui) {
      if (!ui) return;
      if (ui.kind === 'quick_replies' || ui.kind === 'consultation_pause_offer') {
        renderQuickReplies(wrap, ui.quick_replies || [], function (val) {
          if (val === '__free_text__') { input.focus(); return; }
          send(val);
        });
      } else if (ui.kind === 'form_booking') {
        renderBookingSlots(wrap);
      } else if (ui.kind === 'form_lead') {
        showLeadForm();
      }
    }

    // ----- Pro Mode cards -----
    function renderProCards(wrap, ui) {
      state.proCurrentBatchId++;
      var myBatch = state.proCurrentBatchId;
      if (!ui || !Array.isArray(ui.items) || !ui.items.length) {
        if (ui && Array.isArray(ui.missing) && ui.missing.length) {
          wrap.appendChild(el('p', { class: 'cf-pro__missing' }, ['Not in catalog: ' + ui.missing.join(', ')]));
        }
        return;
      }

      var container = el('div', { class: 'cf-pro' });
      var cards = [];

      ui.items.forEach(function (item) {
        var card = buildProCard(item);
        cards.push(card);
        container.appendChild(card.root);
      });

      if (Array.isArray(ui.missing) && ui.missing.length) {
        container.appendChild(el('p', { class: 'cf-pro__missing' }, ['Not in catalog: ' + ui.missing.join(', ')]));
      }

      // Bulk actions bar.
      var actionBar = el('div', { class: 'cf-pro__actions' });
      var addAllBtn = el('button', { class: 'cf-pro__add-all', type: 'button' }, ['Add all to cart']);
      var checkoutBtn = el('button', { class: 'cf-pro__checkout', type: 'button' }, ['Go to checkout']);
      var reviewBtn = el('button', { class: 'cf-pro__review', type: 'button' }, ['Request expert review']);
      addAllBtn.addEventListener('click', function () { addAll(cards, addAllBtn); });
      checkoutBtn.addEventListener('click', function () { window.location.href = '/checkout'; });
      reviewBtn.addEventListener('click', function () { showLeadForm(); });
      actionBar.appendChild(addAllBtn);
      actionBar.appendChild(checkoutBtn);
      actionBar.appendChild(reviewBtn);
      container.appendChild(actionBar);

      if (ui.high_value) {
        var nudge = el('div', { class: 'cf-pro__highvalue' });
        nudge.innerHTML = '<b>Ordering premium equipment?</b><br>Our experts can help spec compatible prep & refrigeration to protect your budget.';
        var nudgeBtn = el('button', { class: 'cf-pro__highvalue-btn', type: 'button' }, ['Book a consult']);
        nudgeBtn.addEventListener('click', function () { sendWithHint('Help me plan a restaurant kitchen', 'consultation'); });
        nudge.appendChild(nudgeBtn);
        container.appendChild(nudge);
      }

      wrap.appendChild(container);
      body.scrollTop = body.scrollHeight;

      // Kick off BDR wholesale pricing fetch for this batch.
      var wholesaleItems = cards.map(function (c) { return c.bdrItem; }).filter(Boolean);
      if (wholesaleItems.length && typeof window.cfFetchWholesalePrices === 'function') {
        cards.forEach(function (c) { c.setPriceLoading(true); });
        window.cfFetchWholesalePrices(wholesaleItems).then(function (resp) {
          // Ignore if a newer batch has been rendered in the meantime.
          if (myBatch !== state.proCurrentBatchId) return;
          cards.forEach(function (c) {
            c.setPriceLoading(false);
            var entry = resp && resp[c.bdrItem.variant_id];
            if (entry && entry.wpd_v_price && Number(entry.wpd_v_price) < Number(entry.original_price || c.bdrItem.price)) {
              c.applyMemberPrice(entry);
            }
          });
        }).catch(function () {
          if (myBatch !== state.proCurrentBatchId) return;
          cards.forEach(function (c) { c.setPriceLoading(false); });
        });
      }
    }

    function buildProCard(item) {
      var currentVariant = pickCurrentVariant(item);

      var root = el('div', { class: 'cf-pro-card' });

      var imgWrap = el('div', { class: 'cf-pro-card__image' });
      var img = el('img', { src: item.image || '', alt: item.product_title || '', loading: 'lazy' });
      imgWrap.addEventListener('click', function () { openImageModal(item.image, item.product_title); });
      imgWrap.appendChild(img);

      var bodyWrap = el('div', { class: 'cf-pro-card__body' });
      var title = el('div', { class: 'cf-pro-card__title' }, [item.product_title || '(untitled)']);
      var skuLine = el('div', { class: 'cf-pro-card__sku' }, ['SKU: ' + (item.sku || '—')]);
      var priceLine = el('div', { class: 'cf-pro-card__price' }, [money(currentVariant.price) || '—']);
      if (item.high_value) {
        priceLine.appendChild(el('span', { class: 'cf-pro-card__hv-tag' }, ['Premium']));
      }

      var variantSelect = null;
      if (item.has_multiple_variants && Array.isArray(item.all_variants) && item.all_variants.length > 1) {
        variantSelect = el('select', { class: 'cf-pro-card__variant' });
        item.all_variants.forEach(function (v) {
          var label = [v.option1, v.option2, v.option3].filter(Boolean).join(' / ') || v.title || v.sku;
          var opt = el('option', { value: String(v.id) }, [label + (v.available ? '' : ' — out of stock')]);
          if (!v.available) opt.disabled = true;
          if (currentVariant && String(v.id) === String(currentVariant.id)) opt.selected = true;
          variantSelect.appendChild(opt);
        });
        variantSelect.addEventListener('change', function () {
          var newVar = (item.all_variants || []).find(function (v) { return String(v.id) === variantSelect.value; });
          if (newVar) {
            currentVariant = newVar;
            priceLine.childNodes[0].nodeValue = money(newVar.price) || '—';
            if (newVar.image) img.src = newVar.image;
            errorLine.textContent = '';
            addBtn.disabled = !newVar.available || state.proAddInFlight > 0;
            updateBdrItem();
          }
        });
      }

      var qtyWrap = el('div', { class: 'cf-pro-card__qty' });
      var minus = el('button', { type: 'button', class: 'cf-pro-card__qty-btn' }, ['−']);
      var qtyI = el('input', { type: 'number', min: '1', value: '1', inputmode: 'numeric' });
      var plus = el('button', { type: 'button', class: 'cf-pro-card__qty-btn' }, ['+']);
      minus.addEventListener('click', function () { qtyI.value = Math.max(1, (parseInt(qtyI.value, 10) || 1) - 1); });
      plus.addEventListener('click', function () { qtyI.value = (parseInt(qtyI.value, 10) || 1) + 1; });
      qtyI.addEventListener('input', function () {
        var n = parseInt(qtyI.value, 10);
        if (!isFinite(n) || n < 1) qtyI.value = '1';
        if (n > 999) qtyI.value = '999';
      });
      qtyWrap.appendChild(minus); qtyWrap.appendChild(qtyI); qtyWrap.appendChild(plus);

      var addBtn = el('button', { class: 'cf-pro-card__add', type: 'button' }, ['Add to cart']);
      var errorLine = el('div', { class: 'cf-pro-card__error' });

      bodyWrap.appendChild(title);
      bodyWrap.appendChild(skuLine);
      bodyWrap.appendChild(priceLine);
      if (variantSelect) bodyWrap.appendChild(variantSelect);
      bodyWrap.appendChild(qtyWrap);
      bodyWrap.appendChild(addBtn);
      bodyWrap.appendChild(errorLine);

      root.appendChild(imgWrap);
      root.appendChild(bodyWrap);

      // BDR item snapshot reflects currently-selected variant.
      var bdrItem = {
        variant_id: String(currentVariant.id || item.variant_id || ''),
        product_id: String(item.product_id || ''),
        compare_at_price: String(currentVariant.compare_at_price || item.compare_at_price || ''),
        price: String(currentVariant.price || item.price || ''),
        quantity: 1,
        send_vd_table: true,
        handle: item.handle || '',
        collection_ids: '',
      };
      function updateBdrItem() {
        bdrItem.variant_id = String(currentVariant.id || bdrItem.variant_id);
        bdrItem.compare_at_price = String(currentVariant.compare_at_price || bdrItem.compare_at_price);
        bdrItem.price = String(currentVariant.price || bdrItem.price);
      }

      function setPriceLoading(isLoading) {
        if (isLoading) priceLine.classList.add('is-loading');
        else priceLine.classList.remove('is-loading');
      }

      function applyMemberPrice(entry) {
        var original = Number(entry.original_price || currentVariant.price || 0);
        var member = Number(entry.wpd_v_price);
        if (!(member > 0 && member < original)) return;
        var saved = original - member;
        priceLine.innerHTML = ''
          + '<div class="cf-pro-card__member-label">Member Price</div>'
          + '<div class="cf-pro-card__member-price">' + money(member) + '</div>'
          + '<div class="cf-pro-card__was">Was ' + money(original) + '</div>'
          + '<div class="cf-pro-card__save">You save ' + money(saved) + '</div>';
      }

      addBtn.addEventListener('click', function () {
        errorLine.textContent = '';
        if (variantSelect && (!currentVariant || !currentVariant.available)) {
          errorLine.textContent = currentVariant && !currentVariant.available ? 'Out of stock' : 'Select a variant first';
          return;
        }
        var vid = currentVariant.id || item.variant_id;
        if (!vid) { errorLine.textContent = 'Missing variant'; return; }
        var qty = parseInt(qtyI.value, 10) || 1;
        addOne(vid, qty, addBtn);
      });

      if (!currentVariant.available) { addBtn.disabled = true; errorLine.textContent = 'Out of stock'; }

      return {
        root: root,
        bdrItem: bdrItem,
        setPriceLoading: setPriceLoading,
        applyMemberPrice: applyMemberPrice,
        getVariantId: function () { return currentVariant.id || item.variant_id; },
        getQty: function () { return parseInt(qtyI.value, 10) || 1; },
        getVariantAvailable: function () { return !!currentVariant.available; },
        hasVariantSelector: function () { return !!variantSelect; },
        isVariantSelected: function () { return !variantSelect || !!currentVariant.id; },
        markError: function (msg) { errorLine.textContent = msg || ''; },
        setButtonState: function (disabled) { addBtn.disabled = disabled || !currentVariant.available; },
      };
    }

    // Pick the default variant for a Pro card: prefer the SKU-matched variant,
    // else first available from all_variants, else first.
    function pickCurrentVariant(item) {
      if (item.variant_id && Array.isArray(item.all_variants) && item.all_variants.length) {
        var match = item.all_variants.find(function (v) { return String(v.id) === String(item.variant_id); });
        if (match) return Object.assign({}, match);
      }
      if (Array.isArray(item.all_variants) && item.all_variants.length) {
        var avail = item.all_variants.find(function (v) { return v.available; });
        return Object.assign({}, avail || item.all_variants[0]);
      }
      return {
        id: item.variant_id,
        price: item.price,
        compare_at_price: item.compare_at_price,
        available: item.available,
        image: item.image,
      };
    }

    // ----- Cart operations -----
    function addOne(variantId, qty, button) {
      state.proAddInFlight++;
      if (button) { button.disabled = true; button.textContent = 'Adding…'; }
      var origText = 'Add to cart';
      return fetch('/cart/add.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variantId, quantity: qty }] })
      }).then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.data && res.data.description || 'Add failed');
          if (button) { button.textContent = '✓ Added'; setTimeout(function () { button.textContent = origText; button.disabled = false; }, 1800); }
          return fetch('/cart.js').then(function (r) { return r.json(); });
        })
        .then(function (cart) {
          document.querySelectorAll('.cart-count-bubble span').forEach(function (el2) { el2.textContent = cart.item_count; });
          if (typeof window.cfShowCartToast === 'function') {
            window.cfShowCartToast({ title: 'Added to cart' }, qty);
          }
        })
        .catch(function (err) {
          if (button) { button.textContent = 'Error — Try again'; button.disabled = false; setTimeout(function () { button.textContent = origText; }, 2000); }
          console.warn('addOne failed', err);
        })
        .then(function () { state.proAddInFlight = Math.max(0, state.proAddInFlight - 1); });
    }

    function addAll(cards, bulkBtn) {
      if (state.proAddInFlight > 0) return;
      // Validate all cards first.
      var blockers = 0;
      var items = [];
      cards.forEach(function (c) {
        if (!c.getVariantAvailable()) { c.markError('Out of stock'); blockers++; return; }
        if (c.hasVariantSelector() && !c.isVariantSelected()) { c.markError('Select a variant'); blockers++; return; }
        var vid = c.getVariantId();
        if (!vid) { c.markError('Missing variant'); blockers++; return; }
        items.push({ id: vid, quantity: c.getQty() });
        c.markError('');
      });
      if (blockers || !items.length) return;

      state.proAddInFlight++;
      if (bulkBtn) { bulkBtn.disabled = true; bulkBtn.textContent = 'Adding all…'; }
      cards.forEach(function (c) { c.setButtonState(true); });

      fetch('/cart/add.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      }).then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.data && res.data.description || 'Bulk add failed');
          return fetch('/cart.js').then(function (r) { return r.json(); });
        })
        .then(function (cart) {
          document.querySelectorAll('.cart-count-bubble span').forEach(function (el2) { el2.textContent = cart.item_count; });
          if (typeof window.cfShowCartToast === 'function') {
            window.cfShowCartToast({ title: items.length + ' items added' }, 0);
          }
          if (bulkBtn) { bulkBtn.textContent = '✓ All added'; setTimeout(function () { bulkBtn.textContent = 'Add all to cart'; bulkBtn.disabled = false; }, 2200); }
        })
        .catch(function (err) {
          if (bulkBtn) { bulkBtn.textContent = 'Error — Try again'; bulkBtn.disabled = false; setTimeout(function () { bulkBtn.textContent = 'Add all to cart'; }, 2000); }
          console.warn('addAll failed', err);
        })
        .then(function () {
          state.proAddInFlight = Math.max(0, state.proAddInFlight - 1);
          cards.forEach(function (c) { c.setButtonState(false); });
        });
    }

    // ----- Lead + legacy booking forms (Discovery) -----
    function showLeadForm() {
      if (state.leadPrompted) return;
      state.leadPrompted = true;
      var wrap = el('div', { class: 'cf-lead' });
      wrap.innerHTML = '<div class="cf-lead__title">Want personalized recommendations?</div><div class="cf-lead__sub">Share your info and a specialist will follow up.</div>';
      var nameI = el('input', { type: 'text', placeholder: 'Name', autocomplete: 'name' });
      var emailI = el('input', { type: 'email', placeholder: 'Email (required)', autocomplete: 'email', required: 'required' });
      var phoneI = el('input', { type: 'tel', placeholder: 'Phone (optional)', autocomplete: 'tel' });
      var skip = el('button', { class: 'cf-lead__skip', type: 'button', onclick: function () { wrap.remove(); } }, ['Skip']);
      var submit = el('button', { class: 'cf-lead__submit', type: 'button' }, ['Submit']);
      submit.addEventListener('click', function () {
        if (!emailI.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value)) { emailI.focus(); return; }
        submit.disabled = true; submit.textContent = 'Saving…';
        fetch(API + '/leads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: state.sessionId, name: nameI.value, email: emailI.value, phone: phoneI.value, source: 'chatbot' })
        }).then(function (r) { return r.json(); }).then(function () {
          wrap.remove();
          addMsg('assistant', '<p>Thanks! A specialist will reach out shortly. Meanwhile, what else can I help you with?</p>');
        }).catch(function () { submit.disabled = false; submit.textContent = 'Submit'; });
      });
      wrap.appendChild(nameI); wrap.appendChild(emailI); wrap.appendChild(phoneI);
      wrap.appendChild(el('div', { class: 'cf-lead__actions' }, [skip, submit]));
      body.appendChild(wrap); body.scrollTop = body.scrollHeight;
    }

    function showBookingForm() {
      // Legacy Discovery-mode "Book a Call" quick button.
      var wrap = el('div', { class: 'cf-lead cf-lead--booking' });
      wrap.innerHTML = '<div class="cf-lead__title">📅 Schedule a Call</div><div class="cf-lead__sub">Pick a slot and a specialist will call you.</div>';
      body.appendChild(wrap); body.scrollTop = body.scrollHeight;
      renderBookingSlots(wrap);
    }

    // ----- Core send -----
    function send(text) {
      if (state.sending) return;
      text = (text || input.value || '').trim().slice(0, MAX_INPUT);
      if (!text) return;
      sendCore(text, null);
    }

    function sendWithHint(text, modeHint) {
      if (state.sending) return;
      text = (text || '').trim().slice(0, MAX_INPUT);
      if (!text) return;
      sendCore(text, modeHint);
    }

    function sendCore(text, modeHint) {
      input.value = ''; input.disabled = true; sendBtn.disabled = true; state.sending = true;
      addMsg('user', '<p>' + escapeHtml(text) + '</p>');
      var typing = addTyping();
      orbSetStateAll(document, 'thinking');

      var payload = {
        message: text,
        session_id: state.sessionId,
        user_id: window.CF_CHATBOT_CUSTOMER_ID || null,
        customer_tags: window.CF_CHATBOT_CUSTOMER_TAGS || null,
        logged_in: !!window.CF_CHATBOT_LOGGED_IN,
      };
      if (modeHint) payload.mode_hint = modeHint;

      fetch(API + '/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          typing.remove();
          orbSetStateAll(document, 'responding');
          if (!res.ok) {
            addMsg('assistant', '<p>' + escapeHtml(res.data.error || 'Something went wrong. Try again.') + '</p>');
            return;
          }
          if (res.data.session_id) {
            state.sessionId = res.data.session_id;
            localStorage.setItem(STORAGE_KEY, res.data.session_id);
          }
          state.messageCount = res.data.message_count || state.messageCount + 1;
          state.lastMode = res.data.mode || 'discovery';

          var wrap = addMsg('assistant', formatReply(res.data.reply));

          if (res.data.mode === 'pro') {
            renderProCards(wrap, res.data.ui || {});
          } else if (res.data.mode === 'consultation') {
            renderConsultationUI(wrap, res.data.ui || {});
          } else {
            addProducts(wrap, res.data.products);
            if (res.data.show_booking) setTimeout(showBookingForm, 400);
            else if (res.data.ask_for_lead) setTimeout(showLeadForm, 400);
          }
        })
        .catch(function () { typing.remove(); addMsg('assistant', '<p>Connection issue. Please try again.</p>'); })
        .then(function () {
          input.disabled = false; sendBtn.disabled = false; state.sending = false; input.focus();
          setTimeout(function () { orbSetStateAll(document, 'idle'); }, 2500);
        });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); send(); });

    function loadHistory() {
      if (!state.sessionId) { greet(); return; }
      fetch(API + '/sessions/' + state.sessionId + '/history')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.messages || !data.messages.length) { greet(); return; }
          data.messages.forEach(function (m) { addMsg(m.role === 'user' ? 'user' : 'assistant', formatReply(m.content)); });
          state.messageCount = data.messages.filter(function (m) { return m.role === 'user'; }).length;
        })
        .catch(greet);
    }

    function greet() {
      var premium = hasPremiumTag();
      var greetText = premium
        ? "<p>Hi! I'm the CF Kitchen Consultant. I can help you find equipment, plan a restaurant, or—since you're on a trade account—take bulk SKU orders right here. What are you looking for today?</p>"
        : "<p>Hi! I'm the CF Kitchen Consultant. I can help you find commercial kitchen equipment, plan your restaurant, or connect you with an expert.</p><p>What are you looking for today?</p>";
      addMsg('assistant', greetText);
    }

    return { loadHistory: loadHistory, focus: function () { input.focus(); } };
  }

  // ----- Floating launcher -----
  function initFloating() {
    if (window.CF_CHATBOT_DISABLE_WIDGET) return;

    var launcher = el('button', { class: 'cf-chatbot__launcher', type: 'button', 'aria-label': 'Open chat' });
    launcher.appendChild(buildOrb('sm'));
    launcher.appendChild(el('span', {}, ['Ask AI']));

    var panel = el('div', { class: 'cf-chatbot__panel', role: 'dialog', 'aria-label': 'CF Kitchen Consultant' });
    var header = el('div', { class: 'cf-chatbot__header' });
    var title = el('div', { class: 'cf-chatbot__title' });
    title.appendChild(buildOrb('md'));
    var titleText = el('div', {});
    titleText.innerHTML = '<div class="cf-chatbot__title-main">Kitchen Consultant</div><div class="cf-chatbot__title-sub">AI-powered • Usually replies instantly</div>';
    title.appendChild(titleText);
    header.appendChild(title);
    var close = el('button', { class: 'cf-chatbot__close', type: 'button', 'aria-label': 'Close' }, ['×']);
    header.appendChild(close);
    panel.appendChild(header);

    var mount = el('div', { style: 'flex:1;display:flex;flex-direction:column;min-height:0' });
    panel.appendChild(mount);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var chat = null;
    launcher.addEventListener('click', function () {
      panel.classList.add('is-open'); launcher.style.display = 'none';
      if (!chat) { chat = createChat(mount); chat.loadHistory(); }
      setTimeout(function () { chat.focus(); }, 50);
    });
    close.addEventListener('click', function () { panel.classList.remove('is-open'); launcher.style.display = ''; });
  }

  function initFullPage() {
    var mount = document.getElementById('cf-chatbot-fullpage');
    if (!mount) return;
    mount.classList.add('cf-chatbot--page');
    var chat = createChat(mount);
    chat.loadHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initFloating(); initFullPage(); });
  } else { initFloating(); initFullPage(); }
})();

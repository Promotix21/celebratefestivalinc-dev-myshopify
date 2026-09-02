/**
 * CF Wholesale Pricing via BDR API
 *
 * Replaces server-side WSH Liquid snippets (wcp_discount/wcp_variant) with a single
 * client-side API call to bdr.wholesalehelper.io. Works only for logged-in wholesale
 * customers; logged-out users see standard Shopify pricing with no JS involvement.
 *
 * Architecture:
 *   1. Fetch intercept in theme.liquid captures auth token from wpd.js API call
 *   2. This script collects product data from data-cf-* attributes in the DOM
 *   3. Calls BDR API in one batch for all visible products
 *   4. Updates UI: "Price" -> "Member Price" + Was + You Save
 *
 * Depends on globals set in theme.liquid:
 *   - window.wcp_customer          (customer object with email, id, tags)
 *   - window.wpdAPIRootUrl         ("https://bdr.wholesalehelper.io/")
 *   - window.shopPermanentDomain   (shop .myshopify.com domain)
 *   - window.cfMemberPriceBadge    ("Member Price" — always the same for all wholesale members)
 *   - window.WPDMoneyFormat        (Shopify money format string)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  MONEY FORMATTING                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Format cents into a money string using the store's money format.
   * Handles {{amount}}, {{amount_no_decimals}}, {{amount_with_comma_separator}}, etc.
   */
  function formatMoney(cents) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    cents = parseInt(cents, 10) || 0;
    var dollars = (cents / 100).toFixed(2);

    var format = window.WPDMoneyFormat || '${{amount}}';

    // Build different representations
    var amountNoDecimals = Math.round(cents / 100).toString();
    var parts = dollars.split('.');
    var amountWithComma = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
    var amountWithCommaSeparator = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
    var amountNoDecimalsWithComma = Math.round(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var amountNoDecimalsWithSpace = Math.round(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var amountWithApostrophe = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + parts[1];
    var amountWithSpace = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '.' + parts[1];

    return format
      .replace('{{amount_with_apostrophe_separator}}', amountWithApostrophe)
      .replace('{{amount_no_decimals_with_comma_separator}}', amountNoDecimalsWithComma)
      .replace('{{amount_no_decimals_with_space_separator}}', amountNoDecimalsWithSpace)
      .replace('{{amount_with_comma_separator}}', amountWithCommaSeparator)
      .replace('{{amount_with_space_separator}}', amountWithSpace)
      .replace('{{amount_no_decimals}}', amountNoDecimals)
      .replace('{{amount}}', amountWithComma);
  }

  /* ------------------------------------------------------------------ */
  /*  AUTH TOKEN                                                         */
  /* ------------------------------------------------------------------ */

  var AUTH_KEY = '__wpdBdrAuth';
  var TOKEN_POLL_INTERVAL = 400;  // ms
  var TOKEN_POLL_TIMEOUT  = 10000; // ms

  /**
   * Wait for the auth token that our fetch intercept stores in sessionStorage.
   * Returns a Promise<string|null>.
   */
  function waitForAuthToken() {
    return new Promise(function (resolve) {
      var existing = sessionStorage.getItem(AUTH_KEY);
      if (existing) {
        return resolve(existing);
      }
      var elapsed = 0;
      var timer = setInterval(function () {
        elapsed += TOKEN_POLL_INTERVAL;
        var token = sessionStorage.getItem(AUTH_KEY);
        if (token) {
          clearInterval(timer);
          return resolve(token);
        }
        if (elapsed >= TOKEN_POLL_TIMEOUT) {
          clearInterval(timer);
          console.warn('[cf-wholesale] Auth token not captured within timeout');
          return resolve(null);
        }
      }, TOKEN_POLL_INTERVAL);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  PRODUCT DATA COLLECTION                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Scan the DOM for elements with data-cf-variant-id and build the items
   * array the BDR API expects.
   */
  function collectProducts() {
    var elements = document.querySelectorAll('[data-cf-variant-id]');
    var items = [];
    var seen = {};

    elements.forEach(function (el) {
      var variantId = el.getAttribute('data-cf-variant-id');
      if (!variantId || seen[variantId]) return;
      seen[variantId] = true;

      items.push({
        variant_id: variantId,
        product_id: el.getAttribute('data-cf-product-id') || '',
        compare_at_price: el.getAttribute('data-cf-compare-at-price') || '',
        price: el.getAttribute('data-cf-price') || '',
        quantity: 1,
        send_vd_table: true,
        handle: el.getAttribute('data-cf-handle') || '',
        collection_ids: el.getAttribute('data-cf-collection-ids') || ''
      });
    });

    return items;
  }

  /**
   * Collect ALL variant data from the SPP JSON blob embedded in a <script> tag.
   * On SPP, we need pricing for every variant (not just the currently selected one).
   */
  function collectSppVariants() {
    var el = document.getElementById('cf-spp-variants-data');
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.warn('[cf-wholesale] Failed to parse SPP variants data', e);
      return null;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  BDR API CALL                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Call the BDR prices-retrieval endpoint.
   * @param {Array} items - Array of item objects
   * @param {string} authToken - Bearer token captured from wpd.js
   * @returns {Promise<Object>} - Response keyed by variant_id
   */
  function callApi(items, authToken) {
    if (!items || items.length === 0) return Promise.resolve({});

    var url = (window.wpdAPIRootUrl || 'https://bdr.wholesalehelper.io/') + 'cost-tree/prices-retrieval/';
    var customer = window.wcp_customer || {};

    var body = {
      admin_domain: window.shopPermanentDomain || '',
      customer_tags: customer.tags || [],
      items: items,
      market_currency: window.Shopify && window.Shopify.currency && window.Shopify.currency.active || 'USD',
      market_currency_exchange_rate: '1.0',
      market_country: 'US'
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify(body)
    })
    .then(function (res) {
      if (!res.ok) throw new Error('BDR API returned ' + res.status);
      return res.json();
    })
    .catch(function (err) {
      console.error('[cf-wholesale] API error:', err);
      return {};
    });
  }

  /* ------------------------------------------------------------------ */
  /*  UI UPDATE — COLLECTION / SEARCH CARDS                              */
  /* ------------------------------------------------------------------ */

  function updateCollectionCards(apiResponse) {
    if (!apiResponse || typeof apiResponse !== 'object') return;

    var badge = window.cfMemberPriceBadge || 'Member Price';

    Object.keys(apiResponse).forEach(function (variantId) {
      var data = apiResponse[variantId];
      if (!data) return;

      var wshPriceCents = parseWshPrice(data.wpd_v_price);
      var originalPriceCents = parseInt(data.original_price, 10) || 0;

      // Only upgrade if WSH price is a real discount
      if (!wshPriceCents || wshPriceCents >= originalPriceCents || wshPriceCents <= 0) return;

      var savingsCents = originalPriceCents - wshPriceCents;
      var html = '<div class="price-member-view price-single price-box cf-plp__price-box">' +
        '<div class="member-view-label price-label-single price-label cf-plp__price-label">' + escapeHtml(badge) + '</div>' +
        '<div class="member-view-price price-amount-single current-price cf-plp__price-main">' + formatMoney(wshPriceCents) + '</div>' +
        '<div class="member-view-regular cf-plp__price-original">Was: <s>' + formatMoney(originalPriceCents) + '</s></div>' +
        '<div class="member-view-savings cf-plp__sale-savings">You Save ' + formatMoney(savingsCents) + '</div>' +
      '</div>';

      // Use querySelectorAll to handle Swiper loop clones — the loop duplicates slides
      // in the DOM, querySelector would only find the first (possibly hidden) clone.
      var cards = document.querySelectorAll('[data-cf-variant-id="' + variantId + '"]');
      cards.forEach(function(card) {
        var priceContainer = card.querySelector('.price-single') ||
                             card.querySelector('.price-member-view') ||
                             card.querySelector('.cf-plp-ajax__price-box');
        if (!priceContainer) return;
        priceContainer.outerHTML = html;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  UI UPDATE — SINGLE PRODUCT PAGE                                    */
  /* ------------------------------------------------------------------ */

  /** The API-built map, replaces the Liquid-built variantWshMap. */
  var sppVariantWshMap = {};

  function updateSPP(apiResponse) {
    if (!apiResponse || typeof apiResponse !== 'object') return;

    // Build the variant WSH map from API response
    Object.keys(apiResponse).forEach(function (variantId) {
      var data = apiResponse[variantId];
      if (!data) return;

      var wshPriceCents = parseWshPrice(data.wpd_v_price);
      var originalPriceCents = parseInt(data.original_price, 10) || 0;

      sppVariantWshMap[variantId] = {
        hasWsh: (wshPriceCents > 0),
        hasDiscount: (wshPriceCents > 0 && wshPriceCents < originalPriceCents),
        wshPrice: wshPriceCents,
        variantPrice: originalPriceCents,
        compareAtPrice: parseInt(data.original_compare_at_price, 10) || 0
      };
    });

    // Expose the map globally so SPP's variant-switching JS can use it
    window.cfVariantWshMap = sppVariantWshMap;

    // Trigger an update for the current variant display
    var event = new CustomEvent('cf:wholesale-prices-ready', { detail: sppVariantWshMap });
    document.dispatchEvent(event);
  }

  /* ------------------------------------------------------------------ */
  /*  UI UPDATE — CART PAGE & CART DRAWER                                */
  /* ------------------------------------------------------------------ */

  function updateCart(apiResponse) {
    if (!apiResponse || typeof apiResponse !== 'object') return;

    var badge = window.cfMemberPriceBadge || 'Member Price';
    var wshSubtotalCents = 0;
    var hasAnyWsh = false;

    // Update each cart item
    var cartItems = document.querySelectorAll('[data-cf-cart-item]');
    cartItems.forEach(function (itemEl) {
      var variantId = itemEl.getAttribute('data-cf-variant-id');
      if (!variantId) return;

      var data = apiResponse[variantId];
      if (!data) return;

      var wshPriceCents = parseWshPrice(data.wpd_v_price);
      var originalPriceCents = parseInt(data.original_price, 10) || 0;
      var qty = parseInt(itemEl.getAttribute('data-cf-qty'), 10) || 1;

      if (!wshPriceCents || wshPriceCents >= originalPriceCents || wshPriceCents <= 0) {
        // No discount for this item — add original to subtotal
        wshSubtotalCents += originalPriceCents * qty;
        return;
      }

      hasAnyWsh = true;
      wshSubtotalCents += wshPriceCents * qty;

      // Show member badge only for items with a WSH discount
      var badge = itemEl.querySelector('.cf-member-badge');
      if (badge) badge.style.display = '';

      // Update unit price display
      var unitPriceEl = itemEl.querySelector('.cf-cart-unit-price');
      if (unitPriceEl) {
        unitPriceEl.innerHTML =
          '<span class="cf-cart-was">Was: <s>' + formatMoney(originalPriceCents) + '</s></span> ' +
          '<span class="cf-cart-member-price">' + formatMoney(wshPriceCents) + '</span>';
      }

      // Update line total display
      var lineTotalEl = itemEl.querySelector('.cf-cart-line-total');
      if (lineTotalEl) {
        var originalLineTotal = originalPriceCents * qty;
        var wshLineTotal = wshPriceCents * qty;
        lineTotalEl.innerHTML =
          '<span class="cf-cart-was"><s>' + formatMoney(originalLineTotal) + '</s></span> ' +
          '<span class="cf-cart-member-price">' + formatMoney(wshLineTotal) + '</span>';
      }
    });

    // Update subtotal and total — replace numbers cleanly with WSH prices
    if (hasAnyWsh) {
      var formatted = formatMoney(wshSubtotalCents);
      document.querySelectorAll('.cf-cart-subtotal-amount').forEach(function (el) {
        el.textContent = formatted;
      });
      document.querySelectorAll('.cf-cart-total-amount').forEach(function (el) {
        el.textContent = formatted;
      });
    }

    // Update window.wcp_data for checkout interception
    updateWcpDataForCheckout(apiResponse);
  }

  /**
   * Update window.wcp_data so that wpd.js checkout interceptor
   * uses the correct WSH prices for draft order creation.
   */
  function updateWcpDataForCheckout(apiResponse) {
    if (!window.wcp_data || !window.wcp_data.wcp_cart || !window.wcp_data.wcp_cart.items) return;

    var items = window.wcp_data.wcp_cart.items;
    var anyUpdated = false;

    items.forEach(function (item) {
      var vid = String(item.variant_id || item.id);
      var data = apiResponse[vid];
      if (!data) return;

      var wshPriceCents = parseWshPrice(data.wpd_v_price);
      if (wshPriceCents > 0) {
        item.wcp_v_price = wshPriceCents;
        anyUpdated = true;
      }
    });

    if (anyUpdated && window.wcp_data.discounted_hash !== undefined) {
      // Recalculate discounted_hash so wpd.js knows prices changed
      window.wcp_data.discounted_hash = Date.now().toString(36);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  HELPERS                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Parse the wpd_v_price from BDR response.
   * Can be a float (238286.994) representing cents, or a string.
   */
  function parseWshPrice(val) {
    if (val === undefined || val === null) return 0;
    var num = parseFloat(val);
    if (isNaN(num) || num <= 0) return 0;
    // BDR returns prices in currency minor units (cents) as a float
    return Math.round(num);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ------------------------------------------------------------------ */
  /*  PAGE TYPE DETECTION                                                */
  /* ------------------------------------------------------------------ */

  function detectPageType() {
    var path = window.location.pathname;
    if (path.indexOf('/products/') === 0) return 'product';
    if (path.indexOf('/collections/') === 0) return 'collection';
    if (path.indexOf('/search') === 0) return 'search';
    if (path === '/cart') return 'cart';
    // Homepage or other pages with product cards
    if (document.querySelector('[data-cf-variant-id]')) return 'collection';
    return 'none';
  }

  /* ------------------------------------------------------------------ */
  /*  INIT                                                               */
  /* ------------------------------------------------------------------ */

  function init() {
    // Only run for logged-in customers
    if (!window.wcp_customer) return;

    var pageType = detectPageType();
    if (pageType === 'none') return;

    // Collect product data from the DOM
    var items = collectProducts();

    // For SPP, also collect all variant data from the embedded JSON
    var sppVariants = null;
    if (pageType === 'product') {
      sppVariants = collectSppVariants();
      if (sppVariants && sppVariants.length > 0) {
        // Merge SPP variants into items (avoid duplicates)
        var seenIds = {};
        items.forEach(function (item) { seenIds[item.variant_id] = true; });
        sppVariants.forEach(function (v) {
          if (!seenIds[v.variant_id]) {
            items.push(v);
            seenIds[v.variant_id] = true;
          }
        });
      }
    }

    if (items.length === 0) return;

    // Wait for auth token, then call API
    waitForAuthToken().then(function (authToken) {
      if (!authToken) {
        console.warn('[cf-wholesale] No auth token available, skipping API call');
        return;
      }

      callApi(items, authToken).then(function (response) {
        if (!response || Object.keys(response).length === 0) return;

        console.log('[cf-wholesale] BDR API returned pricing for', Object.keys(response).length, 'variants');

        switch (pageType) {
          case 'product':
            updateSPP(response);
            break;
          case 'cart':
            updateCart(response);
            break;
          case 'collection':
          case 'search':
            updateCollectionCards(response);
            break;
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  BOOT                                                               */
  /* ------------------------------------------------------------------ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ================================================================== */
/*  VARIANT DESCRIPTION — Self-Renderer                               */
/*  Reads StarApps config JSON tag and renders description directly   */
/* ================================================================== */
(function() {
  function initVariantDesc() {
    var target = document.getElementById('variant-description-target');
    if (!target) return;

    var rendered = false;

    function getSelectedVariantId() {
      var url = new URLSearchParams(window.location.search);
      return url.get('variant') || (window.__cfSPPVariants && window.__cfSPPVariants[0] && String(window.__cfSPPVariants[0].id)) || null;
    }

    function renderForVariant(variantId) {
      var configScript = target.querySelector('script[data-variant-description-app="data"]');
      if (!configScript) return false;

      var config;
      try { config = JSON.parse(configScript.textContent); } catch(e) { return false; }

      var variants = config.variants;
      if (!variants || typeof variants !== 'object') return false;

      var id = variantId ? String(variantId) : String(config.selectedVariantId);
      var html = variants[id] || '';

      // Hide the raw JSON script tag
      configScript.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;font-size:0!important';

      // Remove old rendered block
      var old = target.querySelector('.vd-content');
      if (old) old.parentNode.removeChild(old);

      if (!html || html.replace(/<[^>]*>/g, '').trim() === '') {
        target.style.display = 'none';
        return true;
      }

      target.style.display = '';
      var div = document.createElement('div');
      div.className = 'vd-content';
      div.innerHTML = html;
      target.appendChild(div);
      return true;
    }

    // Poll until app injects the config script tag
    var attempts = 0;
    var interval = setInterval(function() {
      if (target.querySelector('script[data-variant-description-app="data"]')) {
        renderForVariant(getSelectedVariantId());
        clearInterval(interval);
      }
      if (++attempts >= 100) clearInterval(interval);
    }, 150);

    // Watch for variant changes
    document.addEventListener('variant:changed', function(e) {
      if (e.detail && e.detail.variant) {
        setTimeout(function() { renderForVariant(e.detail.variant.id); }, 100);
      }
    });

    // Also watch for history changes (variant param in URL)
    var lastVariant = getSelectedVariantId();
    window.addEventListener('popstate', function() {
      var v = getSelectedVariantId();
      if (v !== lastVariant) { lastVariant = v; renderForVariant(v); }
    });

    // MutationObserver backup
    var obs = new MutationObserver(function() {
      if (!rendered && target.querySelector('script[data-variant-description-app="data"]')) {
        rendered = renderForVariant(getSelectedVariantId());
      }
    });
    obs.observe(target, { childList: true, subtree: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVariantDesc);
  } else {
    initVariantDesc();
  }
})();

/* COMPACT SPP fixes moved to variant-description-cleanup.js (always loaded) */
/* ================================================================== */
/*  PLACEHOLDER - kept for file continuity                            */
/* ================================================================== */
(function() {
  function initCompactFixes() {
    var stickyBtn = document.getElementById('compact-sticky-add-btn');
    var mainAtcBtn = document.querySelector('#compact-sticky-bar') && document.querySelector('.compact-product .compact-atc-btn');

    /* ── 1. Sync sticky bar disabled state with main ATC button ── */
    if (stickyBtn && mainAtcBtn) {
      function syncStickyState() {
        stickyBtn.disabled = mainAtcBtn.disabled;

        if (mainAtcBtn.disabled) {
          stickyBtn.textContent = mainAtcBtn.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
          stickyBtn.style.opacity = '0.5';
          stickyBtn.style.cursor = 'not-allowed';
        } else {
          // Reset to default text if main button is enabled
          var currentText = stickyBtn.textContent.toLowerCase();
          if (currentText.includes('sold') || currentText.includes('contact') || currentText.includes('notify')) {
            stickyBtn.textContent = 'Add to Cart';
          }
          stickyBtn.style.opacity = '';
          stickyBtn.style.cursor = '';
        }
      }

      // Sync immediately
      syncStickyState();

      // Watch main button for changes
      var obs = new MutationObserver(syncStickyState);
      obs.observe(mainAtcBtn, { attributes: true, childList: true, characterData: true, subtree: true });
    }

    /* ── 2. Intercept main ATC form to use AJAX + show toast ── */
    var form = document.querySelector('.compact-product form.compact-cart-row');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      var btn = form.querySelector('.compact-atc-btn');
      // If button is disabled (Sold Out / Contact Us), let native behaviour handle or do nothing
      if (btn && btn.disabled) { e.preventDefault(); return; }

      e.preventDefault();

      var vidInput = form.querySelector('input[name="id"]');
      var qtyInput = form.querySelector('input[name="quantity"]');
      if (!vidInput) return;

      var vid = parseInt(vidInput.value);
      var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

      if (btn) { btn.disabled = true; }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vid, quantity: qty })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status && data.status !== 200) throw new Error(data.description || 'Error');

        // Update cart count
        fetch('/cart.js').then(function(r) { return r.json(); }).then(function(cart) {
          document.querySelectorAll('.cart-count-bubble span, [data-cart-count]').forEach(function(el) {
            el.textContent = cart.item_count;
          });
        });

        // Show notification toast
        if (typeof window.cfShowCartToast === 'function') window.cfShowCartToast(data, qty);

        // Brief feedback on button
        if (btn) {
          var origHtml = btn.innerHTML;
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!';
          btn.style.background = '#10b981';
          setTimeout(function() { btn.innerHTML = origHtml; btn.style.background = ''; btn.disabled = false; }, 2000);
        }
      })
      .catch(function(err) {
        if (btn) {
          btn.innerHTML = 'Error — Try Again';
          setTimeout(function() {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Add to Cart';
            btn.disabled = false;
          }, 2000);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompactFixes);
  } else {
    initCompactFixes();
  }

  // ----- Public helper for chat-driven batches (Pro Mode) -----
  // Concurrent callers share one waitForAuthToken promise; each still gets its
  // own callApi invocation (BDR is stateless, responses are keyed by variant).
  var __sharedTokenPromise = null;
  function sharedTokenPromise() {
    if (!__sharedTokenPromise) {
      __sharedTokenPromise = waitForAuthToken().then(function (tok) {
        // Reset after short TTL so a page with a slow token capture can retry.
        setTimeout(function () { __sharedTokenPromise = null; }, 60000);
        return tok;
      });
    }
    return __sharedTokenPromise;
  }

  window.cfFetchWholesalePrices = function (items) {
    if (!Array.isArray(items) || !items.length) return Promise.resolve({});
    return sharedTokenPromise().then(function (tok) {
      if (!tok) return {};
      return callApi(items, tok);
    }).catch(function (err) {
      console.warn('[cf-wholesale] cfFetchWholesalePrices failed', err);
      return {};
    });
  };
})();

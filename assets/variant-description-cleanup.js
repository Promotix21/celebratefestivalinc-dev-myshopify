/**
 * Variant Description — Self-Rendering
 *
 * The StarApps Variant Description app injects a <script type="application/json">
 * config tag into #variant-description-target. This script reads that config,
 * parses the variant descriptions, and renders the correct one — bypassing the
 * app's own rendering JS which is unreliable.
 */
(function() {
  var target = document.getElementById('variant-description-target');
  if (!target) return;

  var rendered = false;

  function render() {
    if (rendered) return;

    var configScript = target.querySelector('script[data-variant-description-app="data"]');
    if (!configScript) return;

    var config;
    try { config = JSON.parse(configScript.textContent); } catch(e) { return; }

    var variants = config.variants;
    if (!variants || typeof variants !== 'object') return;

    // Get the currently selected variant id from Shopify
    var selectedId = (window.Shopify && window.Shopify.selectedVariantId)
      ? String(window.Shopify.selectedVariantId)
      : String(config.selectedVariantId);

    var html = variants[selectedId] || '';

    // Hide the JSON script tag
    configScript.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;font-size:0!important';

    // Remove any existing rendered output
    var existing = target.querySelector('.vd-content');
    if (existing) existing.parentNode.removeChild(existing);

    if (!html || html.trim() === '' || html === '<p></p>') {
      target.style.display = 'none';
      return;
    }

    // Render content
    target.style.display = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'vd-content';
    wrapper.innerHTML = html;
    target.appendChild(wrapper);

    rendered = true;
  }

  // Re-render when variant changes
  function onVariantChange(newId) {
    rendered = false;
    var configScript = target.querySelector('script[data-variant-description-app="data"]');
    if (!configScript) return;

    var config;
    try { config = JSON.parse(configScript.textContent); } catch(e) { return; }

    var variants = config.variants;
    var html = variants[String(newId)] || '';

    var existing = target.querySelector('.vd-content');
    if (existing) existing.parentNode.removeChild(existing);

    if (!html || html.trim() === '' || html === '<p></p>') {
      target.style.display = 'none';
      return;
    }

    target.style.display = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'vd-content';
    wrapper.innerHTML = html;
    target.appendChild(wrapper);
    rendered = true;
  }

  // Listen for Shopify variant changes
  document.addEventListener('variant:changed', function(e) {
    if (e.detail && e.detail.variant) onVariantChange(e.detail.variant.id);
  });

  // Also watch for URL changes (variant param)
  var lastVariant = new URLSearchParams(window.location.search).get('variant');
  window.addEventListener('popstate', function() {
    var v = new URLSearchParams(window.location.search).get('variant');
    if (v && v !== lastVariant) { lastVariant = v; onVariantChange(v); }
  });

  // Poll until the app injects the config script tag
  var attempts = 0;
  var interval = setInterval(function() {
    if (target.querySelector('script[data-variant-description-app="data"]')) {
      render();
      clearInterval(interval);
    }
    if (++attempts >= 60) clearInterval(interval); // give up after 12s
  }, 200);

  // MutationObserver as backup
  var observer = new MutationObserver(function() { render(); });
  observer.observe(target, { childList: true });
})();

/* ================================================================== */
/*  COMPACT SPP — SOLD-OUT STICKY SYNC + MAIN FORM AJAX               */
/*  Loads for ALL users (not just logged-in) — placed outside         */
/*  the {% if customer %} guard in theme.liquid                       */
/* ================================================================== */
(function() {
  function initCompactFixes() {
    var stickyBtn = document.getElementById('compact-sticky-add-btn');
    var mainAtcBtn = document.querySelector('.compact-product .compact-atc-btn');
    if (!stickyBtn || !mainAtcBtn) return;

    /* ── 1. Sync sticky bar disabled/text with main ATC button ── */
    function syncStickyState() {
      stickyBtn.disabled = mainAtcBtn.disabled;

      if (mainAtcBtn.disabled) {
        stickyBtn.textContent = mainAtcBtn.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
        stickyBtn.style.opacity  = '0.5';
        stickyBtn.style.cursor   = 'not-allowed';
      } else {
        // Reset to default text if main button is enabled
        var currentText = stickyBtn.textContent.toLowerCase();
        if (currentText.includes('sold') || currentText.includes('contact') || currentText.includes('notify')) {
          stickyBtn.textContent = 'Add to Cart';
        }
        stickyBtn.style.opacity = '';
        stickyBtn.style.cursor  = '';
      }
    }

    syncStickyState(); // run once on load

    // Watch main button for attribute/text changes (variant switches)
    new MutationObserver(syncStickyState).observe(mainAtcBtn, {
      attributes: true, childList: true, characterData: true, subtree: true
    });

    /* ── 2. Intercept main price-box form → AJAX + toast ── */
    var form = document.querySelector('.compact-product form.compact-cart-row');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      // Let disabled button do nothing
      if (mainAtcBtn && mainAtcBtn.disabled) { e.preventDefault(); return; }
      e.preventDefault();

      var vidInput = form.querySelector('input[name="id"]');
      var qtyInput = form.querySelector('input[name="quantity"]');
      if (!vidInput) return;

      var vid = parseInt(vidInput.value);
      var qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
      var btn = mainAtcBtn;

      if (btn) { btn.disabled = true; }

      fetch('/cart/add.js', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: vid, quantity: qty })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status && data.status !== 200) throw new Error(data.description || 'Add to cart failed');

        // Refresh cart count badge
        fetch('/cart.js').then(function(r) { return r.json(); }).then(function(cart) {
          document.querySelectorAll('.cart-count-bubble span, [data-cart-count]').forEach(function(el) {
            el.textContent = cart.item_count;
          });
        });

        // Show top-right notification toast
        if (typeof window.cfShowCartToast === 'function') window.cfShowCartToast(data, qty);

        // Brief "Added!" feedback on the button
        if (btn) {
          var origHtml = btn.innerHTML;
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Added!';
          btn.style.background = '#10b981';
          setTimeout(function() { btn.innerHTML = origHtml; btn.style.background = ''; btn.disabled = false; }, 2000);
        }
      })
      .catch(function() {
        if (btn) {
          var origHtml = btn.innerHTML;
          btn.innerHTML = 'Error — Try Again';
          setTimeout(function() { btn.innerHTML = origHtml; btn.disabled = false; }, 2500);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompactFixes);
  } else {
    initCompactFixes();
  }
})();

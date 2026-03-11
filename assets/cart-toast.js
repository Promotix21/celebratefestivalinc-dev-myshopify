/**
 * Cart Toast Notification - Celebrate Festival
 * Simple WebstaurantStore-style toast
 */

(function() {
  'use strict';

  let toastElement = null;
  let autoHideTimer = null;
  const AUTO_HIDE_DURATION = 5000;

  /**
   * Initialize toast
   */
  function initToast() {
    if (!document.getElementById('cf-cart-toast')) {
      const toast = document.createElement('div');
      toast.id = 'cf-cart-toast';
      toast.className = 'cf-toast';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <div class="cf-toast__card">
          <div class="cf-toast__header">
            <h4 class="cf-toast__title">1 item added to your cart</h4>
            <button type="button" class="cf-toast__close" aria-label="Close">&times;</button>
          </div>
          <div class="cf-toast__body">
            <div class="cf-toast__image">
              <img src="" alt="" id="cf-toast-image">
            </div>
            <div class="cf-toast__info">
              <p class="cf-toast__product-title" id="cf-toast-title"></p>
            </div>
          </div>
          <div class="cf-toast__footer">
            <button type="button" class="cf-toast__btn cf-toast__btn--cart" onclick="cfViewCartFromToast()">View Cart</button>
            <a href="/checkout" class="cf-toast__btn cf-toast__btn--checkout">Checkout</a>
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      toastElement = toast;

      // Close button
      toast.querySelector('.cf-toast__close').addEventListener('click', hideToast);

      // Pause on hover
      toast.addEventListener('mouseenter', () => {
        if (autoHideTimer) clearTimeout(autoHideTimer);
      });
      toast.addEventListener('mouseleave', () => {
        autoHideTimer = setTimeout(hideToast, 2000);
      });
    } else {
      toastElement = document.getElementById('cf-cart-toast');
    }
  }

  /**
   * Show toast
   */
  function showToast(product, quantity = 1) {
    if (!toastElement) initToast();

    if (autoHideTimer) clearTimeout(autoHideTimer);

    // Update content
    const titleEl = document.getElementById('cf-toast-title');
    const imageEl = document.getElementById('cf-toast-image');
    const headerEl = toastElement.querySelector('.cf-toast__title');

    const title = product.product_title || product.title || 'Product';
    const image = product.featured_image?.url || product.image || product.featured_image || '';

    if (titleEl) titleEl.textContent = title;
    if (imageEl) {
      imageEl.src = image;
      imageEl.alt = title;
    }
    if (headerEl) {
      headerEl.textContent = quantity > 1 ? `${quantity} items added to your cart` : '1 item added to your cart';
    }

    // Show
    toastElement.classList.add('active');

    // Auto hide
    autoHideTimer = setTimeout(hideToast, AUTO_HIDE_DURATION);
  }

  /**
   * Hide toast
   */
  function hideToast() {
    if (toastElement) {
      toastElement.classList.remove('active');
    }
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  }

  /**
   * Intercept cart behaviors
   */
  function interceptCartDrawer() {
    // Create cart-notification element for product-form.js
    if (!document.querySelector('cart-notification') && !document.querySelector('cart-drawer')) {
      if (!customElements.get('cart-notification')) {
        customElements.define('cart-notification', class extends HTMLElement {
          getSectionsToRender() {
            return [{ id: 'cart-icon-bubble' }];
          }
          setActiveElement() {}
          renderContents(parsedState) {
            // Update cart icon
            if (parsedState.sections?.['cart-icon-bubble']) {
              const bubble = document.getElementById('cart-icon-bubble');
              if (bubble) {
                const doc = new DOMParser().parseFromString(parsedState.sections['cart-icon-bubble'], 'text/html');
                const newContent = doc.querySelector('.shopify-section');
                if (newContent) bubble.innerHTML = newContent.innerHTML;
              }
            }

            // Show toast
            const product = parsedState.items?.[0] || parsedState;
            showToast(product, product.quantity || 1);

            // Update cart count
            if (typeof window.updateCartCount === 'function') {
              window.updateCartCount();
            }
          }
        });

        const cartNotification = document.createElement('cart-notification');
        cartNotification.style.display = 'none';
        document.body.appendChild(cartNotification);
      }
    }

    // Intercept native cart-drawer if exists
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer?.renderContents) {
      const original = cartDrawer.renderContents.bind(cartDrawer);
      cartDrawer.renderContents = function(parsedState) {
        const product = parsedState.items?.[0] || parsedState;
        showToast(product, product.quantity || 1);
        if (typeof window.updateCartCount === 'function') {
          window.updateCartCount();
        }
      };
    }
  }

  // Initialize
  function init() {
    initToast();
    interceptCartDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Handle View Cart button from toast - navigates to cart page
   * Bug Fix #2: Changed to always navigate to /cart instead of opening drawer
   */
  function viewCartFromToast() {
    hideToast();
    // Always navigate to cart page (Bug Fix #2)
    window.location.href = '/cart';
  }

  // Global functions
  window.cfShowCartToast = showToast;
  window.cfHideCartToast = hideToast;
  window.cfViewCartFromToast = viewCartFromToast;

})();

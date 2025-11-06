/**
 * Cart Integration Script
 * Connects header cart button to quick cart drawer
 * Handles add to cart from collection page
 */

(function() {
  'use strict';

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
  } else {
    initializeCart();
  }

  function initializeCart() {
    // Bind header cart button
    bindCartButtons();
    
    // Initialize add to cart buttons
    initializeAddToCartButtons();
    
    // Update cart count on page load
    updateCartCount();
  }

  /**
   * Bind all cart buttons in header to open drawer
   */
  function bindCartButtons() {
    // Main cart button
    const cartButton = document.querySelector('.cart-link');
    if (cartButton) {
      cartButton.addEventListener('click', function(e) {
        e.preventDefault();
        openCartDrawer();
      });
    }

    // Any other cart links
    const cartLinks = document.querySelectorAll('a[href="/cart"], a[href*="/cart"]');
    cartLinks.forEach(link => {
      // Skip checkout links
      if (link.href.includes('/checkout')) return;
      
      link.addEventListener('click', function(e) {
        e.preventDefault();
        openCartDrawer();
      });
    });
  }

  /**
   * Initialize all add to cart buttons on the page
   */
  function initializeAddToCartButtons() {
    // Collection page add to cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-primary:not(.btn-checkout)');
    
    addToCartButtons.forEach(button => {
      // Only bind if it's not already bound and has cart icon
      if (button.innerHTML.includes('fa-shopping-cart') && !button.dataset.bound) {
        button.dataset.bound = 'true';
        
        button.addEventListener('click', function(e) {
          const productCard = this.closest('.product-card');
          const productUrl = productCard.querySelector('.product-title-link').href;
          
          // Check if it's a single variant product
          if (this.classList.contains('quick-add-btn')) {
            e.preventDefault();
            const variantId = this.dataset.variantId;
            addToCart(variantId, 1, this);
          } else if (!productUrl.includes('/products/')) {
            // It's a direct add to cart button
            e.preventDefault();
            // Extract variant ID from product card or button
            const variantId = this.dataset.variantId || productCard.dataset.variantId;
            if (variantId) {
              addToCart(variantId, 1, this);
            }
          }
          // Otherwise let it navigate to product page
        });
      }
    });

    // Quick add buttons specifically
    const quickAddButtons = document.querySelectorAll('.quick-add-btn');
    quickAddButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const variantId = this.dataset.variantId;
        const quantity = 1;
        addToCart(variantId, quantity, this);
      });
    });
  }

  /**
   * Add item to cart via AJAX
   */
  function addToCart(variantId, quantity, button) {
    // Show loading state
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    // Prepare form data
    const formData = {
      items: [{
        id: variantId,
        quantity: quantity
      }]
    };

    // Make AJAX request
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      return response.json();
    })
    .then(data => {
      // Success - show success state
      button.innerHTML = '<i class="fas fa-check"></i> Added!';
      button.style.background = 'var(--success-green)';
      
      // Update cart count
      updateCartCount();
      
      // Open cart drawer after a brief delay
      setTimeout(() => {
        openCartDrawer();
      }, 500);
      
      // Reset button after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
        button.disabled = false;
      }, 2000);
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      
      // Show error state
      button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      button.style.background = '#dc2626';
      
      // Reset button
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
        button.disabled = false;
      }, 2000);
      
      // Show error notification
      showNotification('Unable to add item to cart. Please try again.', 'error');
    });
  }

  /**
   * Update cart count in header
   */
  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Update all cart count elements
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(element => {
          if (cart.item_count > 0) {
            element.textContent = cart.item_count;
            element.style.display = 'flex';
          } else {
            element.style.display = 'none';
          }
        });

        // Update cart drawer count if open
        const drawerCount = document.getElementById('cartItemCount');
        if (drawerCount) {
          drawerCount.textContent = cart.item_count > 0 ? `(${cart.item_count})` : '';
        }

        // Trigger custom event for other scripts
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { cart: cart }
        }));
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }

  /**
   * Open cart drawer
   */
  function openCartDrawer() {
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) {
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Refresh cart contents
      refreshCartDrawer();
    }
  }

  /**
   * Close cart drawer
   */
  window.closeCartDrawer = function() {
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /**
   * Refresh cart drawer contents
   */
  function refreshCartDrawer() {
    fetch('/cart?view=drawer')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Update cart body
        const newBody = doc.querySelector('#cartDrawerBody');
        const currentBody = document.getElementById('cartDrawerBody');
        if (newBody && currentBody) {
          currentBody.innerHTML = newBody.innerHTML;
        }
        
        // Update cart footer
        const newFooter = doc.querySelector('.cart-drawer-footer');
        const currentFooter = document.querySelector('.cart-drawer-footer');
        if (newFooter && currentFooter) {
          currentFooter.innerHTML = newFooter.innerHTML;
        }
        
        // Re-bind events after refresh
        bindCartItemEvents();
        
        updateCartCount();
      })
      .catch(error => {
        console.error('Error refreshing cart:', error);
      });
  }

  /**
   * Bind events to cart items (quantity, remove, etc.)
   */
  function bindCartItemEvents() {
    // These functions are defined in quick-cart.liquid
    // This ensures they work after AJAX refresh
    
    // Quantity buttons
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(button => {
      if (!button.dataset.bound) {
        button.dataset.bound = 'true';
        button.addEventListener('click', function(e) {
          e.preventDefault();
        });
      }
    });

    // Remove buttons
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(button => {
      if (!button.dataset.bound) {
        button.dataset.bound = 'true';
      }
    });
  }

  /**
   * Show notification message
   */
  function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existing = document.querySelector('.cart-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification-${type}`;
    notification.innerHTML = `
      <div class="cart-notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#dc2626'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Handle "Continue Shopping" from empty cart
   */
  document.addEventListener('click', function(e) {
    if (e.target.closest('.cart-empty .btn')) {
      closeCartDrawer();
    }
  });

  /**
   * Close cart on overlay click
   */
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-drawer-overlay')) {
      closeCartDrawer();
    }
  });

  /**
   * Close cart on ESC key
   */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const cartDrawer = document.getElementById('cartDrawer');
      if (cartDrawer && cartDrawer.classList.contains('active')) {
        closeCartDrawer();
      }
    }
  });

  /**
   * Expose functions globally for use in Liquid templates
   */
  window.openCartDrawer = openCartDrawer;
  window.updateCartCount = updateCartCount;
  window.addToCart = addToCart;
  window.refreshCartDrawer = refreshCartDrawer;

})();

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .cart-notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 14px;
  }

  .cart-notification-content i {
    font-size: 18px;
  }
`;
document.head.appendChild(style);
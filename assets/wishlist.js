/**
 * Celebrate Festival - Wishlist System
 * LocalStorage-based wishlist functionality
 */

const CelebrateFestivalWishlist = {
  STORAGE_KEY: 'cf_wishlist',

  // Initialize wishlist
  init() {
    this.updateAllIcons();
    this.updateHeaderCounter();

    // Listen for storage changes (sync across tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.updateAllIcons();
        this.updateHeaderCounter();
      }
    });
  },

  // Get all wishlist items
  getWishlist() {
    try {
      const wishlist = localStorage.getItem(this.STORAGE_KEY);
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (e) {
      console.error('Error reading wishlist:', e);
      return [];
    }
  },

  // Save wishlist
  saveWishlist(wishlist) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wishlist));
      return true;
    } catch (e) {
      console.error('Error saving wishlist:', e);
      return false;
    }
  },

  // Check if product is in wishlist
  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.id === productId);
  },

  // Add product to wishlist
  addToWishlist(productId, productData = {}) {
    const wishlist = this.getWishlist();

    if (this.isInWishlist(productId)) {
      return false; // Already in wishlist
    }

    const item = {
      id: productId,
      title: productData.title || '',
      handle: productData.handle || '',
      image: productData.image || '',
      price: productData.price || 0,
      comparePrice: productData.comparePrice || 0,
      url: productData.url || `/products/${productData.handle}`,
      addedAt: new Date().toISOString()
    };

    wishlist.push(item);
    this.saveWishlist(wishlist);
    this.updateAllIcons();
    this.updateHeaderCounter();
    this.showNotification(`${item.title || 'Product'} added to wishlist!`, 'success');

    return true;
  },

  // Remove product from wishlist
  removeFromWishlist(productId) {
    let wishlist = this.getWishlist();
    const item = wishlist.find(item => item.id === productId);
    wishlist = wishlist.filter(item => item.id !== productId);

    this.saveWishlist(wishlist);
    this.updateAllIcons();
    this.updateHeaderCounter();
    this.showNotification(`${item?.title || 'Product'} removed from wishlist`, 'info');

    return true;
  },

  // Toggle product in wishlist
  toggleWishlist(productId, productData = {}) {
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
      return false;
    } else {
      this.addToWishlist(productId, productData);
      return true;
    }
  },

  // Clear entire wishlist
  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.updateAllIcons();
      this.updateHeaderCounter();
      this.showNotification('Wishlist cleared', 'info');

      // Reload wishlist page if we're on it
      if (window.location.pathname.includes('wishlist')) {
        window.location.reload();
      }
    }
  },

  // Update all wishlist icon states
  updateAllIcons() {
    const wishlist = this.getWishlist();

    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const productId = parseInt(btn.dataset.productId);
      const isInWishlist = this.isInWishlist(productId);

      if (isInWishlist) {
        btn.classList.add('active', 'in-wishlist');
        btn.setAttribute('aria-label', 'Remove from wishlist');
        btn.setAttribute('title', 'Remove from wishlist');
      } else {
        btn.classList.remove('active', 'in-wishlist');
        btn.setAttribute('aria-label', 'Add to wishlist');
        btn.setAttribute('title', 'Add to wishlist');
      }
    });
  },

  // Update header counter
  updateHeaderCounter() {
    const wishlist = this.getWishlist();
    const count = wishlist.length;

    const counters = document.querySelectorAll('[data-wishlist-count]');
    counters.forEach(counter => {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'flex' : 'none';
    });

    const links = document.querySelectorAll('[data-wishlist-link]');
    links.forEach(link => {
      link.setAttribute('data-count', count);
    });
  },

  // Show notification
  showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.cf-wishlist-notification');
    if (existing) {
      existing.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `cf-wishlist-notification cf-wishlist-notification--${type}`;
    notification.innerHTML = `
      <div class="cf-wishlist-notification-content">
        <span class="cf-wishlist-notification-icon">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span class="cf-wishlist-notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  // Get wishlist count
  getCount() {
    return this.getWishlist().length;
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CelebrateFestivalWishlist.init());
} else {
  CelebrateFestivalWishlist.init();
}

// Handle wishlist button clicks
document.addEventListener('click', (e) => {
  const wishlistBtn = e.target.closest('[data-wishlist-btn]');

  if (wishlistBtn) {
    e.preventDefault();
    e.stopPropagation();

    const productId = parseInt(wishlistBtn.dataset.productId);
    const productData = {
      title: wishlistBtn.dataset.productTitle,
      handle: wishlistBtn.dataset.productHandle,
      image: wishlistBtn.dataset.productImage,
      price: wishlistBtn.dataset.productPrice,
      comparePrice: wishlistBtn.dataset.productComparePrice,
      url: wishlistBtn.dataset.productUrl
    };

    CelebrateFestivalWishlist.toggleWishlist(productId, productData);
  }
});

// Handle "Save for Later" button clicks (in cart)
document.addEventListener('click', (e) => {
  const saveForLaterBtn = e.target.closest('[data-save-for-later]');

  if (saveForLaterBtn) {
    e.preventDefault();
    e.stopPropagation();

    const productId = parseInt(saveForLaterBtn.dataset.productId);
    const variantId = saveForLaterBtn.dataset.variantId;
    const productData = {
      title: saveForLaterBtn.dataset.productTitle,
      handle: saveForLaterBtn.dataset.productHandle,
      image: saveForLaterBtn.dataset.productImage,
      price: saveForLaterBtn.dataset.productPrice,
      comparePrice: saveForLaterBtn.dataset.productComparePrice,
      url: saveForLaterBtn.dataset.productUrl
    };

    // Add to wishlist
    const added = CelebrateFestivalWishlist.addToWishlist(productId, productData);

    // Remove from cart
    if (added || CelebrateFestivalWishlist.isInWishlist(productId)) {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 0
        })
      })
      .then(response => response.json())
      .then(cart => {
        // Update cart UI
        if (window.updateCartCount) {
          window.updateCartCount();
        } else {
          const countEls = document.querySelectorAll('.cart-count-bubble span, .cart-count, [data-cart-count]');
          countEls.forEach(el => el.textContent = cart.item_count);
        }

        // Refresh the page/section to update cart display
        if (typeof window.refreshCart === 'function') {
          window.refreshCart();
        } else {
          // Reload if no refresh function available
          window.location.reload();
        }

        CelebrateFestivalWishlist.showNotification(`${productData.title || 'Item'} saved for later!`, 'success');
      })
      .catch(err => {
        console.error('Error removing from cart:', err);
        CelebrateFestivalWishlist.showNotification('Error saving item. Please try again.', 'error');
      });
    } else {
      CelebrateFestivalWishlist.showNotification(`${productData.title || 'Item'} is already in your wishlist!`, 'info');
    }
  }
});

// Export to window for external access
window.CelebrateFestivalWishlist = CelebrateFestivalWishlist;

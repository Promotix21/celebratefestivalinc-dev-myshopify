/**
 * Custom Product Page JavaScript
 * Restaurant Equipment Store - Dawn Theme Customization
 */

class CustomProductPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupThumbnails();
    this.setupQuantityControls();
    this.setupTabs();
    this.setupStickyBar();
    this.setupAddToCart();
    this.setupWishlist();
    this.setupShare();
    this.setupImageZoom();
  }

  /**
   * Thumbnail Image Switching
   */
  setupThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        // Remove active class from all thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked thumbnail
        thumb.classList.add('active');
        
        // Update main image
        const thumbImg = thumb.querySelector('img');
        if (thumbImg) {
          const newSrc = thumbImg.src.replace(/_(compact|small|medium|grande|master)\./, '_large.');
          mainImage.src = newSrc;
          mainImage.alt = thumbImg.alt;
        }
      });
    });
  }

  /**
   * Quantity Controls
   */
  setupQuantityControls() {
    // Main product form quantity controls
    const qtyBtns = document.querySelectorAll('.qty-btn');
    
    qtyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = btn.parentElement.querySelector('.qty-input');
        if (!input) return;

        let value = parseInt(input.value) || 1;
        
        if (btn.name === 'plus') {
          value++;
        } else if (btn.name === 'minus' && value > 1) {
          value--;
        }
        
        input.value = value;
        
        // Sync with sticky bar if exists
        const stickyInput = document.querySelector('.sticky-qty-input');
        if (stickyInput) {
          stickyInput.value = value;
        }
      });
    });

    // Prevent manual input of invalid values
    const qtyInputs = document.querySelectorAll('.qty-input');
    qtyInputs.forEach(input => {
      input.addEventListener('change', () => {
        let value = parseInt(input.value) || 1;
        if (value < 1) value = 1;
        input.value = value;
      });
    });
  }

  /**
   * Tab Switching
   */
  setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabBtns.length === 0) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show corresponding content
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  /**
   * Sticky Bottom Bar
   */
  setupStickyBar() {
    const stickyBar = document.getElementById('stickyBottomBar');
    if (!stickyBar) return;

    let lastScroll = 0;
    const scrollThreshold = 800;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > scrollThreshold) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
      
      lastScroll = currentScroll;
    });

    // Sticky bar quantity controls
    const stickyQtyBtns = document.querySelectorAll('.sticky-qty-btn');
    const stickyQtyInput = document.querySelector('.sticky-qty-input');
    
    stickyQtyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!stickyQtyInput) return;
        
        let value = parseInt(stickyQtyInput.value) || 1;
        
        if (btn.getAttribute('data-action') === 'plus') {
          value++;
        } else if (btn.getAttribute('data-action') === 'minus' && value > 1) {
          value--;
        }
        
        stickyQtyInput.value = value;
        
        // Sync with main form
        const mainInput = document.querySelector('.qty-input');
        if (mainInput) {
          mainInput.value = value;
        }
      });
    });

    // Sticky bar add to cart
    const stickyAddToCart = document.querySelector('.sticky-add-to-cart');
    if (stickyAddToCart) {
      stickyAddToCart.addEventListener('click', () => {
        this.addToCart(stickyAddToCart);
      });
    }
  }

  /**
   * Add to Cart Functionality
   */
  setupAddToCart() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', (e) => {
      if (addToCartBtn.classList.contains('loading')) {
        e.preventDefault();
        return;
      }
    });
  }

  /**
   * Add to Cart AJAX Handler
   */
  async addToCart(button) {
    const form = document.querySelector('form[data-type="add-to-cart-form"]');
    if (!form) return;

    const formData = new FormData(form);
    const variantId = formData.get('id');
    const quantity = parseInt(formData.get('quantity')) || 1;

    if (!variantId) return;

    // Show loading state
    button.classList.add('loading');
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity
        })
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      const data = await response.json();

      // Show success state
      button.innerHTML = '<i class="fas fa-check"></i> Added!';
      
      // Update cart count if drawer exists
      this.updateCartCount();

      // Open cart drawer if available
      if (window.Shopify && window.Shopify.theme && window.Shopify.theme.cartDrawer) {
        window.Shopify.theme.cartDrawer.open();
      }

      // Reset button after delay
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('loading');
      }, 2000);

    } catch (error) {
      console.error('Add to cart error:', error);
      button.innerHTML = '<i class="fas fa-times"></i> Error';
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('loading');
      }, 2000);
    }
  }

  /**
   * Update Cart Count
   */
  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(el => {
        el.textContent = cart.item_count;
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }

  /**
   * Wishlist Functionality
   */
  setupWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (!wishlistBtn) return;

    wishlistBtn.addEventListener('click', () => {
      const productId = wishlistBtn.getAttribute('data-product-id');
      
      // Check if wishlist app is installed
      if (typeof SwymCallbacks !== 'undefined') {
        // Swym Wishlist integration
        this.addToSwymWishlist(productId);
      } else {
        // Fallback: Store in localStorage
        this.addToLocalWishlist(productId);
      }
      
      // Visual feedback
      const icon = wishlistBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fas');
        icon.classList.toggle('far');
      }
      
      const originalText = wishlistBtn.innerHTML;
      wishlistBtn.innerHTML = '<i class="fas fa-check"></i> Added to Wishlist';
      
      setTimeout(() => {
        wishlistBtn.innerHTML = originalText;
      }, 2000);
    });
  }

  /**
   * Add to Local Wishlist (Fallback)
   */
  addToLocalWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }

  /**
   * Share Functionality
   */
  setupShare() {
    const shareBtn = document.querySelector('.share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: document.querySelector('.product-title')?.textContent || '',
        url: window.location.href
      };

      // Check if native share is available
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error.name !== 'AbortError') {
            this.fallbackShare();
          }
        }
      } else {
        this.fallbackShare();
      }
    });
  }

  /**
   * Fallback Share (Copy to Clipboard)
   */
  fallbackShare() {
    const url = window.location.href;
    
    navigator.clipboard.writeText(url).then(() => {
      const shareBtn = document.querySelector('.share-btn');
      const originalHTML = shareBtn.innerHTML;
      
      shareBtn.innerHTML = '<i class="fas fa-check"></i> Link Copied!';
      
      setTimeout(() => {
        shareBtn.innerHTML = originalHTML;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Link: ' + url);
    });
  }

  /**
   * Image Zoom Functionality
   */
  setupImageZoom() {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage) return;

    mainImage.addEventListener('click', () => {
      this.openImageModal(mainImage.src, mainImage.alt);
    });
  }

  /**
   * Open Image Modal
   */
  openImageModal(src, alt) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-zoom-modal';
    modal.innerHTML = `
      <div class="image-zoom-overlay"></div>
      <div class="image-zoom-content">
        <button class="image-zoom-close" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        <img src="${src}" alt="${alt}">
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close handlers
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    modal.querySelector('.image-zoom-close').addEventListener('click', closeModal);
    modal.querySelector('.image-zoom-overlay').addEventListener('click', closeModal);
    
    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Fade in
    requestAnimationFrame(() => {
      modal.classList.add('visible');
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CustomProductPage();
  });
} else {
  new CustomProductPage();
}

// Product Recommendations Loading
document.addEventListener('DOMContentLoaded', () => {
  const productRecommendations = document.querySelector('.product-recommendations');
  if (productRecommendations && productRecommendations.dataset.url) {
    fetch(productRecommendations.dataset.url)
      .then(response => response.text())
      .then(text => {
        const html = new DOMParser().parseFromString(text, 'text/html');
        const recommendations = html.querySelector('.product-recommendations');
        
        if (recommendations && recommendations.innerHTML.trim().length) {
          productRecommendations.innerHTML = recommendations.innerHTML;
        }
      })
      .catch(error => {
        console.error('Error loading recommendations:', error);
      });
  }
});
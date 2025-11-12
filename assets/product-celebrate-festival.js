/**
 * Celebrate Festival Inc - Product Template Scripts
 * Version: 1.0
 *
 * Handles interactive features for the product template
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initThumbnailSwitcher();
    initQuantityInput();
    initProductForm();
    initCarouselNavigation();
  }

  /**
   * Thumbnail Image Switcher
   * Allows clicking on thumbnails to change the main product image
   */
  function initThumbnailSwitcher() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('#main-product-image');

    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', function() {
        // Remove active class from all thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));

        // Add active class to clicked thumbnail
        this.classList.add('active');

        // Get the image source from the thumbnail
        const thumbnailImg = this.querySelector('img');
        if (thumbnailImg) {
          // Replace the main image with a larger version
          const thumbnailSrc = thumbnailImg.src;
          // Convert thumbnail size to larger size (assuming Shopify image URLs)
          const largeSrc = thumbnailSrc.replace(/_(70|80|small|compact|medium)\./g, '_large.');
          mainImage.src = largeSrc;
        }
      });
    });

    // Add keyboard navigation support
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.setAttribute('tabindex', '0');
      thumbnail.setAttribute('role', 'button');
      thumbnail.setAttribute('aria-label', `View image ${index + 1}`);

      thumbnail.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /**
   * Quantity Input Validation
   * Ensures quantity is always a positive integer
   */
  function initQuantityInput() {
    const quantityInput = document.querySelector('#quantity-input');

    if (!quantityInput) return;

    quantityInput.addEventListener('change', function() {
      let value = parseInt(this.value);

      // Ensure value is at least 1
      if (isNaN(value) || value < 1) {
        this.value = 1;
      } else {
        this.value = value;
      }
    });

    // Prevent non-numeric input
    quantityInput.addEventListener('keypress', function(e) {
      // Allow: backspace, delete, tab, escape, enter
      if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true)) {
        return;
      }

      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    });
  }

  /**
   * Product Form Handler
   * Handles add to cart functionality
   */
  function initProductForm() {
    const form = document.querySelector('#product-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(form);
      const addButton = form.querySelector('.btn-add-cart');

      if (!addButton) return;

      // Disable button and show loading state
      addButton.disabled = true;
      const originalText = addButton.innerHTML;
      addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

      // Submit to Shopify cart
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Success - show confirmation
        addButton.innerHTML = '<i class="fas fa-check"></i> Added!';
        addButton.style.background = 'var(--success-green)';

        // Trigger Shopify cart drawer if available
        if (typeof Shopify !== 'undefined' && Shopify.theme && Shopify.theme.cart) {
          Shopify.theme.cart.refresh();
        }

        // Dispatch custom event for theme cart
        document.dispatchEvent(new CustomEvent('cart:updated'));

        // Reset button after 2 seconds
        setTimeout(() => {
          addButton.disabled = false;
          addButton.innerHTML = originalText;
          addButton.style.background = '';
        }, 2000);

        // Update cart count if element exists
        updateCartCount();
      })
      .catch(error => {
        console.error('Error adding to cart:', error);

        // Error state
        addButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
        addButton.style.background = 'var(--primary-coral)';

        // Reset button after 2 seconds
        setTimeout(() => {
          addButton.disabled = false;
          addButton.innerHTML = originalText;
          addButton.style.background = '';
        }, 2000);
      });
    });
  }

  /**
   * Update Cart Count
   * Updates cart count display in header
   */
  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Update cart count elements
        const cartCountElements = document.querySelectorAll('[data-cart-count]');
        cartCountElements.forEach(el => {
          el.textContent = cart.item_count;
        });

        // Show cart count badge if hidden
        const cartBadges = document.querySelectorAll('.cart-count-badge');
        cartBadges.forEach(badge => {
          if (cart.item_count > 0) {
            badge.style.display = 'block';
          }
        });
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }

  /**
   * Smooth Scroll for Product Carousels
   * Adds arrow navigation for product carousels (optional enhancement)
   */
  function initCarouselNavigation() {
    const carousels = document.querySelectorAll('.products-carousel');

    carousels.forEach(carousel => {
      // You can add prev/next buttons here if needed
      // This is a basic implementation
      let isDown = false;
      let startX;
      let scrollLeft;

      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });

      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
      });

      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });
    });
  }

  /**
   * Carousel Navigation with Auto-Slide
   * Adds manual navigation and auto-slide functionality to product carousels
   */
  function initCarouselNavigation() {
    const carouselWrappers = document.querySelectorAll('.carousel-wrapper');

    carouselWrappers.forEach((wrapper) => {
      const carousel = wrapper.querySelector('.products-carousel');
      const leftBtn = wrapper.querySelector('.carousel-nav-left');
      const rightBtn = wrapper.querySelector('.carousel-nav-right');

      if (!carousel || !leftBtn || !rightBtn) return;

      const scrollAmount = 450; // Scroll by ~2 cards (215px * 2 + gaps)
      let autoSlideInterval;

      // Manual Navigation - Left Button
      leftBtn.addEventListener('click', () => {
        carousel.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
        // Reset auto-slide when manually navigating
        resetAutoSlide();
      });

      // Manual Navigation - Right Button
      rightBtn.addEventListener('click', () => {
        carousel.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
        // Reset auto-slide when manually navigating
        resetAutoSlide();
      });

      // Auto-slide Function
      function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
          // Check if we've reached the end
          if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
            // Reset to beginning
            carousel.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          } else {
            // Scroll right
            carousel.scrollBy({
              left: scrollAmount,
              behavior: 'smooth'
            });
          }
        }, 3000); // Auto-slide every 3 seconds
      }

      // Stop and restart auto-slide
      function resetAutoSlide() {
        if (autoSlideInterval) {
          clearInterval(autoSlideInterval);
        }
        startAutoSlide();
      }

      // Pause auto-slide on hover
      carousel.addEventListener('mouseenter', () => {
        if (autoSlideInterval) {
          clearInterval(autoSlideInterval);
        }
      });

      // Resume auto-slide on mouse leave
      carousel.addEventListener('mouseleave', () => {
        startAutoSlide();
      });

      // Start auto-slide initially
      startAutoSlide();
    });
  }

})();

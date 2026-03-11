/**
 * WSH Bridge Script
 *
 * Reads wholesale prices from hidden bridge elements processed by wpd.js
 * and updates the custom pricing UI:
 * 1. Cards showing "Price" label (no server-side WSH) → converts to "Member Price"
 * 2. Cards already showing "Member Price" from server-side WSH → corrects the price
 *    if the client-side wpd.js returns a different (more accurate) amount.
 * 3. Cart drawer & cart page — corrects stale server-side WSH prices using
 *    bridge elements (.wpd-cart-bridge) or sessionStorage-cached prices.
 *
 * DOES NOT modify wpd.js or any visible pricing elements directly.
 */
(function() {
  'use strict';

  var memberPriceLabel = window.cfMemberPriceBadge || 'Member Price';

  function parsePriceText(text) {
    var cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned);
  }

  function formatMoney(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // --- WSH Price Cache (sessionStorage) ---
  // Caches bridge-discovered prices so cart pages can correct stale server-side WSH
  var CACHE_KEY = 'wpd_bridge_prices';

  function getCachedPrices() {
    try {
      var data = sessionStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function cachePrice(variantId, retailAmount, memberAmount) {
    if (!variantId) return;
    try {
      var cache = getCachedPrices();
      cache[variantId] = { r: retailAmount, m: memberAmount };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) { /* sessionStorage full or unavailable */ }
  }

  /**
   * Extract price unit text from existing DOM element (e.g. "/Each")
   */
  function getPriceUnit(container) {
    var unitEl = container && container.querySelector('.price-unit');
    if (unitEl) return unitEl.textContent.trim().replace(/^\//, '');
    return 'Each';
  }

  /**
   * Parse wpd.js bridge element to extract retail and member prices.
   * Returns null if no discount found.
   */
  function parseBridgePrices(bridge) {
    var compareAtEl = bridge.querySelector('.wpd-ext-compare-at-price');
    if (!compareAtEl) {
      // Fallback: wpd.js may replace innerHTML with just the member price text
      // (no <s> tag) when the product has no compare_at_price. Detect by comparing
      // the bridge text against the original variant price stored in data attribute.
      if (bridge.classList.contains('wpd-processed')) {
        var bridgeText = bridge.textContent.trim();
        var variantPriceAttr = bridge.getAttribute('data-wpd-variant-price');
        if (bridgeText && variantPriceAttr) {
          var memberAmount = parsePriceText(bridgeText);
          var retailAmount = parseInt(variantPriceAttr) / 100;
          if (!isNaN(memberAmount) && !isNaN(retailAmount) && memberAmount > 0 && memberAmount < retailAmount) {
            return {
              retailText: formatMoney(retailAmount),
              memberText: bridgeText,
              retailAmount: retailAmount,
              memberAmount: memberAmount,
              savingsAmount: retailAmount - memberAmount
            };
          }
        }
      }
      return null;
    }

    var retailPriceText = compareAtEl.textContent.trim();
    var clone = bridge.cloneNode(true);
    var sEl = clone.querySelector('.wpd-ext-compare-at-price');
    if (sEl) sEl.remove();
    var memberPriceText = clone.textContent.trim();

    if (!memberPriceText || !retailPriceText) return null;

    var retailAmount = parsePriceText(retailPriceText);
    var memberAmount = parsePriceText(memberPriceText);

    if (isNaN(retailAmount) || isNaN(memberAmount) || memberAmount >= retailAmount) return null;

    return {
      retailText: retailPriceText,
      memberText: memberPriceText,
      retailAmount: retailAmount,
      memberAmount: memberAmount,
      savingsAmount: retailAmount - memberAmount
    };
  }

  /**
   * Process collection/search page bridge elements (.wpd-bridge)
   */
  function processCollectionBridges() {
    var bridges = document.querySelectorAll('.wpd-bridge');
    var updated = 0;

    bridges.forEach(function(bridge) {
      var prices = parseBridgePrices(bridge);
      if (!prices) return;

      // Cache the bridge-discovered price for cart usage
      cachePrice(bridge.getAttribute('data-wpd-variant-id'), prices.retailAmount, prices.memberAmount);

      // Find the parent product card
      var card = bridge.closest('.cf-plp__card') || bridge.closest('.l3-product-card');
      if (!card) return;

      // Skip if already processed by bridge
      if (card.dataset.wpdBridgeProcessed === 'true') return;

      // --- Handle cf-plp__* cards (search-results-cf, main-collection-cf, collection-level2-hub) ---
      var cfPriceBox = card.querySelector('.cf-plp__price-box');
      if (cfPriceBox) {
        var cfLabel = cfPriceBox.querySelector('.cf-plp__price-label');
        var cfLabelText = cfLabel ? cfLabel.textContent.trim() : '';

        if (cfLabelText === 'Price') {
          // Case 1: No server-side WSH → convert to Member Price
          cfLabel.textContent = memberPriceLabel;

          var cfMain = cfPriceBox.querySelector('.cf-plp__price-main');
          if (cfMain) {
            cfMain.innerHTML = prices.memberText + '<span class="cf-plp__price-unit">/Each</span>';

            // Add "Was" line
            var wasDiv = document.createElement('div');
            wasDiv.className = 'cf-plp__price-regular';
            wasDiv.innerHTML = 'Was: <s>' + prices.retailText + '</s>';
            cfMain.after(wasDiv);

            // Add savings line
            var savDiv = document.createElement('div');
            savDiv.className = 'cf-plp__sale-savings';
            savDiv.textContent = 'You Save ' + formatMoney(prices.savingsAmount);
            wasDiv.after(savDiv);
          }

          card.dataset.wpdBridgeProcessed = 'true';
          updated++;
        } else if (cfLabelText === 'Member Price') {
          // Case 2: Server-side WSH already rendered → correct price if it differs
          var cfMain = cfPriceBox.querySelector('.cf-plp__price-main');
          if (cfMain) {
            var currentText = cfMain.textContent.replace(/\/Each/g, '').trim();
            var currentAmount = parsePriceText(currentText);

            if (!isNaN(currentAmount) && Math.abs(currentAmount - prices.memberAmount) > 0.01) {
              cfMain.innerHTML = prices.memberText + '<span class="cf-plp__price-unit">/Each</span>';

              // Update or create "Was" line
              var wasDiv = cfPriceBox.querySelector('.cf-plp__price-regular');
              if (wasDiv) {
                wasDiv.innerHTML = 'Was: <s>' + prices.retailText + '</s>';
              } else {
                wasDiv = document.createElement('div');
                wasDiv.className = 'cf-plp__price-regular';
                wasDiv.innerHTML = 'Was: <s>' + prices.retailText + '</s>';
                cfMain.after(wasDiv);
              }

              // Update or create savings line
              var savDiv = cfPriceBox.querySelector('.cf-plp__sale-savings');
              if (savDiv) {
                savDiv.textContent = 'You Save ' + formatMoney(prices.savingsAmount);
              } else {
                savDiv = document.createElement('div');
                savDiv.className = 'cf-plp__sale-savings';
                savDiv.textContent = 'You Save ' + formatMoney(prices.savingsAmount);
                wasDiv.after(savDiv);
              }

              card.dataset.wpdBridgeProcessed = 'true';
              updated++;
            }
          }
        } else if (cfLabelText === 'Sale Price') {
          // Case 3: Server-side rendered "Sale Price" from compare_at_price, but bridge
          // discovered a lower WSH member price → convert to "Member Price" layout
          var cfMain = cfPriceBox.querySelector('.cf-plp__price-main');
          if (cfMain) {
            var currentSaleAmount = parsePriceText(cfMain.textContent);
            // Only convert if bridge member price is lower than the displayed sale price
            if (!isNaN(currentSaleAmount) && prices.memberAmount < currentSaleAmount) {
              // Read compare_at_price from the stale original-price element before removing
              var wasAmount = prices.retailAmount;
              var priceOriginal = cfPriceBox.querySelector('.cf-plp__price-original');
              if (priceOriginal) {
                var origAmount = parsePriceText(priceOriginal.textContent);
                if (!isNaN(origAmount) && origAmount > wasAmount) {
                  wasAmount = origAmount;
                }
                priceOriginal.remove();
              }

              var wasText = formatMoney(wasAmount);
              var savingsAmt = wasAmount - prices.memberAmount;

              cfLabel.textContent = memberPriceLabel;
              cfMain.innerHTML = prices.memberText + '<span class="cf-plp__price-unit">/Each</span>';

              // Update or create "Was" line with original compare_at_price
              var wasDiv = cfPriceBox.querySelector('.cf-plp__price-regular');
              if (wasDiv) {
                wasDiv.innerHTML = 'Was: <s>' + wasText + '</s>';
              } else {
                wasDiv = document.createElement('div');
                wasDiv.className = 'cf-plp__price-regular';
                wasDiv.innerHTML = 'Was: <s>' + wasText + '</s>';
                cfMain.after(wasDiv);
              }

              // Update or create savings line
              var savDiv = cfPriceBox.querySelector('.cf-plp__sale-savings');
              if (savDiv) {
                savDiv.textContent = 'You Save ' + formatMoney(savingsAmt);
              } else {
                savDiv = document.createElement('div');
                savDiv.className = 'cf-plp__sale-savings';
                savDiv.textContent = 'You Save ' + formatMoney(savingsAmt);
                wasDiv.after(savDiv);
              }

              card.dataset.wpdBridgeProcessed = 'true';
              updated++;
            }
          }
        }
        return;
      }

      // --- Handle l3-* cards (main-collection) ---
      var l3Single = card.querySelector('.l3-price-single');
      if (l3Single) {
        var l3Label = l3Single.querySelector('.l3-price-label');
        var l3LabelText = l3Label ? l3Label.textContent.trim() : '';

        if (l3LabelText === 'Price') {
          // Case 1: No server-side WSH → replace with member-view div
          var memberView = document.createElement('div');
          memberView.className = 'l3-price-member-view';
          memberView.innerHTML =
            '<div class="l3-member-price-label">' + memberPriceLabel + '</div>' +
            '<div class="l3-member-view-price">' + prices.memberText + '<span class="l3-price-unit">/Each</span></div>' +
            '<div class="l3-member-view-regular">Was: <s>' + prices.retailText + '</s></div>' +
            '<div class="l3-member-view-savings">You Save ' + formatMoney(prices.savingsAmount) + '</div>';
          l3Single.parentNode.replaceChild(memberView, l3Single);

          card.dataset.wpdBridgeProcessed = 'true';
          updated++;
        } else if (l3LabelText === 'Sale Price') {
          // Case 3: Server-side "Sale Price" from compare_at_price, but bridge found
          // a lower WSH member price → convert to member-view layout
          var l3Price = l3Single.querySelector('.l3-price-amount');
          var currentL3SaleAmount = l3Price ? parsePriceText(l3Price.textContent) : NaN;
          if (!isNaN(currentL3SaleAmount) && prices.memberAmount < currentL3SaleAmount) {
            // Read compare_at_price from stale element for correct "Was"
            var wasAmount = prices.retailAmount;
            var l3PriceOriginal = l3Single.querySelector('.l3-price-original');
            if (l3PriceOriginal) {
              var origAmount = parsePriceText(l3PriceOriginal.textContent);
              if (!isNaN(origAmount) && origAmount > wasAmount) {
                wasAmount = origAmount;
              }
            }

            var wasText = formatMoney(wasAmount);
            var savingsAmt = wasAmount - prices.memberAmount;

            var memberView = document.createElement('div');
            memberView.className = 'l3-price-member-view';
            memberView.innerHTML =
              '<div class="l3-member-price-label">' + memberPriceLabel + '</div>' +
              '<div class="l3-member-view-price">' + prices.memberText + '<span class="l3-price-unit">/Each</span></div>' +
              '<div class="l3-member-view-regular">Was: <s>' + wasText + '</s></div>' +
              '<div class="l3-member-view-savings">You Save ' + formatMoney(savingsAmt) + '</div>';
            l3Single.parentNode.replaceChild(memberView, l3Single);

            card.dataset.wpdBridgeProcessed = 'true';
            updated++;
          }
        }
        return;
      }

      // --- Handle l3-price-member-view (server-side WSH rendered, may need price correction) ---
      var l3MemberView = card.querySelector('.l3-price-member-view');
      if (l3MemberView) {
        var l3ViewPrice = l3MemberView.querySelector('.l3-member-view-price');
        if (l3ViewPrice) {
          var currentL3Text = l3ViewPrice.textContent.replace(/\/Each/g, '').trim();
          var currentL3Amount = parsePriceText(currentL3Text);

          if (!isNaN(currentL3Amount) && Math.abs(currentL3Amount - prices.memberAmount) > 0.01) {
            // Case 2: Server-side WSH price differs → correct it
            l3ViewPrice.innerHTML = prices.memberText + '<span class="l3-price-unit">/Each</span>';

            var l3Regular = l3MemberView.querySelector('.l3-member-view-regular');
            if (l3Regular) l3Regular.innerHTML = 'Was: <s>' + prices.retailText + '</s>';

            var l3Savings = l3MemberView.querySelector('.l3-member-view-savings');
            if (l3Savings) l3Savings.textContent = 'You Save ' + formatMoney(prices.savingsAmount);

            card.dataset.wpdBridgeProcessed = 'true';
            updated++;
          }
        }
        return;
      }
    });

    return updated;
  }

  /**
   * Process Single Product Page bridge element (#wpd-price-bridge)
   * Replaces single "Price" card with dual-card layout (Regularly + Member Price)
   */
  var sppProcessed = false;
  function processSPPBridge() {
    if (sppProcessed) return 0;

    var bridge = document.getElementById('wpd-price-bridge');
    if (!bridge) return 0;

    var prices = parseBridgePrices(bridge);
    if (!prices) return 0;

    // Cache the bridge-discovered price for cart usage
    cachePrice(bridge.getAttribute('data-wpd-variant-id'), prices.retailAmount, prices.memberAmount);

    // Find the price section container
    var container = document.querySelector('.price-section-container');
    if (!container) return 0;

    // Find the single-price row with "Price" label
    var priceRow = container.querySelector('.price-cards-row');
    if (!priceRow) return 0;

    // Check if dual-card layout already exists (server-side WSH rendered)
    var existingMemberCard = priceRow.querySelector('.price-card-member');
    if (existingMemberCard) {
      // Correct member price if it differs from bridge price
      var memberAmountEl = existingMemberCard.querySelector('.price-card-amount');
      if (memberAmountEl) {
        var currentMemberText = memberAmountEl.textContent.trim();
        var currentMemberAmount = parsePriceText(currentMemberText);

        if (!isNaN(currentMemberAmount) && Math.abs(currentMemberAmount - prices.memberAmount) > 0.01) {
          var priceUnit = getPriceUnit(priceRow);
          memberAmountEl.innerHTML = prices.memberText + '<span class="price-unit">/' + priceUnit + '</span>';

          // Also correct the regular price card
          var regularAmountEl = priceRow.querySelector('.price-card-regular .price-card-amount');
          if (regularAmountEl) {
            regularAmountEl.innerHTML = '<s>' + prices.retailText + '</s><span class="price-unit">/' + priceUnit + '</span>';
          }

          // Update financing row
          var financingRow = container.querySelector('.financing-row');
          if (financingRow) {
            var installmentEl = financingRow.querySelector('[data-wpd-installment]');
            if (installmentEl) {
              installmentEl.textContent = formatMoney(Math.round(prices.memberAmount / 4));
            }
          }

          // Update variantWshMap
          var variantId = priceRow.getAttribute('data-wpd-variant-id') || '';
          if (window.variantWshMap && variantId) {
            window.variantWshMap[variantId] = {
              hasWsh: true,
              wshPrice: Math.round(prices.memberAmount * 100),
              variantPrice: Math.round(prices.retailAmount * 100),
              compareAtPrice: parseInt(priceRow.getAttribute('data-wpd-variant-compare-at-price')) || 0
            };
          }

          sppProcessed = true;
          return 1;
        }
      }
      return 0;
    }

    // Single-price layout: check for "Price" label to convert to dual-card
    var priceLabel = priceRow.querySelector('.price-card-label');
    if (!priceLabel || priceLabel.textContent.trim() !== 'Price') return 0;

    // Get the price unit from the existing element
    var priceUnit = getPriceUnit(priceRow);

    // Build the dual-card layout HTML
    // Copy data-wpd-* attributes from the existing price row
    var handle = priceRow.getAttribute('data-wpd-product-handle') || '';
    var variantId = priceRow.getAttribute('data-wpd-variant-id') || '';
    var variantPrice = priceRow.getAttribute('data-wpd-variant-price') || '';
    var compareAt = priceRow.getAttribute('data-wpd-variant-compare-at-price') || '';
    var collIds = priceRow.getAttribute('data-wpd-product-collection-ids') || '';
    var productId = priceRow.getAttribute('data-wpd-product-id') || '';

    var dualCardHtml =
      '<div class="price-cards-row"' +
      ' data-wpd-product-handle="' + handle + '"' +
      ' data-wpd-variant-id="' + variantId + '"' +
      ' data-wpd-variant-price="' + variantPrice + '"' +
      ' data-wpd-variant-compare-at-price="' + compareAt + '"' +
      ' data-wpd-product-collection-ids="' + collIds + '"' +
      ' data-wpd-product-id="' + productId + '">' +
      '<div class="price-card price-card-regular">' +
        '<div class="price-card-label">Regularly</div>' +
        '<div class="price-card-amount"><s>' + prices.retailText + '</s><span class="price-unit">/' + priceUnit + '</span></div>' +
      '</div>' +
      '<div class="price-card price-card-member">' +
        '<div class="price-card-badge">' + memberPriceLabel + '</div>' +
        '<div class="price-card-amount">' + prices.memberText + '<span class="price-unit">/' + priceUnit + '</span></div>' +
      '</div>' +
      '</div>';

    // Replace the single-price row with dual-card layout
    priceRow.outerHTML = dualCardHtml;

    // Update financing row with member price installments
    var financingRow = container.querySelector('.financing-row');
    if (financingRow) {
      var installmentEl = financingRow.querySelector('[data-wpd-installment]');
      if (installmentEl) {
        installmentEl.textContent = formatMoney(Math.round(prices.memberAmount / 4));
      }
    }

    // Update variantWshMap so variant switching JS uses bridge-discovered price
    if (window.variantWshMap && variantId) {
      window.variantWshMap[variantId] = {
        hasWsh: true,
        wshPrice: Math.round(prices.memberAmount * 100),
        variantPrice: Math.round(prices.retailAmount * 100),
        compareAtPrice: parseInt(compareAt) || 0
      };
    }

    sppProcessed = true;
    return 1;
  }

  /**
   * Process cart bridge elements (.wpd-cart-bridge)
   * Corrects stale server-side WSH prices in cart drawer and cart page
   * using bridge data (if wpd.js populated it) or sessionStorage cache.
   */
  function processCartBridges() {
    var bridges = document.querySelectorAll('.wpd-cart-bridge');
    if (!bridges.length) return 0;

    var updated = 0;
    var cache = getCachedPrices();

    bridges.forEach(function(bridge) {
      var variantId = bridge.getAttribute('data-wpd-variant-id');
      var quantity = parseInt(bridge.getAttribute('data-quantity')) || 1;

      // Try bridge element first (wpd.js may have filled it on cart page)
      var prices = parseBridgePrices(bridge);

      // Fall back to sessionStorage cache
      if (!prices && variantId && cache[variantId]) {
        var c = cache[variantId];
        if (c.m < c.r) {
          prices = {
            retailAmount: c.r,
            memberAmount: c.m,
            retailText: formatMoney(c.r),
            memberText: formatMoney(c.m),
            savingsAmount: c.r - c.m
          };
        }
      }

      if (!prices) return;

      var cartItem = bridge.closest('.cart-item') || bridge.closest('.cf-cart-item');
      if (!cartItem || cartItem.dataset.wpdCartProcessed === 'true') return;

      // --- Cart drawer items (.cart-item in quick-cart) ---
      var drawerMemberEl = cartItem.querySelector('.cart-item-price-member');
      if (drawerMemberEl) {
        var currentMemberLine = parsePriceText(drawerMemberEl.textContent);
        var correctMemberLine = prices.memberAmount * quantity;
        if (!isNaN(currentMemberLine) && Math.abs(currentMemberLine - correctMemberLine) > 0.01) {
          drawerMemberEl.textContent = formatMoney(correctMemberLine);
          var drawerRegEl = cartItem.querySelector('.cart-item-price-regular');
          if (drawerRegEl) drawerRegEl.textContent = formatMoney(prices.retailAmount * quantity);
          cartItem.dataset.wpdCartProcessed = 'true';
          updated++;
        }
      } else {
        // Cart drawer item without WSH styling — convert to WSH display
        var flatPrice = cartItem.querySelector('.cart-item-price:not(.cart-item-price--wsh)');
        if (flatPrice) {
          var correctMemberLine = prices.memberAmount * quantity;
          var correctRetailLine = prices.retailAmount * quantity;
          flatPrice.className = 'cart-item-price cart-item-price--wsh';
          flatPrice.innerHTML =
            '<s class="cart-item-price-regular">' + formatMoney(correctRetailLine) + '</s>' +
            '<span class="cart-item-price-member">' + formatMoney(correctMemberLine) + '</span>';
          cartItem.dataset.wpdCartProcessed = 'true';
          updated++;
        }
      }

      // --- Cart page items (.cf-cart-item in main-cart-celebrate-festival) ---
      var cfPriceCell = cartItem.querySelector('.cf-cart-item-price');
      if (cfPriceCell) {
        var cfSale = cfPriceCell.querySelector('.cf-price-sale');
        if (cfSale) {
          // Existing WSH display — correct if price differs
          var currentUnit = parsePriceText(cfSale.textContent);
          if (!isNaN(currentUnit) && Math.abs(currentUnit - prices.memberAmount) > 0.01) {
            cfSale.textContent = formatMoney(prices.memberAmount);
            var cfCompare = cfPriceCell.querySelector('.cf-price-compare');
            if (cfCompare) cfCompare.textContent = formatMoney(prices.retailAmount);
            cartItem.dataset.wpdCartProcessed = 'true';
            updated++;
          }
        } else {
          // Regular price only — convert to WSH display
          var cfRegular = cfPriceCell.querySelector('.cf-price-regular');
          if (cfRegular) {
            cfPriceCell.innerHTML =
              '<span class="cf-price-compare">' + formatMoney(prices.retailAmount) + '</span>' +
              '<span class="cf-price-sale">' + formatMoney(prices.memberAmount) + '</span>';
            cartItem.dataset.wpdCartProcessed = 'true';
            updated++;
          }
        }

        // Update line total column
        var totalCell = cartItem.querySelector('.cf-cart-item-total');
        if (totalCell) {
          var lineMember = prices.memberAmount * quantity;
          var lineRetail = prices.retailAmount * quantity;
          var totalSale = totalCell.querySelector('.cf-total-sale');
          if (totalSale) {
            totalSale.textContent = formatMoney(lineMember);
            var totalCompare = totalCell.querySelector('.cf-total-compare');
            if (totalCompare) totalCompare.textContent = formatMoney(lineRetail);
          } else {
            var totalFinal = totalCell.querySelector('.cf-total-final');
            if (totalFinal) {
              totalCell.innerHTML =
                '<span class="cf-total-compare">' + formatMoney(lineRetail) + '</span>' +
                '<span class="cf-total-final cf-total-sale">' + formatMoney(lineMember) + '</span>';
            }
          }
        }
      }
    });

    if (updated > 0) {
      updateCartSubtotals();
      updateWcpCartData();
    }

    return updated;
  }

  /**
   * Update window.wcp_data.wcp_cart.items with bridge-discovered WSH prices
   * so that WSH's checkout interceptor sends correct wholesale prices to draft order API.
   * Matches by variant_id and updates wcp_v_price and wcp_vd_price (in cents).
   * Also updates discounted_hash so WSH's checkout handler intercepts and doesn't
   * reset our prices.
   */
  function updateWcpCartData() {
    if (!window.wcp_data || !window.wcp_data.wcp_cart || !window.wcp_data.wcp_cart.items) return;

    var cache = getCachedPrices();
    var items = window.wcp_data.wcp_cart.items;
    var anyUpdated = false;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var vid = String(item.variant_id);
      var cached = cache[vid];
      if (!cached || cached.m >= cached.r) continue;

      var memberCents = Math.round(cached.m * 100);
      var currentWcpPrice = item.wcp_v_price;

      // Only update if the cached bridge price is lower than what's currently set
      if (memberCents > 0 && (currentWcpPrice === 0 || currentWcpPrice > memberCents || currentWcpPrice === item.price)) {
        item.wcp_v_price = memberCents;
        item.wcp_vd_price = memberCents;
        anyUpdated = true;
      }
    }

    // Ensure discounted_hash reflects bridge-discovered discounts so WSH's
    // checkout interceptor fires (condition: discount_value truthy OR
    // formatted totals differ) and doesn't reset wcp_v_price
    if (anyUpdated && window.wcp_data.discounted_hash) {
      var originalTotal = 0;
      var wcpTotal = 0;
      for (var j = 0; j < items.length; j++) {
        var qty = items[j].quantity || 1;
        var itemPrice = items[j].price || (items[j].original_item && items[j].original_item.price) || 0;
        originalTotal += itemPrice * qty;
        wcpTotal += (items[j].wcp_v_price || itemPrice) * qty;
      }
      if (wcpTotal < originalTotal) {
        var hash = window.wcp_data.discounted_hash;
        hash.discount_value = originalTotal - wcpTotal;
        hash.formatted_original_total = formatMoney(originalTotal / 100);
        hash.formatted_wcp_total = formatMoney(wcpTotal / 100);
        hash.wcp_total = wcpTotal;
      }
    }
  }

  /**
   * Recalculate cart subtotals after bridge corrections
   */
  function updateCartSubtotals() {
    // --- Cart drawer subtotal ---
    var drawerItems = document.querySelectorAll('#cartDrawerBody .cart-item');
    if (drawerItems.length > 0) {
      var drawerSubtotal = 0;
      drawerItems.forEach(function(item) {
        var memberEl = item.querySelector('.cart-item-price-member');
        var flatEl = item.querySelector('.cart-item-price:not(.cart-item-price--wsh)');
        if (memberEl) {
          drawerSubtotal += parsePriceText(memberEl.textContent) || 0;
        } else if (flatEl) {
          drawerSubtotal += parsePriceText(flatEl.textContent) || 0;
        }
      });
      if (drawerSubtotal > 0) {
        var subtotalEl = document.getElementById('cartSubtotal');
        if (subtotalEl) subtotalEl.textContent = formatMoney(drawerSubtotal);
      }
    }

    // --- Cart page subtotals ---
    var pageItems = document.querySelectorAll('.cf-cart-item');
    if (pageItems.length > 0) {
      var pageSubtotal = 0;
      pageItems.forEach(function(item) {
        var saleTotal = item.querySelector('.cf-total-sale');
        var regularTotal = item.querySelector('.cf-total-final:not(.cf-total-sale)');
        if (saleTotal) {
          pageSubtotal += parsePriceText(saleTotal.textContent) || 0;
        } else if (regularTotal) {
          pageSubtotal += parsePriceText(regularTotal.textContent) || 0;
        }
      });
      if (pageSubtotal > 0) {
        var summaryValue = document.querySelector('.cf-summary-value');
        if (summaryValue) summaryValue.textContent = formatMoney(pageSubtotal);

        // Update estimated total (subtract any cart-level discounts)
        var totalAmount = document.querySelector('.cf-total-amount');
        if (totalAmount) {
          var discount = 0;
          document.querySelectorAll('.cf-discount-amount').forEach(function(el) {
            discount += parsePriceText(el.textContent) || 0;
          });
          var estimatedTotal = pageSubtotal - discount;
          // Preserve currency suffix (e.g. " USD") if present
          var existing = totalAmount.textContent.trim();
          var suffix = '';
          var suffixMatch = existing.match(/\s+[A-Z]{3}$/);
          if (suffixMatch) suffix = suffixMatch[0];
          totalAmount.textContent = formatMoney(estimatedTotal) + suffix;
        }
      }
    }
  }

  function processBridgeElements() {
    var count = processCollectionBridges();
    count += processSPPBridge();
    count += processCartBridges();
    // Always attempt to update wcp_data with cached bridge prices for checkout,
    // even if no cart bridges were processed this round (cache may have been
    // populated from a previous collection/search page visit)
    updateWcpCartData();
    return count;
  }

  // Debounced processing via MutationObserver
  var processTimer = null;
  var observer = new MutationObserver(function() {
    clearTimeout(processTimer);
    processTimer = setTimeout(processBridgeElements, 150);
  });

  function init() {
    if (!document.body) return;

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Poll a few times as fallback in case MutationObserver misses wpd.js updates
    setTimeout(processBridgeElements, 2000);
    setTimeout(processBridgeElements, 4000);
    setTimeout(processBridgeElements, 7000);

    // Hook checkout buttons (capture phase) to ensure bridge prices are applied
    // right before WSH's checkout handler processes the click
    document.addEventListener('click', function(e) {
      var target = e.target.closest('input[name="checkout"], button[name="checkout"], .wcp_checkout_btn, a[href="/checkout"]');
      if (target) {
        updateWcpCartData();
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

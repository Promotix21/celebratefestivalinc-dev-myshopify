# Celebrate Festival Bug Fixes - January 2026

**Theme ID:** `148264910893`
**Last Updated:** 2026-01-30

---

## Summary of Fixed Bugs

| Bug # | Description | Status | Files Modified |
|-------|-------------|--------|----------------|
| BUG-001 | Login redirect not working after registration/login | Fixed | `main-login.liquid`, `main-register.liquid` |
| BUG-002 | Mini Cart "View Cart" button not navigating to /cart | Fixed | `cart-toast.js` |
| BUG-003 | Search results showing only 10 products | Fixed | `search-results-custom.liquid` |
| BUG-004 | Indian products showing member pricing when logged out | Fixed | `snippets/product-card.liquid` |
| BUG-005 | USA products showing "Login for Member Pricing" incorrectly | Fixed | `snippets/product-card.liquid` |
| BUG-006 | Search results Sort By & View Toggle not working | Fixed | `search-results-custom.liquid` |
| BUG-007 | Search results theme inconsistent with L3 page | Fixed | `search-results.css`, `product-card.liquid` |
| BUG-008 | Promotional elements visible to logged-in members | Fixed | `product-card.liquid` |
| BUG-009 | Regular price missing strikethrough in member view | Fixed | `product-card.liquid` |
| BUG-010 | Product page Add to Cart not showing toast | Fixed | `cart-toast.js`, `product-celebrate-festival.liquid` |
| BUG-011 | Topbar not visible | Fixed | `settings_data.json` (enable_top_bar: true) |
| BUG-012 | Cart exit animation abrupt | Fixed | `component-cart-drawer.css` |
| BUG-013 | Search/L3 design consistency (price boxes) | Fixed | `product-card.liquid` |
| BUG-014 | L2 Add to Cart: "quantity is not defined" error | Fixed | `collection-level2-hub.liquid` |
| BUG-015 | Cart +/- buttons behave incorrectly | Fixed | `global.js` |
| BUG-016 | Cart page quantity input missing data attributes | Fixed | `main-cart-celebrate-festival.liquid` |
| BUG-017 | Product card images too small | Fixed | `product-card.liquid` |
| BUG-018 | Product card titles cause uneven card heights | Fixed | `product-card.liquid` |
| BUG-019 | Homepage slider blank slides on reorder | Fixed | `hero-diagonal-slider.liquid` |
| BUG-020 | Cart: No "Save for Later" functionality | Fixed | `main-cart-celebrate-festival.liquid`, `cart-drawer.liquid`, `wishlist.js` |
| BUG-021 | L2 subcategory pills limited to 10 items | Fixed | `collection-level2-hub.liquid` |
| BUG-022 | L2 page needs compact 5-column design | Fixed | `collection-level2-hub.liquid` |

---

## Detailed Fix Notes

### BUG-001: Login Redirect
- Added `checkout_url` hidden input to login form
- Added `return_to` hidden input to register form
- Captures `return_url` from query string

### BUG-002: Mini Cart View Cart Button
- Fixed onclick handler to navigate to `/cart`

### BUG-003: Search Pagination
- Changed from 10 to 24 products per page
- Added pagination controls

### BUG-004 & BUG-005: Member Pricing Logic
- Added `is_indian_product` detection
- Indian products: No member pricing shown to non-members
- Own-brand (CF) products: Show dual pricing to non-members
- Other products: Single retail price only

### BUG-006: Search Sorting
- Fixed `sortProducts()` function
- Fixed `switchView()` toggle between grid/list

### BUG-007 & BUG-013: Design Consistency
Updated `product-card.liquid` price boxes to match L3:
```css
background: #fafafa;
border-radius: 6px;
padding: 10px 8px;
border: 1px dotted #d1d5db;
```

### BUG-008: Member Promotional Elements
- Hide "Login for Member Pricing" when customer is logged in
- Show member pricing directly instead

### BUG-009: Strikethrough Styling
- Added `<s>` tag around regular price in member view
- CSS styling for strikethrough

### BUG-010: Cart Toast
- Integrated toast notification on successful add to cart
- Shows product title and "View Cart" button

### BUG-011: Topbar
- Changed `enable_top_bar` from `false` to `true`

### BUG-012: Cart Animation
- Added `visibility` transition delay
- Allows slide-out animation to complete before hiding

### BUG-014: L2 Add to Cart Error (2026-01-30)
- Variable was defined as `qty` but called as `quantity`
- Fixed line 2694: `window.cfShowCartToast(data, quantity)` → `window.cfShowCartToast(data, qty)`

### BUG-015: Cart +/- Buttons (2026-01-30)
- Simplified `onButtonClick()` in `global.js`
- Removed conditional logic that caused plus button to behave incorrectly when `data-min > step`

### BUG-016: Cart Quantity Input (2026-01-30)
- Added missing attributes to cart page quantity input:
  - `data-min="{{ item.variant.quantity_rule.min | default: 1 }}"`
  - `step="{{ item.variant.quantity_rule.increment | default: 1 }}"`
  - `max="{{ item.variant.quantity_rule.max }}"` (when applicable)

### BUG-017: Product Card Images (2026-01-30)
- Increased image dimensions from 160x160 to 200x200
- Reduced `.card-image` padding from 16px to 10px
- Updated srcset to serve 300w and 500w images

### BUG-018: Product Card Title Heights (2026-01-30)
- Limited titles to 3 lines using `-webkit-line-clamp: 3`
- Added fixed `min-height: calc(13px * 1.4 * 3)` for consistent card heights
- Added hover tooltip showing full title via `data-full-title` attribute

### BUG-019: Homepage Slider Blank Slides (2026-01-30)
- Added `block.settings.image != blank` condition to both content and image sliders
- Prevents desync when slides are missing images

### BUG-020: Save for Later (2026-01-30)
- Added "Save for Later" button to cart page and cart drawer
- On click: adds item to wishlist + removes from cart
- Extended `wishlist.js` with `[data-save-for-later]` click handler

### BUG-021: L2 Subcategory Pills Limited (2026-01-30)
- Menu is now source of truth for pills - ALL items shown from menu
- Uses menu link titles (not collection titles) for display
- Collections without products still show pills
- Removed fallback check that filtered out empty collections

### BUG-022: L2 Compact 5-Column Design (2026-01-30)
- Added compact mode toggle in theme customizer (default: ON)
- 5 products per row instead of 4
- Scaled down proportionally:
  - Cards: padding 12px (was 20px)
  - Images: 120px (was 160px)
  - Pills: padding 6px 12px, font 11px
  - Sidebar: 220px (was 260px)
  - All fonts reduced ~15%
- Responsive: 4 cols @ 1400px, 3 cols @ 1100px, 2 cols @ 768px

---

## Files Pushed to Theme 148264910893

### January 24, 2026:
1. `snippets/product-card.liquid`
2. `assets/collection.css`
3. `assets/search-results.css`
4. `sections/search-results-custom.liquid`
5. `sections/main-login.liquid`
6. `sections/main-register.liquid`

### January 30, 2026:
7. `sections/collection-level2-hub.liquid`
8. `assets/global.js`
9. `sections/main-cart-celebrate-festival.liquid`
10. `snippets/product-card.liquid`
11. `snippets/cart-drawer.liquid`
12. `assets/wishlist.js`
13. `sections/hero-diagonal-slider.liquid`

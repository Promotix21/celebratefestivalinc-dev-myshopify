# Cart Page - Quick Reference Card

## 📁 Files Modified
1. `assets/cart-celebrate-festival.css` - NEW (Main styling)
2. `sections/main-cart-items.liquid` - UPDATED (Product table)
3. `sections/main-cart-footer.liquid` - UPDATED (Order summary)
4. `templates/cart.json` - NO CHANGES (uses sections above)

## 🎨 Brand Colors
```css
--cf-deep-blue: #1a365d    /* Headers, titles */
--cf-navy: #2d5a87         /* Links, buttons */
--cf-coral: #ff6b6b        /* CTAs, prices */
--cf-gold: #d4af37         /* Accents */
--cf-success: #10b981      /* Discounts, free shipping */
```

## 📝 Key Classes

### Layout
- `.cart-celebrate-festival` - Main wrapper
- `.cart-layout` - Two-column grid
- `.cart-items-wrapper` - Products container
- `.cart-summary` - Order summary sidebar

### Product Row
- `.cart-item-row` - Table row
- `.cart-item-image-wrapper` - 100x100px image
- `.cart-item-details` - Product info
- `.cart-item-title` - Product name
- `.cart-item-vendor` - Vendor badge
- `.cart-item-sku` - SKU display

### Quantity
- `.cart-quantity-selector` - Wrapper
- `.cart-quantity-btn` - +/- buttons
- `.cart-quantity-input` - Number input
- `.cart-remove-btn` - Remove button

### Pricing
- `.cart-item-price` - Unit price
- `.cart-item-total` - Line total
- `.cart-summary-total-amount` - Grand total

### Summary
- `.cart-summary-title` - "Order Summary"
- `.cart-summary-row` - Line item
- `.cart-summary-discount` - Discount badge
- `.cart-free-shipping` - Free shipping indicator
- `.cart-checkout-btn` - Checkout button
- `.cart-trust-badges` - Security badges

## 📐 Sizing

### Images
- Desktop: 100x100px
- Mobile: 120x120px
- Border radius: 8px

### Layout
- Max width: 1400px
- Sidebar: 400px (desktop)
- Padding: 40px (desktop), 20px (mobile)
- Gaps: 30px (columns), 20px (grid)

### Buttons
- Quantity: 36x36px
- Remove: 32x32px
- Checkout: Full width, 16px padding

## 🔧 Configuration

### Free Shipping Threshold
```liquid
{%- assign free_shipping_threshold = 100000 -%}
```
**Location**: `main-cart-footer.liquid` line 82
**Note**: Value in cents (100000 = $1000)

### Cart Note
**Setting**: `settings.show_cart_note`
**Location**: `main-cart-items.liquid` line 377

### Trust Badges
**Location**: `main-cart-footer.liquid` lines 169-188
**Editable**: Text and icons can be changed

## 📱 Responsive

### Desktop (993px+)
- Two columns
- Sticky summary
- Full table

### Tablet (768-992px)
- Single column
- Summary below

### Mobile (<768px)
- Card layout
- Stacked elements
- Larger touch targets

## 🎯 Quick Edits

### Change Colors
Edit CSS variables in `cart-celebrate-festival.css` lines 16-48

### Modify Layout
Edit `.cart-layout` in `cart-celebrate-festival.css` line 66

### Update Checkout Button
Edit `.cart-checkout-btn` in `cart-celebrate-festival.css` lines 474-502

### Change Free Shipping Threshold
Edit variable in `main-cart-footer.liquid` line 82

### Customize Trust Badges
Edit HTML in `main-cart-footer.liquid` lines 169-188

## 🐛 Common Issues

### Summary Not Sticky
**Fix**: Check CSS in `main-cart-footer.liquid` lines 25-40

### Images Not Square
**Fix**: `.cart-item-image-wrapper` CSS lines 145-152

### Mobile Layout Broken
**Fix**: Check media query at line 621 in CSS

### Fonts Not Loading
**Fix**: Verify Google Fonts link in `main-cart-items.liquid` lines 9-11

### Colors Wrong
**Fix**: CSS variables might not be loading, check line 1 of `cart-celebrate-festival.css`

## ✅ Testing Checklist
- [ ] Empty cart displays correctly
- [ ] Single item works
- [ ] Multiple items display
- [ ] Quantity +/- buttons work
- [ ] Remove button works
- [ ] Discounts show correctly
- [ ] Free shipping indicator (>$1000)
- [ ] Checkout button works
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop layout

## 📊 Performance
- CSS: ~20KB
- No external dependencies (except Google Fonts)
- GPU-accelerated animations
- Lazy-loaded images

## 🔗 Related Files
- Brand guidelines: `CLAUDE.md`
- Collection styles: `assets/collection-hierarchy.css`
- Product styles: `assets/component-card.css`
- Reference mockup: `webstaurant-red-blue-mockup (1).html`

## 📞 Support
For detailed information, see:
- `CART-UPDATE-SUMMARY.md` - Complete documentation
- `CART-DESIGN-REFERENCE.md` - Visual design guide

## 🚀 Deployment
1. Upload all modified files to theme
2. Test in theme preview
3. Check all breakpoints
4. Verify cart functionality
5. Test checkout flow
6. Publish when ready

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Ready for Testing

# Cart Page Design Reference - Celebrate Festival

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CART PAGE HEADER                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ║ Shopping Cart          ← Continue Shopping           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TWO-COLUMN LAYOUT                                              │
│                                                                 │
│  ┌────────────────────────────────┐  ┌────────────────────┐   │
│  │  CART ITEMS TABLE              │  │  ORDER SUMMARY     │   │
│  │                                │  │  (Sticky Sidebar)  │   │
│  │  ┌──────────────────────────┐  │  │                    │   │
│  │  │ Product | Details | $ |  │  │  │  ┌──────────────┐  │   │
│  │  ├──────────────────────────┤  │  │  │ Order Summary│  │   │
│  │  │ [IMG]  Product Name      │  │  │  ├──────────────┤  │   │
│  │  │        SKU: 12345        │  │  │  │ Subtotal: $X │  │   │
│  │  │        Variants          │  │  │  │ Discount: $X │  │   │
│  │  │        [- 1 +] [Remove]  │  │  │  │ ────────────  │  │   │
│  │  │        $XX.XX            │  │  │  │ Total: $XXX  │  │   │
│  │  └──────────────────────────┘  │  │  │              │  │   │
│  │  (Repeat for each item)        │  │  │ [CHECKOUT]   │  │   │
│  │                                │  │  │              │  │   │
│  │  ┌──────────────────────────┐  │  │  │ Trust Badges │  │   │
│  │  │ Cart Note (Optional)     │  │  │  └──────────────┘  │   │
│  │  └──────────────────────────┘  │  │                    │   │
│  └────────────────────────────────┘  └────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Page Header
```
┌─────────────────────────────────────────────────────────┐
│ ║ Shopping Cart              ← Continue Shopping       │
└─────────────────────────────────────────────────────────┘
```
- **Left**: Title with gradient accent bar (║)
- **Right**: "Continue Shopping" link with arrow
- **Font**: Montserrat 700, 28px
- **Color**: CF Deep Blue (#1a365d)

### 2. Product Row (Desktop)
```
┌──────────────────────────────────────────────────────────────┐
│ [Image]  │  Product Details    │  $XX.XX  │  [- 2 +]  │ $XXX │
│  100x100 │  Title              │          │  [X]      │      │
│          │  Vendor             │          │           │      │
│          │  SKU: 12345         │          │           │      │
│          │  Size: Large        │          │           │      │
└──────────────────────────────────────────────────────────────┘
```

**Columns:**
1. **Product** (Image): 100x100px, rounded borders
2. **Details**: Title, vendor, SKU, variants
3. **Price**: Unit price with compare-at if on sale
4. **Quantity**: Styled selector + remove button
5. **Total**: Line total (bold, right-aligned)

### 3. Product Row (Mobile)
```
┌─────────────────────────┐
│   ┌─────────────────┐   │
│   │   Product Image │   │
│   │     120x120     │   │
│   └─────────────────┘   │
│                         │
│   Product Title         │
│   VENDOR                │
│   SKU: 12345            │
│                         │
│   Size: Large           │
│                         │
│   $XX.XX                │
│                         │
│   [- 1 +]  [Remove]     │
│   ─────────────────     │
│   Total: $XXX.XX        │
└─────────────────────────┘
```

### 4. Quantity Selector
```
┌───┬─────┬───┐
│ − │  2  │ + │
└───┴─────┴───┘  [X]
```
- **Buttons**: 36x36px, navy hover
- **Input**: 50x36px, centered
- **Remove**: 32x32px, red accent

### 5. Order Summary (Desktop)
```
┌────────────────────────────┐
│ Order Summary              │
├────────────────────────────┤
│ Subtotal (2 items)   $XX   │
│                            │
│ ┌────────────────────────┐ │
│ │ ★ Discount -$XX       │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ ✓ Free Shipping!      │ │
│ └────────────────────────┘ │
│                            │
│ ──────────────────────────  │
│ Total            $XXX.XX   │
│                            │
│ Tax info...                │
│                            │
│ ┌────────────────────────┐ │
│ │   PROCEED TO CHECKOUT  │ │
│ └────────────────────────┘ │
│                            │
│ — OR —                     │
│ [Dynamic Checkout Buttons] │
│                            │
│ ┌──────┬──────┬──────┐    │
│ │ 🔒   │  ✓   │  🚚  │    │
│ │Secure│Returns│Ship │    │
│ └──────┴──────┴──────┘    │
└────────────────────────────┘
```

## Color Usage

### Primary Elements
- **Headers/Titles**: CF Deep Blue (#1a365d)
- **Links**: CF Navy (#2d5a87)
- **CTAs/Prices**: CF Coral (#ff6b6b)
- **Discounts/Success**: CF Success (#10b981)

### Backgrounds
- **Page**: White (#ffffff)
- **Cards**: White with border (#e2e8f0)
- **Summary**: Gradient (#dbeafe → #eff6ff)
- **Hover**: Navy light (rgba(45, 90, 135, 0.02))

### Borders
- **Default**: #e2e8f0 (1px)
- **Active**: CF Navy (#2d5a87)
- **Summary**: rgba(45, 90, 135, 0.2)

## Typography Scale

### Headings
- **Page Title**: Montserrat 700, 28px
- **Section Title**: Montserrat 700, 18px
- **Product Title**: Montserrat 600, 15px

### Body Text
- **Regular**: Inter 400, 13-14px
- **Labels**: Inter 600, 12-13px
- **Small**: Inter 400, 11px

### Prices
- **Unit Price**: Montserrat 700, 16px
- **Line Total**: Montserrat 800, 18px
- **Grand Total**: Montserrat 800, 24px

## Spacing System

### Section Padding
- **Desktop**: 40px
- **Mobile**: 20px

### Card Padding
- **Summary**: 24px
- **Product Row**: 24px (vertical), 20px (horizontal)
- **Note Section**: 20px

### Gaps
- **Column Gap**: 30px
- **Table Rows**: 24px
- **Summary Items**: 14px

## Interactive States

### Buttons
```css
/* Default */
background: #ff6b6b;
color: white;
box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);

/* Hover */
background: #ff5252;
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

### Quantity Buttons
```css
/* Default */
background: #f8fafc;
color: #2d5a87;

/* Hover */
background: #2d5a87;
color: white;
```

### Product Rows
```css
/* Default */
background: white;

/* Hover */
background: rgba(45, 90, 135, 0.02);
```

## Responsive Breakpoints

### Desktop (993px+)
- Two-column layout
- Sticky summary sidebar (400px)
- Full table display
- All features visible

### Tablet (768px - 992px)
- Single column
- Summary below items
- Table remains
- Horizontal scroll if needed

### Mobile (< 768px)
- Single column
- Card-based product display
- Hidden table headers
- Stacked elements
- Larger touch targets

## Accessibility Features

### ARIA Labels
- Quantity inputs have descriptive labels
- Remove buttons have product context
- Loading states announced
- Error states announced

### Keyboard Navigation
- All buttons focusable
- Tab order logical
- Enter/Space activates buttons
- Escape closes modals

### Screen Readers
- Semantic HTML (table, th, td)
- Hidden labels for context
- Status announcements (cart updates)
- Clear button descriptions

## Icons Used

### SVG Icons (Inline)
- **Discount**: Star/sparkle (14x14px)
- **Free Shipping**: Checkmark (18x18px)
- **Remove**: X/Close (16x16px)
- **Empty Cart**: Shopping bag (80x80px)
- **Trust Badges**: Lock, check, truck (32x32px)

## Special Features

### Free Shipping Indicator
```
┌────────────────────────────┐
│ ✓ Free Shipping Eligible   │
│ Your order qualifies!       │
└────────────────────────────┘
```
- Green accent (#10b981)
- Shows when cart total ≥ $1000
- Animated checkmark
- Celebratory message

### Line Discounts
```
┌──────────────────────┐
│ ★ 10% OFF (-$10.00) │
└──────────────────────┘
```
- Green background (rgba(16, 185, 129, 0.1))
- Icon + text
- Shows under product details

### Trust Badges
```
┌──────┬────────┬──────┐
│ 🔒   │   ✓    │  🚚  │
│Secure│ Returns│ Ship │
└──────┴────────┴──────┘
```
- Three badges
- Icons + text
- Below checkout button
- Builds confidence

## Testing Scenarios

### Empty Cart
- Large icon display
- Friendly message
- CTA to shop
- Login prompt (if not logged in)

### Single Item
- Full layout shown
- All features work
- Summary calculates correctly

### Multiple Items
- Scrollable table
- Sticky summary
- Bulk calculations correct

### With Discounts
- Line discounts show
- Cart discounts show
- Totals accurate

### Free Shipping
- Indicator appears at $1000+
- Updates dynamically
- Removes when below threshold

## Performance

### Load Time
- CSS: ~20KB (minified)
- Fonts: Preconnected to Google
- Icons: Inline SVG (no requests)
- Images: Lazy loaded

### Animations
- CSS transitions (GPU)
- Transform for movement
- Opacity for fades
- No JavaScript animations

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 14+, Android Chrome)

## Future Enhancements

### Recommended
1. Upsell products section
2. Progress bar for free shipping
3. Save for later functionality
4. Promo code input field
5. Estimated delivery dates

### Nice to Have
1. Mini cart preview
2. Recently viewed items
3. Product recommendations
4. Gift message option
5. Multiple shipping addresses

---

**Reference Files:**
- CSS: `assets/cart-celebrate-festival.css`
- Items: `sections/main-cart-items.liquid`
- Summary: `sections/main-cart-footer.liquid`
- Template: `templates/cart.json`

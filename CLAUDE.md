# Claude Implementation Guide - Celebrate Festival Collection Templates

**Last Updated:** January 2026
**Reference Mockup:** `webstaurant-red-blue-mockup (1).html`
**Shopify Theme ID:** `148264910893`
**Theme Push Command:** `shopify theme push --theme 148264910893`

---

## QUICK REFERENCE

### Brand Colors (USE THESE, NOT MOCKUP COLORS)

```css
:root {
  /* Primary */
  --cf-deep-blue: #1a365d;      /* Hero, headers, titles */
  --cf-navy: #2d5a87;           /* Links, buttons, accents */
  --cf-coral: #ff6b6b;          /* CTAs, counts, badges */
  --cf-gold: #d4af37;           /* Ratings, special highlights */

  /* Status */
  --cf-success: #10b981;        /* Free shipping, success states */

  /* Text */
  --cf-text-dark: #0f172a;
  --cf-text-medium: #475569;
  --cf-text-light: #64748b;
  --cf-text-muted: #94a3b8;

  /* Backgrounds */
  --cf-border: #e2e8f0;
  --cf-bg-light: #f8fafc;
  --cf-bg-white: #ffffff;

  /* Derived Colors */
  --cf-coral-bg: rgba(255, 107, 107, 0.2);
  --cf-coral-border: rgba(255, 107, 107, 0.3);
  --cf-navy-hover: #3d6a9f;
  --cf-overlay: rgba(26, 54, 93, 0.85);
}
```

---

## DO NOT DEVIATE FROM THESE RULES

### MUST DO:
1. All images are **1:1 ratio (square)**
2. **Symmetry is the main concern** - all spacing must be equal
3. Use **exact padding/margins** from mockup
4. **Hide categories with no sub-categories**
5. Keep **WSH wholesale pricing** integration intact
6. Use **Montserrat** for headings, **Inter** for body

### MUST NOT DO:
- Add extra padding (theme already has too much)
- Use mockup colors (use CF brand colors above)
- Show empty categories
- Break WSH pricing functionality
- Create non-symmetric layouts
- Use rectangular images

---

## LEVEL 1 - MAIN CATEGORY PAGE

### Structure:
```
[Hero Banner - 220px]
[Main Categories - 4 columns]
[Icon Row - 9 items]
[Secondary Categories - 4 columns]
[Brands Row - flex]
[Top Products Carousel]
```

### Hero Banner:
- Height: **220px**
- Background: `linear-gradient(135deg, #1a365d 0%, #0f172a 100%)`
- Animated gradient sweep
- Floating shapes (circles, low opacity)
- Tagline pill + Title (with gradient text) + Subtitle

### Main Categories Grid:
- **4 columns**, gap: 24px
- Card: border-radius 12px, border #e2e8f0
- Image: **160x160px square**
- Hover: border #2d5a87, shadow, translateY(-4px)
- **Image hover overlay**: Show category name on dark blue background

### Card Content:
```
[160x160 Image]
[Title - Montserrat 16px 700]
[Count Link - "Shop X Categories" - Coral with arrow]
[Description - 13px light gray]
[Sub-links - 4 items max, blue with dot prefix]
```

### Icon Row:
- 9 items, flex space-between
- Icon box: **80x80px**, border-radius 12px
- Label: 12px, 600 weight
- Hover: border blue, bg pale blue, translateY(-4px)

### Spacing:
```css
.main-categories-section { padding: 40px; }
.main-categories-grid { gap: 24px; }
.category-card-content { padding: 20px; }
.icon-section { padding: 30px 40px; }
.section-header { margin-bottom: 28px; }
```

---

## LEVEL 2 - SUBCATEGORY PAGE

### Structure:
```
[Hero Banner - 220px]
[Category Cards - 3 columns]
[Icon Grid - 8 columns]
[Top Products Carousel]
[Other Equipment - horizontal scroll]
```

### Category Cards:
- **3 columns**, gap: 28px
- Image: **200x200px square**
- Content padding: 24px
- Larger cards than L1

### Icon Grid:
- **8 columns**, gap: 16px
- Image: **90x90px**
- Background: #f8fafc
- Label: 11px, 600 weight

### Spacing:
```css
.level2-section { padding: 40px; }
.level2-grid { gap: 28px; }
.level2-card-content { padding: 24px; }
.level2-icon-section { padding: 30px 40px; }
.level2-icon-grid { gap: 16px; }
```

---

## LEVEL 3 - PRODUCT LISTING PAGE

### Structure:
```
[Breadcrumb - 16px 40px padding]
[Page Header - 30px 40px padding]
[Container: Sidebar 260px | Products Area]
  [Toolbar]
  [Power Type Selector (if applicable)]
  [Product Grid - 4 columns]
```

### Filters Sidebar:
- Width: **260px**
- Padding: 24px
- Background: #f8fafc
- Filter groups with collapsible sections
- Checkboxes: accent-color navy

### Product Grid:
- **4 columns**, gap: 20px
- Responsive: 3 @ 1200px, 2 @ 992px

### Product Card:
```
[Badge - top left, Deep Blue bg]
[Image - 160x160px square]
  [Hover: switch to variation images]
[Fuel Type Pill - sky blue bg]
[Title - 13px 600, min-height 54px]
[Rating - Plus badge + stars]
[SKU - 11px muted]
[Price Box - gradient bg, rounded]
  [Label - "Member Price"]
  [Price - Montserrat 22px 800, Coral]
  [Regular Price - strikethrough]
[Free Shipping Badge - green pill]
[Add to Cart Row - qty + button]
```

### Price Box:
```css
.price-box {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  border: 1px solid rgba(45, 90, 135, 0.2);
  padding: 14px;
  border-radius: 10px;
  text-align: center;
}
```

### Spacing:
```css
.breadcrumb { padding: 16px 40px; }
.level3-header { padding: 30px 40px; }
.filters-sidebar { width: 260px; padding: 24px; }
.products-area { padding: 24px 30px; }
.products-grid { gap: 20px; }
.product-card { padding: 20px; }
.toolbar { margin-bottom: 24px; }
```

---

## HOVER EFFECTS

### Category Image Hover (L1 & L2):
```css
.category-image-wrapper {
  position: relative;
  overflow: hidden;
}

.category-image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cf-overlay);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-card:hover .category-image-wrapper::after {
  opacity: 1;
}

.category-image-wrapper .hover-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  text-align: center;
  padding: 0 10px;
}

.category-card:hover .hover-title {
  opacity: 1;
}
```

### Product Image Hover (L3):
```javascript
// On hover, cycle through product.media images
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
  const images = JSON.parse(card.dataset.images);
  let currentIndex = 0;

  card.addEventListener('mouseenter', () => {
    if (images.length > 1) {
      // Start cycling images
    }
  });
});
```

---

## COMPONENT SNIPPETS

### Section Title:
```liquid
<div class="section-header">
  <h2 class="section-title">{{ title }}</h2>
  {% if view_all_url %}
    <a href="{{ view_all_url }}" class="view-all-link">
      {{ view_all_text | default: 'View All' }} →
    </a>
  {% endif %}
</div>
```

```css
.section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--cf-deep-blue);
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 28px;
  background: linear-gradient(180deg, var(--cf-coral) 0%, var(--cf-navy) 100%);
  border-radius: 2px;
}
```

### Category Count Link:
```liquid
<a href="{{ url }}" class="category-count">
  Shop {{ count }} Categories
</a>
```

```css
.category-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--cf-coral);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.category-count::after {
  content: '→';
  transition: transform 0.3s ease;
}

.category-card:hover .category-count::after {
  transform: translateX(4px);
}
```

### Sub-links List:
```css
.category-links {
  list-style: none;
  border-top: 1px solid var(--cf-border);
  padding-top: 14px;
  margin-top: 14px;
}

.category-links a {
  font-size: 13px;
  color: var(--cf-navy);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.category-links a::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--cf-navy);
  border-radius: 50%;
}

.category-links a:hover {
  color: var(--cf-coral);
  padding-left: 4px;
}

.category-links a:hover::before {
  background: var(--cf-coral);
}
```

---

## HIDE EMPTY CATEGORIES LOGIC

```liquid
{% comment %} For menu-based navigation {% endcomment %}
{% for link in linklists[menu_handle].links %}
  {% if link.links.size > 0 %}
    {% comment %} This category has sub-categories, show it {% endcomment %}
    <div class="category-card">
      ...
    </div>
  {% endif %}
{% endfor %}

{% comment %} For collection-based navigation {% endcomment %}
{% for collection in collections %}
  {% assign child_count = 0 %}
  {% for c in collections %}
    {% if c.metafields.custom.parent_handle == collection.handle %}
      {% assign child_count = child_count | plus: 1 %}
    {% endif %}
  {% endfor %}

  {% if child_count > 0 %}
    {% comment %} Show collection {% endcomment %}
  {% endif %}
{% endfor %}
```

---

## WSH WHOLESALE PRICING

**DO NOT MODIFY** - Already integrated via Shopify plugin

The theme detects customer tags and shows different prices:
- Members see "Member Price" with special styling
- Non-members see regular price
- Compare-at price shows as strikethrough

Just ensure the price display area uses the styled price box component.

---

## RESPONSIVE BREAKPOINTS

```css
/* Desktop */
@media (min-width: 1201px) {
  .l1-grid { grid-template-columns: repeat(4, 1fr); }
  .l2-grid { grid-template-columns: repeat(3, 1fr); }
  .l3-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Tablet Landscape */
@media (max-width: 1200px) {
  .l3-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Tablet Portrait */
@media (max-width: 992px) {
  .l1-grid { grid-template-columns: repeat(2, 1fr); }
  .l2-grid { grid-template-columns: repeat(2, 1fr); }
  .l3-grid { grid-template-columns: repeat(2, 1fr); }
  .l2-icon-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Mobile */
@media (max-width: 576px) {
  .l1-grid { grid-template-columns: 1fr; }
  .l2-grid { grid-template-columns: 1fr; }
  .l3-grid { grid-template-columns: repeat(2, 1fr); }
  .filters-sidebar { display: none; } /* Show as modal on mobile */
}
```

---

## FILES TO MODIFY

| File | Action | Notes |
|------|--------|-------|
| `sections/collection-level1-hub.liquid` | REWRITE | Complete rewrite to match mockup |
| `sections/collection-level2-hub.liquid` | REWRITE | Complete rewrite to match mockup |
| `sections/main-collection.liquid` | UPDATE | Add L3 enhancements |
| `templates/collection.level-1.json` | UPDATE | Verify section reference |
| `templates/collection.level-2.json` | UPDATE | Verify section reference |
| `templates/collection.level-3.json` | UPDATE | Verify section reference |
| `assets/collection-hierarchy.css` | CREATE | Consolidated styles |

---

## TESTING CHECKLIST

Before pushing:

- [ ] All colors match brand palette
- [ ] All images are 1:1 square
- [ ] Spacing matches mockup exactly
- [ ] Empty categories are hidden
- [ ] Hover overlay works on L1/L2 images
- [ ] Product image switch works on L3
- [ ] WSH pricing displays correctly
- [ ] Grids are symmetric and aligned
- [ ] Responsive at all breakpoints
- [ ] No horizontal scroll issues
- [ ] Links work correctly
- [ ] Breadcrumbs accurate

---

## IMAGE BANNER OPTIONS (COLLECTION METAFIELDS)

### Metafields Created (via API):

| Metafield | Namespace.Key | Type | Purpose |
|-----------|---------------|------|---------|
| Hero Banner | `custom.hero_banner` | File (Image) | 1400x400px hero background |
| Hero Tagline | `custom.hero_tagline` | Single line text | "Professional Grade" |
| Hero Subtitle | `custom.hero_subtitle` | Multi-line text | Description under title |

### How to Add Banner Images:
1. Go to Shopify Admin → Products → Collections
2. Select a collection (e.g., Restaurant Equipment)
3. Scroll to "Metafields" section
4. Upload image to "Hero Banner" field
5. Add tagline and subtitle text

### Liquid Usage:
```liquid
{% assign hero_banner = collection.metafields.custom.hero_banner %}
{% assign hero_tagline = collection.metafields.custom.hero_tagline | default: 'Professional Grade' %}
{% assign hero_subtitle = collection.metafields.custom.hero_subtitle %}

<div class="hero-banner {% unless hero_banner %}hero-banner--gradient{% endunless %}">
  {% if hero_banner %}
    <img src="{{ hero_banner | image_url: width: 1400 }}" class="hero-banner__image">
  {% endif %}
  ...
</div>
```

### Category Card Images:
Each category card should pull image from:
1. **Collection featured image** (primary)
2. **Metafield image** (fallback)
3. **Placeholder** (last resort)

### Promotional Banners (Optional Blocks):
Add block type for promotional banners between sections:
```json
{
  "type": "promo_banner",
  "name": "Promotional Banner",
  "settings": [
    {
      "type": "image_picker",
      "id": "banner_image",
      "label": "Banner Image"
    },
    {
      "type": "url",
      "id": "banner_link",
      "label": "Banner Link"
    },
    {
      "type": "text",
      "id": "banner_alt",
      "label": "Alt Text"
    }
  ]
}
```

### Brand Logos:
Allow customizer to add brand logos via blocks:
```json
{
  "type": "brand_logo",
  "name": "Brand Logo",
  "settings": [
    {
      "type": "image_picker",
      "id": "logo_image",
      "label": "Brand Logo"
    },
    {
      "type": "text",
      "id": "brand_name",
      "label": "Brand Name"
    },
    {
      "type": "url",
      "id": "brand_url",
      "label": "Brand URL"
    }
  ]
}
```

### Icon Categories:
Allow customizer to set icons:
```json
{
  "type": "icon_category",
  "name": "Icon Category",
  "settings": [
    {
      "type": "image_picker",
      "id": "icon_image",
      "label": "Icon Image (80x80px recommended)"
    },
    {
      "type": "text",
      "id": "icon_label",
      "label": "Label"
    },
    {
      "type": "url",
      "id": "icon_url",
      "label": "Link URL"
    }
  ]
}
```

### Image Placeholders:
When no image is set, show styled placeholder:
```css
.image-placeholder {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cf-text-muted);
  font-size: 40px;
}
```

---

## CREATIVE FREEDOM ALLOWED

You CAN make small creative improvements:
- Subtle animation timing adjustments
- Micro-interactions on hover
- Shadow depths
- Transition easing curves

You CANNOT change:
- Grid column counts
- Spacing values
- Color palette
- Image ratios
- Component structure
- Overall layout

**Remember: SYMMETRY IS THE MAIN CONCERN**

---

## WSH WHOLESALE PLUGIN INTEGRATION

**Last Updated:** January 2026
**Investigation Completed:** 2026-01-14
**Schema Setting:** `enable_member_pricing` - **DEFAULT: FALSE** (Must be manually enabled)

### ⚠️ IMPORTANT: Member Pricing is NOT Real WSH Integration

The "Member Pricing" feature in the product template is a **FALLBACK/PROMOTIONAL** display only. It does NOT show actual WSH wholesale prices.

**To Use Real WSH Wholesale Pricing:**
- Direct wholesale customers to: `https://celebratefestivalinc.myshopify.com/apps/wpdapp/wholesale`
- This is where WSH plugin actually works with real individual variant pricing
- The regular storefront CANNOT access WSH prices (by WSH's architectural design)

**Member Pricing Toggle:**
- Schema setting: `enable_member_pricing`
- **Default: FALSE** (disabled)
- When enabled, shows calculated discount (default 2%) as promotional preview
- This is purely visual - NOT connected to WSH database

### CRITICAL UNDERSTANDING: How WSH Works

The WSH Wholesale plugin uses a **proprietary architecture** that is fundamentally different from standard Shopify apps:

**❌ What WSH Does NOT Do:**
- Does NOT store prices in Shopify product metafields
- Does NOT expose Liquid variables (e.g., `product.wsh_wholesale_price`)
- Does NOT modify `product.price` or `variant.price` in regular theme
- Does NOT integrate with standard Shopify theme templates

**✅ What WSH Does:**
- Stores individual variant pricing in its own external database
- Serves wholesale prices ONLY through dedicated section: `/apps/wpdapp/wholesale`
- Uses customer tags to determine discount groups (9 groups configured)
- Provides Professional plan features for B2B pricing management

### Discount Groups Configuration

The store has **9 discount groups** configured in WSH:
- CPH
- UMRP
- 5% Margin
- 10% Margin
- 15% Margin
- 20% Margin
- ROU
- 30% Margin
- Premium

**Example Pricing:**
- Product: ATOSA AEC-0511E
- Regular Price: $5806.00
- CPH Group Price: $5278.08 (9% discount)

### Current Theme Implementation

**Member Detection:**
```liquid
{% assign is_member = false %}
{% if customer %}
  {% if customer.tags contains 'plus-member' or customer.tags contains 'wholesale' or customer.tags contains 'member' %}
    {% assign is_member = true %}
  {% endif %}
{% endif %}
```

**Fallback Pricing Calculation:**
Since WSH doesn't expose prices to the regular theme, we use a 2% fallback discount:
```liquid
{% assign member_discount = 2 %}
{% assign discount_multiplier = 100 | minus: member_discount | divided_by: 100.0 %}
{% assign member_price = product.price | times: discount_multiplier %}
```

**Price Source Detection Attempts (All Fail by Design):**
```liquid
{% if product.metafields.wsh.wholesale_price %}
  {% assign member_price = product.metafields.wsh.wholesale_price %}
{% elsif product.metafields.wholesale.price %}
  {% assign member_price = product.metafields.wholesale.price %}
{% elsif product.metafields.custom.wholesale_price %}
  {% assign member_price = product.metafields.custom.wholesale_price %}
{% elsif product.compare_at_price and product.compare_at_price < product.price %}
  {% assign member_price = product.compare_at_price %}
{% else %}
  {% comment %} Use fallback calculation {% endcomment %}
  {% assign member_price = product.price | times: discount_multiplier %}
{% endif %}
```

### Why This Works Correctly

**For Regular Storefront:**
- Shows 2% discount as a "teaser" for membership program
- Member tag detection works perfectly
- Non-members see blurred pricing with login prompt
- Members see calculated 2% discount

**For Wholesale Customers:**
- Direct them to: `https://celebratefestivalinc.myshopify.com/apps/wpdapp/wholesale`
- They see actual discount group prices (CPH, ROU, etc.)
- Individual variant pricing applies based on customer tags
- Volume discounts are honored

### Debug Tools Created

Two debug snippets available (not rendered in production):
- `snippets/debug-wsh-detection.liquid` - Shows all metafield detection attempts
- `snippets/debug-wsh-variables.liquid` - Tests for WSH Liquid variables

These can be rendered temporarily for troubleshooting:
```liquid
{% render 'debug-wsh-detection' %}
{% render 'debug-wsh-variables' %}
```

### DO NOT Attempt These Solutions

**❌ Don't Try:**
- Adding more metafield paths (WSH doesn't use any)
- Looking for WSH Liquid variables (they don't exist in regular theme)
- Modifying price detection logic (current implementation is correct)
- Expecting WSH prices in product page (only available in `/apps/wpdapp/wholesale`)

**✅ Current Implementation is Correct:**
- 2% fallback works as designed for regular storefront
- WSH dedicated section handles actual wholesale pricing
- Customer segmentation by tags works properly
- This is how WSH Professional plan is designed to work

### Member Pricing Display

**For Members (logged in with "wholesale" tag):**
```liquid
<div class="price-member-section">
  <div class="price-type-label">{{ section.settings.member_price_label | default: "Plus Member Price:" }}</div>
  <div class="member-price">
    {{ member_price | money }}
    <span>/{{ section.settings.price_unit | default: "Each" }}</span>
  </div>
  <span class="savings-badge">Save {{ savings_amount | money }} ({{ member_discount }}%)</span>
</div>
```

**For Non-Members:**
```liquid
<div class="member-price-blur-container">
  <div class="price-member-section" style="filter: blur(5px);">
    <div class="member-price">$X,XXX.XX</div>
  </div>
  <div class="member-price-blur-overlay">
    <div class="login-prompt-text">🔒 Login to see member pricing</div>
    <a href="/account/login" class="login-btn">Login to Your Account</a>
  </div>
</div>
```

### Recommendation for Clients

When setting up wholesale customers:
1. Add appropriate customer tag (CPH, ROU, etc.)
2. Also add "wholesale" tag for member detection
3. Direct wholesale customers to `/apps/wpdapp/wholesale`
4. Regular storefront shows 2% preview pricing
5. Actual discount group pricing only in WSH section

This architecture ensures:
- Regular customers see promotional member pricing (2% teaser)
- Wholesale customers get full B2B experience in dedicated section
- No confusion between retail and wholesale pricing
- Clean separation of concerns

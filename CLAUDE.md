# Claude Implementation Guide - Celebrate Festival Collection Templates

**Last Updated:** February 2026
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

## WSH WHOLESALE PLUGIN & MEMBER PRICING

**Last Updated:** February 2026

### VENDOR-BASED PRICING LOGIC (CURRENT IMPLEMENTATION)

The pricing display is determined by **product vendor**, not just member status:

#### For CF Inc Products (Own Brand):
- **Members:** Show dual pricing (Regular Price + Member Price)
- **Non-Members:** Show blurred member price + **"Login for Member Pricing"** button

#### For Third-Party Vendor Products:
- **All Users:** Show single price only (no member pricing)
- **Non-Members:** Show **"Call for More Details - (408) 673-9999"** button

### Vendor Detection Logic
```liquid
{% assign is_own_brand = false %}
{% assign vendor_lower = product.vendor | downcase %}
{% if vendor_lower contains 'cf inc' or vendor_lower contains 'celebrate festival' %}
  {% assign is_own_brand = true %}
{% endif %}
```

### Files Updated with Vendor-Based Logic

| File | Component | CF Inc Products | Other Vendors |
|------|-----------|-----------------|---------------|
| `snippets/product-card.liquid` | Home page, Search | Login for Member Pricing | Call for More Details |
| `sections/main-collection.liquid` | L3 Collection pages | Login for Member Pricing | Call for More Details |
| `sections/collection-level2-hub.liquid` | L2 Collection pages | Login for Member Pricing | Call for More Details |
| `sections/product-celebrate-festival.liquid` | Single Product Page | Blurred price + Login button | Single price + Call button |

---

### PRICING CALCULATION LOGIC (Single Product Page)

The theme uses WSH plugin output + compare_at_price for pricing:

**Two Pricing Cases:**

```liquid
# Case 1: Individual variant pricing (WSH)
# When WSH returns wholesale price lower than product.price
if wcp_price != blank and wcp_price > 0 and wcp_price < product.price
  retail_price = product.price
  member_price = wcp_price (WSH wholesale price)

# Case 2: Bulk discount
# When compare_at_price exists and is greater than product.price
elsif product.compare_at_price != blank and product.compare_at_price > product.price
  retail_price = product.compare_at_price  ← "Regular Price" shown to user
  member_price = product.price             ← "Member Price" shown to user
```

**IMPORTANT:** When member pricing is displayed, the "Regular Price" shown is actually `compare_at_price`, NOT `product.price`. The current `product.price` becomes the member price.

### Member Detection
```liquid
{% assign is_member = false %}
{% if customer %}
  {% if customer.tags contains 'plus-member' or customer.tags contains 'wholesale' or customer.tags contains 'member' %}
    {% assign is_member = true %}
  {% endif %}
{% endif %}
```

---

### WSH WHOLESALE PLUGIN NOTES

- WSH stores individual variant pricing in its own external database
- For full wholesale experience, direct customers to: `/apps/wpdapp/wholesale`
- WSH uses customer tags for discount groups (CPH, ROU, etc.)
- The `wcp_discount` snippet renders WSH prices when available

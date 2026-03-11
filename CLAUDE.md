# Claude Implementation Guide - Celebrate Festival Collection Templates

**Last Updated:** February 12, 2026

---

## MEMORY FILE INSTRUCTIONS

A persistent memory file is maintained at:
`.claude/projects/-home-rajthecypher-projects-celebrate-festival/memory/MEMORY.md`

**Rules for managing it:**
- At the START of each session, read `MEMORY.md` to check for pending tasks
- As tasks are completed during a session, **immediately remove** the completed items from `MEMORY.md`
- Once ALL pending fixes in a section are done, **delete that entire section** from `MEMORY.md`
- Never leave completed tasks in the memory file — stale entries cause confusion and risk reverting work
- Only keep items that are genuinely not yet done

---

## PENDING TASKS (for session continuity)

### TASK 1: Refactor product cards into a single reusable snippet

**Status:** NOT STARTED
**Priority:** HIGH

**Problem:** There are FOUR different inline product card implementations with different CSS class naming conventions:

| Template File | CSS Prefix | Data Attrs | Used On |
|--------------|-----------|-----------|---------|
| `snippets/product-card.liquid` | `price-single`, `price-member-view` | `data-cf-*` | Home page (Staff Picks), some other pages |
| `sections/main-collection-cf.liquid` | `cf-plp__price-box`, `cf-plp__price-label` | `data-cf-*` | Most L3 collection pages, test-pricing-scenarios |
| `sections/main-collection.liquid` | `l3-price-single`, `l3-price-member-view` | `data-cf-*` | Some L3 collection pages |
| `sections/search-results-cf.liquid` | `cf-plp__price-box` (same as main-collection-cf) | `data-cf-*` | Search results |
| `sections/collection-level2-hub-ajax.liquid` | `cf-plp-ajax__price-box`, `cf-plp-ajax__price-label` | `data-product-id` (NO `data-cf-*`) | L2 hub pages (AJAX) — **BDR API NOT WORKING HERE** |

**What needs to happen:**
1. Consolidate all product card HTML into ONE snippet: `snippets/product-card.liquid`
2. All collection sections, search results, L2 hubs, staff picks should use `{% render 'product-card', product: product %}`
3. ONE set of CSS class names (choose one convention and standardize)
4. `cf-wholesale-pricing.js` only needs ONE selector pattern instead of three
5. Any pricing/CTA/design change happens in ONE file

**Current band-aid:** `cf-wholesale-pricing.js` detects all three naming conventions and outputs HTML matching whichever template it finds. This works but is fragile.

**Why this matters:**
- DRY principle — one place to maintain product card logic
- Vendor CTA logic (is_own_brand, is_member) defined once
- `data-cf-*` attributes defined once
- WSH pricing JS simplified to one selector
- Future design changes apply everywhere automatically

### TASK 2: Verify WSH pricing on all page types (logged-in vs logged-out)

**Status:** COMPLETE
**Priority:** HIGH

**Full verification completed Feb 12, 2026:**

**Logged Out:**
- ✅ Collection (L3) — "Price" + "Login for Member Pricing" CTA for CF Inc, "Call for More Details" for third-party
- ✅ Search — Correct vendor CTAs working
- ✅ Home (Staff Picks) — Correct vendor CTAs
- ✅ L2 Hub — Products shown with prices
- ⚠️ SPP — Shows "Price" but **missing "Login for Member Pricing" CTA** on CF Inc products (BUG)

**Logged In (Member - CPH+ROU):**
- ✅ Collection (L3) — Member pricing with Was/Save/Member Price working
- ✅ Search — Member pricing with Was/Save working
- ✅ SPP — Dual-card layout (Regularly + Member Price), variant switching works correctly
- ✅ Home (Staff Picks) — Member pricing working, BDR API called
- ✅ Cart — Prices + member badge showing, BDR API called
- ⚠️ L2 Hub — **BDR API NOT called** — page uses `data-product-id` (not `data-cf-product-id`) and `cf-plp-ajax__*` classes. This is a 4th naming convention not covered by `cf-wholesale-pricing.js`

**Issues found:**
1. L2 Hub AJAX page missing BDR integration entirely (TASK 1 prerequisite — needs refactor)
2. SPP missing "Login for Member Pricing" CTA for logged-out visitors on CF Inc products
3. "Premium Member Price" label still showing (TASK 3)

**Test credentials:** rajesh_kumar@hiraya.digital / Annex@141$ (CPH+ROU tags)

### TASK 3: Simplify pricing labels — remove "Premium Member Price"

**Status:** COMPLETE (Feb 12, 2026)
**Priority:** MEDIUM

**Rule:** There are only TWO pricing labels across the entire site:
- **"Price"** — shown to everyone (regular Shopify price)
- **"Member Price"** — shown to ALL wholesale members (CPH, ROU, any tag)

**Files updated:**
- `layout/theme.liquid` — simplified to `window.cfMemberPriceBadge = "Member Price"` (removed CPH branching)
- `sections/main-collection.liquid` — removed CPH detection + "Premium Member Price" assignment
- `sections/collection-level2-hub.liquid` — removed CPH detection + "Premium Member Price" (x2 instances)
- `sections/product-celebrate-festival.liquid` — removed CPH + wcp_set_prices metafield check
- `assets/cf-wholesale-pricing.js` — updated comment
- `assets/wpd-bridge.js` — updated comment + simplified label check

### TASK 4: Fix compare_at_price display for multi-variant products

**Status:** NOT STARTED
**Priority:** MEDIUM

**Problem:** When a product has `price_varies = true` (multiple variants with different prices), the template shows only a price range ("$100.00 – $300.00") and **skips the compare_at_price strikethrough entirely**. The "SALE" badge appears but the actual crossed-out original price is missing.

**What is compare_at_price?** Shopify's built-in sale mechanism. If `compare_at_price > price`, the product is "on sale". The compare_at_price should show crossed out next to the selling price. This is separate from WSH wholesale pricing.

**Expected behavior for multi-variant products with compare_at_price:**
- If any variant has compare_at_price, show sale indication even in the price range display
- Example: ~~$150.00~~ **$100.00** – ~~$450.00~~ **$300.00** or similar sale indicator

**Affected product:** Test Product 1 - Compare At Price (shows "SALE" badge but no strikethrough)

---

## RECENT FIXES (Feb 16, 2026)

### Fix #1: Search Results Login Redirect
**Issue:** After login from search page, users landed on empty page (search query lost)
**Solution:** Added `return_url` parameter to login buttons to preserve search context
**Files changed:**
- `snippets/product-card.liquid`
- `sections/collection-level1-hub.liquid`
**Testing:** See `TESTING-GUIDE.md` for simple test steps

---
**Reference Mockup:** `webstaurant-red-blue-mockup (1).html`

**⚠️ CREDENTIALS:** All Shopify credentials are stored in `.env` file (not tracked in git). See `.env.example` for template.

**Theme Push Command:** `shopify theme push --theme $SHOPIFY_THEME_ID` (or `shopify theme push --theme 148264910893`)

**API Usage Example:**
```bash
# Load credentials from .env file first
source .env
curl -s "https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/smart_collections.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_API_TOKEN}"
```

---

## WSH WHOLESALE PRICING — BDR API INTEGRATION (February 12, 2026)

### CRITICAL CONTEXT — DO NOT USE LIQUID SNIPPETS FOR PRICING

The store is on the **WSH Global Plan (BDR Integration)**, NOT the Liquid Integration.

**What this means:**
- `wcp_discount` and `wcp_variant` Liquid snippets DO NOT work reliably in collection page product loops
- The Liquid metafields (`wcp_set_prices`) are NOT refreshed during page render on the BDR plan
- All wholesale pricing MUST come from the **BDR API** (client-side JavaScript)

**This was confirmed by the WSH support team (Abdullah, Feb 10, 2026):**
> "The store is on the Global Plan, which mandates the use of the BDR (Backend Data Retrieval) Integration for Wholesale Pricing Discount (WPD). When the integration type is set to BDR, the Liquid metafields and their associated variables are not refreshed during the page render."

### How Pricing Works Now

**Server-side (Liquid):** Renders base Shopify price ("Price: $X.XX") for all users. Shows vendor CTAs based on `is_own_brand` + `is_member`. No WSH Liquid snippet calls.

**Client-side (JavaScript):** `cf-wholesale-pricing.js` calls the BDR API to get wholesale prices and upgrades "Price" to "Member Price" with Was/Save for logged-in members.

### BDR API Endpoint

```javascript
fetch(window.wpdAPIRootUrl + "cost-tree/prices-retrieval/", {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json", "Authorization": authToken },
  body: JSON.stringify({
    admin_domain: window.shopPermanentDomain,
    customer_tags: window.wcp_customer.tags,
    items: items, // array of {variant_id, product_id, compare_at_price, price, quantity, send_vd_table, handle, collection_ids}
    market_currency: window.Shopify.currency.active,
    market_currency_exchange_rate: window.Shopify.currency.rate,
    market_country: window.Shopify.country
  })
})
```

### Auth Token Capture

The BDR API requires an authorization token unique per store. We capture it by intercepting wpd.js's own fetch calls:

```javascript
// In layout/theme.liquid — intercepts wpd.js fetch to BDR API and saves auth token
const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  const url = typeof args[0] === "string" ? args[0] : args[0].url;
  if (url.includes("/bdr.wholesalehelper.io/cost-tree/prices-retrieval")) {
    try {
      const headers = new Headers(args[1]?.headers || {});
      if (headers.has("Authorization")) sessionStorage.setItem("__wpdBdrAuth", headers.get("Authorization"));
    } catch (err) {}
  }
  return originalFetch(...args);
};
```

A hidden trigger element (`#wpd-trigger`) in `theme.liquid` ensures wpd.js makes at least one API call so the token gets captured.

### Files Involved

| File | Role | Status |
|------|------|--------|
| `layout/theme.liquid` | Fetch intercept + wpd.js loading + trigger element + cf-wholesale-pricing.js loading | Working |
| `assets/cf-wholesale-pricing.js` | BDR API client — collects `data-cf-*` elements, calls API, upgrades pricing UI | Working |
| `snippets/product-card.liquid` | Has `data-cf-*` attributes + vendor CTAs + member detection | Restored |
| `sections/main-collection-cf.liquid` | Has `data-cf-*` attributes + vendor CTAs + member detection | Restored |
| `sections/main-collection.liquid` | Has `data-cf-*` attributes + vendor CTAs + member detection (x2 instances) | Restored |
| `sections/search-results-cf.liquid` | Has `data-cf-*` attributes + vendor CTAs + member detection | Restored |
| `sections/product-celebrate-festival.liquid` | Has `data-cf-*` attributes + BDR variant JSON + vendor display branching in JS | Restored |

### data-cf-* Attributes (on every product card / SPP container)

```html
data-cf-product-id="{{ product.id }}"
data-cf-variant-id="{{ product.variants.first.id }}"
data-cf-price="{{ product.variants.first.price }}"
data-cf-compare-at-price="{{ product.variants.first.compare_at_price }}"
data-cf-handle="{{ product.handle }}"
data-cf-collection-ids="{{ product.collections | map: 'id' | join: ',' }}"
```

### Display Flow

1. **Server-side (Liquid):** Render "Price: $X.XX" for all users
2. **Server-side (Liquid):** Show vendor CTAs based on `is_own_brand` + `is_member`
3. **Client-side (JS):** For logged-in members, `cf-wholesale-pricing.js` calls BDR API
4. **Client-side (JS):** If WSH discount exists, upgrade "Price" → "Member Price" with Was/Save
5. **Client-side (JS):** Non-members still see "Price" + their vendor-appropriate CTA

### Test Products

| Product | Regular Price | Member Price (WSH) |
|---------|---------------|-------------------|
| Rational Double Deck 6 Pan Half-Size Electric | $29,676.80 | $22,119.00 |
| Robot Coupe R301 | $2,124.00 | $1,949.00 |
| Patila (multi-variant) | $159.99–$389.99 | Varies per variant |

### Test URLs (Preview Theme)

```
Preview base: https://celebratefestivalinc.myshopify.com?preview_theme_id=148264910893

- Search: /search?q=rational&preview_theme_id=148264910893
- L3 Collection: /collections/commercial-ovens?preview_theme_id=148264910893
- L2 Collection: /collections/food-preparation?preview_theme_id=148264910893
- SPP: /products/robot-coupe-r301?preview_theme_id=148264910893
- Cart: /cart?preview_theme_id=148264910893
- Test Pricing: /collections/test-pricing-scenarios?preview_theme_id=148264910893
```

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

## WSH TECHNICAL REFERENCE (BDR Plan)

**Last Updated:** February 12, 2026

### IMPORTANT: DO NOT USE `wcp_discount` or `wcp_variant` Liquid Snippets

The store is on the **BDR (Global Plan)**. These Liquid snippets exist in the theme but their metafield data is NOT refreshed during page render. They will return stale/incorrect prices, especially in collection loops.

All wholesale pricing comes from the BDR API via `cf-wholesale-pricing.js`.

### Customer Tags & Discount Groups
- WSH uses customer tags for discount group identification
- Known tags: `CPH`, `ROU`
- Member detection checks: `wholesale`, `plus`, `member`, `cph`, `rou`, `margin`
- CPH customers see "Premium Member Price" label; others see "Member Price"

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

**Last Updated:** February 12, 2026

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

The SPP uses the **BDR API** for wholesale pricing:
1. All variant data is embedded as JSON in `#cf-spp-variants-data` script tag
2. `cf-wholesale-pricing.js` sends all variants to the BDR API in one batch call
3. Response populates `variantWshMap` and fires `cf:wholesale-prices-ready` event
4. When users switch variants, JS reads from `variantWshMap` — no additional server calls

**Display logic in JS (updateVariantDisplay):**
- **Member + variant has WSH price:** Dual-card layout (Regularly strikethrough + Member Price)
- **Member + variant has no WSH price:** Single-card layout (just "Price")
- **Non-member + CF Inc product:** Single price + "Login for Member Pricing" CTA
- **Non-member + third-party vendor:** Single price + "Call for More Details" CTA

### Member Detection
```liquid
{% assign is_member = false %}
{% if customer %}
  {% for tag in customer.tags %}
    {% assign tag_lower = tag | downcase %}
    {% if tag_lower contains 'wholesale' or tag_lower contains 'plus' or tag_lower contains 'member' or tag_lower contains 'cph' or tag_lower contains 'rou' or tag_lower contains 'margin' %}
      {% assign is_member = true %}
      {% break %}
    {% endif %}
  {% endfor %}
{% endif %}
```

---

## CRITICAL RULES FOR FUTURE SESSIONS

### DO NOT remove display logic when swapping data sources

When changing WHERE price data comes from (e.g., Liquid → BDR API), do NOT touch HOW prices are displayed:
- **KEEP:** `is_own_brand` vendor detection
- **KEEP:** `is_member` member detection
- **KEEP:** Vendor CTAs ("Login for Member Pricing" / "Call for More Details")
- **KEEP:** Member badge display
- **KEEP:** Pricing mode branching (member-view / non-member-view / single-price)
- **KEEP:** `compare_at_price` sale display (strikethrough + savings %)

### DO NOT use `wcp_discount` or `wcp_variant` Liquid snippets

The store is on BDR plan. These will return stale data in collection loops. Use `cf-wholesale-pricing.js` + BDR API instead.

### DO NOT put `data-wpd-*` attributes on visible pricing elements

wpd.js (still loaded as Shopify App Extension) will find elements with `data-wpd-*` and replace their innerHTML, destroying custom UI. Only the hidden `#wpd-trigger` element in `theme.liquid` should have these.

---

## CLIENT DOCUMENTATION — Word Document Generator

**Last Updated:** February 21, 2026

### Overview

We have a reusable Python system for generating Word (.docx) client guides.

| File | Role |
|------|------|
| `scripts/docs/docx_builder.py` | Reusable base class — import this in every new doc script |
| `scripts/docs/spp_client_guide.py` | Single Product Page data-entry guide |
| `scripts/docs/output/` | All generated `.docx` files land here (not tracked in git) |

### How to Run an Existing Guide

```bash
py -3.13 scripts/docs/spp_client_guide.py
# Output: scripts/docs/output/SPP_Client_Guide.docx
```

### How to Create a New Guide

1. Create a new file in `scripts/docs/`, e.g. `scripts/docs/collection_page_guide.py`
2. Start with this template:

```python
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from docx_builder import DocBuilder

doc = DocBuilder(
    title    = "Your Guide Title",
    subtitle = "Celebrate Festival Inc  |  Topic Name",
    author   = "Hiraya Digital",
)

doc.add_section("Section Name")
doc.add_paragraph("Body text here.")
doc.save("Your_Guide_Filename")   # saves to scripts/docs/output/
```

3. Run: `py -3.13 scripts/docs/your_new_guide.py`

### DocBuilder Method Reference

```python
# Headings
doc.add_section("Title")           # H1, numbered, deep-blue
doc.add_subsection("Title")        # H2, navy
doc.add_subsubsection("Title")     # H3, grey

# Text
doc.add_paragraph("text", bold=False, italic=False, color=None)
doc.add_bullet(["item 1", "item 2"])              # bullet list
doc.add_bullet([("bold item", True), "normal"])   # mixed bold
doc.add_steps(["Step one", "Step two"])           # numbered list
doc.add_spacer()                                  # blank line
doc.add_page_break()

# Callout boxes  (style: 'info' | 'tip' | 'warning' | 'note')
doc.add_info_box("Message here", style="warning")
doc.add_info_box("Message here", style="tip", label="Custom label")

# Tables
doc.add_table(
    headers=["Col A", "Col B", "Col C"],
    rows=[
        ["val1", "val2", "val3"],
        ["val4", "val5", "val6"],
    ],
    col_widths=[Inches(1.5), Inches(2.0), Inches(2.0)],  # optional
)

# Data-entry reference table (6 fixed columns)
# columns: Element | Source | Where in Admin | Format | Example | Notes
doc.add_field_table([
    {
        "element": "Product Title",
        "source":  "Product Admin",
        "where":   "Admin → Products → Title",
        "format":  "Plain text",
        "example": "Rational iCombi Pro",
        "notes":   "Appears as H1",
    },
])

# Save
doc.save("Filename_Without_Extension")  # → scripts/docs/output/Filename_Without_Extension.docx
```

### Colour Constants (CF brand — available as `CF.DEEP_BLUE` etc.)

```python
from docx_builder import CF

CF.DEEP_BLUE   # #1A365D — headers
CF.NAVY        # #2D5A87 — subheadings, links
CF.CORAL       # #FF6B6B — CTAs, badges
CF.SUCCESS     # #10B981 — green states
CF.TEXT_MED    # #475569 — body text
CF.WHITE       # #FFFFFF
```

### Guides Produced So Far

| File | Description | Date |
|------|-------------|------|
| `SPP_Client_Guide.docx` | Single Product Page — all data entry points explained | Feb 21, 2026 |

Use `data-cf-*` attributes for our custom BDR API integration.

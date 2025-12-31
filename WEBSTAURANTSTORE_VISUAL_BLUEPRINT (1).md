# WebstaurantStore Collection Pages - Complete Visual Blueprint

## Purpose
This document provides a detailed breakdown of WebstaurantStore's collection page structure across all 3 hierarchy levels, mapped to your existing Shopify theme components.

---

## LEVEL 1: MAIN CATEGORY PAGE
**Example:** https://www.webstaurantstore.com/restaurant-equipment.html

### PAGE STRUCTURE (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER & MEGA MENU                          │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          BREADCRUMB                                  │
│  Home > Restaurant Equipment                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PAGE TITLE SECTION                             │
│                                                                      │
│  # Restaurant Equipment                                              │
│  ## Reliable Commercial Restaurant Kitchen Equipment...             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         HERO BANNER IMAGE                            │
│                                                                      │
│  [Full-width image: re-header.jpg - ~600px height]                 │
│  Simple image, no text overlay                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              FEATURED SUB-CATEGORIES GRID (4 LARGE CARDS)           │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │   [Image]    │  │   [Image]    │  │   [Image]    │  │ [Image] ││
│  │              │  │              │  │              │  │         ││
│  │ Shop Cooking │  │ Shop         │  │ Shop Work    │  │ Shop    ││
│  │ Equipment    │  │ Refrigeration│  │ Tables       │  │ Food    ││
│  │              │  │              │  │              │  │ Prep    ││
│  │ ## Heading   │  │ ## Heading   │  │ ## Heading   │  │ ##      ││
│  │ Shop 21      │  │ Shop 19      │  │ Shop 23      │  │ Shop 64 ││
│  │ Categories   │  │ Categories   │  │ Categories   │  │ Cat     ││
│  │              │  │              │  │              │  │         ││
│  │ Description  │  │ Description  │  │ Description  │  │ Desc    ││
│  │ text...      │  │ text...      │  │ text...      │  │ ...     ││
│  │              │  │              │  │              │  │         ││
│  │ [4 Quick     │  │ [5 Quick     │  │ [4 Quick     │  │ [4 Quick││
│  │  Links]      │  │  Links]      │  │  Links]      │  │  Links] ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘│
│                                                                      │
│  (2 columns on desktop, stacks on mobile)                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           SECONDARY CATEGORIES CAROUSEL (9 SMALLER CARDS)           │
│                                                                      │
│  Horizontal scrolling carousel with:                                │
│  - Smaller square image cards                                       │
│  - Category title below image                                       │
│  - Link to category                                                 │
│                                                                      │
│  [Img] [Img] [Img] [Img] [Img] [Img] [Img] [Img] [Img]           │
│  Dish   Ranges Fryers Grills Food  Meat  Mixers Outdoor Smart      │
│  Wash                        Proc   Slice                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              MORE SUB-CATEGORIES GRID (4 MORE LARGE CARDS)          │
│                                                                      │
│  Same structure as first grid above - more Level 2 categories       │
│  (Commercial Sinks, Ovens, Food Holding, Storage/Transport)        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           ANOTHER CAROUSEL (8 BRAND/VENDOR CARDS)                   │
│                                                                      │
│  Brand logos in horizontal carousel                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    "TOP PRODUCTS" SECTION                           │
│                                                                      │
│  ## Top Products                                                    │
│                                                                      │
│  Product grid (4 columns on desktop)                                │
│  - Product image                                                    │
│  - Star rating                                                      │
│  - Price                                                            │
│  - Title                                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    RICH TEXT CONTENT SECTION                        │
│                                                                      │
│  ### Reliable Commercial Restaurant Kitchen Equipment...           │
│                                                                      │
│  [Long form content with multiple paragraphs]                      │
│  [Links to resources]                                               │
│  [Additional resource links]                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FOOTER                                     │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### SECTIONS BREAKDOWN FOR LEVEL 1:

| Section # | Section Name | Purpose | Your Theme Equivalent |
|-----------|--------------|---------|----------------------|
| 1 | Breadcrumb | Navigation path | CREATE NEW: collection-breadcrumb.liquid |
| 2 | Page Title | H1 + Subtitle | CREATE NEW: In template or section |
| 3 | Hero Banner | Full-width image | CREATE NEW: collection-hero-banner.liquid |
| 4 | Featured Categories Grid | 4 large cards with images, titles, descriptions, quick links | **REUSE**: featured-categories.liquid + featured-categories.css |
| 5 | Category Carousel | Horizontal scroll of smaller category cards | CREATE NEW OR ADAPT: carousel section |
| 6 | More Categories Grid | Another set of large category cards | **REUSE**: featured-categories.liquid again |
| 7 | Brand/Vendor Carousel | Brand logo carousel | OPTIONAL: Can skip or use existing carousel |
| 8 | Top Products Grid | Featured products | **REUSE**: Existing product grid components |
| 9 | Rich Text Content | SEO content, descriptions, links | **REUSE**: Existing rich text section |

---

## LEVEL 2: SUB-CATEGORY PAGE
**Example:** https://www.webstaurantstore.com/13421/reach-in-refrigerators-and-freezers.html

### PAGE STRUCTURE (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER & MEGA MENU                          │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          BREADCRUMB                                  │
│  Home > Refrigeration Equipment > Reach-In Refrigerators & Freezers │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PAGE TITLE SECTION                             │
│                                                                      │
│  # Reach-In Refrigerators and Freezers                              │
│  ## Keep Cold and Frozen Foods Organized and Properly Stored...     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         HERO BANNER IMAGE                            │
│                                                                      │
│  [Full-width image: reach-in_fridge_freezers_banner.jpg]           │
│  Simple image, no text overlay, ~400px height                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           LEVEL 3 CATEGORIES GRID (3 LARGE CARDS)                   │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │    [Image]      │  │    [Image]      │  │    [Image]      │   │
│  │                 │  │                 │  │                 │   │
│  │ Shop Reach-In   │  │ Shop Reach-In   │  │ Shop Combination│   │
│  │ Refrigerators   │  │ Freezers        │  │ Refrigerators/  │   │
│  │                 │  │                 │  │ Freezers        │   │
│  │ ## Heading      │  │ ## Heading      │  │ ## Heading      │   │
│  │ Shop 555        │  │ Shop 362        │  │ Shop 61         │   │
│  │ Products        │  │ Products        │  │ Products        │   │
│  │                 │  │                 │  │                 │   │
│  │ Description...  │  │ Description...  │  │ Description...  │   │
│  │                 │  │                 │  │                 │   │
│  │ [Quick Links]   │  │ [Quick Links]   │  │ [Quick Links]   │   │
│  │ - Solid Door    │  │ - Solid Door    │  │ - Solid Door    │   │
│  │ - Glass Door    │  │ - Glass Door    │  │ - Glass Door    │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                      │
│  (3 columns on desktop, stacks on mobile)                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│         RELATED CATEGORIES CAROUSEL (4-8 SMALLER CARDS)             │
│                                                                      │
│  Horizontal scrolling carousel with related sub-categories          │
│                                                                      │
│  [Img] [Img] [Img] [Img] [Img] [Img] [Img] [Img]                 │
│  Bottom Top   Bottom Top   Spec  Pass  Spec  Pass                  │
│  Mount  Mount Mount  Mount Line  Thru  Line  Thru                  │
│  Frzrs  Frzrs Refrig Refrig                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    "TOP PRODUCTS" SECTION                           │
│                                                                      │
│  ## Top Products                                                    │
│                                                                      │
│  Product grid (5-6 columns on desktop)                              │
│  - Smaller product cards than Level 1                               │
│  - Product image                                                    │
│  - Star rating                                                      │
│  - Price                                                            │
│  - Title                                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              "OTHER REFRIGERATION EQUIPMENT" SECTION                │
│                                                                      │
│  Related categories links (text + small image)                      │
│  4 columns of related product links                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    RICH TEXT CONTENT SECTION                        │
│                                                                      │
│  ### Keep Cold and Frozen Foods Organized...                        │
│                                                                      │
│  [SEO content with paragraphs]                                      │
│  [Featured resource links]                                          │
│  [Additional resource links]                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FOOTER                                     │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### SECTIONS BREAKDOWN FOR LEVEL 2:

| Section # | Section Name | Purpose | Your Theme Equivalent |
|-----------|--------------|---------|----------------------|
| 1 | Breadcrumb | Navigation path (3 levels) | **REUSE**: collection-breadcrumb.liquid |
| 2 | Page Title | H1 + Subtitle | **REUSE**: Same as Level 1 |
| 3 | Hero Banner | Full-width image | **REUSE**: collection-hero-banner.liquid |
| 4 | Main Categories Grid | 3 large cards for Level 3 categories | **REUSE**: featured-categories.liquid |
| 5 | Related Categories Carousel | Horizontal scroll | **REUSE**: Carousel from Level 1 |
| 6 | Top Products Grid | Featured products | **REUSE**: Existing product grid |
| 7 | Related Links Grid | Text links with small images | CREATE NEW OR SKIP: Optional |
| 8 | Rich Text Content | SEO content | **REUSE**: Existing rich text section |

---

## LEVEL 3: PRODUCT CATEGORY / FILTERED PRODUCTS PAGE
**Example:** https://www.webstaurantstore.com/52705/reach-in-refrigerators.html?filter=door-type:solid

### PAGE STRUCTURE (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER & MEGA MENU                          │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          BREADCRUMB                                  │
│  Home > Refrigeration > Reach-In Refrigerators & Freezers >         │
│  Reach-In Refrigerators                                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PAGE TITLE SECTION                             │
│                                                                      │
│  # Reach In Refrigerators                                           │
│  ## Commercial Reach-In Refrigerators Provide Convenient Storage... │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           "CHOOSE NUMBER OF SECTIONS" QUICK FILTER BAR              │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │                         │
│  │          │  │          │  │          │                         │
│  │1 Section │  │2 Sections│  │3 Sections│                         │
│  └──────────┘  └──────────┘  └──────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────────┐
│                  │                                                  │
│  FILTER SIDEBAR  │           PRODUCTS GRID AREA                     │
│                  │                                                  │
│  Filters:        │  ┌────────────────────────────────────┐         │
│  [ ] Grid        │  │  Toolbar:                          │         │
│  [ ] List        │  │  [555 products] [Sort] [Compare]  │         │
│                  │  └────────────────────────────────────┘         │
│  Sort/Filter     │                                                  │
│  [Dropdown]      │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│                  │  │ Img │ │ Img │ │ Img │ │ Img │ │ Img │     │
│  WebstaurantPlus │  │     │ │     │ │     │ │     │ │     │     │
│  [ ] Eligible    │  │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │     │
│                  │  │$1949│ │$2099│ │$1549│ │$3779│ │$2619│     │
│  Quick Ship      │  │Title│ │Title│ │Title│ │Title│ │Title│     │
│  [ ] Quick Ship  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│                  │                                                  │
│  Brand           │  [... more rows of products ...]                │
│  [ ] Avantco     │                                                  │
│  [ ] Galaxy      │                                                  │
│  [ ] MainStreet  │  ┌──────────────────────────────────┐           │
│  [ ] Beverage-Air│  │       PAGINATION                 │           │
│  [+] Show More   │  │  ◄ 1 2 3 4 5 6 ... 20 ►          │           │
│                  │  └──────────────────────────────────┘           │
│  Sections        │                                                  │
│  [ ] 1 Section   │                                                  │
│  [ ] 2 Sections  │                                                  │
│  [ ] 3 Sections  │                                                  │
│                  │                                                  │
│  Construction    │                                                  │
│  [ ] All SS      │                                                  │
│  [ ] Painted     │                                                  │
│  [ ] SS+Aluminum │                                                  │
│                  │                                                  │
│  Capacity        │                                                  │
│  [Min] to [Max]  │                                                  │
│  [ ] 8-24 cu.ft. │                                                  │
│  [ ] 25-40       │                                                  │
│  [ ] 42-63       │                                                  │
│                  │                                                  │
│  [... more       │                                                  │
│   filters ...]   │                                                  │
│                  │                                                  │
│  Search within   │                                                  │
│  [ Text Input ]  │                                                  │
│                  │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              "OTHER REACH-IN EQUIPMENT" LINKS SECTION               │
│                                                                      │
│  Grid of related category links (4 columns)                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    RICH TEXT CONTENT SECTION                        │
│                                                                      │
│  ### Commercial Reach-In Refrigerators...                           │
│                                                                      │
│  [SEO content]                                                      │
│  [Read more button]                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FOOTER                                     │
│                     (Already built - don't touch)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### SECTIONS BREAKDOWN FOR LEVEL 3/4:

| Section # | Section Name | Purpose | Your Theme Equivalent |
|-----------|--------------|---------|----------------------|
| 1 | Breadcrumb | Full navigation path | **REUSE**: collection-breadcrumb.liquid |
| 2 | Page Title | H1 + Subtitle | **REUSE**: Same structure |
| 3 | Quick Filter Bar | Visual filters for common attributes | CREATE NEW OR SKIP: Optional |
| 4 | Sidebar Filters + Product Grid | **THIS IS YOUR EXISTING main-collection.liquid!** | **✅ ALREADY EXISTS** |
| 5 | Related Links | Related category links | CREATE NEW OR SKIP: Optional |
| 6 | Rich Text Content | SEO content | **REUSE**: Existing rich text section |

**IMPORTANT:** Level 3 that shows products uses your EXISTING `main-collection.liquid` template!

### 💰 MEMBER PRICING (CRITICAL!)

**WebstaurantStore Style Pricing Display:**

Each product card on Level 4 (product listing page) shows:
```
Product Image
★★★★☆ Rating

Plus Member Price: $1,799.00    ← Highlighted/featured price
Regularly: $1,949.00             ← Struck through or de-emphasized

Product Title
```

**Your Theme Already Has This!**
- ✅ Member pricing code already exists (using Shopify plugin)
- ✅ Shows different prices based on customer tags
- ✅ DO NOT modify this functionality - it's working

**What to Verify:**
- Make sure member pricing displays in product cards on `main-collection.liquid`
- Ensure "Plus Member Price" is visually prominent (larger, bold, colored)
- Ensure regular price is de-emphasized (smaller, struck-through, gray)
- Format: 
  ```liquid
  {% if customer.tags contains 'wholesale' or customer.tags contains 'member' %}
    <span class="price--member">Plus Member Price: {{ member_price }}</span>
    <span class="price--regular">Regularly: {{ regular_price }}</span>
  {% else %}
    <span class="price--regular">{{ regular_price }}</span>
  {% endif %}
  ```

---

## COMPONENT MAPPING TO YOUR EXISTING THEME

### ✅ Components You ALREADY HAVE:

| WebstaurantStore Component | Your Theme File | Status |
|---------------------------|-----------------|--------|
| Product Grid with Filters | `main-collection.liquid` | ✅ EXISTS - Use for Level 4 |
| Featured Categories Cards | `featured-categories.liquid` + CSS | ✅ EXISTS - Reuse for category grids |
| Product Cards | Component in main-collection | ✅ EXISTS |
| Header & Mega Menu | `enhanced-header.liquid` | ✅ EXISTS - Don't touch |
| Footer | `custom-footer.liquid` | ✅ EXISTS - Don't touch |

### 🆕 Components You NEED TO CREATE:

| Component | Purpose | Priority |
|-----------|---------|----------|
| `collection-breadcrumb.liquid` | Breadcrumb navigation | **HIGH** |
| `collection-hero-banner.liquid` | Simple image banner section | **HIGH** |
| `collection-page-header.liquid` | Title + subtitle section | **MEDIUM** |
| Carousel/Slider Section | Optional secondary categories | **LOW** |
| Related Links Section | Optional related categories | **LOW** |

---

## TEMPLATE STRUCTURE RECOMMENDATIONS

### Template: collection.level-1.json
```json
{
  "sections": {
    "breadcrumb": {
      "type": "collection-breadcrumb"
    },
    "page_header": {
      "type": "collection-page-header"
    },
    "hero_banner": {
      "type": "collection-hero-banner"
    },
    "featured_categories_1": {
      "type": "featured-categories",
      "settings": {
        "title": "Main Categories"
      }
    },
    "category_carousel": {
      "type": "carousel-section"  // Optional
    },
    "featured_categories_2": {
      "type": "featured-categories",
      "settings": {
        "title": "More Categories"
      }
    },
    "top_products": {
      "type": "featured-collection"  // If exists
    },
    "rich_text": {
      "type": "rich-text"
    }
  },
  "order": [
    "breadcrumb",
    "page_header", 
    "hero_banner",
    "featured_categories_1",
    "category_carousel",
    "featured_categories_2",
    "top_products",
    "rich_text"
  ]
}
```

### Template: collection.level-2.json
```json
{
  "sections": {
    "breadcrumb": {
      "type": "collection-breadcrumb"
    },
    "page_header": {
      "type": "collection-page-header"
    },
    "hero_banner": {
      "type": "collection-hero-banner"
    },
    "sub_categories": {
      "type": "featured-categories",
      "settings": {
        "columns": 3
      }
    },
    "related_carousel": {
      "type": "carousel-section"  // Optional
    },
    "top_products": {
      "type": "featured-collection"
    },
    "rich_text": {
      "type": "rich-text"
    }
  },
  "order": [
    "breadcrumb",
    "page_header",
    "hero_banner",
    "sub_categories",
    "related_carousel",
    "top_products",
    "rich_text"
  ]
}
```

### Template: collection.level-3.json (Product Categories - No Products Yet)
```json
{
  "sections": {
    "breadcrumb": {
      "type": "collection-breadcrumb"
    },
    "page_header": {
      "type": "collection-page-header"
    },
    "quick_filters": {
      "type": "collection-quick-filters"  // Optional visual filters
    },
    "product_categories": {
      "type": "featured-categories",
      "settings": {
        "columns": 3
      }
    },
    "rich_text": {
      "type": "rich-text"
    }
  },
  "order": [
    "breadcrumb",
    "page_header",
    "quick_filters",
    "product_categories",
    "rich_text"
  ]
}
```

### Template: collection.level-4.json (Final Products Display)
```json
{
  "sections": {
    "breadcrumb": {
      "type": "collection-breadcrumb"
    },
    "product_grid": {
      "type": "main-collection"  // ✅ USE EXISTING!
    },
    "rich_text": {
      "type": "rich-text"
    }
  },
  "order": [
    "breadcrumb",
    "product_grid",
    "rich_text"
  ]
}
```

---

## CSS DESIGN NOTES

### Banner Styling (collection-hero-banner)
```css
.collection-hero-banner {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  margin-bottom: 40px;
}

/* On mobile */
@media (max-width: 768px) {
  .collection-hero-banner {
    height: 250px;
  }
}
```

### Page Header Styling
```css
.collection-page-header {
  text-align: center;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.collection-page-header h1 {
  /* Use existing theme's H1 styles */
  margin-bottom: 16px;
}

.collection-page-header h2 {
  /* Use existing theme's subtitle styles */
  font-weight: normal;
  color: var(--color-text-secondary);
}
```

### Category Cards
**USE YOUR EXISTING `featured-categories.css`** - It already has the perfect structure!

---

## KEY DIFFERENCES BETWEEN LEVELS

| Aspect | Level 1 | Level 2 | Level 3 (no products) | Level 4 (products) |
|--------|---------|---------|----------------------|-------------------|
| Breadcrumb | 2 levels | 3 levels | 4 levels | 4 levels |
| Hero Banner | YES - Large | YES - Medium | NO | NO |
| Category Grid | 4-8 large cards | 3 large cards | 3-4 cards | NO |
| Carousel | YES - Optional | YES - Optional | Optional | NO |
| Filter Sidebar | NO | NO | NO | YES |
| Product Grid | Featured only | Featured only | NO | YES - Main content |
| Rich Text | YES | YES | YES | YES |

---

## IMPLEMENTATION PRIORITY

### Phase 1: ESSENTIAL (Must Have)
1. ✅ **collection-breadcrumb.liquid** - Breadcrumb navigation
2. ✅ **collection-hero-banner.liquid** - Simple image banner
3. ✅ **collection-page-header.liquid** - Title + subtitle
4. ✅ **collection.level-1.json** - Main category template
5. ✅ **collection.level-2.json** - Sub-category template
6. ✅ **collection.level-4.json** - Use existing main-collection

### Phase 2: NICE TO HAVE (Optional)
1. ⭕ **collection.level-3.json** - Product category template (if needed)
2. ⭕ **carousel-section.liquid** - Secondary categories carousel
3. ⭕ **collection-quick-filters.liquid** - Visual quick filters
4. ⭕ **related-links-section.liquid** - Related categories

---

## FINAL RECOMMENDATIONS

### DO:
1. ✅ **Reuse `featured-categories.liquid`** for ALL category grids (Level 1, 2, 3)
2. ✅ **Reuse `main-collection.liquid`** for Level 4 products
3. ✅ **Create simple, minimal new sections** (breadcrumb, banner, header)
4. ✅ **Use existing theme's design system** for all styling
5. ✅ **Keep templates simple** - just order sections appropriately

### DON'T:
1. ❌ Don't recreate category card components (use existing featured-categories)
2. ❌ Don't recreate product grid (use existing main-collection)
3. ❌ Don't add complex banner sections (keep it simple - just image)
4. ❌ Don't copy WebstaurantStore's colors/fonts
5. ❌ Don't build carousel unless really needed (optional)

---

## CONCLUSION

The good news: **You already have 70% of what you need!**

**Existing components to reuse:**
- ✅ `featured-categories.liquid` (perfect for category grids)
- ✅ `main-collection.liquid` (perfect for Level 4)
- ✅ Header, footer, product cards (all done)

**New components needed (simple!):**
- 🆕 Breadcrumb section
- 🆕 Hero banner section (just image + height)
- 🆕 Page header section (title + subtitle)

**Templates needed:**
- 🆕 3-4 JSON template files that just order existing sections

This is **very achievable** and most of the heavy lifting is already done in your theme!

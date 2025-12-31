# Research Findings - December 31, 2024

## 1. CELEBRATE FESTIVAL COLOR PALETTE

### Brand Colors (from settings_data.json & custom-footer)
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Gold** | #d4af37 | Contact bar title, accents |
| **Primary Coral/Red** | #ff6b6b | Accents, icons, hover states |
| **Deep Blue** | #1a365d | Backgrounds, social icons, text |
| **Navy** | #2d5a87 | Secondary backgrounds |
| **Dark Background** | #1b2b47 | Footer main |
| **Darkest** | #070c14 | Footer bottom |

### Scheme Colors
| Scheme | Background | Text | Button |
|--------|------------|------|--------|
| Scheme-1 (Default) | #ffffff | #121212 | #121212 |
| Scheme-2 (Cards) | #f3f3f3 | #121212 | #121212 |
| Scheme-3 (Dark Gray) | #242833 | #ffffff | #ffffff |
| Scheme-4 (Black) | #121212 | #ffffff | #ffffff |
| Scheme-5 (Royal Blue) | #334fb4 | #ffffff | #ffffff |

### Newsletter Section
- Gradient: #8b1538 to #ff6b6b
- Button Gradient: #ff6b6b to #e85a4f

---

## 2. LEVEL 3 COLLECTION TEMPLATE ANALYSIS

### Current Configuration (collection.level-3.json)
```json
"products_per_row_desktop": 3,  // NEEDS: 5+
"products_per_row_tablet": 2,
"products_per_row_mobile": 2,
"image_ratio": "adapt",         // NEEDS: "square"
"enable_filtering": true,
"filter_type": "vertical"       // Sidebar filters
```

### Files to Modify
| File | Change Needed |
|------|---------------|
| `templates/collection.level-3.json` | Change image_ratio to "square", columns to 5 |
| `sections/main-collection.liquid` | Extend schema max columns from 5 to 6+ |
| `assets/collection.css` | Add .products-grid[data-columns="6"] rule |
| `assets/collection.css` | Change object-fit: contain to cover for 1:1 |

### Key CSS Lines
- Line 649: height: 250px (product image)
- Line 658: object-fit: contain
- Line 605: grid gap: 30px
- Line 104: sidebar width: 280px

### For Full Width
- Change filter_type to "drawer" or "horizontal"
- Set .collection-grid to grid-template-columns: 1fr

---

## 3. PRODUCT VARIATIONS - ALREADY IMPLEMENTED!

### Current Status: FULLY WORKING
- Variant picker: VariantSelects custom element
- Image switching: Automatic on variant selection
- Event system: PubSub pattern
- Picker types: Swatch, Button, Dropdown

### Files Involved
| File | Purpose |
|------|---------|
| `snippets/product-variant-picker.liquid` | Main picker component |
| `snippets/product-variant-options.liquid` | Option values |
| `assets/global.js` (lines 1063-1126) | VariantSelects class |
| `assets/product-info.js` | Handles variant change |
| `assets/media-gallery.js` | Image gallery management |

### To Show All Variant Images
Change `hide_variants` setting in product-media-gallery.liquid

---

## 4. LEVEL 1 & 2 TEMPLATES ANALYSIS

### Existing Templates
| Template | Columns | Purpose |
|----------|---------|---------|
| collection.level-1.json | 2 | Main category hub |
| collection.level-2.json | 3 | Subcategory hub |

### Section Files
- `sections/collection-level1-hub.liquid`
- `sections/collection-level2-hub.liquid`
- `sections/collection-breadcrumb.liquid`

### How Subcollections Are Linked
```liquid
{% for coll in collections %}
  {% assign parent_val = coll.metafields.custom.parent_handle.value %}
  {% if parent_val == current_handle %}
    <!-- Render child collection -->
  {% endif %}
{% endfor %}
```

### Reusable Patterns for Static Pages
1. 2-column grid (L1) and 3-column grid (L2)
2. Card structure with image + content
3. Hover effects (shadow, transform)
4. Thumbnail navigation row
5. Breadcrumb with Schema.org markup

### Styling Patterns
- Card hover: box-shadow: 0 8px 24px rgba(0,0,0,0.12)
- Card titles: 16-18px bold #1e3a5f
- Image zoom on hover: transform: scale(1.05)
- Subcategory links: 13px, 2-column layout

---

## 5. IMPLEMENTATION SUMMARY

### Quick Wins (Config Changes Only)
1. Change image_ratio to "square" in collection.level-3.json
2. Change products_per_row_desktop to 5
3. Disable hide_variants in product template

### CSS Changes Needed
1. Add .products-grid[data-columns="6"] rule
2. Consider object-fit: cover for true 1:1 crop
3. Adjust responsive breakpoints for 5-6 columns

### Static Pages Required
6 Level 1 pages using existing patterns from collection-level1-hub.liquid

### Menu Structure
Ready in full_menu_structure.json with handles

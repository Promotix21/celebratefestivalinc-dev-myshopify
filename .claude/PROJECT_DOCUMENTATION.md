# Celebrate Festival - Shopify Theme Project Documentation

## Last Updated: December 31, 2024

---

## 1. PAGE STRUCTURE (FINAL ARCHITECTURE)

### 3-Level Hierarchy

| Level | Page Type | Content | Images | Searchable |
|-------|-----------|---------|--------|------------|
| **Level 1** | STATIC PAGE (custom) | Grid of L2 collection cards | YES (manual) | YES |
| **Level 2** | Collection Page (auto) | Grid of L3 collection cards | YES | YES |
| **Level 3** | Collection Page (auto) | PRODUCTS directly | NO (products have images) | YES |

### Key Decisions
- **Level 1 pages are STATIC** - Not Shopify collections
- **Static pages appear in search** - Better SEO
- **L1/L2 collection references redirect** to custom pages
- **Level 3 shows products** - No collection thumbnail images needed

---

## 2. DESIGN REFERENCE

### Source File
`D:\Clients\Hiraya Digital Clients\Celebrate Festival\Shopify-theme-dev\webstaurant-mockup.html`

### Design Pattern by Level

**Level 1 (Main Category Page):**
- Hero banner with background image
- 4-column main category cards with images, descriptions & links
- Icon grid row (8 items)
- Secondary 4-column category cards
- Another icon row
- Brand logos
- Top Products carousel

**Level 2 (Subcategory Page):**
- Hero banner with background image
- 3-column category cards (large image + content)
- 8-column icon grid
- Top Products carousel
- Other Equipment section

**Level 3 (Product Listing Page):**
- Breadcrumb navigation
- Page title + subtitle
- Left sidebar filters (checkboxes)
- Toolbar (grid/list toggle, sort, compare)
- Product grid (5 columns, 1:1 ratio images)
- Variation filters (NEW REQUIREMENT)

### Color Palette
- Use Celebrate Festival colors ONLY
- Keep WebstaurantStore layout/structure

---

## 3. COLLECTION FORMULA ISSUE

### Problem Explanation
Shopify Smart Collections use rules/conditions to auto-populate products.

**The Chain:**
```
Level 1 Collection → includes Level 2 Collection products
Level 2 Collection → includes Level 3 Collection products
Level 3 Collection → has actual products
```

**If Level 2 formula doesn't include Level 3 products:**
- Level 2 shows 0 products
- Level 1 shows 0 products (cascade failure)

**Why "New Theme" collections have products:**
- They have proper rules/conditions set
- Original collections have broken/missing rules

### Solution Options
1. **Static Pages for L1** (chosen) - Bypass collection formulas entirely
2. **Fix collection rules** - Update Smart Collection conditions
3. **Manual collections** - Add products manually (not scalable)

---

## 4. LEVEL 3 PAGE REQUIREMENTS (Product Listing)

### Current Issues to Fix
1. Product images NOT 1:1 ratio
2. Not enough columns
3. Not full width
4. Variations not filterable
5. Variation selection doesn't change product image

### Required Changes
- [ ] 1:1 ratio product images
- [ ] 5-6 columns in product grid
- [ ] Full width layout (no container constraints)
- [ ] Add variation filters to sidebar
- [ ] On variation selection → update product image

---

## 5. SINGLE PRODUCT PAGE REQUIREMENTS

### Current Issues
- Variations not showing
- Image doesn't change on variant selection

### Required Changes
- [ ] Display all product variations
- [ ] Variant selection changes main product image
- [ ] Data exists (same as existing website)

---

## 6. SAFETY RULES

### CRITICAL - DO NOT:
- Touch live/published theme
- Publish code accidentally
- Modify production collections without backup
- Delete collections that might have products

### ALWAYS:
- Work in development theme only
- Test before deploying
- Keep backups of modified files
- Document all changes

---

## 7. DATA FILES

### Source Files
| File | Purpose |
|------|---------|
| `Suggested Navigation Structure to Rajesh.xlsx` | Menu structure (USE THIS) |
| `webstaurant-mockup.html` | Design reference |

### Generated Files
| File | Purpose |
|------|---------|
| `shopify_collections_fresh.json` | All collections with product counts |
| `menu_structure_from_excel.json` | Parsed menu structure |
| `collection_matching_report.json` | Excel vs Shopify matching |

---

## 8. COLLECTION STATUS SUMMARY

### From Latest Analysis (Dec 31, 2024)
- **Total Collections:** 902
- **With Products:** 775
- **Empty (0 products):** 127
- **"New Theme" prefix:** 147 (these have products)

### Level 1 Status
| Category | Handle | Products | Status |
|----------|--------|----------|--------|
| Restaurant Equipment | `restaurant-equipment` | 0 | EMPTY - Use static page |
| Refrigeration | `refrigeration` | 0 | EMPTY - Use static page |
| Smallwares | `smallwares` | 388 | OK |
| Tabletop | `winco-tabletop` | 133 | OK |
| Indian Specialty | `indian-specialty` | 16 | OK |
| Storage and Transport | `storage-and-transport` | 0 | EMPTY - Use static page |

---

## 9. EXISTING PYTHON SCRIPTS

| Script | Purpose |
|--------|---------|
| `create_navigation_graphql.py` | Creates Shopify menu via GraphQL API |
| `bulk_update_collections.py` | Updates collection templates & tags |
| `assign_templates.py` | Assigns level-1/2/3/4 templates |
| `add_collection_metafields.py` | Adds hierarchy metafields |
| `check_collections_in_shopify.py` | Compares Excel vs Shopify |
| `generate_progress_report.py` | Creates Excel progress report |

---

## 10. SHOPIFY API CREDENTIALS

```
Shop: celebratefestivalinc.myshopify.com
API Version: 2024-01
Token: [REDACTED - stored locally in Python scripts]
```

---

## 11. SESSION LOG

### December 31, 2024
- Reviewed all Python scripts (14 total)
- Fetched fresh collection data (902 collections)
- Parsed Excel menu structure (6 sheets, 36 L2, 171 L3)
- Matched Excel to Shopify: 147 found, 31 empty, 34 not found
- Identified "New Theme" collections have products
- Confirmed Level 1 approach: Static pages (not collections)
- Design reference: webstaurant-mockup.html
- Level 3 fixes: 1:1 images, more columns, full width, variation filters
- Product page fixes: Show variations, image change on selection

---

## 12. CLEANUP LIST (Collections with 0 Products)

To be generated - for safe removal when going live.

# Collection Hierarchy Implementation - AUTO-POPULATION Requirements

## OBJECTIVE
Build a collection hierarchy system that **automatically populates** mega menu, category grids, and breadcrumbs from the Excel data structure - NOT manual configuration.

---

## CRITICAL REQUIREMENT: AUTO-POPULATION

### ❌ DO NOT Build:
- Sections that require manual configuration in Theme Customizer
- Hardcoded menu structures
- Static category cards that need manual selection

### ✅ DO Build:
- **Auto-population from collection tags and hierarchy**
- Dynamic category grids that fetch children automatically
- Self-building breadcrumbs from parent tags
- One-time data setup, automatic everywhere else

---

## IMPLEMENTATION REQUIREMENTS

### 1. AUTO-POPULATE MEGA MENU
**Requirement:** Mega menu should automatically build itself from collection hierarchy.

**Logic:**
- Read all collections tagged `level-1` (main categories)
- For each level-1, fetch all collections tagged `parent-{handle}` 
- Build nested menu structure automatically
- Strip "New Theme - " prefix from display names

**Result:** Change Excel → Collections get tagged → Mega menu updates automatically

---

### 2. AUTO-POPULATE CATEGORY GRIDS

**Requirement:** Category cards on Level 1, 2, 3 pages should automatically show child collections.

**Logic:**
```
If collection is tagged "level-1":
  → Fetch all collections tagged "parent-{this-collection-handle}"
  → Display as category cards (use featured-categories.liquid style)

If collection is tagged "level-2":
  → Fetch all collections tagged "parent-{this-collection-handle}"
  → Display as category cards

If collection is tagged "level-3":
  → Fetch all collections tagged "parent-{this-collection-handle}"
  → Display as category cards OR show products if no children
```

**Result:** No manual section configuration needed. Collections organize themselves.

---

### 3. AUTO-BUILD BREADCRUMBS

**Requirement:** Breadcrumbs should automatically construct full hierarchy path.

**Logic:**
- Check collection's tags for `parent-{handle}`
- Lookup parent collection
- Recursively build path up to Level 1
- Strip "New Theme - " prefix
- Format: Home > Level1 > Level2 > Level3 > Current

**Result:** Breadcrumbs update automatically based on tagging structure.

---

### 4. TOGGLE CONTROLS (Optional but Recommended)

Add theme settings to enable/disable auto-population:

**Theme-wide Setting:**
```
☑ Auto-populate from collection hierarchy
☐ Use manual configuration
```

**Section Settings:**
Each section can override:
```
☑ Auto-populate child collections
☐ Manually select collections
```

---

## DATA STRUCTURE (Excel → Shopify)

### Excel Structure:
```
Level 1: Restaurant Equipment
  Level 2: Cooking Equipment
    Level 3: Commercial Grills
      Level 4: New Theme - Griddles
```

### Shopify Collections Structure:
```
Collection: "Restaurant Equipment"
Tags: level-1

Collection: "Cooking Equipment"  
Tags: level-2, parent-restaurant-equipment

Collection: "Commercial Grills"
Tags: level-3, parent-cooking-equipment

Collection: "New Theme - Griddles"
Tags: level-4, parent-commercial-grills
```

### Auto-Population Result:
- Mega menu automatically shows: Restaurant Equipment > Cooking Equipment > Commercial Grills
- Level 1 page automatically displays Level 2 category cards
- Level 2 page automatically displays Level 3 category cards
- Breadcrumbs automatically build full path

---

## COMPONENTS TO BUILD

### 1. collection-breadcrumb.liquid
**Auto-populate:** YES
- Reads collection tags
- Finds parent collections recursively
- Builds breadcrumb path automatically

### 2. collection-page-header.liquid  
**Auto-populate:** YES
- Gets title from collection.title (strips "New Theme - ")
- Gets description from collection.description

### 3. collection-hero-banner.liquid
**Auto-populate:** YES
- Gets image from collection.featured_image
- Simple image display, no text overlay

### 4. collection-category-grid.liquid
**Auto-populate:** YES - THIS IS KEY!
- Determines current collection level from tags
- Fetches all child collections automatically
- Generates category cards dynamically
- Uses existing featured-categories.liquid styling
- NO manual collection selection needed

### 5. Enhanced Mega Menu (if needed)
**Auto-populate:** YES
- Modify existing enhanced-header.liquid 
- Or create mega-menu-auto.liquid
- Reads Level 1 collections
- Builds nested structure from parent tags
- Renders automatically

---

## TEMPLATE STRUCTURE

### collection.level-1.json
```json
{
  "sections": {
    "breadcrumb": { "type": "collection-breadcrumb" },
    "header": { "type": "collection-page-header" },
    "banner": { "type": "collection-hero-banner" },
    "categories": { 
      "type": "collection-category-grid",
      "settings": {
        "auto_populate": true
      }
    },
    "rich_text": { "type": "rich-text" }
  }
}
```

All other templates follow same pattern. Key: `"auto_populate": true`

---

## USER WORKFLOW (After Implementation)

### One-Time Setup:
1. ✅ Create collections in Shopify Admin (from Excel)
2. ✅ Tag each collection:
   - Add level tag: `level-1`, `level-2`, `level-3`, or `level-4`
   - Add parent tag: `parent-{parent-handle}`
3. ✅ Upload featured image to each collection
4. ✅ Assign template to each collection

### Auto-Magic Result:
- ✅ Mega menu populates automatically
- ✅ Category grids populate automatically  
- ✅ Breadcrumbs build automatically
- ✅ Everything links correctly
- ✅ Change tags → Everything updates

### NO Manual Work Needed:
- ❌ No section configuration in Theme Customizer
- ❌ No manual collection selection
- ❌ No hardcoded menu items
- ❌ No manual linking

---

## EXCEL FILE REFERENCE

**File:** `Suggested_Navigation_Structure_to_Rajesh.xlsx`

**Your Task:**
1. Read the Excel structure
2. Understand parent-child relationships
3. Build code that recreates this structure from collection tags
4. Make it automatic, not manual

**Example from Excel:**
```
Refrigeration (Level 1)
  └─ Reach-In Refrigerators and Freezers (Level 2)
      └─ Reach-In Refrigerators (Level 3)
          └─ New Theme - Reach-In Refrigerators (Level 4)
```

**Resulting Tags:**
```
Collection: Refrigeration → level-1
Collection: Reach-In Refrigerators and Freezers → level-2, parent-refrigeration
Collection: Reach-In Refrigerators → level-3, parent-reach-in-refrigerators-and-freezers
Collection: New Theme - Reach-In Refrigerators → level-4, parent-reach-in-refrigerators
```

**Auto-Population Result:**
Everything organizes itself based on these tags.

---

## KEY IMPLEMENTATION POINTS

### Fetching Child Collections (Core Logic):
```liquid
{% comment %}
Get current collection handle and find all children
{% endcomment %}

{% assign current_handle = collection.handle %}
{% assign parent_tag = 'parent-' | append: current_handle %}

{% comment %}
Find all collections that are children of current collection
{% endcomment %}

{% assign child_collections = collections | where_exp: "item", "item.tags contains parent_tag" %}

{% comment %}
Display child collections as category cards
{% endcomment %}

{% for child in child_collections %}
  {% include 'category-card', collection: child %}
{% endfor %}
```

### Stripping "New Theme - " Prefix:
```liquid
{% assign display_title = collection.title | remove: "New Theme - " %}
```

### Level Detection:
```liquid
{% if collection.tags contains "level-1" %}
  {# This is a main category #}
{% elsif collection.tags contains "level-2" %}
  {# This is a sub-category #}
{% elsif collection.tags contains "level-3" %}
  {# This is a product category #}
{% elsif collection.tags contains "level-4" %}
  {# This is final products - use main-collection.liquid #}
{% endif %}
```

---

## SUCCESS CRITERIA

✅ **User creates collections + tags them → Everything works automatically**
✅ **Mega menu builds itself from collection structure**
✅ **Category grids populate themselves with children**
✅ **Breadcrumbs construct themselves from hierarchy**
✅ **No manual Theme Customizer configuration needed**
✅ **Change Excel structure → Re-tag collections → Site updates**
✅ **Member pricing displays correctly in product cards**
✅ **"New Theme - " prefix stripped everywhere**

---

## FILES YOU HAVE ACCESS TO

- ✅ All existing theme files
- ✅ Excel file: `Suggested_Navigation_Structure_to_Rajesh.xlsx`
- ✅ Context document: `COLLECTION_HIERARCHY_CONTEXT.md`
- ✅ Visual blueprint: `WEBSTAURANTSTORE_VISUAL_BLUEPRINT.md`

---

## START IMPLEMENTATION

**Priority Order:**

1. **collection-breadcrumb.liquid** (with auto-build logic)
2. **collection-page-header.liquid** (auto-pulls from collection)
3. **collection-hero-banner.liquid** (auto-pulls featured image)
4. **collection-category-grid.liquid** (auto-fetches children - MOST IMPORTANT!)
5. **CSS for new components**
6. **Templates (.json files)**
7. **Test with sample collections**

**Remember:**
- Use existing `featured-categories.liquid` styling for category cards
- Use existing `main-collection.liquid` for Level 4 products
- Reuse existing theme design system (colors, fonts, spacing)
- Keep member pricing functionality (already working)

**GO!** Build the auto-population system. User should only need to tag collections once, then everything works automatically.

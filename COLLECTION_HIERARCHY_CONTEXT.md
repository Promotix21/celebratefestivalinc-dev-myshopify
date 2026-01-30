# Collection Hierarchy Implementation - Context Document

## PROJECT OVERVIEW

**Client:** Celebrate Festival Inc (https://celebratefestivalinc.com/)
**Objective:** Implement a 3-4 level collection hierarchy system similar to WebstaurantStore's navigation structure

---

## BACKGROUND & HISTORY

### The Problem
The previous developer created a Shopify store for Celebrate Festival Inc without properly understanding how to structure collections. The result was:
- Collections exist but are not organized logically
- No clear hierarchy or parent-child relationships
- No template logic to determine which page layout to display at which level
- The client's business model requires WebstaurantStore-style categorization for their restaurant equipment supply business

### What's Already Completed ✅
1. **Theme Structure** - Header, footer, and mega menu are fully designed and functional
2. **Single Product Page** - Completed and approved by client
3. **Member Pricing Feature** - Code already integrated (uses Shopify plugin to show different prices to different customer tags/groups)
4. **Final Product Listing Design** - The shopping page where products display is already designed
5. **Mega Menu** - Already created with proper navigation structure (code is in the theme files)

### What We're Building NOW 🎯
**Collection page templates for 3-4 hierarchy levels** that will:
- Display different layouts depending on the collection's level in the hierarchy
- Follow WebstaurantStore's organizational structure (not visual design)
- Use the existing theme's design system (colors, buttons, typography, components)
- Handle the parent-child collection relationships properly

---

## COLLECTION HIERARCHY STRUCTURE

The client has provided an Excel file (`Suggested_Navigation_Structure_to_Rajesh.xlsx`) that defines their desired hierarchy.

### Hierarchy Levels Explained:

#### **LEVEL 1: Main Categories**
Examples: "Restaurant Equipment", "Refrigeration", "Smallwares", "Tabletop", "Indian Specialty"
- These are the top-level navigation items
- Should display a grid of Level 2 categories
- Template: Shows category cards with images linking to sub-categories

#### **LEVEL 2: Sub-Categories** 
Examples: 
- Under "Refrigeration" → "Reach-In Refrigerators and Freezers", "Merchandising Refrigeration"
- Under "Restaurant Equipment" → "Cooking Equipment", "Commercial Ovens"
- Should display a grid of Level 3 categories
- Template: Shows sub-category cards with images linking to collections

#### **LEVEL 3: Product Categories**
Examples:
- Under "Reach-In Refrigerators and Freezers" → "Reach-In Refrigerators", "Reach-In Freezers"
- Under "Cooking Equipment" → "Commercial Grills and Griddles", "Commercial Ranges and Burners"
- Should display a grid of Level 4 collections OR show products if this is the final level
- Template: Category cards OR product listing with filters

#### **LEVEL 4: Final Collections (Product Display)**
Examples: "New Theme - Griddles", "New Theme - Reach-In Refrigerators", "New Theme - Wire Shelving"
- These are the actual Shopify collections containing products
- Should display products in a grid with filtering sidebar
- Template: Full product listing page with filters (already designed)

### Example Hierarchy Flow:
```
Main Category: Refrigeration (Level 1)
  └─ 2nd Category: Reach-In Refrigerators and Freezers (Level 2)
      └─ 3rd Category: Reach-In Refrigerators (Level 3)
          └─ Collection: New Theme - Reach-In Refrigerators (Level 4 - PRODUCTS)
```

---

## EXCEL FILE STRUCTURE

**File:** `Suggested_Navigation_Structure_to_Rajesh.xlsx`

### Important Sheets:
- **Restaurant Equipment** - 57 rows of hierarchy
- **Refrigeration** - 36 rows of hierarchy  
- **Smallwares** - 39 rows of hierarchy
- **Tabletop** - 44 rows (has 4 levels!)
- **Indian Specialty** - 25 rows (has 4 levels!)
- **Storage Transport** - 24 rows of hierarchy

### Column Structure:
- **Column 1:** Main Category (Level 1)
- **Column 2:** 2nd Category (Level 2)
- **Column 3:** 3rd Category (Level 3)
- **Column 4:** Collection Name OR 4th Category (Level 4)

### Key Notes:
1. **"New Theme -" Prefix:** All new collections are named "New Theme - [Name]" - this prefix should be STRIPPED from display names
   - Shopify collection: "New Theme - Griddles"
   - Display on site: "Griddles"

2. **NaN Values:** Empty cells appear as "NaN" - these indicate the category continues from the previous row

3. **Some Collections May Not Exist:** Not all collections in the Excel have been created in Shopify yet - handle gracefully

4. **No Metafields:** Collection levels are identified purely through Shopify collections structure, not metafields

---

## DESIGN REFERENCE - WEBSTAURANTSTORE

**Purpose:** Use WebstaurantStore as a STRUCTURAL reference, NOT a visual design reference

### Reference URLs:
1. **Main Category Page:** https://www.webstaurantstore.com/restaurant-equipment.html
2. **Sub-Category Page:** https://www.webstaurantstore.com/13421/reach-in-refrigerators-and-freezers.html
3. **Product Listing with Filters:** https://www.webstaurantstore.com/52705/reach-in-refrigerators.html?filter=door-type:solid

### What to Borrow from WebstaurantStore:
✅ **STRUCTURE/CONCEPT:**
- 3-4 level hierarchy navigation pattern
- Grid layout for displaying categories
- Left sidebar filter structure (for product pages)
- Product card arrangement and grid system
- Breadcrumb navigation pattern
- Category organization logic
- How sub-categories are displayed as cards
- Filter functionality and UI patterns

❌ **DO NOT Copy:**
- Colors, fonts, or brand-specific styling
- Exact spacing/padding values
- Button designs
- WebstaurantStore's visual identity
- Their specific color schemes

### What to Use Instead:
✅ **USE EXISTING THEME'S:**
- Color scheme and palette
- Button styles and components
- Typography and font families
- Spacing system and grid
- Existing design system components
- Brand identity elements
- Component styling that already exists in the theme

**Think:** "Borrow the blueprint, not the paint job"

---

## TECHNICAL IMPLEMENTATION REQUIREMENTS

### 1. Collection Level Identification
**Challenge:** Determine which level (1, 2, 3, or 4) a collection belongs to

**Possible Approaches:**
- Collection tags (e.g., `level-1`, `level-2`, `level-3`, `level-4`)
- Collection handle naming convention analysis
- Parent-child relationships through collection references
- Metafields (if we decide to add them)

**Recommended:** Use collection tags for simplicity and flexibility

### 2. Template Logic
Create 3-4 different collection page templates:

**Template 1: Level 1 (Main Category)**
- Display grid of Level 2 sub-category cards
- Each card links to the Level 2 collection page
- Include category images and names
- Breadcrumb: Home > [Main Category]

**Template 2: Level 2 (Sub-Category)**
- Display grid of Level 3 category cards
- Each card links to the Level 3 collection page
- Include category images and names
- Breadcrumb: Home > [Main Category] > [Sub-Category]

**Template 3: Level 3 (Product Category)**
- Could show Level 4 collections as cards OR
- Could show products directly if this is the final level
- Breadcrumb: Home > [Main Category] > [Sub-Category] > [Product Category]

**Template 4: Level 4 (Final Product Display)**
- Full product listing with filtering sidebar (ALREADY DESIGNED)
- Product grid layout
- Filter options in left sidebar
- Sort options
- Pagination
- Member pricing display (already coded)
- Breadcrumb: Full path

### 3. "New Theme -" Prefix Removal
**Rule:** Strip "New Theme - " from all display names

```liquid
{% assign display_name = collection.title | remove: "New Theme - " %}
```

### 4. Child Collection Fetching
For Level 1-3 templates, need to fetch and display child collections:
- Query collections that belong to the next level
- Display them as grid cards with images
- Link to the appropriate child collection page

### 5. Breadcrumb Navigation
Implement breadcrumb that shows the full hierarchy path:
```
Home > Refrigeration > Reach-In Refrigerators and Freezers > Reach-In Refrigerators
```

### 6. Filtering System (Level 4 Only)
- Left sidebar with filter options
- Filter by attributes like:
  - Brand
  - Price range
  - Features
  - Specifications
- Use existing theme's filter component styling

---

## DESIGN SPECIFICATIONS FROM WEBSTAURANTSTORE

### Level 1-2 Category Grid Layout:
- **Grid:** 3-4 columns depending on viewport
- **Category Cards Include:**
  - Category image (featured image)
  - Category name
  - Optional: Number of products or short description
  - Hover effect on cards
- **Responsive:** Stack to 2 columns on tablet, 1 column on mobile

### Level 3-4 Product Listing Layout:
- **Layout:** Sidebar + Product Grid
- **Sidebar (Left):** 
  - Filter options
  - Collapsible filter sections
  - Checkbox/radio selections
  - Apply filters button
- **Product Grid (Right):**
  - 3-4 products per row (desktop)
  - Product card includes: image, title, price, rating
  - Member pricing display (if applicable)
  - Quick view option
  - Add to cart button

### Filtering Features to Implement:
- Brand filter
- Price range slider
- Feature checkboxes (multiple selections)
- Section filter (1 Section, 2 Sections, 3 Sections)
- Construction type filter
- Capacity filter
- Door type filter
- Other relevant attributes based on product type

---

## EXISTING THEME INTEGRATION

### Member Pricing
- Already coded and integrated
- Uses Shopify plugin to detect customer tags
- Shows different prices to different customer groups
- DO NOT modify this functionality - it works

### Theme Components to Reuse
- Button components
- Card components
- Grid system
- Color variables
- Typography scale
- Spacing system
- Icon set
- Form elements

### Files to Reference
- Check existing product listing template for product card design
- Review header/mega menu for navigation patterns
- Use existing color scheme from CSS/theme settings
- Follow existing button and link styling

---

## STEP-BY-STEP IMPLEMENTATION GUIDE

### Phase 1: Collection Setup & Tagging
1. Review all collections in Shopify
2. Tag collections with their appropriate level (`level-1`, `level-2`, `level-3`, `level-4`)
3. Ensure collection handles match Excel structure
4. Add featured images to collections where needed

### Phase 2: Template Creation
1. Create `collection.level-1.liquid` template
2. Create `collection.level-2.liquid` template  
3. Create `collection.level-3.liquid` template
4. Create `collection.level-4.liquid` (or use/modify existing collection template)

### Phase 3: Template Logic Development
1. Implement collection level detection logic
2. Build child collection fetching logic
3. Create category card component/snippet
4. Implement breadcrumb navigation
5. Build filter sidebar for product pages

### Phase 4: Styling & Theming
1. Apply existing theme's design system
2. Ensure responsive behavior
3. Test hover states and interactions
4. Verify member pricing displays correctly
5. Cross-browser testing

### Phase 5: Content Population & Testing
1. Populate collection content based on Excel
2. Add featured images to collections
3. Test navigation flow through all levels
4. Verify filtering works correctly
5. Test member pricing integration
6. Mobile responsiveness testing

---

## CRITICAL REMINDERS

### DO:
✅ Use existing theme's design system completely
✅ Strip "New Theme - " prefix from display names
✅ Implement 3-4 level hierarchy as per Excel structure
✅ Use WebstaurantStore as STRUCTURAL reference only
✅ Make it responsive and mobile-friendly
✅ Preserve existing member pricing functionality
✅ Create clear breadcrumb navigation
✅ Handle cases where collections don't exist yet

### DON'T:
❌ Copy WebstaurantStore's visual design or colors
❌ Break existing member pricing functionality  
❌ Modify header, footer, or mega menu (already done)
❌ Change existing product page design (already approved)
❌ Display "New Theme - " prefix in any user-facing text
❌ Create new design system - use what exists

---

## SUCCESS CRITERIA

The implementation is successful when:

1. ✅ Collections display in proper 3-4 level hierarchy
2. ✅ Navigation flows naturally from main categories down to products
3. ✅ Each level displays the appropriate template (grid or product listing)
4. ✅ Filtering works on product listing pages
5. ✅ Breadcrumbs accurately reflect hierarchy path
6. ✅ "New Theme -" prefix is removed from all display names
7. ✅ Member pricing continues to work correctly
8. ✅ Design matches existing theme (not WebstaurantStore)
9. ✅ Responsive on all devices
10. ✅ Client can easily manage and add new collections

---

## QUESTIONS TO RESOLVE DURING IMPLEMENTATION

1. **Collection Tagging:** Should we use tags or another method to identify levels?
2. **Missing Collections:** How to handle categories in Excel that don't have collections yet?
3. **Image Fallbacks:** What placeholder images to use if collection has no featured image?
4. **Filter Attributes:** Which product metafields/tags should be used for filtering?
5. **Mega Menu Sync:** Does mega menu need updating to reflect new structure?

---

## REFERENCE LINKS

- **Excel File:** `Suggested_Navigation_Structure_to_Rajesh.xlsx` (provided separately)
- **Client Site:** https://celebratefestivalinc.com/
- **WebstaurantStore Examples:**
  - Main: https://www.webstaurantstore.com/restaurant-equipment.html
  - Category: https://www.webstaurantstore.com/13421/reach-in-refrigerators-and-freezers.html
  - Products: https://www.webstaurantstore.com/52705/reach-in-refrigerators.html?filter=door-type:solid

---

## THEME CLEANUP & FILE MANAGEMENT

### The Cleanup Challenge
This theme started as Dawn but has been heavily customized. Many original Dawn theme files may no longer be necessary. We need to clean up the theme while being careful not to break existing functionality.

### Cleanup Objectives
1. **Remove Dawn remnants** that are not needed
2. **Keep the theme lean** - no unnecessary files or code
3. **Don't break anything** that's currently working
4. **Maintain all customizations** that have been built

### Files Safe to Review for Removal

**Candidate Files for Cleanup:**
- Unused Dawn sections that were never customized
- Default Dawn templates that have been completely replaced
- Sample/demo content files
- Unused Dawn snippets
- Redundant asset files (CSS/JS that's been replaced)
- Dawn-specific documentation files

**Check Before Removing:**
- Unused collection templates (if you created new ones)
- Old/backup versions of customized files
- Dawn marketing/promotional sections not used
- Default Dawn color scheme files (if completely replaced)

### Files to KEEP (Dependencies)

**NEVER Remove:**
- Base Dawn architecture files that theme depends on
- Core Liquid files used by Shopify
- Any file referenced in sections/templates currently in use
- Schema files
- Localization files
- Settings files (theme settings schema)

### How to Identify if a File is Still Needed

**Before deleting ANY file, verify:**

1. **Check References:**
   ```bash
   # Search for file references across theme
   grep -r "filename" ./
   ```

2. **Review Include/Render Statements:**
   - Search for `{% include 'filename' %}`
   - Search for `{% render 'filename' %}`
   - Search for `{% section 'filename' %}`

3. **Check Asset Pipeline:**
   - Look for CSS/JS file references in theme.liquid
   - Check for asset_url references

4. **Test After Removal:**
   - Remove file
   - Test all pages thoroughly
   - If anything breaks, restore immediately

### Systematic Cleanup Approach

**Phase 1: Inventory**
1. List all theme files
2. Categorize: Dawn original vs Customized vs New
3. Identify which pages use which files

**Phase 2: Safe Removal**
1. Start with obviously unused files:
   - Unused section files
   - Sample content
   - Unused templates
2. Test after each removal
3. Commit to version control before deleting

**Phase 3: Consolidation**
1. Merge duplicate functionality
2. Remove redundant code
3. Optimize asset loading

### Files NOT TO WORRY ABOUT

**Checkout Pages:**
- Checkout templates are managed by Shopify
- Theme changes don't affect checkout
- No need to customize or clean up checkout-related files

**System Files:**
- Config files
- Settings_schema.json
- Settings_data.json
- Locales folder

### Best Practices During Implementation

**DO:**
✅ Keep version control/backups before deleting anything
✅ Test thoroughly after each cleanup
✅ Document what was removed and why
✅ Remove files one at a time, not in bulk
✅ Check dependencies before removing
✅ Keep a "removed_files" log

**DON'T:**
❌ Delete files in bulk without checking
❌ Remove anything you're not 100% sure about
❌ Delete without testing first
❌ Remove files just because they say "dawn" in the name
❌ Delete schema or config files
❌ Remove files during active development

### Red Flags - Keep These

**If a file contains any of these, research before removing:**
- Layout files (theme.liquid, etc.)
- Files referenced in settings_schema.json
- Files with "base", "core", "main" in the name
- Files that other files depend on
- CSS/JS files loaded globally

### When Adding New Collection Templates

**Keep it Clean:**
1. Only add files specifically needed for collection hierarchy
2. Reuse existing snippets/components where possible
3. Don't duplicate code - create reusable snippets
4. Follow existing theme naming conventions
5. Comment your code for future maintenance

**New Files Will Include:**
- `collection.level-1.liquid` (or similar)
- `collection.level-2.liquid` (or similar)
- `collection.level-3.liquid` (or similar)
- Possibly a snippet for category cards
- Possibly a snippet for breadcrumbs (if doesn't exist)
- Any necessary supporting snippets

**Don't Add:**
- Redundant versions of existing components
- Duplicate functionality
- Unnecessary helper files
- Excessive new CSS (use existing theme styles)

### Testing After Cleanup

**Test These Pages After ANY File Removal:**
1. Homepage
2. Collection pages (all levels)
3. Product pages
4. Cart page
5. Header navigation (mega menu)
6. Footer
7. Member pricing functionality
8. Search functionality

**If ANY page breaks:**
- Immediately restore the removed file
- Document it as a dependency
- Keep it in the theme

---

## FINAL NOTES

This is a complex but achievable implementation. The key is understanding that we're building a hierarchical navigation system that mirrors WebstaurantStore's STRUCTURE while maintaining our own DESIGN identity.

Take time to:
1. Study the Excel structure thoroughly
2. Understand the existing theme's components
3. Plan the template logic before coding
4. Test each level independently before moving to the next
5. Clean up unnecessary files carefully and systematically

The existing theme files will have all the styling you need - reference them heavily. Focus on getting the structure and logic right, then apply the existing visual design system.

**Remember:** It's better to keep an unused file than to break functionality. When in doubt, leave it in.

---

## DESIGN SPECIFICATIONS V2 - WEBSTAURANT RED/BLUE MOCKUP (December 2024)

**Reference File:** `webstaurant-red-blue-mockup (1).html`

### Brand Color Palette (Celebrate Festival)

| Purpose | Color | Hex Code |
|---------|-------|----------|
| Primary Dark (Hero, Headers, Titles) | Deep Blue | #1a365d |
| Primary Accent (Links, Buttons, Accents) | Navy | #2d5a87 |
| CTA/Counts (Badges, Action Items) | Coral | #ff6b6b |
| Special Accents (Ratings, Highlights) | Gold | #d4af37 |
| Success (Free Shipping Badge) | Green | #10b981 |
| Text Dark | - | #0f172a |
| Text Medium | - | #475569 |
| Text Light | - | #64748b |
| Text Muted | - | #94a3b8 |
| Border | - | #e2e8f0 |
| Background Light | - | #f8fafc |
| Background White | - | #ffffff |

### Image Specifications

**ALL IMAGES ARE 1:1 RATIO (SQUARE)**

| Element | Dimensions | Notes |
|---------|------------|-------|
| L1 Main Category Card | 160x160px | Square, object-fit: cover |
| L1 Icon Categories | 80x80px | Square icons |
| L1 Secondary Categories | 160x160px | Square image |
| L2 Category Cards | 200x200px | Larger square cards |
| L2 Icon Grid | 90x90px | Square icons |
| L3 Product Cards | 160x160px | Square product images |

### Exact Spacing & Padding (Compact Style)

**Global:**
- Page wrapper: max-width: 1280px
- Border radius (cards): 12px
- Border radius (buttons): 6px

**Level 1 & 2:**
| Element | Value |
|---------|-------|
| Hero banner height | 220px |
| Hero content padding | 0 40px |
| Main sections padding | 40px |
| Category grid gap | 24px |
| Card content padding | 20px |
| Icon sections padding | 30px 40px |
| Section header margin-bottom | 28px |

**Level 2 Specific:**
| Element | Value |
|---------|-------|
| L2 category grid gap | 28px |
| L2 card content padding | 24px |
| L2 icon section padding | 30px 40px |
| L2 icon grid gap | 16px |

**Level 3 (Product Listing):**
| Element | Value |
|---------|-------|
| Breadcrumb padding | 16px 40px |
| Page header padding | 30px 40px |
| Filters sidebar width | 260px |
| Filters sidebar padding | 24px |
| Products area padding | 24px 30px |
| Product grid gap | 20px |
| Product card padding | 20px |
| Toolbar margin-bottom | 24px |

### Hover Effects

**Level 1 & 2 - Category Card Image Hover:**
```css
/* On hover: Dark overlay with category name centered */
.category-card:hover .category-image::after {
  content: attr(data-category-name);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 54, 93, 0.85); /* Deep Blue with opacity */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
}
```

**Level 3 - Product Image Hover:**
- On hover: Image switches to show variation/alternate product images
- Mini gallery dots at bottom (optional)
- Smooth fade transition between images
- Uses product.media for multiple images

### Grid Layouts

**Level 1:**
- Main Categories: 4 columns (gap: 24px)
- Icon Row: 9 items (flex, justify-content: space-between)
- Secondary Categories: 4 columns (gap: 24px)
- Brands: flex row (justify-content: space-between)
- Products Carousel: horizontal scroll

**Level 2:**
- Category Cards: 3 columns (gap: 28px)
- Icon Grid: 8 columns (gap: 16px)
- Products Carousel: horizontal scroll
- Other Equipment: horizontal scroll

**Level 3:**
- Layout: 260px sidebar + fluid products area
- Product Grid: 4 columns (gap: 20px)
- Responsive: 3 cols @ 1200px, 2 cols @ 992px

### Component Specifications

**Hero Banner (L1 & L2):**
- Height: 220px
- Background: linear-gradient(135deg, #1a365d 0%, #0f172a 100%)
- Animated gradient sweep effect
- Floating decorative shapes (circles with low opacity)
- Content: Tagline pill + Title + Subtitle

**Tagline Pill:**
- Background: rgba(255, 107, 107, 0.2)
- Border: 1px solid rgba(255, 107, 107, 0.3)
- Padding: 6px 14px
- Border-radius: 50px
- Font: 11px, 600 weight, uppercase

**Category Card:**
- Border: 1px solid #e2e8f0
- Border-radius: 12px
- Hover: border-color: #2d5a87, shadow, translateY(-4px)
- Image: 160x160px (L1) or 200x200px (L2)
- Content padding: 20px
- Title: Montserrat, 16px, 700 weight
- Count link: 12px, Coral color, with arrow
- Description: 13px, #64748b
- Sub-links: Blue with dot prefix

**Section Title:**
- Font: Montserrat, 22px, 700 weight
- Color: Deep Blue
- Left accent bar: 4px wide, gradient from Coral to Navy

**Product Card (L3):**
- Padding: 20px
- Border-radius: 12px
- Badge: top-left, Deep Blue background
- Image: 160x160px square
- Fuel type pill: sky blue background
- Title: 13px, 600 weight, min-height: 54px
- SKU: 11px, muted
- Price box: gradient background (pale blue), 14px padding, rounded
- Price: Montserrat, 22px, 800 weight, Coral color
- Free shipping badge: Green gradient, rounded pill
- Add to Cart: Navy gradient button

### WSH Wholesale Pricing Integration

**Existing Feature:** The theme already has WSH wholesale pricing integrated
- Uses Shopify plugin to detect customer tags
- Shows different prices to members vs non-members
- DO NOT modify this functionality

**Display in Templates:**
- Show "Member Price" label in price box
- Show regular/compare-at price with strikethrough
- Price box uses gradient background to highlight savings

### Critical Logic Rules

**1. Hide Empty Categories:**
```liquid
{% for child in collection.links %}
  {% if child.links.size > 0 %}
    <!-- Only show categories that have sub-categories -->
  {% endif %}
{% endfor %}
```

**2. Strip "New Theme -" Prefix:**
```liquid
{% assign display_name = collection.title | remove: "New Theme - " %}
```

**3. Collection Level Detection:**
- Use template suffix: `level-1`, `level-2`, `level-3`
- Each level has its own JSON template file

### Symmetry Guidelines (MAIN CONCERN)

1. **Equal spacing** - All gaps and margins must be consistent
2. **Aligned grids** - Cards must align perfectly in rows
3. **Consistent card heights** - Use min-height where needed
4. **Balanced layouts** - Left/right padding must match
5. **Uniform image sizes** - All 1:1 ratio, same dimensions per section
6. **Centered content** - Icons, text must be centered in their containers
7. **Matching hover states** - All cards behave the same on hover

### Files to Create/Update

**Templates (JSON):**
- `templates/collection.level-1.json`
- `templates/collection.level-2.json`
- `templates/collection.level-3.json`

**Sections (Liquid):**
- `sections/collection-level1-hub.liquid` - REWRITE
- `sections/collection-level2-hub.liquid` - REWRITE
- `sections/main-collection-level3.liquid` - UPDATE

**Assets (CSS):**
- `assets/collection-hierarchy.css` - Consolidated styles

### Menu Integration

The templates work with menu `cf-menu-31-12-2026` which has:
- 6 Level 1 categories (Restaurant Equipment, Refrigeration, Smallwares, Tabletop, Indian Specialty, Storage and Transport)
- Nested Level 2 and Level 3 items
- All sub-items restored and functional

---

## IMPLEMENTATION CHECKLIST

- [ ] Update brand colors throughout templates
- [ ] Set all images to 1:1 ratio
- [ ] Apply exact spacing from mockup
- [ ] Implement category image hover overlay (L1/L2)
- [ ] Implement product image switch hover (L3)
- [ ] Add logic to hide empty categories
- [ ] 4-column grid for L1
- [ ] 3-column grid for L2
- [ ] 4-column grid + 260px sidebar for L3
- [ ] 220px hero banner with animation
- [ ] Section title with gradient accent bar
- [ ] Price box with gradient background
- [ ] Free shipping badge styling
- [ ] Ensure symmetry across all elements
- [ ] Test with WSH wholesale pricing
- [ ] Push and verify on preview theme

Good luck! 🚀

---

## SPECIAL CASE: TABLETOP HAS 4 LEVELS (Unique)

**IMPORTANT:** While most primary categories have 3 levels, **Tabletop is the ONLY category with 4 levels** in the hierarchy.

### Tabletop 4-Level Structure:

```
LEVEL 1: Tabletop
├── LEVEL 2: YANCO PRODUCT COLLECTION (Special Brand Page - see below)
├── LEVEL 2: Dinnerware
│   ├── LEVEL 3: China Dinnerware
│   │   ├── LEVEL 4: China Plates
│   │   ├── LEVEL 4: China Bowls
│   │   ├── LEVEL 4: China Platters
│   │   ├── LEVEL 4: China Cups
│   │   └── LEVEL 4: China Mugs
│   ├── LEVEL 3: Porcelain Dinnerware
│   │   ├── LEVEL 4: Porcelain Plates
│   │   ├── LEVEL 4: Porcelain Bowls
│   │   ├── LEVEL 4: Porcelain Platters
│   │   └── LEVEL 4: Porcelain Cups & Mugs
│   ├── LEVEL 3: Melamine Dinnerware
│   │   ├── LEVEL 4: Melamine Bowls
│   │   ├── LEVEL 4: Melamine Plates
│   │   ├── LEVEL 4: Melamine Platters
│   │   ├── LEVEL 4: Melamine Cups
│   │   └── LEVEL 4: Melamine Mugs
│   ├── LEVEL 3: Stoneware Dinnerware
│   │   └── LEVEL 4: Stoneware Plates (others have no products)
│   ├── LEVEL 3: Plastic Dinnerware
│   │   ├── LEVEL 4: Plastic Barware
│   │   └── LEVEL 4: Plastic Tumblers
│   ├── LEVEL 3: Metal Dinnerware (few products - not added)
│   └── LEVEL 3: Glass Dinnerware (few products - not added)
├── LEVEL 2: Beverage Service Supplies
│   └── LEVEL 3: Beverage Dispensers, Condiment Organizers, Pitchers, etc.
├── LEVEL 2: Flatware
└── LEVEL 2: Beverageware
    └── LEVEL 3: Mugs, Cups, Saucers, etc.
```

### Template Assignment for Tabletop Hierarchy:
- **Tabletop (L1)**: `level-1` template
- **Dinnerware, Beverage Service (L2)**: `level-2` template
- **China Dinnerware, Melamine Dinnerware (L3)**: `level-3` template (shows subcategory cards)
- **China Plates, Melamine Bowls (L4)**: `level-3` template (shows products - this is the final level)

---

## SPECIAL CASE: YANCO PRODUCT COLLECTION (Brand Page)

**YANCO PRODUCT COLLECTION** is NOT a regular collection - it's a **special brand page** that was created as a Shopify Page (not Collection).

### Live Page URL:
`https://celebratefestivalinc.com/pages/yanco-main-page`

### What YANCO PRODUCT COLLECTION Contains:
This page displays all Yanco Melamine collections organized as a brand showcase page. These are existing collections in Shopify:

```
YANCO MELAMINE COLLECTIONS (39 total):
├── yanco-melamine-accessories
├── yanco-melamine-bamboo-style
├── yanco-melamine-bay-shell
├── yanco-melamine-birmingham
├── yanco-melamine-birmingham-green
├── yanco-melamine-birmingham-teal
├── yanco-melamine-black-pearl-1
├── yanco-melamine-black-red
├── yanco-melamine-catering
├── yanco-melamine-compartment
├── yanco-melamine-coupe-pattern
├── yanco-melamine-deli-collection
├── yanco-melamine-discover
├── yanco-melamine-gn-pan-collection
├── yanco-melamine-honda
├── yanco-melamine-houston
├── yanco-melamine-japanese
├── yanco-melamine-longevity-chinese-style
├── yanco-melamine-mexico
├── yanco-melamine-milando
├── yanco-melamine-mile-stone
├── yanco-melamine-moderne
├── yanco-melamine-nessico
├── yanco-melamine-olive
├── yanco-melamine-orchis
├── yanco-melamine-osaka
├── yanco-melamine-peony-chinese-style
├── yanco-melamine-pine-tree
├── yanco-melamine-rome
├── yanco-melamine-serving-trays
├── yanco-melamine-sesame
├── yanco-melamine-soul
├── yanco-melamine-venice
├── yanco-melamineware-collection
├── yanco-melamine-wood-bamboo
├── yanco-melamine-wooden-tray-1
├── yanco-melamine-wooden-tray-2
├── yanco-melamine-woodland
└── yanco-melamine-yoto
```

### Implementation for YANCO:
- **Template:** `collection.brand.json` with `collection-brand-hub.liquid` section
- **Collection Handle:** `yanco-product-collection`
- **Menu Handle:** `cf-menu-31-12-2026`
- **Features:**
  - Brand logo display
  - Brand description
  - Grid of Yanco subcollections (the 39 melamine pattern collections above)
  - Products aggregated from subcollections if main collection is empty

### Why YANCO is Different:
The client organized YANCO differently because:
1. YANCO is a vendor/brand, not a product category
2. YANCO products are organized by pattern/style collections (Rome, Houston, etc.)
3. The live theme had this as a special page `/pages/yanco-main-page`
4. Excel sheet notes: "Existing Vendor Page - Well structured"

---

## DINNERWARE SUBCATEGORIES (L3 under Tabletop > Dinnerware)

These Level 3 collections should show Level 4 product collections as cards:

| L3 Collection | Handle | L4 Products Collections |
|---------------|--------|-------------------------|
| China Dinnerware | china-dinnerware | china-plates, china-bowls, china-platters, china-cups, china-mugs |
| Porcelain Dinnerware | porcelain-dinnerware | porcelain-plates, porcelain-bowls, porcelain-platters, porcelain-cups |
| Melamine Dinnerware | melamine-dinnerware | melamine-bowls, melamine-plates, melamine-platters, melamine-cups, melamine-mugs |
| Stoneware Dinnerware | stoneware-dinnerware | stoneware-plates (only one with products) |
| Plastic Dinnerware | plastic-dinnerware | plastic-barware, plastic-tumblers |

### New Collections Created:
- `stoneware-dinnerware` (ID: 312516771885) - Template: level-3

---

## CART DRAWER IMPLEMENTATION NOTES

### Issue Fixed (January 2026):
The cart drawer was not opening after add-to-cart because:
1. `cart_type` setting was `"notification"` instead of `"drawer"`
2. JavaScript innerHTML replacement was losing event listeners

### Cart Drawer Fix Applied To:
- `sections/main-collection.liquid` (L3 pages)
- `sections/collection-level1-hub.liquid` (L1 pages)
- `sections/collection-level2-hub.liquid` (L2 pages)

### Correct Cart Drawer Code Pattern:
```javascript
// Fetch and update cart drawer, then open
fetch('/?sections=cart-drawer,cart-icon-bubble')
  .then(res => res.json())
  .then(sections => {
    const cartDrawerHtml = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');
    const newDrawerInner = cartDrawerHtml.querySelector('#CartDrawer');
    const currentDrawerInner = document.querySelector('#CartDrawer');
    if (newDrawerInner && currentDrawerInner) {
      currentDrawerInner.innerHTML = newDrawerInner.innerHTML;
    }

    // Re-attach overlay click handler
    cartDrawer.classList.remove('is-empty');
    const overlay = cartDrawer.querySelector('#CartDrawer-Overlay');
    if (overlay) {
      overlay.addEventListener('click', () => cartDrawer.close());
    }
    cartDrawer.open();
  });
```

---

# Claude Code Prompt: Shopify Product Template - Celebrate Festival Inc Style

## Context & Important Notes

**DO NOT DELETE OR MODIFY:**
- Existing files: `sections/product-webstaurant-improved.liquid`
- Existing files: `assets/product-webstaurant-improved.css`
- Existing files: `templates/product.webstaurant-improved.json`
- These were previous attempts that were rejected - leave them alone

**Your Task:**
Create a NEW Shopify product template based on the HTML file I'm providing, using Celebrate Festival Inc's branding and color palette.

---

## Source Files

**Reference HTML Template:**
`/mnt/user-data/outputs/product-template-celebrate-festival-style.html`

This HTML contains the complete layout, styling, and structure you need to replicate in Shopify.

---

## File Structure to Create

```
sections/
  └── product-celebrate-festival.liquid

assets/
  └── product-celebrate-festival.css
  └── product-celebrate-festival.js (if needed)

templates/
  └── product.celebrate-festival.json
```

---

## Critical Requirements

### 1. Demo Mode Toggle
**Must have a schema setting:**
```liquid
{
  "type": "checkbox",
  "id": "show_demo_data",
  "label": "Show Demo Data",
  "default": false,
  "info": "Enable to preview design with sample data. Disable for live products."
}
```

**Behavior:**
- **Demo Mode ON**: Show full design with dummy/placeholder data for ALL sections
- **Demo Mode OFF**: Only show sections that have actual product data
- Client needs to see complete design before filling all product information

### 2. Metafields Support - CRITICAL

**You MUST research Shopify metafield documentation to handle ALL data types correctly.**

The template MUST support displaying:

1. **Text metafields** (single line, multi-line)
2. **Image metafields** (files)
3. **PDF metafields** (file downloads)
4. **Array/List metafields** (multiple values)
5. **Number metafields**
6. **Boolean metafields**
7. **JSON metafields**

**Search the internet and confirm:**
- How to check if a metafield exists
- How to check metafield type
- How to render images from metafields
- How to render file downloads (PDFs, documents)
- How to loop through array metafields
- Error handling when metafield type doesn't match expected format

**Example Use Cases:**
- Product A: Specifications stored as TEXT in metafield
- Product B: Specifications stored as IMAGE (photo of spec sheet) in metafield
- Both must display without errors

### 3. Specifications Section in Sidebar

**Must support multiple input methods:**

```liquid
{# Option 1: Text-based specifications #}
{% if product.metafields.custom.specifications_text %}
  {# Display as key-value table #}
{% endif %}

{# Option 2: Image-based specifications #}
{% if product.metafields.custom.specifications_image %}
  {# Display image #}
{% endif %}

{# Option 3: JSON/Structured specifications #}
{% if product.metafields.custom.specifications_json %}
  {# Parse and display as table #}
{% endif %}
```

### 4. Smart Related Products System

**Default Behavior:**
- Section title: "Other Products from this Line"
- Shows products from same collection OR same vendor

**Conditional Logic:**
Create settings for category-based related products:

```liquid
{
  "type": "text",
  "id": "related_title_default",
  "label": "Default Related Products Title",
  "default": "Other Products from this Line"
},
{
  "type": "collection",
  "id": "related_collection_default",
  "label": "Default Related Products Collection"
}
```

**Advanced: Category-based overrides**

If product type/tag matches specific criteria, show different products with different title:

Example:
- Product Type = "Gas Stove" → Title: "Cleaning Products for Gas Stoves" → Collection: "stove-cleaning"
- Product Type = "Refrigerator" → Title: "Refrigerator Accessories" → Collection: "refrigerator-parts"

Create schema settings to configure multiple conditional rules.

### 5. Layout Structure (From HTML)

**Two-Column Layout:**
- Left: Main content (65-70% width)
- Right: Sidebar (400px width)

**Left Column Sections:**
1. Product title & metadata
2. Vertical thumbnails + Main image (with zoom on hover)
3. "Other Products from this Line" (horizontal slider, hidden scrollbar)
4. Product description with feature icons
5. Q&A section
6. Product comparison table
7. Customer reviews with rating breakdown
8. Related products (horizontal slider, hidden scrollbar)

**Right Column (Sidebar):**
1. Price box (member/non-member pricing)
2. Shipping alerts
3. Quantity selector & Add to Cart
4. Instant Access Shipping info
5. Promotional banner (Beverage-Air style)
6. Parts & Service banner
7. **SPECIFICATIONS TABLE** ← Must support text/image/JSON
8. Resources & Documents
9. Additional Resources banner
10. Help/Contact info

### 6. Key Features from HTML

**Image Zoom:**
- Hover over main image = 1.2x scale
- Smooth transition
- Cursor: zoom-in

**Horizontal Sliders:**
- Product cards with image LEFT, text RIGHT
- Hidden scrollbar (scrollbar-width: none)
- Smooth scroll behavior
- Card structure: 70px image + product name + price

**Pricing:**
- Non-member price (large, coral color)
- Member price (green color, smaller)
- Savings badge

**Reviews:**
- Overall rating display
- Star rating breakdown with visual bars
- Individual review items
- Verified purchase badges

---

## Color Palette (Celebrate Festival Inc)

```css
--primary-navy: #1a2332;
--primary-coral: #ff6b6b;
--secondary-teal: #4ecdc4;
--accent-gold: #ffd93d;
--accent-orange: #ff9a3d;
--success-green: #6bcf7f;
--neutral-dark: #2d3748;
--neutral-gray: #cbd5e0;
--neutral-light: #f7fafc;
--text-light: #718096;
--gradient-coral: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
--gradient-ocean: linear-gradient(135deg, #4ecdc4 0%, #44a3a3 100%);
```

**Typography:**
- Headings: 'Playfair Display', serif
- Body: 'Poppins', sans-serif

---

## Schema Settings to Include

1. **Demo Mode**
   - Toggle for showing demo data

2. **Pricing**
   - Enable member pricing
   - Member discount percentage
   - Shipping alert text

3. **Specifications**
   - Metafield selector for specs (text/image/json)
   - Fallback to manual input

4. **Related Products**
   - Default collection
   - Default title
   - Conditional rules (multiple entries)
   - Products per slide

5. **Q&A Section**
   - Enable/disable
   - Manual Q&A entries (if metafield not available)

6. **Reviews**
   - Enable/disable
   - Use Shopify product reviews app OR manual entries

7. **Sidebar Banners**
   - Brand banner (title, description, features)
   - Service banner (title, description, services list, CTA)
   - Resources banner (video links, guide links)

---

## Testing Checklist

Before considering this complete, test:

- [ ] Demo mode ON shows full design
- [ ] Demo mode OFF hides empty sections
- [ ] Text specifications display correctly
- [ ] Image specifications display correctly
- [ ] PDF downloads work
- [ ] Array metafields loop correctly
- [ ] Related products slider works (hidden scrollbar)
- [ ] Image zoom on hover works
- [ ] Member/non-member pricing displays
- [ ] Reviews section renders
- [ ] Q&A section renders
- [ ] Comparison table displays
- [ ] Mobile responsive (all sections)
- [ ] No JavaScript errors in console
- [ ] No liquid errors in theme editor

---

## Research Required

**Before coding, search the internet for:**

1. "Shopify metafield types liquid examples"
2. "How to display image metafields in Shopify liquid"
3. "Shopify file metafield download link"
4. "Shopify metafield array loop liquid"
5. "Check if Shopify metafield exists liquid"
6. "Shopify product reviews liquid code"
7. "Shopify related products by collection liquid"

**Confirm your approach handles all metafield edge cases.**

---

## Success Criteria

1. Template appears in Shopify theme customizer
2. Can be selected from product template dropdown
3. With demo mode ON: Full design visible with dummy data
4. With demo mode OFF: Only populated sections show
5. Client can compare Product A (text specs) vs Product B (image specs) - both work perfectly
6. Related products change based on product type/category
7. No errors in any scenario (missing data, wrong metafield type, etc.)

---

## Additional Notes

- Maintain semantic HTML structure
- Use Shopify sections best practices
- Make all content editable via schema settings when possible
- Add helpful info text to schema settings
- Use BEM or similar CSS methodology
- Comment complex liquid logic
- Optimize for performance (lazy load images, etc.)

---

## File Naming Convention

Use prefix `celebrate-festival` for all files to avoid conflicts:
- `product-celebrate-festival.liquid`
- `product-celebrate-festival.css`
- `product-celebrate-festival.js`
- `product.celebrate-festival.json`

---

## Final Deliverables

1. Liquid section file with all logic
2. CSS file with Celebrate Festival styling
3. JavaScript file (if needed for sliders, zoom, etc.)
4. JSON template file for theme customizer
5. Brief README explaining:
   - How to enable template
   - How to configure settings
   - How to set up metafields
   - Demo mode usage

---

**Remember:** The client rejected previous attempts. This time, ensure:
- ALL metafield types work
- Demo mode accurately shows final design
- Related products are smart and configurable
- No sections break when data is missing
- Design matches the HTML exactly

Good luck!

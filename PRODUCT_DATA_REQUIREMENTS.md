# Product Data Requirements & Setup Guide
## Celebrate Festival Inc - WebstaurantStore Style Product Pages

**Document Version:** 1.0
**Date:** November 6, 2025
**Purpose:** This document outlines all data requirements needed to implement WebstaurantStore-style product pages

---

## Table of Contents
1. [Priority Level Definitions](#priority-level-definitions)
2. [Existing Metafields Audit](#existing-metafields-audit)
3. [New Metafields Required](#new-metafields-required)
4. [Collection Strategy](#collection-strategy)
5. [Tagging Strategy](#tagging-strategy)
6. [Product Relationship Examples](#product-relationship-examples)
7. [Data Entry Checklist](#data-entry-checklist)
8. [Time Estimates](#time-estimates)

---

## Priority Level Definitions

| Priority | Symbol | Meaning | Impact if Missing |
|----------|--------|---------|-------------------|
| **CRITICAL** | 🔴 | Must have for basic functionality | Page won't display properly, features broken |
| **IMPORTANT** | 🟡 | Needed for full experience | Features work but limited, missing key sections |
| **OPTIONAL** | 🟢 | Nice to have, enhances experience | Minimal impact, graceful fallback |

---

## Existing Metafields Audit

### 1. `custom.warranty_document` [File]
- **Priority:** 🟡 IMPORTANT
- **Current Status:** ⚠️ Partially filled
- **Used For:** Warranty tab - displays downloadable warranty PDF
- **Format:** Single file upload (PDF preferred)
- **Action Required:** Upload warranty documents for products that include warranty
- **Example:**
  ```
  File: "Avantco_SS-2F-HC_Warranty.pdf"
  Display: "Download Warranty Document" button in Warranty tab
  ```
- **Fallback:** If empty, shows generic warranty text with contact information

---

### 2. `custom.specification` [Rich Text / JSON]
- **Priority:** 🔴 CRITICAL
- **Current Status:** ⚠️ Partially filled, not categorized
- **Used For:** Specifications table section
- **Current Format:** Unstructured text/HTML
- **Required Format:** Categorized structure
- **Action Required:**
  1. Organize specs into categories
  2. Fill for ALL products
  3. Use consistent naming

- **Example Format (JSON structure):**
  ```json
  {
    "Overall Dimensions": {
      "Width": "54 inches",
      "Depth": "31 1/2 inches",
      "Height": "82 3/4 inches"
    },
    "Interior Dimensions": {
      "Capacity": "49 cu. ft.",
      "Shelves": "6 adjustable"
    },
    "Electrical": {
      "Voltage": "115 Volts",
      "Amperage": "9.6 Amps",
      "Phase": "1 Phase",
      "Plug Type": "NEMA 5-15P"
    },
    "Construction": {
      "Exterior Material": "Stainless steel",
      "Interior Material": "Aluminum",
      "Door Type": "Solid"
    },
    "Operational": {
      "Temperature Range": "-10°F to 0°F",
      "Refrigerant": "R290",
      "Compressor Power": "1/2 HP"
    }
  }
  ```

- **Alternative Format (Rich Text with HTML table):**
  ```html
  <h3>Overall Dimensions</h3>
  <table>
    <tr><td>Width</td><td>54 inches</td></tr>
    <tr><td>Depth</td><td>31 1/2 inches</td></tr>
    <tr><td>Height</td><td>82 3/4 inches</td></tr>
  </table>

  <h3>Electrical</h3>
  <table>
    <tr><td>Voltage</td><td>115 Volts</td></tr>
    <tr><td>Phase</td><td>1 Phase</td></tr>
  </table>
  ```

---

### 3. `custom.certifications` [Text]
- **Priority:** 🟡 IMPORTANT
- **Current Status:** ❌ Not filled for most products
- **Used For:** Certification badge display
- **Format:** Comma-separated text
- **Action Required:** Add certifications for products that have them
- **Example:**
  ```
  ETL US, ETL Sanitation, NSF, cETL, ENERGY STAR
  ```
- **Common Certifications:**
  - ETL US (electrical safety)
  - ETL Sanitation (food safety)
  - NSF (food equipment certification)
  - cETL (Canadian certification)
  - CE (European conformity)
  - UL (Underwriters Laboratories)
  - ENERGY STAR (energy efficiency)

---

### 4. `custom.warranty` [Rich Text]
- **Priority:** 🟡 IMPORTANT
- **Current Status:** ⚠️ Partially filled
- **Used For:** Warranty tab text content
- **Format:** Rich text / HTML
- **Action Required:** Add warranty terms for each product
- **Example:**
  ```html
  <h3>Manufacturer Warranty</h3>
  <p><strong>Parts and Labor:</strong> 1 year from date of purchase</p>
  <p><strong>Compressor:</strong> 5 years parts and labor</p>

  <h4>Coverage Includes:</h4>
  <ul>
    <li>Defects in materials and workmanship</li>
    <li>Compressor failure</li>
    <li>Factory parts replacement</li>
  </ul>

  <h4>Exclusions:</h4>
  <ul>
    <li>Damage from improper installation</li>
    <li>Normal wear and tear</li>
    <li>Cosmetic damage</li>
  </ul>

  <p>For warranty service, contact us at (408) 673-9999</p>
  ```

---

### 5. `custom.key_features` [Text / List]
- **Priority:** 🔴 CRITICAL
- **Current Status:** ⚠️ Some products have it
- **Used For:**
  - Feature bullet points in product info section
  - Feature accordion sections
- **Format:** Pipe-separated (|) or JSON array
- **Action Required:** Add 6-10 key features per product

- **Example (Pipe-separated):**
  ```
  49 cu. ft. interior capacity with 6 adjustable shelves|Stainless steel exterior with aluminum interior|Self-closing solid doors with recessed handles|Temperature range of -10°F to 0°F|Bottom-mounted 1/2 HP compressor|4" heavy-duty casters for easy mobility|Digital temperature display and controls|Energy-efficient R290 refrigerant|ETL Sanitation and ETL US certified
  ```

- **Example (For Feature Accordion - needs image links):**
  ```json
  [
    {
      "title": "Convenient Capacity",
      "description": "With 49 cu. ft. of interior space and 6 adjustable shelves, this freezer provides ample storage for all your frozen goods. The adjustable shelving allows you to customize the interior layout.",
      "image": "shopify://shop_images/freezer-interior-capacity.jpg"
    },
    {
      "title": "Strong and Sturdy Construction",
      "description": "Built with a durable stainless steel exterior and aluminum interior, this freezer is designed to withstand the demands of busy commercial kitchens while maintaining a professional appearance.",
      "image": "shopify://shop_images/freezer-construction.jpg"
    }
  ]
  ```

---

### 6. `custom.instructions_manual` [File]
- **Priority:** 🟡 IMPORTANT
- **Current Status:** ⚠️ Partially filled
- **Used For:** Resources section - instruction manual download
- **Format:** PDF file upload
- **Action Required:** Upload instruction manuals where available
- **Example:**
  ```
  File: "Avantco_SS-2F-HC_Installation_Manual.pdf"
  Display: "Download Installation & User Manual" in Resources section
  ```

---

### 7. `custom.specification_sheet` [File]
- **Priority:** 🟡 IMPORTANT
- **Current Status:** ⚠️ Some products have it
- **Used For:** Resources section - spec sheet download
- **Format:** PDF file upload
- **Action Required:** Upload spec sheets for technical details
- **Example:**
  ```
  File: "Avantco_SS-2F-HC_SpecSheet.pdf"
  Display: "Download Technical Specifications" in Resources section
  ```

---

### 8. Other Existing Metafields
- `custom.reorder_inventory_point1` - 🟢 OPTIONAL (internal use)
- `custom.purchased_from_country` - 🟢 OPTIONAL (internal use)
- `custom.shipment_text` - 🟡 IMPORTANT (displays shipping info)
- `custom.shipment_text_sub` - 🟢 OPTIONAL (additional shipping details)
- `custom.shipment_tooltip_text` - 🟢 OPTIONAL (tooltip for shipping info)

---

## New Metafields Required

### 1. `custom.works_with_products` [Product List Reference]
- **Priority:** 🔴 CRITICAL
- **Type:** List of product references
- **Used For:** "Works With" carousel section
- **How to Create:**
  1. Go to Shopify Admin → Settings → Custom Data → Products
  2. Add definition: "Works With Products"
  3. Type: Product → List of products
  4. Namespace: `custom.works_with_products`

- **How to Fill:**
  - For each main product, select 4-6 related/compatible products
  - Think: What accessories, parts, or complementary items go with this?

- **Example 1 - Tandoor Oven:**
  ```
  Selected Products:
  - Tandoor Skewers (Set of 12)
  - Clay Hot Rocks (10 Pack)
  - Tandoor Cleaning Brush
  - Replacement Clay Pot Insert
  - Naan Bread Paddle
  - Temperature Gauge
  ```

- **Example 2 - Commercial Refrigerator:**
  ```
  Selected Products:
  - Replacement Door Gasket
  - Additional Shelf (Adjustable)
  - Temperature Monitoring System
  - Caster Wheels (Set of 4)
  - Door Lock Kit
  ```

- **Example 3 - Gas Range:**
  ```
  Selected Products:
  - Gas Range Cleaning Kit
  - Replacement Burner Grates
  - Griddle Top Attachment
  - Oven Thermometer
  - Drip Pan Set
  ```

---

### 2. `custom.member_price` [Decimal]
- **Priority:** 🟡 IMPORTANT
- **Type:** Decimal/Money
- **Used For:** Display member-exclusive pricing
- **How to Create:**
  1. Settings → Custom Data → Products
  2. Add definition: "Member Price"
  3. Type: Decimal or Money
  4. Namespace: `custom.member_price`

- **How to Fill:**
  - Calculate member price (typically 5-10% off regular price)
  - Leave empty if no member discount available

- **Example:**
  ```
  Product: Commercial Freezer
  Regular Price: $2,619.00
  Member Price: $2,469.00 (5.7% discount)

  Product: Tandoor Oven
  Regular Price: $1,299.00
  Member Price: $1,199.00 (7.7% discount)
  ```

---

### 3. `custom.feature_sections` [JSON / Metaobject]
- **Priority:** 🔴 CRITICAL
- **Type:** JSON text or Metaobject
- **Used For:** Feature accordion sections (WebstaurantStore style)
- **How to Create:**
  1. Settings → Custom Data → Products
  2. Add definition: "Feature Sections"
  3. Type: JSON (as multi-line text) or create Metaobject
  4. Namespace: `custom.feature_sections`

- **Format:**
  ```json
  [
    {
      "title": "Feature Title Here",
      "description": "Detailed description of this feature. Explain benefits and technical details.",
      "image": "shopify://shop_images/feature-image.jpg"
    },
    {
      "title": "Next Feature",
      "description": "More detailed information...",
      "image": "shopify://shop_images/feature-image-2.jpg"
    }
  ]
  ```

- **Example - Commercial Refrigerator:**
  ```json
  [
    {
      "title": "Convenient Capacity",
      "description": "With 49 cu. ft. of interior space and 6 adjustable shelves, this freezer provides ample storage for all your frozen goods. The adjustable shelving allows you to customize the interior layout to accommodate items of various sizes.",
      "image": "shopify://shop_images/refrigerator-interior-capacity.jpg"
    },
    {
      "title": "Strong and Sturdy Construction",
      "description": "Built with a durable stainless steel exterior and aluminum interior, this freezer is designed to withstand the demands of busy commercial kitchens while maintaining a professional appearance that's easy to clean.",
      "image": "shopify://shop_images/refrigerator-construction.jpg"
    },
    {
      "title": "Self-Closing Doors",
      "description": "The self-closing solid doors with stay-open feature ensure that the unit maintains proper temperature while providing easy access during busy service periods. Recessed handles protect against damage in tight spaces.",
      "image": "shopify://shop_images/refrigerator-doors.jpg"
    },
    {
      "title": "Digital Temperature Control",
      "description": "Easy-to-read digital display and precise electronic controls allow you to maintain optimal temperature settings. Temperature range of -10°F to 0°F keeps your products perfectly frozen.",
      "image": "shopify://shop_images/refrigerator-controls.jpg"
    },
    {
      "title": "Bottom-Mounted Compressor",
      "description": "The bottom-mounted 1/2 HP compressor design keeps the unit running efficiently while allowing for easy maintenance access. This placement also protects the compressor from heat exposure.",
      "image": "shopify://shop_images/refrigerator-compressor.jpg"
    },
    {
      "title": "Mobility and Convenience",
      "description": "Four heavy-duty 4-inch casters make it easy to move the freezer for cleaning or repositioning. Front casters include brakes to keep the unit secure during operation.",
      "image": "shopify://shop_images/refrigerator-casters.jpg"
    }
  ]
  ```

- **Example - Tandoor Oven:**
  ```json
  [
    {
      "title": "Authentic Clay Construction",
      "description": "Traditional clay-lined interior provides authentic tandoor cooking experience, reaching temperatures up to 900°F for perfect naan, kebabs, and tandoori dishes. The clay retains heat evenly for consistent results.",
      "image": "shopify://shop_images/tandoor-clay-interior.jpg"
    },
    {
      "title": "Gas-Powered Efficiency",
      "description": "Natural gas or propane operation provides precise temperature control and faster heating compared to traditional charcoal tandoors. Adjustable flame control allows you to maintain optimal cooking temperature.",
      "image": "shopify://shop_images/tandoor-gas-burner.jpg"
    },
    {
      "title": "Insulated Exterior",
      "description": "Double-wall stainless steel construction with insulation keeps exterior cool to touch while maintaining intense internal heat. Safe for busy kitchen environments.",
      "image": "shopify://shop_images/tandoor-exterior.jpg"
    },
    {
      "title": "Large Cooking Capacity",
      "description": "Spacious 36-inch interior depth allows you to cook multiple naan breads or skewers simultaneously. Internal diameter of 20 inches provides ample working space.",
      "image": "shopify://shop_images/tandoor-capacity.jpg"
    }
  ]
  ```

---

### 4. `custom.free_shipping` [Boolean]
- **Priority:** 🟡 IMPORTANT
- **Type:** True/False
- **Used For:** Display "Free Shipping" badge
- **How to Create:**
  1. Settings → Custom Data → Products
  2. Add definition: "Free Shipping"
  3. Type: True/False
  4. Namespace: `custom.free_shipping`

- **How to Fill:**
  - Check "Yes" if product qualifies for free shipping
  - Check "No" for products that don't qualify

---

### 5. `custom.protection_plan_price` [Decimal]
- **Priority:** 🟢 OPTIONAL
- **Type:** Decimal/Money
- **Used For:** Display custom protection plan pricing
- **How to Fill:**
  - Leave empty to auto-calculate (10% of product price)
  - Or enter specific price if different

- **Example:**
  ```
  Product Price: $2,619.00
  Protection Plan: $78.99 (leave empty to auto-calculate)

  Product Price: $8,500.00
  Protection Plan: $299.00 (custom pricing for expensive items)
  ```

---

### 6. `custom.installation_available` [Boolean]
- **Priority:** 🟢 OPTIONAL
- **Type:** True/False
- **Used For:** Show "Installation Services Available" section
- **How to Fill:**
  - Check "Yes" if installation services are offered
  - Typically for heavy equipment (refrigerators, ovens, dishwashers)

---

### 7. `custom.quick_shipping` [Boolean]
- **Priority:** 🟢 OPTIONAL
- **Type:** True/False
- **Used For:** Display "Quick Shipping" badge
- **How to Fill:**
  - Check "Yes" for in-stock items that ship within 1-2 business days

---

### 8. `custom.comparison_products` [Product List]
- **Priority:** 🟢 OPTIONAL
- **Type:** List of product references
- **Used For:** Specification comparison table (future feature)
- **How to Fill:**
  - Select 3-5 similar/competing products for comparison
  - Should be same category (e.g., all reach-in freezers)

- **Example:**
  ```
  Main Product: Avantco SS-2F-HC 54" Freezer

  Comparison Products:
  - Avantco SS-2F 54" Freezer (different model)
  - True T-49F 54" Freezer (competitor)
  - Beverage-Air HF2-1G 54" Freezer (competitor)
  ```

---

## Collection Strategy

### Why Collections Matter
Collections are used for fallback logic when `works_with_products` metafield is empty. They also help organize products logically for browsing.

---

### Collections to Create

#### 1. **Accessory & Parts Collections** (🔴 CRITICAL)

These collections group related accessories for the "Works With" section fallback.

| Collection Handle | Collection Name | Products to Include | Purpose |
|-------------------|-----------------|---------------------|---------|
| `tandoor-accessories` | Tandoor Accessories | Skewers, clay pots, hot rocks, brushes, temperature gauges | Related items for tandoor ovens |
| `refrigeration-accessories` | Refrigeration Accessories | Door gaskets, shelves, temp monitors, casters | Related items for fridges/freezers |
| `gas-stove-accessories` | Gas Stove Accessories | Burner grates, cleaning kits, griddle tops, oven thermometers | Related items for gas ranges |
| `cookware-accessories` | Cookware Accessories | Lids, handles, cleaning supplies | Related items for pots/pans |
| `dishwasher-accessories` | Dishwasher Accessories | Rack parts, wash arms, cleaning chemicals | Related items for dishwashers |
| `smallware-accessories` | Smallware Accessories | Replacement parts, cleaning tools | Related items for small equipment |

**How to Use:**
- Add accessory products to these collections
- When a main product doesn't have `works_with_products` filled, the template will look for products in the matching collection

**Example:**
```
Product: "Commercial Clay Tandoor Oven"
- If works_with_products is empty
- Template looks for products in "tandoor-accessories" collection
- Shows those as "Works With" items
```

---

#### 2. **Equipment Category Collections** (🟡 IMPORTANT)

For organizing main equipment by type.

| Collection Handle | Collection Name | Example Products |
|-------------------|-----------------|------------------|
| `refrigeration-equipment` | Refrigeration Equipment | Reach-in fridges, freezers, prep tables |
| `cooking-equipment` | Cooking Equipment | Ranges, ovens, grills, fryers |
| `food-prep-equipment` | Food Prep Equipment | Mixers, slicers, food processors |
| `warewashing-equipment` | Warewashing Equipment | Dishwashers, sinks, drying racks |
| `indian-specialty-equipment` | Indian Specialty Equipment | Tandoors, curry stations, specialized cookware |
| `beverage-equipment` | Beverage Equipment | Coffee makers, beverage dispensers, ice machines |

---

#### 3. **Brand Collections** (🟢 OPTIONAL)

One collection per major brand for browsing.

| Collection Handle | Collection Name |
|-------------------|-----------------|
| `avantco-brand` | Avantco Equipment |
| `true-brand` | True Refrigeration |
| `imperial-brand` | Imperial Range |
| `rational-brand` | Rational Ovens |

---

### How to Create Collections in Shopify

1. **Go to:** Products → Collections → Create collection
2. **Set:**
   - Title: "Tandoor Accessories"
   - Handle: `tandoor-accessories` (will auto-generate)
   - Type: Manual (add products manually) or Automated (use conditions)
3. **For Automated Collections:**
   - Condition: Product tag equals `accessory-tandoor`
   - This auto-adds products with that tag
4. **Save**

---

## Tagging Strategy

### Tag Purpose: When to Use Tags vs Metafields

| Use Case | Solution | Example |
|----------|----------|---------|
| Show/hide specific sections | Tags | `show:works-with` |
| Filter by product type | Tags | `product-type:refrigeration` |
| Mark product relationships | Tags | `accessory-tandoor` |
| Simple boolean flags | Tags | `free-shipping`, `contact-for-price` |
| Specific product references | Metafields | `works_with_products` |
| Structured data | Metafields | `specification`, `feature_sections` |
| File uploads | Metafields | `warranty_document` |

---

### Required Tag Structure

#### 1. **Section Control Tags** (🔴 CRITICAL)

These tags control which sections appear on the product page.

| Tag | Purpose | When to Use | Example Product |
|-----|---------|-------------|-----------------|
| `show:works-with` | Shows "Works With" section | Main equipment that has accessories/parts | Commercial Freezer, Tandoor Oven, Gas Range |
| `show:accessories` | Shows "Accessories & Options" dropdown | Products with optional add-ons | Mixer (bowl options), Oven (rack options) |
| `show:parts` | Shows "Parts & Accessories" section | Products that have replacement parts available | Dishwasher, Food Processor |

**How to Use:**
- Add ONE of these tags to main equipment products
- Don't add to accessory products themselves

---

#### 2. **Relationship Tags** (🟡 IMPORTANT)

These tags help products find their related items.

| Tag | Purpose | Products That Should Have This Tag |
|-----|---------|-------------------------------------|
| `accessory-tandoor` | Works with tandoor ovens | Skewers, clay pots, hot rocks, cleaning brushes |
| `accessory-refrigeration` | Works with refrigeration equipment | Door gaskets, shelves, temperature monitors |
| `accessory-gas-range` | Works with gas ranges | Burner grates, cleaning kits, griddle tops |
| `accessory-mixer` | Works with commercial mixers | Dough hooks, beaters, bowls, splash guards |
| `accessory-dishwasher` | Works with dishwashers | Rack parts, wash arms, rinse aid |

**Naming Convention:**
```
accessory-[main-equipment-type]
```

---

#### 3. **Product Type Tags** (🟢 OPTIONAL)

For additional categorization and filtering.

| Tag | Purpose |
|-----|---------|
| `product-type:refrigeration` | All refrigeration products |
| `product-type:cooking` | All cooking equipment |
| `product-type:indian-equipment` | Indian specialty items |
| `product-type:accessory` | All accessories |
| `product-type:cleaning` | Cleaning products |

---

#### 4. **Feature/Attribute Tags** (🟢 OPTIONAL)

| Tag | Purpose |
|-----|---------|
| `free-shipping` | Product qualifies for free shipping |
| `contact-for-price` | Pricing requires contact (MAP restriction) |
| `energy-star` | ENERGY STAR certified |
| `nsf-certified` | NSF food safety certified |
| `heavy-equipment` | Requires special handling/installation |

---

### Complete Tagging Examples

#### Example 1: Commercial Reach-In Freezer (Main Product)
```
Tags to Add:
- show:works-with (enables "Works With" section)
- product-type:refrigeration (categorization)
- free-shipping (if applicable)
- energy-star (if certified)
- heavy-equipment (requires installation)

Collections to Add:
- Refrigeration Equipment
- All Products
- Heavy Equipment (if applicable)

Metafields to Fill:
- works_with_products → Select: door gasket, extra shelf, temp monitor, casters
- specification → Full specs table
- key_features → 8-10 features
- feature_sections → 5-6 sections with images
- certifications → ETL US, ETL Sanitation, NSF
- member_price → Discounted price
```

---

#### Example 2: Tandoor Skewers (Accessory Product)
```
Tags to Add:
- accessory-tandoor (works with tandoors)
- product-type:accessory (categorization)
- product-type:indian-equipment (category)

Collections to Add:
- Tandoor Accessories
- Indian Specialty Equipment
- Smallwares

Metafields to Fill:
- specification → Material, length, gauge
- key_features → 3-5 features
- (No works_with_products needed - this IS an accessory)
```

---

#### Example 3: 6-Burner Gas Range (Main Product)
```
Tags to Add:
- show:works-with (enables "Works With" section)
- show:accessories (if optional griddle top available)
- product-type:cooking (categorization)
- nsf-certified (if certified)
- heavy-equipment (requires installation)

Collections to Add:
- Cooking Equipment
- Gas Ranges
- All Products

Metafields to Fill:
- works_with_products → Select: cleaning kit, griddle top, oven thermometer, drip pans
- specification → Full specs table (BTU, dimensions, gas type, etc.)
- key_features → 8-10 features
- feature_sections → 5-6 sections with images
- certifications → NSF, ETL US, CSA
- member_price → Discounted price
- installation_available → Yes
```

---

#### Example 4: Gas Range Cleaning Kit (Accessory)
```
Tags to Add:
- accessory-gas-range (works with gas ranges)
- product-type:accessory (categorization)
- product-type:cleaning (category)

Collections to Add:
- Gas Stove Accessories
- Cleaning Supplies
- Smallwares

Metafields to Fill:
- specification → Kit contents, chemical specs
- key_features → What's included
```

---

## Product Relationship Examples

### Full Setup Examples for Different Product Types

---

### Example 1: Commercial Clay Tandoor Oven

#### Product Information
- **Product Name:** "36-Inch Commercial Clay Tandoor Oven - Natural Gas"
- **SKU:** TAND-36-NG
- **Price:** $1,299.00
- **Vendor:** Shaan Tandoor

#### Tags to Add
```
show:works-with
product-type:cooking
product-type:indian-equipment
heavy-equipment
nsf-certified
```

#### Collections to Add
```
- Indian Specialty Equipment
- Cooking Equipment
- All Products
- Tandoor Ovens (create this collection)
```

#### Metafields to Fill

**works_with_products** (Select these products):
```
1. Tandoor Skewers - Stainless Steel Set of 12
2. Clay Hot Rocks - 10 Pack for Tandoor Base
3. Tandoor Cleaning Brush - Long Handle
4. Replacement Clay Pot Insert - 36"
5. Naan Bread Paddle - Traditional Wood
6. Tandoor Temperature Gauge - Analog 900°F
```

**specification** (JSON format):
```json
{
  "Overall Dimensions": {
    "Height": "36 inches",
    "Diameter": "20 inches (interior)",
    "Weight": "285 lbs"
  },
  "Construction": {
    "Exterior": "Double-wall stainless steel",
    "Interior": "Traditional clay lining",
    "Insulation": "Ceramic fiber wool"
  },
  "Operational": {
    "Fuel Type": "Natural Gas",
    "BTU Rating": "65,000 BTU/hr",
    "Temperature Range": "Up to 900°F",
    "Gas Connection": "3/4 inch NPT",
    "Ignition": "Manual pilot light"
  },
  "Certifications": {
    "Safety": "NSF, CSA",
    "Gas": "ANSI Z83.11"
  }
}
```

**key_features** (pipe-separated):
```
Traditional clay-lined interior for authentic tandoori cooking|Reaches temperatures up to 900°F for perfect naan and kebabs|Double-wall stainless steel construction with ceramic insulation|Natural gas operation with 65,000 BTU burner|20-inch interior diameter accommodates multiple skewers|285 lbs weight provides stability during operation|NSF and CSA certified for commercial use|Manual pilot light ignition system|Includes removable grate for easy cleaning
```

**feature_sections** (JSON):
```json
[
  {
    "title": "Authentic Clay Construction",
    "description": "Traditional clay-lined interior provides authentic tandoor cooking experience, reaching temperatures up to 900°F for perfect naan, kebabs, and tandoori dishes. The clay retains heat evenly for consistent results and imparts the signature smoky flavor.",
    "image": "shopify://shop_images/tandoor-clay-interior.jpg"
  },
  {
    "title": "Gas-Powered Efficiency",
    "description": "65,000 BTU natural gas burner provides precise temperature control and faster heating compared to traditional charcoal tandoors. Manual pilot light system ensures reliable ignition. Adjustable flame control allows you to maintain optimal cooking temperature.",
    "image": "shopify://shop_images/tandoor-gas-burner.jpg"
  },
  {
    "title": "Insulated Exterior",
    "description": "Double-wall stainless steel construction with ceramic fiber wool insulation keeps exterior cool to touch while maintaining intense internal heat. Safe for busy kitchen environments and reduces heat loss for energy efficiency.",
    "image": "shopify://shop_images/tandoor-exterior-insulation.jpg"
  },
  {
    "title": "Large Cooking Capacity",
    "description": "Spacious 36-inch height with 20-inch interior diameter allows you to cook multiple naan breads or skewers simultaneously. Accommodates up to 8 skewers at once for high-volume cooking during busy service periods.",
    "image": "shopify://shop_images/tandoor-capacity.jpg"
  }
]
```

**certifications**:
```
NSF, CSA, ANSI Z83.11
```

**warranty** (Rich text):
```html
<h3>Manufacturer Warranty</h3>
<p><strong>Clay Liner:</strong> 1 year from date of purchase</p>
<p><strong>Stainless Steel Exterior:</strong> 2 years from date of purchase</p>
<p><strong>Gas Burner Assembly:</strong> 1 year parts and labor</p>

<h4>Coverage Includes:</h4>
<ul>
  <li>Defects in materials and workmanship</li>
  <li>Clay liner cracking or deterioration</li>
  <li>Stainless steel exterior defects</li>
  <li>Burner component failure</li>
</ul>

<h4>Exclusions:</h4>
<ul>
  <li>Normal wear and tear on clay lining</li>
  <li>Damage from improper gas pressure</li>
  <li>Cosmetic damage or surface rust</li>
  <li>Damage from improper installation</li>
</ul>

<p>For warranty service, contact us at (408) 673-9999 or sales@celebratefestivalinc.com</p>
```

**member_price**:
```
1199.00
```

**free_shipping**:
```
No (too heavy - freight shipping required)
```

**installation_available**:
```
Yes
```

---

### Example 2: Avantco SS-2F-HC 54" Reach-In Freezer

#### Product Information
- **Product Name:** "Avantco SS-2F-HC 54" Two Section Solid Door Reach-In Freezer"
- **SKU:** 178SS2FHC
- **Price:** $2,619.00
- **Vendor:** Avantco

#### Tags to Add
```
show:works-with
product-type:refrigeration
free-shipping
energy-star
heavy-equipment
```

#### Collections to Add
```
- Refrigeration Equipment
- Reach-In Freezers
- All Products
- Energy Star Equipment
```

#### Metafields to Fill

**works_with_products** (Select these products):
```
1. Replacement Door Gasket - Avantco Compatible
2. Adjustable Wire Shelf - 24" x 20"
3. Digital Temperature Monitoring System
4. Heavy Duty Caster Wheel Set (4 wheels)
5. Door Lock Kit - Keyed Entry
6. Shelf Clips - Replacement Pack of 20
```

**specification** (JSON format):
```json
{
  "Overall Dimensions": {
    "Width": "54 inches",
    "Depth": "31 1/2 inches",
    "Height": "82 3/4 inches",
    "Weight": "425 lbs"
  },
  "Interior Dimensions": {
    "Capacity": "49 cubic feet",
    "Shelves Included": "6 adjustable wire shelves",
    "Shelf Dimensions": "24 inch x 20 inch"
  },
  "Electrical": {
    "Voltage": "115 Volts",
    "Amperage": "9.6 Amps",
    "Phase": "1 Phase",
    "Hertz": "60 Hz",
    "Plug Type": "NEMA 5-15P"
  },
  "Construction": {
    "Exterior Material": "Stainless steel",
    "Interior Material": "Aluminum",
    "Door Type": "Solid, self-closing",
    "Door Handle": "Recessed",
    "Insulation": "Polyurethane foam"
  },
  "Operational": {
    "Temperature Range": "-10°F to 0°F",
    "Refrigerant": "R290 (eco-friendly)",
    "Compressor Type": "Bottom-mounted",
    "Compressor Power": "1/2 HP",
    "Defrost": "Automatic",
    "Control Type": "Digital"
  },
  "Features": {
    "Casters": "4 inch heavy-duty (2 locking)",
    "Leveling Legs": "Adjustable 4-6 inches",
    "Door Sections": "2 sections"
  }
}
```

**key_features** (pipe-separated):
```
49 cu. ft. interior capacity with 6 adjustable wire shelves|Stainless steel exterior with aluminum interior for durability|Self-closing solid doors with recessed handles and stay-open feature|Temperature range of -10°F to 0°F maintains frozen goods|Bottom-mounted 1/2 HP compressor for efficient cooling|Energy-efficient R290 refrigerant reduces environmental impact|Digital temperature display and electronic controls|4-inch heavy-duty casters with front locks for mobility|ETL Sanitation and ETL US certified for commercial use|Automatic defrost system for low maintenance
```

**feature_sections** (JSON):
```json
[
  {
    "title": "Convenient Capacity",
    "description": "With 49 cu. ft. of interior space and 6 adjustable shelves, this freezer provides ample storage for all your frozen goods. The adjustable shelving allows you to customize the interior layout to accommodate items of various sizes, from boxed goods to bulk ingredients.",
    "image": "shopify://shop_images/freezer-interior-capacity.jpg"
  },
  {
    "title": "Strong and Sturdy Construction",
    "description": "Built with a durable stainless steel exterior and aluminum interior, this freezer is designed to withstand the demands of busy commercial kitchens while maintaining a professional appearance. The materials are easy to clean and resistant to corrosion.",
    "image": "shopify://shop_images/freezer-construction.jpg"
  },
  {
    "title": "Self-Closing Doors",
    "description": "The self-closing solid doors with stay-open feature ensure that the unit maintains proper temperature while providing easy access during busy service periods. Recessed handles protect against damage in tight kitchen spaces and provide a sleek appearance.",
    "image": "shopify://shop_images/freezer-doors.jpg"
  },
  {
    "title": "Digital Temperature Control",
    "description": "Easy-to-read digital display and precise electronic controls allow you to maintain optimal temperature settings between -10°F to 0°F. Monitor and adjust temperatures without opening the doors, helping maintain consistent freezing conditions.",
    "image": "shopify://shop_images/freezer-digital-controls.jpg"
  },
  {
    "title": "Energy-Efficient Refrigeration",
    "description": "Uses eco-friendly R290 refrigerant that reduces environmental impact while providing powerful cooling performance. The efficient design helps lower energy costs while maintaining consistent freezing temperatures.",
    "image": "shopify://shop_images/freezer-refrigeration-system.jpg"
  },
  {
    "title": "Bottom-Mounted Compressor",
    "description": "The bottom-mounted 1/2 HP compressor design keeps the unit running efficiently while allowing for easy maintenance access. This placement also protects the compressor from heat exposure and kitchen hazards.",
    "image": "shopify://shop_images/freezer-compressor.jpg"
  },
  {
    "title": "Mobility and Convenience",
    "description": "Four heavy-duty 4-inch casters make it easy to move the freezer for cleaning or repositioning in your kitchen layout. Front casters include brakes to keep the unit secure during operation.",
    "image": "shopify://shop_images/freezer-casters.jpg"
  }
]
```

**certifications**:
```
ETL US, ETL Sanitation, ENERGY STAR
```

**warranty** (Rich text):
```html
<h3>Manufacturer Warranty</h3>
<p><strong>Parts and Labor:</strong> 1 year from date of purchase</p>
<p><strong>Compressor:</strong> 3 years parts, 1 year labor</p>

<h4>Coverage Includes:</h4>
<ul>
  <li>Defects in materials and workmanship</li>
  <li>Compressor failure</li>
  <li>Factory parts replacement</li>
  <li>On-site service (in serviceable areas)</li>
</ul>

<h4>Exclusions:</h4>
<ul>
  <li>Damage from improper installation or voltage</li>
  <li>Normal wear and tear (door gaskets, light bulbs)</li>
  <li>Cosmetic damage or surface scratches</li>
  <li>Damage from unauthorized repairs</li>
</ul>

<p><strong>Warranty Registration:</strong> Register within 30 days of purchase</p>
<p>For warranty service, contact us at (408) 673-9999 or visit www.avantoequipment.com</p>
```

**member_price**:
```
2469.00
```

**free_shipping**:
```
Yes
```

**installation_available**:
```
Yes
```

**quick_shipping**:
```
Yes (in-stock item)
```

---

### Example 3: 6-Burner Gas Range with Standard Oven

#### Product Information
- **Product Name:** "Imperial IR-6 6-Burner Gas Range with Standard Oven - 36 inch"
- **SKU:** IMP-IR6-LP
- **Price:** $3,450.00
- **Vendor:** Imperial Range

#### Tags to Add
```
show:works-with
show:accessories
product-type:cooking
nsf-certified
heavy-equipment
```

#### Collections to Add
```
- Cooking Equipment
- Gas Ranges
- All Products
- Imperial Range Brand
```

#### Metafields to Fill

**works_with_products** (Select these products):
```
1. Gas Range Cleaning Kit - Professional Grade
2. Replacement Cast Iron Grates - Set of 6
3. Griddle Top Plate - 24" x 24" (optional accessory)
4. Oven Thermometer - Commercial Accuracy
5. Drip Pan Set - Stainless Steel
6. Burner Cap Replacement Kit
```

**specification** (JSON):
```json
{
  "Overall Dimensions": {
    "Width": "36 inches",
    "Depth": "38 inches",
    "Height": "36 inches",
    "Weight": "420 lbs"
  },
  "Burner Specifications": {
    "Number of Burners": "6 open burners",
    "Burner BTU": "32,000 BTU each (192,000 BTU total)",
    "Burner Type": "Cast iron grates",
    "Burner Spacing": "12 inch centers"
  },
  "Oven Specifications": {
    "Oven Capacity": "26.5 inch W x 26 inch D x 14 inch H",
    "Oven BTU": "35,000 BTU",
    "Oven Type": "Standard convection",
    "Oven Racks": "2 chrome-plated racks included"
  },
  "Gas Connection": {
    "Fuel Type": "Liquid Propane (LP)",
    "Gas Connection Size": "3/4 inch NPT",
    "Gas Pressure": "11 inch W.C.",
    "Natural Gas Conversion": "Kit available (sold separately)"
  },
  "Construction": {
    "Exterior": "Stainless steel front and sides",
    "Top": "Heavy-duty steel with removable crumb tray",
    "Oven Interior": "Porcelain enamel",
    "Legs": "Adjustable 4-6 inches stainless steel"
  },
  "Certifications": {
    "Safety": "NSF, CSA, ETL",
    "Commercial Use": "UL approved"
  }
}
```

**key_features** (pipe-separated):
```
Six 32,000 BTU open burners deliver 192,000 BTU total cooking power|Standard convection oven with 35,000 BTU and two chrome racks|Heavy-duty cast iron grates for durability and heat distribution|Stainless steel construction on front and sides|Removable crumb tray for easy cleaning|Liquid propane fuel with natural gas conversion kit available|Adjustable 4-6 inch stainless steel legs|NSF, CSA, and ETL certified for commercial use|26.5 inch oven width accommodates full-size sheet pans|Porcelain enamel oven interior resists stains and heat damage
```

**feature_sections** (JSON):
```json
[
  {
    "title": "Powerful Open Burner Design",
    "description": "Six 32,000 BTU open burners provide exceptional heat output for fast boiling, searing, and sautéing. The cast iron grates distribute heat evenly and support heavy pots and pans during high-volume cooking.",
    "image": "shopify://shop_images/gas-range-burners.jpg"
  },
  {
    "title": "Standard Convection Oven",
    "description": "The 35,000 BTU oven provides consistent temperature for baking, roasting, and holding. Spacious 26.5-inch width accommodates full-size 18 x 26 inch sheet pans. Includes two adjustable chrome-plated racks.",
    "image": "shopify://shop_images/gas-range-oven.jpg"
  },
  {
    "title": "Commercial-Grade Construction",
    "description": "Built with stainless steel front and sides for durability and professional appearance. Heavy-duty steel cooking top withstands daily commercial use. Porcelain enamel oven interior resists stains and is easy to clean.",
    "image": "shopify://shop_images/gas-range-construction.jpg"
  },
  {
    "title": "Easy Maintenance Features",
    "description": "Removable crumb tray catches spills and food particles for quick cleanup. Cast iron grates lift off easily for cleaning. Porcelain oven interior wipes clean without harsh chemicals.",
    "image": "shopify://shop_images/gas-range-maintenance.jpg"
  },
  {
    "title": "Flexible Fuel Options",
    "description": "Comes configured for liquid propane (LP) with 3/4 inch NPT connection. Natural gas conversion kit available separately for easy conversion to natural gas. Operates at 11 inch W.C. pressure.",
    "image": "shopify://shop_images/gas-range-fuel-options.jpg"
  }
]
```

**certifications**:
```
NSF, CSA, ETL, UL
```

**warranty** (Rich text):
```html
<h3>Imperial Range Warranty</h3>
<p><strong>Parts and Labor:</strong> 1 year from date of installation</p>
<p><strong>Burners and Grates:</strong> 2 years parts only</p>

<h4>Coverage Includes:</h4>
<ul>
  <li>Defects in materials and workmanship</li>
  <li>Burner component failure</li>
  <li>Oven controls and ignition system</li>
  <li>Factory parts replacement</li>
</ul>

<h4>Exclusions:</h4>
<ul>
  <li>Damage from improper gas pressure or installation</li>
  <li>Normal wear on burner caps and grates</li>
  <li>Cosmetic damage or discoloration from heat</li>
  <li>Unauthorized modifications or repairs</li>
  <li>Commercial cleaning chemicals damage</li>
</ul>

<p><strong>Installation Requirements:</strong> Must be installed by licensed gas technician</p>
<p>For warranty service, contact Imperial Range at 1-800-421-6603 or sales@celebratefestivalinc.com</p>
```

**member_price**:
```
3199.00
```

**free_shipping**:
```
Yes (freight shipping)
```

**installation_available**:
```
Yes (gas line connection required)
```

**shipment_text**:
```
Ships in 3-5 business days via freight carrier
```

**shipment_text_sub**:
```
Freight delivery to loading dock or curbside. Inside delivery available for additional fee.
```

---

### Related Accessory Products Setup

For the related products to show up properly, they also need to be configured:

---

#### Example: Tandoor Skewers (Accessory Product)

**Product Name:** "Tandoor Skewers - Stainless Steel Set of 12"
**SKU:** TAND-SKEW-12
**Price:** $34.99

**Tags:**
```
accessory-tandoor
product-type:accessory
product-type:indian-equipment
```

**Collections:**
```
- Tandoor Accessories
- Indian Specialty Equipment
- Smallwares
```

**key_features:**
```
Set of 12 stainless steel skewers|24-inch length perfect for standard tandoors|Food-grade stainless steel construction|Pointed tips for easy threading|Flat blade design prevents food spinning|Dishwasher safe for easy cleaning
```

**specification:**
```json
{
  "Product Details": {
    "Quantity": "12 skewers per set",
    "Length": "24 inches",
    "Width": "0.5 inches (blade)",
    "Material": "18/8 stainless steel",
    "Weight": "3.2 lbs per set"
  }
}
```

---

#### Example: Replacement Door Gasket (Accessory Product)

**Product Name:** "Replacement Door Gasket - Avantco Compatible"
**SKU:** DOOR-GASKET-AV-54
**Price:** $45.99

**Tags:**
```
accessory-refrigeration
product-type:accessory
product-type:replacement-part
```

**Collections:**
```
- Refrigeration Accessories
- Replacement Parts
```

**key_features:**
```
Compatible with Avantco 54-inch reach-in models|Easy snap-in installation|Maintains proper seal and temperature|Durable vinyl construction|54-inch length|Reduces energy costs by preventing cold air loss
```

---

## Data Entry Checklist

Use this checklist for EACH product you're setting up:

### Phase 1: Basic Product Information (🔴 CRITICAL)
- [ ] Product title clear and descriptive
- [ ] SKU entered
- [ ] Price set
- [ ] Vendor assigned
- [ ] At least 4 high-quality product images uploaded
- [ ] Featured image selected
- [ ] Product description written (at least 200 words)
- [ ] Product type assigned (Shopify default field)

---

### Phase 2: Collections (🔴 CRITICAL)
- [ ] Added to primary equipment category collection (e.g., "Cooking Equipment")
- [ ] Added to specific product type collection (e.g., "Gas Ranges")
- [ ] Added to "All Products" collection
- [ ] If accessory: Added to relevant accessory collection (e.g., "Tandoor Accessories")
- [ ] If brand: Added to brand collection (e.g., "Imperial Range Brand")

---

### Phase 3: Tags (🔴 CRITICAL for Main Products)
Main Equipment Tags:
- [ ] Add `show:works-with` (if product has accessories/related items)
- [ ] Add `show:accessories` (if optional add-ons available)
- [ ] Add `product-type:[category]` tag

Accessory Product Tags:
- [ ] Add `accessory-[equipment-type]` tag
- [ ] Add `product-type:accessory`

Optional Tags:
- [ ] Add `free-shipping` (if applicable)
- [ ] Add `contact-for-price` (if MAP restricted)
- [ ] Add `heavy-equipment` (if requires special handling)

---

### Phase 4: Critical Metafields (🔴 CRITICAL)

#### For ALL Products:
- [ ] **specification** - Fill out categorized specs table
  - Overall Dimensions
  - Electrical (if applicable)
  - Construction
  - Operational specs
- [ ] **key_features** - Add 6-10 bullet points (pipe-separated)

#### For Main Equipment Products:
- [ ] **works_with_products** - Select 4-6 related products
- [ ] **feature_sections** - Create 4-6 accordion sections with images
- [ ] **member_price** - Set discounted member pricing
- [ ] **certifications** - List all certifications (comma-separated)
- [ ] **warranty** - Full warranty text in HTML format

---

### Phase 5: Important Metafields (🟡 IMPORTANT)

- [ ] **warranty_document** - Upload warranty PDF (if available)
- [ ] **instructions_manual** - Upload manual PDF (if available)
- [ ] **specification_sheet** - Upload spec sheet PDF (if available)
- [ ] **free_shipping** - Set to Yes/No
- [ ] **installation_available** - Set to Yes/No (for heavy equipment)
- [ ] **shipment_text** - Add shipping timeframe
- [ ] **shipment_text_sub** - Add additional shipping details

---

### Phase 6: Optional Enhancements (🟢 OPTIONAL)

- [ ] **protection_plan_price** - Custom protection pricing (or leave empty for auto-calc)
- [ ] **quick_shipping** - Set to Yes for fast-ship items
- [ ] **comparison_products** - Select 3-5 similar products for comparison table
- [ ] Add product to "Best Sellers" collection (if applicable)
- [ ] Add product to "New Products" collection (if applicable)

---

### Phase 7: Product Relationships (🔴 CRITICAL for Accessories)

If this is an ACCESSORY product:
- [ ] Verify it's in the correct accessory collection
- [ ] Verify it has the correct `accessory-[type]` tag
- [ ] Check that main equipment products reference this in their `works_with_products`

If this is a MAIN EQUIPMENT product:
- [ ] Verify all related accessories are created and tagged
- [ ] Verify `works_with_products` metafield lists all accessories
- [ ] Test that "Works With" section displays correctly on live product page

---

### Phase 8: Quality Check (🔴 CRITICAL)

- [ ] Preview product page - check layout
- [ ] Verify all images load properly
- [ ] Check that "Works With" section shows correct products
- [ ] Verify specification table displays properly
- [ ] Test Add to Cart functionality
- [ ] Check mobile view
- [ ] Verify pricing displays correctly (regular and member)
- [ ] Check that certifications show as badges
- [ ] Verify warranty tab has content

---

## Time Estimates

### Per Product Time Requirements

| Product Type | Estimated Time | Notes |
|--------------|----------------|-------|
| **Main Equipment** (Full setup) | 45-60 minutes | Includes all metafields, images, relationships |
| **Accessory Product** (Basic setup) | 15-20 minutes | Simpler setup, fewer metafields |
| **Existing Product** (Adding missing data) | 20-30 minutes | Filling gaps in existing products |

### Breakdown by Task

| Task | Time Estimate |
|------|---------------|
| Writing product description | 10 minutes |
| Creating specification table | 10 minutes |
| Writing key features (8-10) | 10 minutes |
| Creating feature sections (5-6 with images) | 15-20 minutes |
| Finding and selecting works-with products | 5 minutes |
| Uploading images and arranging | 5 minutes |
| Setting tags and collections | 5 minutes |
| Writing warranty content | 10 minutes |
| Uploading documents (warranty, manual) | 5 minutes |
| Quality check and testing | 5 minutes |

### Project Timeline Estimates

| Scenario | Number of Products | Estimated Total Time |
|----------|-------------------|----------------------|
| Small catalog | 50 main products + 100 accessories | 80-100 hours |
| Medium catalog | 200 main products + 400 accessories | 250-300 hours |
| Large catalog | 500+ main products + 1000+ accessories | 600-750 hours |

**Recommendation:** Start with high-priority products (best sellers, high-margin items, featured products) and expand from there.

---

## Implementation Roadmap

### Phase 1: Setup (Week 1)
1. Create all new metafield definitions in Shopify
2. Create all necessary collections
3. Document tagging strategy for team

### Phase 2: High-Priority Products (Week 2-3)
1. Identify top 20 best-selling products
2. Complete full data entry for these products
3. Set up all relationships and accessories
4. Test on staging/dev theme

### Phase 3: Category Expansion (Week 4-6)
1. Complete one product category at a time
2. Refrigeration → Cooking → Food Prep → etc.
3. Test each category as completed

### Phase 4: Accessories & Related Products (Week 7-8)
1. Fill in all accessory products
2. Verify all relationships work correctly
3. Test "Works With" sections

### Phase 5: Remaining Products (Ongoing)
1. Continue with remaining catalog
2. Prioritize by importance/traffic
3. Maintain consistency in data format

---

## Questions? Need Help?

### Contact Information
- **Developer:** [Your contact info]
- **Client:** Celebrate Festival Inc - (408) 673-9999
- **Email:** sales@celebratefestivalinc.com

### Common Questions

**Q: Do I need to fill ALL metafields for EVERY product?**
A: No. Follow the priority levels:
- 🔴 CRITICAL - Must have for page to work
- 🟡 IMPORTANT - Needed for full experience
- 🟢 OPTIONAL - Nice to have

**Q: What if I don't have warranty documents or manuals?**
A: That's okay! The template has fallback content. Fill in text-based warranty info in the `warranty` metafield instead.

**Q: How do I know which products should have "Works With" relationships?**
A: Main equipment that has accessories, parts, or complementary items should have:
- `show:works-with` tag
- `works_with_products` metafield filled with 4-6 related items

**Q: Can I add more metafields later?**
A: Yes! Start with critical ones. Add more as needed. The template is designed to handle missing data gracefully.

**Q: What if a product doesn't fit these categories?**
A: That's fine! Not every product needs every section. Use what makes sense for each product type.

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 6, 2025 | Initial document created |

---

**END OF DOCUMENT**

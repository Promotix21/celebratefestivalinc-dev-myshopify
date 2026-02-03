# Celebrate Festival - Shopify Store Admin Guide

**Document Version:** 1.0
**Last Updated:** January 2026
**For:** Store Administrators (Non-Technical)

---

## TABLE OF CONTENTS

1. [Quick Reference - Common Tasks](#section-1-quick-reference---common-tasks)
2. [Understanding the Store Structure](#section-2-understanding-the-store-structure)
3. [Mega Menu & Navigation](#section-3-mega-menu--navigation)
4. [Homepage Management](#section-4-homepage-management)
5. [Collection Pages (L1, L2, L3)](#section-5-collection-pages-l1-l2-l3)
6. [Single Product Page](#section-6-single-product-page)
7. [Footer & Global Settings](#section-7-footer--global-settings)
8. [Metafields Reference](#section-8-metafields-reference)
9. [Troubleshooting](#section-9-troubleshooting)

---

## SECTION 1: Quick Reference - Common Tasks

### Where to Edit What (Cheat Sheet)

| I Want To Change... | Go To This Location |
|---------------------|---------------------|
| Top bar announcement text | Online Store > Themes > Customize > Enhanced Header > "Marquee Text" |
| Phone number in header | Online Store > Themes > Customize > Enhanced Header > "Expert Help Phone" |
| Store logo | Online Store > Themes > Customize > Header > Logo |
| Menu items/links | Settings > Navigation > "cf-menu-31-12-2026" |
| Homepage banner slides | Online Store > Themes > Customize > Home page > Hero Diagonal Slider |
| Homepage category images | Online Store > Themes > Customize > Home page > Featured Categories |
| Product price | Products > [Product Name] > Pricing |
| Product description | Products > [Product Name] > Description |
| Product images | Products > [Product Name] > Media |
| Member/wholesale price | Products > [Product Name] > Metafields > wholesale_price |
| Collection image | Products > Collections > [Collection] > Collection image |
| Collection description | Products > Collections > [Collection] > Description |
| Footer contact info | Online Store > Themes > Customize > Footer > Custom Footer |
| Social media links | Online Store > Themes > Customize > Footer > Social Links |

---

## SECTION 2: Understanding the Store Structure

### How Everything Connects

```
SHOPIFY ADMIN (Backend)          WEBSITE (Frontend)
─────────────────────────────────────────────────────
Products                    →    Product Pages
Collections                 →    Category Pages (L1, L2, L3)
Navigation Menus            →    Mega Menu & Links
Theme Customizer            →    Layout, Colors, Text
Metafields                  →    Extra Product Info (Specs, Warranty, etc.)
```

### The Three Access Points

**1. Shopify Admin** (admin.shopify.com)
- Products, Collections, Orders, Customers
- URL: `celebratefestivalinc.myshopify.com/admin`

**2. Theme Customizer**
- Visual editor for page layouts
- Path: Online Store > Themes > Customize

**3. Navigation/Menus**
- Menu structure and links
- Path: Settings > Navigation

---

## SECTION 3: Mega Menu & Navigation

### Menu Structure Overview

The main navigation uses a menu called **"cf-menu-31-12-2026"**

```
Main Menu
├── Restaurant Equipment (Mega Menu with subcategories)
├── Smallwares (Mega Menu with subcategories)
├── Refrigeration (Mega Menu with subcategories)
├── Tabletop (Mega Menu with subcategories)
├── Indian Specialty (Mega Menu with subcategories)
├── Storage & Transport (Mega Menu with subcategories)
└── Shop by Brands (Logo Grid)
```

### How to Edit Menu Items

**Step-by-Step:**
1. Go to **Shopify Admin**
2. Click **Settings** (bottom left)
3. Click **Navigation**
4. Find and click **"cf-menu-31-12-2026"**
5. To add item: Click **"Add menu item"**
6. To edit item: Click on existing item
7. To delete: Click item, then "Remove"
8. Click **Save**

### Menu Item Options

| Field | What It Does | Example |
|-------|-------------|---------|
| Name | Text shown in menu | "Cooking Equipment" |
| Link | Where it goes when clicked | Collection: cooking-equipment |

### Connecting Menu to Collections

When adding a menu item:
1. Click **"Link"** field
2. Select **"Collections"**
3. Choose the collection you want to link to
4. The menu item now opens that collection page

### Submenu Items (Dropdown)

To create dropdown items:
1. Add main menu item first (e.g., "Restaurant Equipment")
2. Click **"Add menu item"** again
3. Drag it UNDER the parent item (indent it)
4. The indented items become the dropdown

---

## SECTION 4: Homepage Management

### Homepage Sections (Top to Bottom)

| Section | What It Shows | How to Edit |
|---------|--------------|-------------|
| **Hero Slider** | 3 rotating banners with text & buttons | Customize > Home > Hero Diagonal Slider |
| **Trust Badges** | 4 guarantee icons (Best Price, Brands, etc.) | Customize > Home > Trust Badges |
| **Hexagon Brands** | Brand logos in honeycomb pattern | Customize > Home > Hexagon Brand Grid |
| **Featured Categories** | 5+ category cards with images | Customize > Home > Featured Categories |
| **Staff Picks** | 8 product carousel | Customize > Home > Staff Picks |
| **Partner Section** | About us with features | Customize > Home > Partner Section |
| **Industry Cards** | Restaurant type cards (Pizza, Italian, etc.) | Customize > Home > Industry Use Cases |
| **Testimonials** | Customer reviews | Customize > Home > Testimonials |

### Editing Hero Banner Slides

**Path:** Online Store > Themes > Customize > Home page > Hero Diagonal Slider

Each slide has:
- **Background Image** - Upload 1920x800px image
- **Title** - Main heading text
- **Subtitle** - Secondary text below title
- **Button Text** - What the button says
- **Button Link** - Where button goes when clicked

**Current Slides:**
1. "Never Pay More for Restaurant Equipment"
2. "From Kitchen Dreams to Restaurant Reality"
3. "Authentic Indian Kitchen Equipment Specialists"

### Editing Featured Categories

**Path:** Online Store > Themes > Customize > Home page > Featured Categories

Each category card shows:
- Image (from collection or custom upload)
- Category name
- Optional badges (SALE, NEW, HOT)

**To change a category:**
1. Click on the category block
2. Change the linked collection
3. Upload new image if needed
4. Toggle badges on/off
5. Save

---

## SECTION 5: Collection Pages (L1, L2, L3)

### Understanding the 3 Levels

```
LEVEL 1 (Main Categories)
Example: "Restaurant Equipment"
Shows: Hero banner + category cards + icons + brands

    ↓ Click a category

LEVEL 2 (Subcategories)
Example: "Cooking Equipment"
Shows: Hero banner + subcategory cards + icons + products

    ↓ Click a subcategory

LEVEL 3 (Product Listing)
Example: "Commercial Ovens"
Shows: Filters sidebar + product grid + sorting
```

### Which Template to Assign

When creating a collection, assign the correct template:

| Collection Type | Template to Use |
|-----------------|-----------------|
| Main category (Restaurant Equipment) | collection.level-1 |
| Subcategory (Cooking Equipment) | collection.level-2 |
| Product listing (Commercial Ovens) | collection.level-3 |

**How to assign template:**
1. Go to Products > Collections > [Your Collection]
2. Scroll to bottom right
3. Find **"Theme template"** dropdown
4. Select appropriate template
5. Save

### Collection Hero Banner (L1 & L2)

The hero banner at top of collection pages can be customized:

**Option 1: Using Collection Metafields**
1. Go to Products > Collections > [Collection]
2. Scroll to Metafields section
3. Fill in:
   - **Hero Banner** - Upload 1400x400px image
   - **Hero Tagline** - Small text above title (e.g., "Professional Grade")
   - **Hero Subtitle** - Description text below title

**Option 2: Default Gradient**
If no banner image is set, a blue gradient background appears automatically.

### Collection Featured Image

The image shown on category cards:
1. Go to Products > Collections > [Collection]
2. Find **"Collection image"** section
3. Upload square image (recommended: 400x400px)
4. Save

### What Shows on L1 Page

| Section | Source |
|---------|--------|
| Hero banner | Collection metafields OR default gradient |
| Category cards | Child collections with featured images |
| Category descriptions | Collection descriptions |
| Subcategory links | Menu structure |
| Brand logos | Theme customizer blocks |
| Top products | Products in collection |

### What Shows on L3 Page (Product Listing)

| Element | Source |
|---------|--------|
| Breadcrumbs | Auto-generated from collection |
| Page title | Collection title |
| Description | Collection description |
| Filters | Auto-generated from product variants/tags |
| Products | Products assigned to collection |
| Product count | Automatic count |

---

## SECTION 6: Single Product Page

### Product Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Breadcrumb: Home > Category > Subcategory > Product]  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────┐  │
│  │              │  │ Brand Logo                      │  │
│  │   Product    │  │ PRODUCT TITLE                   │  │
│  │   Images     │  │ SKU: ABC123                     │  │
│  │              │  │ ★★★★★ (5.0) 128 reviews        │  │
│  │              │  │                                 │  │
│  │              │  │ Non-Member Price: $599.99       │  │
│  │              │  │ Plus Member Price: $509.99      │  │
│  │              │  │ You Save: $90.00                │  │
│  │              │  │                                 │  │
│  │              │  │ [Quantity] [ADD TO CART]        │  │
│  │              │  │                                 │  │
│  │              │  │ 🚀 Shipping Information         │  │
│  │              │  │ ✓ Free shipping on orders...    │  │
│  └──────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  [Product Features]  [Specifications]  [Warranty]       │
├─────────────────────────────────────────────────────────┤
│  YOU MAY ALSO NEED: [Related Products Carousel]         │
└─────────────────────────────────────────────────────────┘
```

### Basic Product Information

**Where to edit:** Products > [Product Name]

| Field | What It Shows | Location |
|-------|--------------|----------|
| Title | Product name | Product title field |
| Description | Main description | Description editor |
| Price | Regular price | Pricing > Price |
| Compare at price | Original/strikethrough price | Pricing > Compare at price |
| SKU | Product code | Inventory > SKU |
| Vendor | Brand name | Organization > Vendor |
| Images | Product photos | Media section |

### Member Pricing System

The store has a wholesale/member pricing system:

**How it works:**
1. Regular customers see: "Non-Member Price"
2. Logged-in members see: "Plus Member Price" (discounted)

**Who qualifies as a member:**
Customers with these tags: `plus-member`, `wholesale`, or `member`

**How member price is determined (in order):**
1. First checks: Product metafield `wholesale_price`
2. If not set: Uses `compare_at_price` as regular, `price` as member
3. If neither: Calculates discount from theme settings

**To set member price for a product:**
1. Go to Products > [Product]
2. Scroll to Metafields
3. Find `wholesale_price`
4. Enter the member price
5. Save

### Product Metafields Explained

Metafields store extra product information. Here's what each one does:

| Metafield | What It's For | How to Fill It |
|-----------|--------------|----------------|
| **wholesale_price** | Member/wholesale price | Enter number (e.g., 425.00) |
| **material** | Material description | Enter text (e.g., "Stainless Steel 304") |
| **free_shipping** | Show free shipping badge | Yes or No |
| **feature_sections** | Product features list | Enter each feature on new line |
| **warranty** | Warranty description | Rich text with details |
| **warranty_document** | Warranty PDF | Upload PDF file |
| **specification** | Spec sheet PDF | Upload PDF file |
| **specification_sheet** | Alternate spec sheet | Upload PDF file |
| **specs_table_pic_pdf** | Specs with images PDF | Upload PDF file |
| **instructions_manual** | User manual PDF | Upload PDF file |
| **certifications** | NSF, CSA, etc. | Enter each on new line |
| **product_certificates** | Certificate details | Enter details |
| **dimensions_utilities** | Size/power specs | Enter each on new line |
| **shipment_text1** | Shipping info details | Multi-line text |
| **shipment_text_sub** | Shipping subtitle | Single line text |
| **shipment_tooltip_text** | Hover tooltip text | Single line text |
| **works_with_products** | Compatible products | Select products |

### How to Edit Product Metafields

**Step-by-Step:**
1. Go to **Products** in Shopify Admin
2. Click on the product you want to edit
3. Scroll down to the **Metafields** section
4. Click to expand **"custom"** namespace
5. Find the field you want to edit
6. Enter your content or upload file
7. Click **Save**

### Editable Text on Product Page

Some text on the product page can be changed in Theme Customizer:

**Path:** Online Store > Themes > Customize > Products > Default product

| Text | Setting Name | Default Value |
|------|-------------|---------------|
| Member price label | "Member Price Label" | "Plus Member Price:" |
| Non-member price label | "Regular Price Label" | "Non-Member Price:" |
| Add to cart button | "Add to Cart Text" | "Add to Cart" |
| Shipping section title | "Shipping Title" | "Shipping Information" |

### Help Box Contact Info

The contact box on product pages shows:

| Info | Where to Edit |
|------|--------------|
| Phone | Theme Customize > Product > Help Box > Phone |
| Email | Theme Customize > Product > Help Box > Email |
| Address | Theme Customize > Product > Help Box > Address |
| Hours | Theme Customize > Product > Help Box > Hours |

**Current Values:**
- Phone: (408) 673-9999
- Email: sales@celebratefestivalinc.com
- Address: 235 Whitney Pl, Fremont, CA 94539
- Hours: Mon-Fri: 9AM-6PM

---

## SECTION 7: Footer & Global Settings

### Footer Sections

**Path:** Online Store > Themes > Customize > Footer

| Section | What It Contains |
|---------|-----------------|
| Newsletter | Email signup form |
| Contact Bar | Phone, email, address, hours |
| Link Columns | Equipment Categories, Popular Brands, Support |
| Social Icons | Instagram, Facebook, etc. |
| Copyright | Legal text |

### Editing Footer Contact Info

1. Go to Online Store > Themes > Customize
2. Scroll to Footer section
3. Click "Custom Footer"
4. Edit:
   - Contact Title
   - Phone Number
   - Email Address
   - Physical Address
   - Business Hours

### Footer Link Menus

The footer uses these menus (edit in Settings > Navigation):
- **equipment-categories** - Equipment category links
- **popular-brands** - Brand page links
- **customer-support** - Help/support links

### Social Media Links

**Path:** Online Store > Themes > Customize > Footer > Social Links

Currently configured:
- Instagram: https://www.instagram.com/celebrate.festival

To add more:
1. Find the social platform field
2. Enter full URL
3. Save

### Global Color Settings

**Path:** Online Store > Themes > Customize > Theme settings > Colors

The store uses these brand colors:
- **Deep Blue:** #1a365d (headers, titles)
- **Navy:** #2d5a87 (links, buttons)
- **Coral:** #ff6b6b (CTAs, badges, sale prices)
- **Gold:** #d4af37 (ratings, highlights)
- **Success Green:** #10b981 (free shipping, success)

### Global Font Settings

**Path:** Online Store > Themes > Customize > Theme settings > Typography

Current fonts:
- **Headings:** Montserrat (bold, clean)
- **Body text:** Inter (readable)

---

## SECTION 8: Metafields Reference

### Collection Metafields

| Metafield | Purpose | Image Size |
|-----------|---------|------------|
| hero_banner | Collection page hero background | 1400x400px |
| hero_tagline | Small text above title | Text only |
| hero_subtitle | Description below title | Text only |

### Product Metafields (Complete List)

| Namespace.Key | Type | Purpose |
|---------------|------|---------|
| custom.wholesale_price | Number | Member/wholesale price |
| custom.material | Text | Material composition |
| custom.free_shipping | Boolean | Enable free shipping badge |
| custom.feature_sections | Multi-line text | Bullet point features |
| custom.warranty | Rich text | Warranty details |
| custom.warranty_document | File | Warranty PDF |
| custom.specification | File | Full specification PDF |
| custom.specification_sheet | File | Spec sheet PDF |
| custom.specs_table_pic_pdf | File | Visual spec sheet |
| custom.instructions_manual | File | User manual PDF |
| custom.certifications | Multi-line text | NSF, CSA certifications |
| custom.product_certificates | Multi-line text | Certificate details |
| custom.dimensions_utilities | Multi-line text | Size and power info |
| custom.shipment_text1 | Multi-line text | Shipping details |
| custom.shipment_text_sub | Text | Shipping subtitle |
| custom.shipment_tooltip_text | Text | Hover tooltip |
| custom.works_with_products | Product list | Related products |

---

## SECTION 9: Troubleshooting

### Common Issues & Solutions

**Issue: Menu changes not showing**
- Solution: Clear browser cache (Ctrl+Shift+R)
- Solution: Wait 2-3 minutes for Shopify to update

**Issue: Collection image not showing**
- Solution: Make sure image is uploaded to "Collection image" field
- Solution: Use square image (1:1 ratio)
- Solution: Image should be at least 400x400px

**Issue: Member pricing not working**
- Solution: Customer must be logged in
- Solution: Customer account must have correct tag
- Solution: Check if wholesale_price metafield is set

**Issue: Product not showing in collection**
- Solution: Check product is added to that collection
- Solution: Check product status is "Active"
- Solution: Check product is not out of stock (if hiding out-of-stock)

**Issue: Hero banner not showing on collection**
- Solution: Upload image to hero_banner metafield
- Solution: Image must be proper size (1400x400px)

### Need Developer Help For:

These changes require code editing (contact developer):
- Changing page layouts/structure
- Adding new sections
- Modifying how filters work
- Changing pricing calculation logic
- Adding new metafields
- Custom functionality

### Helpful Links

- Shopify Admin: `celebratefestivalinc.myshopify.com/admin`
- Theme Customizer: Admin > Online Store > Themes > Customize
- Shopify Help: `help.shopify.com`

---

## APPENDIX: Step-by-Step Guides

### A. Adding a New Product

1. Go to **Products > Add product**
2. Enter product title
3. Add description
4. Upload images (first image = main image)
5. Set pricing
6. Add SKU in Inventory section
7. Set Vendor (brand name)
8. Scroll to Metafields and fill in:
   - wholesale_price (if different from regular)
   - material
   - features
   - certifications
   - Upload any PDFs
9. Scroll to Collections and select relevant collections
10. Click **Save**

### B. Creating a New Collection

1. Go to **Products > Collections > Create collection**
2. Enter collection title
3. Add description
4. Upload collection image (square, 400x400px)
5. Choose how to add products:
   - Manual: Select products individually
   - Automated: Set rules (e.g., product type = "Ovens")
6. Scroll to bottom, select theme template:
   - Level 1: `collection.level-1`
   - Level 2: `collection.level-2`
   - Level 3: `collection.level-3`
7. Click **Save**
8. Go to Metafields to add hero banner (optional)

### C. Adding Item to Mega Menu

1. Go to **Settings > Navigation**
2. Click **"cf-menu-31-12-2026"**
3. Click **Add menu item**
4. Enter name (what appears in menu)
5. Click **Link** and select the collection
6. Drag to position (indent for dropdown)
7. Click **Save**

### D. Changing Homepage Banner

1. Go to **Online Store > Themes > Customize**
2. Click **Home page** dropdown at top
3. Click on **Hero Diagonal Slider** section
4. Click on the slide you want to edit
5. Change:
   - Image (upload new)
   - Heading text
   - Subheading text
   - Button text
   - Button link
6. Click **Save**

### E. Updating Product Pricing

**Regular price:**
1. Go to **Products > [Product Name]**
2. Find **Pricing** section
3. Edit **Price** field
4. Click **Save**

**Member/Wholesale price:**
1. Go to **Products > [Product Name]**
2. Scroll to **Metafields**
3. Find **wholesale_price**
4. Enter new price
5. Click **Save**

---

**END OF GUIDE**

*For technical changes or questions not covered here, please contact your developer.*

# Use Cases — Content Management Guide

**For:** Celebrate Festival Inc  
**Last Updated:** May 2026  
**Managed by:** Hiraya Digital

---

## Overview

The Use Cases section has two parts:

| Page | URL | Purpose |
|------|-----|---------|
| **Landing Page** | `/pages/use-cases` | Shows all business types (Bakery, Pizza, Grocery, etc.) with a sidebar, product thumbnails, and CTA buttons |
| **Individual Use Case Pages** | e.g. `/pages/cf-grocery-store` | Deep-dive page for a single business type — equipment sections, store type grid, buying guides, brands |

The **landing page** is managed entirely in the Shopify Theme Editor.  
Each **individual use case page** uses a pre-built template with all content set — also editable in the Theme Editor.

---

## Part 1 — Use Cases Landing Page (`/pages/use-cases`)

### How to Edit Existing Cards

1. Go to **Online Store → Themes → Customize**
2. Navigate to the **Use Cases** page (use the page selector dropdown at the top)
3. In the left panel, click on the **"use-cases-landing"** section
4. Each use case (Bakery, Pizza, Grocery Store, etc.) is a **block** — click any block to edit it

### What You Can Change Per Card

| Field | What It Controls |
|-------|-----------------|
| **Card image** | Upload the hero photo for that use case card (4:3 ratio, e.g. 600×450px) |
| **Card image URL** | Temporary external image URL (used until a real image is uploaded) |
| **Business type name** | The card title (e.g. "Bakery") |
| **Icon (emoji)** | Emoji shown in the sidebar filter |
| **Description** | Short paragraph below the title |
| **Button text** | CTA button label (e.g. "Shop Bakery Equipment") |
| **Button URL** | Where the CTA button links to (use the individual use case page URL once created) |
| **Collection handle** | The Shopify collection whose products appear as thumbnails (4 shown automatically) |
| **View All URL** | The "View All →" link URL |
| **Mark as NEW** | Adds a red "NEW" badge to the card and sidebar item |
| **Featured card** | Applies a soft-pink background highlight to the card |

### How to Add a New Use Case Card

1. In the Theme Editor on the Use Cases page, scroll to **"use-cases-landing"** section
2. Click **"Add block"** → select **"Use Case Card"**
3. Fill in all the fields above
4. Set **Button URL** to the new individual page URL you'll create (see Part 2)
5. Set **Collection handle** to a Shopify collection that has relevant products

### Replacing Placeholder Images

The gray `500 × 375` placeholder boxes will remain until you upload real photos.

To replace a placeholder on a card:
1. Theme Editor → Use Cases → click the card block
2. Click **"Card image"** → upload a photo (recommended: **600×450px, landscape**)
3. Clear the **"Card image URL"** field (the upload takes priority automatically)

---

## Part 2 — Individual Use Case Pages (e.g. Grocery Store)

### Currently Live

| Page | URL | Template |
|------|-----|----------|
| Grocery Store | `/pages/cf-grocery-store` | `page.cf-grocery-store` |

### How to Edit an Existing Individual Page

1. Go to **Online Store → Themes → Customize**
2. Use the page selector at the top → **Pages** → select the page (e.g. "Grocery Store Equipment")
3. Click on the **"cf-industry-hub"** section in the left panel
4. All blocks are listed: nav tabs, equipment sections, store types, guides, brands

#### Equipment Sections
Each equipment section block controls one row on the page (e.g. "Produce Coolers"):

| Field | What It Controls |
|-------|-----------------|
| **Image** | Upload a photo for this equipment category (4:3 ratio) |
| **Image URL** | External/placeholder URL (temporary) |
| **Anchor ID** | ID that the category nav tab scrolls to (must match the nav tab's anchor) |
| **Image on right side** | Toggle to flip the image to the right (alternating layout) |
| **Section title** | e.g. "Produce Coolers" |
| **Description** | Short paragraph |
| **Bullet points 1–3** | Checkmark list items below the description |
| **Button text** | CTA label |
| **Button URL** | Where the CTA links |
| **Collection handle** | Shopify collection whose products appear (first 4 products shown with prices) |
| **View All URL** | The "View All →" link |

#### Store Type Grid
Each "Store Type Card" block is one item in the "Shop by Store Type" grid:

| Field | What It Controls |
|-------|-----------------|
| **Image** | Upload a photo (landscape, 16:11 ratio) |
| **Image URL** | External/placeholder URL (temporary) |
| **Store type name** | Label below the image |
| **Card link URL** | Where the card links when clicked |

#### Buying Guides
Each "Buying Guide" block is one guide entry:

| Field | What It Controls |
|-------|-----------------|
| **Thumbnail image** | Small image shown on the guide card |
| **Image URL** | External/placeholder URL (temporary) |
| **Guide title** | The article/guide headline |
| **Guide URL** | Link to the blog post or article |
| **Label** | Tag shown below title (e.g. "Guide", "Article", "Video") |

#### Brands
Each "Brand" block is one brand name shown in the "Top Brands We Carry" section:

| Field | What It Controls |
|-------|-----------------|
| **Brand name** | Text displayed |
| **Brand URL** | Where clicking the brand name goes |

---

## Part 3 — How to Create a New Individual Use Case Page

> **Example:** Creating a "Pizza Restaurant" individual page

### Step 1 — Ask your developer to create the template file

Your developer needs to create a new template file:  
`templates/page.cf-pizza-restaurant.json`

This pre-populates all the blocks (nav tabs, equipment sections, store types, guides, brands) for Pizza Restaurant. Once the file is pushed to the theme, you don't need to manually add any blocks in the editor — they'll already be there.

**Provide your developer with:**
- Page title (e.g. "Pizza Restaurant Equipment Solutions")
- Hero description (1–2 sentences)
- Equipment categories to feature (e.g. Pizza Ovens, Prep Tables, Refrigerators, Dough Mixers)
- The Shopify collection handle for each equipment category
- Store types to show in the grid (e.g. "Neapolitan Pizzeria", "Fast Pizza", "Pizza Buffet")
- 2–3 buying guide titles and blog post links
- Brands to feature (e.g. Wisco, Lincoln, Bakers Pride)

### Step 2 — Create the page in Shopify Admin

1. Go to **Online Store → Pages → Add page**
2. **Title:** Pizza Restaurant Equipment
3. **Handle** (URL slug): `cf-pizza-restaurant`  
   *(This must exactly match the template filename `page.cf-pizza-restaurant`)*
4. **Theme template:** select `page.cf-pizza-restaurant`
5. Leave body content blank
6. Click **Save**

The page is now live at `/pages/cf-pizza-restaurant`

### Step 3 — Link it from the landing page

1. Theme Editor → Use Cases landing → click the "Pizza Restaurant" card block
2. Update **Button URL** to `/pages/cf-pizza-restaurant`
3. Save

### Step 4 — Upload real images

For hero, equipment section, and store type images, follow the upload steps in Part 2.

---

## Part 4 — Hero Image for Individual Pages

Each individual use case page has a **hero banner** at the top. By default it shows a dark gradient background.

To add a real hero photo:
1. Theme Editor → navigate to the individual page
2. Click the **"cf-industry-hub"** section
3. Scroll to **"Hero image"** in the section settings (not inside a block — it's at the section level)
4. Upload a wide photo (recommended: **1600×700px, landscape**)

---

## Current Placeholder Images

All gray placeholder boxes (`500 × 375`, `720 × 540` etc.) are temporary. They use [placehold.co](https://placehold.co) and will be replaced once real photography is provided.

**Priority images needed from client:**
- Hero photo per use case (wide, dark-toned kitchen/store photos work best)
- One representative photo per equipment section
- Store type photos (square or landscape shots of the store type)
- Guide thumbnails (can be product photos or in-store shots)

---

## Use Cases Planned but Not Yet Built

The following use cases are referenced in the design but don't have individual pages yet:

| Use Case | Status | Notes |
|----------|--------|-------|
| Bakery | Landing card only | Template not yet created |
| Pizza Restaurant | Landing card only | Template not yet created |
| Indian Restaurant | Landing card only | Template not yet created |
| Café / Coffee Shop | Landing card only | Template not yet created |
| Food Truck | Landing card only | Template not yet created |
| Grocery Store | ✅ Live | `/pages/cf-grocery-store` |

To build each one: provide content to your developer (see Part 3 Step 1), and a new page will be created within one working day.

---

## Quick Reference — Collection Handles Used

| Use Case Card | Collection Handle | Products |
|---------------|------------------|---------|
| Bakery | `commercial-ovens` | 104 |
| Pizza Restaurant | `refrigerated-pizza-prep-tables` | 14 |
| Grocery Store | `reach-in-refrigerators-all` | 619 |
| Indian Restaurant | `indian-specialty` | 16 |
| Café / Coffee Shop | `ice-machine-all-by-all-brands` | 35 |
| Food Truck | `commercial-grills-and-griddles` | 38 |

*These are the collections whose first 4 products appear as thumbnails in each landing page card.*

---

## Need Help?

Contact **Hiraya Digital** for:
- Creating new individual use case page templates
- Uploading and replacing placeholder images in bulk
- Adding more use case types to the landing page
- Any layout or content issues

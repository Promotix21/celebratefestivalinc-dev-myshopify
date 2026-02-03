# Celebrate Festival Store Operations Guide

This guide is your map to managing the Celebrate Festival Shopify store. It explains how backend settings in Shopify Admin connect to what customers see on the website.

---

## 📚 Table of Contents
1. [Menu & Navigation (Mega Menu)](#1-menu--navigation-mega-menu)
2. [Homepage Management](#2-homepage-management)
3. [Collection Hierarchy (Categories)](#3-collection-hierarchy-categories)
4. [Product Page Management](#4-product-page-management)
5. [General Settings & Text](#5-general-settings--text)

---

## 1. Menu & Navigation (Mega Menu)

The main navigation bar is a "Mega Menu" that displays images and columns.

### **Where to Edit:**
1. **Links & Structure:** Go to **Online Store > Navigation > Main Menu**.
   - This determines the *links* and the *text* of the menu items.
   - **Important:** Do NOT change the "Handle" of menu items if possible, as the design relies on them.

2. **Visuals (Images & Columns):** Go to **Online Store > Themes > Customize > Header**.
   - Click on the **Header** section on the left sidebar.
   - You will see "Blocks" under the Header section (e.g., `Mega Menu`, `Logo Grid`).
   - Click on a block to edit:
     - **Menu Handle:** Connects this visual block to a menu item (must match the handle in Navigation).
     - **Promotional Images:** Upload images that appear inside the dropdown.
     - **Column Layout:** Adjust how many columns appear.

---

## 2. Homepage Management

The homepage is built from stacked "Sections". You can reorder, hide, or edit them.

### **Where to Edit:**
Go to **Online Store > Themes > Customize**.

| Section Name | What it Controls | What You Can Change |
|--------------|------------------|---------------------|
| **Hero Diagonal Slider** | The main top banner | Images, Headings ("Never Pay More..."), Buttons ("Shop Equipment") |
| **Trust Badges** | Icons below banner | Icons (Shipping, Warranty), Titles, Descriptions |
| **Hexagon Brand Grid** | "100+ Trusted Brands" | Brand Logos, "View All" Button link |
| **Featured Categories** | Grid of circles/cards | Images for categories, Category Names, "Sale/New" Badges |
| **Staff Picks** | "Handpicked by experts" | Select the Collection to display (e.g., "Best Sellers") |
| **Partner Section** | "Your Complete Partner" | Text, Image, Checkmark points |
| **Industry Use Cases** | "Pizza", "Bakery" cards | Images, Icons (🍕), Titles, Links to industry pages |
| **Testimonials** | Customer reviews slider | Review text, Author names, Star ratings |

---

## 3. Collection Hierarchy (Categories)

Your store uses a tiered structure like WebstaurantStore:
**Level 1 (Main)** → **Level 2 (Sub)** → **Level 3 (Product Category)** → **Products**

### **How it Works:**
*   **Collection Naming:** You may see collections named `New Theme - Griddles`. The code **automatically removes** "New Theme -" so customers just see "Griddles".
*   **Templates:** The "Look" of a page depends on the **Theme Template** assigned to the collection in Shopify Admin.

### **Setting Up a New Category:**

1.  Go to **Products > Collections > Create collection**.
2.  **Title:** Name it (e.g., `New Theme - Pizza Ovens`).
3.  **Description:** Optional (usually not shown on index pages).
4.  **Image:** **CRITICAL!** Upload a square (1:1) image. This image appears on the parent category page card.
5.  **Theme Template (Bottom Right):**
    *   Select `collection.level-1` for Main Categories (e.g., Restaurant Equipment).
    *   Select `collection.level-2` for Sub-Categories (e.g., Cooking Equipment).
    *   Select `collection.level-3` for Product Lists (e.g., Commercial Ovens).
    *   Select `Default collection` (or Level 4) for the final product grid with filters.

### **Special Case: Tabletop**
Tabletop has 4 levels.
*   **Tabletop:** Uses `level-1`
*   **Dinnerware:** Uses `level-2`
*   **China Dinnerware:** Uses `level-3` (shows sub-categories like Plates, Bowls)
*   **China Plates:** Uses `level-3` (shows actual products)

---

## 4. Product Page Management

The product page is highly customized. Much of the detailed info comes from **Metafields** (custom data fields) at the bottom of the product editing page in Admin.

### **Where to Edit:**
Go to **Products > [Select Product]**.

#### **A. Basic Info (Standard Shopify)**
*   **Title:** Product Name.
*   **Description:** Main text description.
*   **Media:** Images (drag to reorder). **First image** is the main image.
*   **Price:** Non-member price.
*   **Vendor:** Brand Name (displays logo automatically if file exists in assets).
*   **SKU:** Stock Keeping Unit.

#### **B. Member Pricing (WSH Plugin)**
*   **Wholesale Price:** Found in Metafields or WSH Plugin section.
*   *Note: If the user is logged in as a "Member", they see this price. If not, they see a blurred price with a login prompt.*

#### **C. Custom Data (Metafields)**
Scroll to the bottom of the product page to **Metafields**.

| Metafield Name | What it Does | Example Data |
|----------------|--------------|--------------|
| **Specs Table Pic/PDF** | Image/PDF shown in Specs sidebar | Upload an image/PDF file |
| **Material** | Lists material in Specs | "Stainless Steel", "Aluminum" |
| **Free Shipping** | Toggles "Free Shipping" badge | `true` (checked) or `false` |
| **Feature Sections** | Checkmarked list in description | "Heavy Duty|Easy Clean|NSF Listed" (Use `|` to separate lines) |
| **Works With Products** | "You May Also Need" carousel | Select related products |
| **Warranty Document** | Link in "Resources" sidebar | Upload PDF |
| **Specification Sheet** | Creates a table in Specs sidebar | `Height: 30"|Width: 24"|Volts: 120` (Use `|` to separate rows) |
| **Certifications** | Badge icons (NSF, ETL) | List of text values |
| **Shipment Text** | Green text in "Instant Access" box | "Ships in 24 hours" |

---

## 5. General Settings & Text

Some text is global and changed in the Theme Settings.

### **Where to Edit:**
Go to **Online Store > Themes > Customize > Theme Settings (Gear Icon)**.

*   **Colors:** Change your brand colors (Deep Blue, Coral, etc.) here.
*   **Typography:** Change fonts.
*   **Cart Drawer:** Enable/Disable the slide-out cart.
*   **Social Media:** Add links to your Facebook/Instagram.

### **Specific Text Labels:**
To change text like "Add to Cart", "Sold Out", or "Non-Member Price":
1.  Go to **Online Store > Themes > Customize**.
2.  Navigate to the **Product Page** template.
3.  Click on the **Product Information** section on the left.
4.  Look at the settings on the right panel. You will find fields for:
    *   Price Label ("Non-Member Price:")
    *   Member Price Label ("Plus Member Price:")
    *   Shipping Alert Text
    *   Help Phone Number

---
**Tip:** If you can't find where to change text, it's likely in **Theme Content**.
Go to **Online Store > Themes > ... (Actions) > Edit default theme content** and search for the text you want to change.

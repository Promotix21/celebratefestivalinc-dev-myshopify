# Deployment Guide - WebstaurantStore Style Product Page

## 📁 Files to Copy to Shopify

You need to copy **2 files** from GitHub to your Shopify theme editor:

---

## Step 1: Copy the Liquid Template File

### File Location on GitHub:
```
sections/product-webstaurant-improved.liquid
```

### Where to Copy in Shopify:
1. Go to Shopify Admin → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. In the left sidebar, find **"Sections"** folder
4. Click **"Add a new section"**
5. Name it: `product-webstaurant-improved`
6. Copy the **entire contents** of `sections/product-webstaurant-improved.liquid` from GitHub
7. Paste into the Shopify code editor
8. Click **Save**

---

## Step 2: Copy the CSS File

### File Location on GitHub:
```
assets/product-webstaurant-improved.css
```

### Where to Copy in Shopify:
1. Still in the code editor, find **"Assets"** folder in left sidebar
2. Click **"Add a new asset"**
3. Choose **"Create a blank file"**
4. Name it: `product-webstaurant-improved.css`
5. Copy the **entire contents** of `assets/product-webstaurant-improved.css` from GitHub
6. Paste into the Shopify code editor
7. Click **Save**

---

## Step 3: Create a New Product Template

### In Shopify Theme Customizer:

1. Go to **Online Store** → **Themes**
2. Click **Customize** (on your active theme)
3. In the top dropdown, change from "Home page" to **"Products"** → **"Default product"**
4. Click the dropdown again and select **"Create template"**
5. Name it: `WebstaurantStore Style` (or any name you prefer)
6. In the template editor:
   - Remove all existing sections
   - Click **"Add section"**
   - Scroll down to find **"Product - WebstaurantStore Style"** (this is your new section)
   - Add it
7. Click **Save**

---

## Step 4: Configure Template Settings

### Enable Demo Mode (For Testing):

1. With the template open in customizer, select the **"Product - WebstaurantStore Style"** section
2. In the left sidebar settings panel, find **"🧪 DEVELOPMENT MODE"**
3. Check the box: **"Show Demo Data"** ✓
4. Click **Save**

**Result:** You'll now see example content populate all sections (accordion features, works with products, specifications, etc.)

---

### Important Settings to Configure:

| Setting | Default | What It Does |
|---------|---------|--------------|
| **Show Demo Data** | OFF | ⚠️ Enable for preview, disable for production |
| **Enable Member Pricing** | ON | Shows member-only pricing section |
| **Enable Image Zoom** | ON | Adds zoom button to product images |
| **Show Protection Plan** | ON | Shows "What We Offer" protection section |
| **Show Rewards Info** | ON | Shows rewards points earning info |
| **Show Feature Accordion** | ON | Shows collapsible feature sections |
| **Show Specifications Table** | ON | Shows product specs table |
| **Show 'Works With' Section** | ON | Shows related products carousel |

---

## Step 5: Assign Template to Products

### To use this template on specific products:

1. Go to Shopify Admin → **Products**
2. Open any product
3. On the right sidebar, scroll to **"Theme template"**
4. Select dropdown → Choose **"WebstaurantStore Style"** (or whatever you named it)
5. Click **Save**

### To set as default template:

1. Go to **Online Store** → **Themes** → **Customize**
2. Navigate to **Products** → **Default product**
3. Change template to use your new WebstaurantStore style section
4. Save

---

## Step 6: Testing with Demo Data

### What You Should See with Demo Mode ON:

✅ **Product Title** - Shows actual product title
✅ **Pricing** - Shows regular price + blurred member price
✅ **Free Shipping Badge** - Displays if enabled
✅ **Protection Plan** - Shows example "$78.99" coverage
✅ **Key Features** - Shows 8 example bullet points
✅ **Feature Accordion** - Shows 3 collapsible sections with placeholder images
✅ **Specifications** - Shows example specs table (dimensions, electrical, etc.)
✅ **Works With Section** - Shows 4 example related products
✅ **Product Description** - Shows actual product description
✅ **Warranty** - Shows example warranty text

### Demo Mode Banner:
At the top of the page, you'll see a red banner:
```
⚠️ DEMO MODE ACTIVE - Showing Example Data | Turn off "Show Demo Data" in theme settings for production
```

---

## Step 7: Going Live (Disable Demo Mode)

### When ready for production:

1. Go back to theme customizer
2. Select the product template
3. Click on the **"Product - WebstaurantStore Style"** section
4. In settings, **UNCHECK** "Show Demo Data" ☐
5. Save

**Result:** Template will now only show real data from:
- Product metafields
- Product tags
- Shopify default fields

**Sections will auto-hide if no data exists** (graceful fallback)

---

## Step 8: Populate Real Data

### For template to work fully, products need:

#### **Tags** (for section display):
- `show:works-with` → Enables "Works With" section
- `free-shipping` → Shows free shipping badge

#### **Metafields** (for content):
- `custom.key_features` → Bullet point features
- `custom.specification` → Specs table data
- `custom.feature_sections` → Accordion sections (JSON)
- `custom.works_with_products` → Related product references
- `custom.member_price` → Member-only pricing
- `custom.certifications` → Certification badges
- `custom.warranty` → Warranty text
- `custom.shipment_text` → Shipping info

📚 **Full data guide:** See `SIMPLE_PRODUCT_SETUP_GUIDE.md`

---

## Troubleshooting

### Issue: Section not showing up
**Solution:** Make sure you saved the file with exact name: `product-webstaurant-improved` (no .liquid extension in section name)

### Issue: CSS not loading
**Solution:**
1. Check file is in Assets folder as `product-webstaurant-improved.css`
2. Add this to the section file if missing:
   ```liquid
   {{ 'product-webstaurant-improved.css' | asset_url | stylesheet_tag }}
   ```

### Issue: Demo data not showing
**Solution:** Make sure "Show Demo Data" checkbox is enabled in section settings

### Issue: Real data not showing
**Solution:**
1. Disable demo mode
2. Check product has required metafields filled
3. Check product has correct tags
4. See `SIMPLE_PRODUCT_SETUP_GUIDE.md` for data requirements

---

## Key Features of This Template

### ✅ WebstaurantStore-Inspired Design
- Clean, minimal aesthetic
- Focus on price and CTA
- Professional layout

### ✅ Optimized Sidebar Order
1. Free Shipping Badge (if applicable)
2. **Price** (large and prominent)
3. Protection Plan
4. **Quantity + Add to Cart** (high up!)
5. Rewards Info
6. Wishlist Button
7. Shipping Info

### ✅ Feature Accordion
- Collapsible sections with images
- Professional presentation
- Easy to read

### ✅ Demo Data Toggle
- Preview full design immediately
- No need to wait for client data
- Easy switch to production

### ✅ Graceful Fallbacks
- Sections auto-hide if no data
- No broken/empty sections
- Works with partial data

### ✅ Mobile Responsive
- Adapts to all screen sizes
- Touch-friendly controls
- Optimized layout

---

## File Summary

| File | Purpose | Size |
|------|---------|------|
| `sections/product-webstaurant-improved.liquid` | Product template structure | ~1000 lines |
| `assets/product-webstaurant-improved.css` | Styling (WebstaurantStore aesthetic) | ~600 lines |

---

## Need Help?

**Issues with template:** Check GitHub repo for updates
**Data population:** See `SIMPLE_PRODUCT_SETUP_GUIDE.md`
**Metafield details:** See `PRODUCT_DATA_REQUIREMENTS.md`

---

## Quick Checklist

- [ ] Copied `product-webstaurant-improved.liquid` to Sections folder
- [ ] Copied `product-webstaurant-improved.css` to Assets folder
- [ ] Created new product template in customizer
- [ ] Added "Product - WebstaurantStore Style" section to template
- [ ] Enabled "Show Demo Data" for testing
- [ ] Saved template
- [ ] Assigned template to test product
- [ ] Previewed product page
- [ ] Saw demo data displaying correctly
- [ ] Ready to populate real data
- [ ] Disabled demo mode when going live

---

**END OF DEPLOYMENT GUIDE**

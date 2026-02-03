# Post-Launch Checklist - Celebrate Festival Theme

**Theme Name:** Celebrate-festival-PT - preWPD
**Created:** January 20, 2026
**Status:** Pre-Launch

---

## Theme Push Command

```bash
shopify theme push --store celebratefestivalinc.myshopify.com --theme "Celebrate-festival-PT - preWPD"
```

## Theme Preview Link

**Theme ID:** `148264910893`

**Preview URL:**
```
https://celebratefestivalinc.myshopify.com/?preview_theme_id=148264910893
```

**Theme Editor:**
```
https://celebratefestivalinc.myshopify.com/admin/themes/148264910893/editor
```

---

## Preview Specific Pages (Before Going Live)

### IMPORTANT: Custom Domain Limitation

The `?preview_theme_id=` parameter **DOES NOT WORK** on the custom domain (celebratefestivalinc.com) because it redirects and strips the parameter.

### Solution: Use Shopify Theme Dev Server

Run this command to start a local development server that renders the unpublished theme correctly:

```bash
shopify theme dev --store celebratefestivalinc.myshopify.com --theme "Celebrate-festival-PT - preWPD"
```

This will give you a `localhost` URL (e.g., `http://127.0.0.1:9292`) where you can test all pages properly.

### Alternative: Preview URLs (may not work with custom domain redirect)

### Cart Page (Bug #18 - Template Preview Issue)
```
https://celebratefestivalinc.myshopify.com/cart?preview_theme_id=148264910893
```

Alternative cart view:
```
https://celebratefestivalinc.myshopify.com/cart?view=drawer&preview_theme_id=148264910893
```

### Collection Pages
```
https://celebratefestivalinc.myshopify.com/collections/restaurant-equipment?preview_theme_id=148264910893
```

### Product Page
```
https://celebratefestivalinc.myshopify.com/products/[PRODUCT-HANDLE]?preview_theme_id=148264910893
```

### Search Results
```
https://celebratefestivalinc.myshopify.com/search?q=griddle&preview_theme_id=148264910893
```

### Homepage
```
https://celebratefestivalinc.myshopify.com/?preview_theme_id=148264910893
```

### Contact Page
```
https://celebratefestivalinc.myshopify.com/pages/contact?preview_theme_id=148264910893
```

---

## Known Conflicts With Live Theme

These pages/features may show differently when previewing vs. the live theme:

| Page/Feature | Issue | Solution |
|--------------|-------|----------|
| Cart | Renders live theme template | Use `?preview_theme_id=148264910893` |
| New page templates | Don't appear in Admin dropdown | Create pages after theme is live |
| Resource pages (FAQ, Videos, Installation) | Links will 404 | Pages must be created after theme is live |

---

## IMPORTANT: Do These Tasks AFTER Theme Goes Live

These tasks cannot be completed until the theme is published because Shopify only shows templates from the live theme.

---

## 1. Create Resource Pages (Bug #15)

After publishing the theme, create these 3 pages:

### FAQ Page
1. Go to **Shopify Admin → Online Store → Pages**
2. Click **Add page**
3. Title: `FAQ` or `Frequently Asked Questions`
4. Handle: `faq` (check URL slug)
5. Template: Select `page.faq`
6. Save
7. Customize content via **Theme Customizer**

### Product Videos Page
1. Go to **Shopify Admin → Online Store → Pages**
2. Click **Add page**
3. Title: `Product Videos`
4. Handle: `product-videos`
5. Template: Select `page.product-videos`
6. Save
7. Add video blocks via **Theme Customizer**

### Installation Service Page
1. Go to **Shopify Admin → Online Store → Pages**
2. Click **Add page**
3. Title: `Installation Service` or `Professional Installation`
4. Handle: `installation-service`
5. Template: Select `page.installation`
6. Save
7. Customize content via **Theme Customizer**

---

## 2. Verify Help Box Links

After creating the pages above, verify these links work:
- [ ] `/pages/faq` → FAQ page loads correctly
- [ ] `/pages/product-videos` → Product Videos page loads
- [ ] `/pages/installation-service` → Installation Service page loads
- [ ] Help Box on product pages shows all 3 links

---

## 3. Verify Bug #23 - Smallwares Navigation

Check navigation menu hierarchy:

1. Go to **Shopify Admin → Online Store → Navigation**
2. Find the main menu
3. Verify path: **Smallwares → Cookware → Indian Specialty - Cookware**
4. If incorrect, update the menu links to proper hierarchy
5. Expected: Indian Specialty - Cookware should be under **Indian Specialty** parent, not Smallwares

---

## 4. Upload Missing Collection Images (Bug #21)

1. Go to **Shopify Admin → Products → Collections**
2. Find **Indian Specialty** collection
3. Add a collection image (square recommended, min 400x400px)
4. Save

---

## 5. Test All Fixed Bugs

After theme is live, verify these fixes work:

### Product Cards
- [ ] #1: Member pricing label at bottom of price section
- [ ] #2: SKU displays as styled badge
- [ ] #3: Add to Cart button inside price box

### Homepage
- [ ] #10: Shop Equipment buttons go to `/collections/restaurant-equipment`
- [ ] #11: Rolling banner is hidden/removed

### Contact Form
- [ ] #12: Form type selector uses buttons (not dropdown)
- [ ] #13: File upload field appears in Quote Request form

### Cart
- [ ] #16: Continue Shopping returns to last browsed collection/product
- [ ] #17: Cart sidebar shows compact product list

### Collection Pages
- [ ] #19: Indian Specialty layout matches other categories
- [ ] #20: Parent collections show aggregated product counts
- [ ] #22: Breadcrumbs don't repeat (no "Indian Specialty > Indian Specialty")

### Filters
- [ ] #4: Filter checkboxes update product grid
- [ ] #6, #7: Filter buttons work from all navigation paths
- [ ] #8: Brand and Product Type at top of filter panel

### Search
- [ ] #24: Search results styling matches category pages

---

## 6. File Upload Limitation Note (Bug #13)

The file upload field has been added to the Quote Request form, but **Shopify's native contact forms cannot process file uploads**. Options:

1. **Current behavior:** Field is visible but files won't be attached to the email
2. **Solution options:**
   - Use a third-party form app (JotForm, Typeform, Formstack)
   - Use Uploadcare or Cloudinary for file handling
   - Add note for customers to email files separately to `sales@celebratefestivalinc.com`

---

## 7. Alternative Cart URL (Bug #18)

For testing unpublished cart designs, use:
- URL: `/cart?view=drawer`
- This renders the `cart.drawer.liquid` template

---

## Quick Reference - Page Handles

| Page | Handle | Template |
|------|--------|----------|
| FAQ | `faq` | `page.faq` |
| Product Videos | `product-videos` | `page.product-videos` |
| Installation Service | `installation-service` | `page.installation` |

---

## Contact

**Developer:** Rajesh Kumar - Hiraya Digital
**Theme:** Celebrate-festival-PT - preWPD
**Bug Tracker:** `Celebrate-Festival-Bug-Tracker-UPDATED.xlsx`

# Bug Verification Guide - January 30, 2026

## PREVIEW LINK (USE THIS TO TEST)

**https://celebratefestivalinc.myshopify.com?preview_theme_id=148264910893**

Open this link in an incognito/private browser window to test the fixes.

---

## How to Test

1. Open the preview link above
2. Follow each test below
3. Check the box when verified working
4. Report any issues that still occur

---

## TEST 1: Search Page Buttons

**Go to:** Search page - search for "mixer"

**What to test:**
1. In the left sidebar, find "Product Type" section
2. Click the **"Browse All"** link next to it
3. Should go to: `/collections` (a page showing all collections)

4. Go back to search results
5. Find "Brand" section in sidebar
6. Click the **"All Brands"** link
7. Should go to: `/collections/brands` (brands collection page, NOT a 404 error)

- [ ] "Browse All" works correctly
- [ ] "All Brands" works correctly (no 404)

---

## TEST 2: Product Card Button Alignment

**Go to:** Any collection page with products, e.g.:
- `/collections/food-preparation`
- `/collections/refrigeration`

**What to test:**
1. Look at the product grid
2. Find products with SHORT titles (1 line)
3. Find products with LONG titles (2-3 lines)
4. Compare where the "Add to Cart" buttons are positioned
5. All buttons should be at the SAME height (aligned at bottom of cards)

- [ ] Add to Cart buttons are aligned at same height across all cards

---

## TEST 3: Cart Notification Flash

**Go to:** Any collection page

**What to test:**
1. Change the "Sort by" dropdown (e.g., "Price: Low to High")
2. Watch the top-right corner during page reload
3. The cart popup should NOT flash/flicker briefly

- [ ] No cart flash when sorting or navigating

---

## TEST 4: Featured Categories (Homepage)

**Go to:** Homepage `/`

**What to test:**
1. Scroll to "Featured Categories" section
2. Count how many category cards are in ONE row
3. Should be **6 categories per row** (not 4)
4. Check the spacing above and below the section - should look tighter/reduced

- [ ] 6 categories per row on desktop
- [ ] Spacing above/below section is reduced

---

## TEST 5: Industry Use Cases (Homepage)

**Go to:** Homepage `/`

**What to test:**
1. Scroll to "Industry Use Cases" section (Pizza Restaurants, Italian Restaurants, etc.)
2. **Click on an IMAGE** (e.g., Pizza Restaurants image) - should navigate to a page
3. **Click on a TITLE** (e.g., "Pizza Restaurants" text) - should navigate to a page
4. **Click on a tag button** (e.g., "Pizza Ovens", "Dough Mixers") - should go to a collection
5. **Click "View Equipment"** button - should navigate to category page
6. Check spacing above this section - should be reduced

- [ ] Clicking images navigates to page
- [ ] Clicking titles navigates to page
- [ ] Tag buttons (Pizza Ovens, etc.) go to collections
- [ ] "View Equipment" buttons work
- [ ] Spacing above section is reduced

**NOTE:** If links don't work, the URLs may not be set in Theme Customizer. This is a content issue, not a code issue.

---

## TEST 6: Search Login Redirect

**Go to:** Search page (logged out)

**What to test:**
1. **Log out first** if you're logged in (important!)
2. Search for "mixer" or any product
3. Find a product showing **"Login for Member Pricing"**
4. Click that login link
5. Log in with test account
6. After login, you should be **redirected back to the search results page**
7. Products should still be visible (not a blank page)

Test credentials (if needed): [Ask team for test account]

- [ ] After login, redirects back to search page (not blank)
- [ ] Products are still visible after login

---

## Quick Checklist Summary

| Test | What to Check | Pass? |
|------|--------------|-------|
| Search Buttons | "Browse All" and "All Brands" work | [ ] |
| Card Alignment | Add to Cart buttons same height | [ ] |
| Cart Flash | No flash on sort/navigation | [ ] |
| Featured Categories | 6 per row, less spacing | [ ] |
| Industry Use Cases | Images/titles/buttons clickable | [ ] |
| Login Redirect | Returns to search after login | [ ] |

---

## Troubleshooting

**If something doesn't work:**

1. **Hard refresh the page** - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Try incognito mode** - Old CSS may be cached
3. **Check you're using the preview link** - Must have `?preview_theme_id=148264910893` in URL
4. **Report the issue** with:
   - Which test failed
   - What you expected
   - What actually happened
   - Screenshot if possible

---

## Already Fixed by Client

These were in the bug list but client already fixed them:
- Homepage category images have links (client added these)

## Not Code Issues

These require Shopify Admin changes, not code:
- Duplicate Product Type filters ("Planetry Mixers" vs "Planetary Mixer") - fix in product tags
- Industry Use Cases missing images - add images in Theme Customizer

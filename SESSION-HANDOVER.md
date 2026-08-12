# Session Handover — Dinnerware Storefront API Filter POC

**Date:** 2026-08-11
**Branch:** `main` (commit `de9b4dc` — no new commits this session; investigation only)
**Theme touched:** NONE — no files modified, no pushes
**Status:** POC complete. Architecture approved. Implementation NOT STARTED.

---

## 1. What this session was

Pure investigation. Task: determine whether Shopify's Storefront API can provide working filters for the oversized Dinnerware "All Products" view, which Liquid cannot filter because the collection exceeds Shopify's ~5,000-product threshold.

No code was written. This document captures all findings so the next session can implement directly.

---

## 2. The problem being solved

Dinnerware is the only L2 collection that exceeds Shopify's ~5,000-product storefront filter limit (~5,991 published products). As a result:
- `collection.filters` in Liquid returns empty — sidebar shows "No filters available"
- `filter.p.vendor=X` URL params are completely IGNORED by Shopify Liquid — `collection.products` returns the full unfiltered set regardless

All other 26 L2 collections are under 5,000 products and their native filters work correctly. When an L3 pill is selected inside Dinnerware (e.g. Porcelain Dinnerware), that L3 collection is small and filters work normally. The problem is exclusively Dinnerware → "All Products."

---

## 3. Confirmed Dinnerware product counts

| Source | Count | Notes |
|--------|-------|-------|
| Admin REST (all products in collection) | 6,123 | Includes draft |
| Admin REST — Active status | 5,994 | Matches previous audit |
| Admin REST — Draft status | 129 | In collection but invisible to storefront |
| Admin REST — Archived | 0 | |
| Admin REST — Active + published to Online Store | 5,991 | The true storefront-visible total |
| Admin REST — Active + unpublished from Online Store | 3 | Active but explicitly hidden |
| **Storefront API full pagination (exhausted)** | **5,991** | Matches exactly — no gap |
| Storefront API facet availability sum | ~5,020 | **Underreported** — facet count computation hits its own ~5,000 internal cap |

**Key reconciliation:** The "5,994 vs 5,020" apparent discrepancy from the previous session is now explained:
- 5,994 = Admin active-status count (includes 3 unpublished-from-Online-Store products)
- 5,991 = Storefront API actual (all 250-product cursor pages exhausted at exactly 5,991)
- ~5,020 = Storefront API facet `count` fields, which stop computing after ~5,000 products — an internal Shopify limitation on facet counting, not on actual product access
- The facet counts are underreported but the facet GROUPS and LABELS are correct and usable

---

## 4. Storefront API POC findings (all run on 2026-07)

**API version confirmation:** `x-shopify-api-version: 2026-07` returned in response headers. ✅

### 4a. ProductFilter inputs — PASS/FAIL

| Filter | Result | Details |
|--------|--------|---------|
| `productVendor` | **PASS** | `{productVendor: "Winco"}` returned correct Winco-only products, cursor pagination preserved |
| `productType` | **FAIL** | Silently ignored — even a bogus value `"XYZZY_NONEXISTENT_99999"` returned real products. Root cause: the native `productType` filter (`filter.p.product_type`) is not configured in Search & Discovery for this store. The store uses tag-based filtering (`filter.p.tag`) as "product type" instead. **To enable:** Shopify Admin → Apps → Search & Discovery → Filters → add Product Type. |
| `available` | **PASS with caveat** | `{available: true}` is accurate. `{available: false}` returns correct out-of-stock products but also surfaces a small number of products with real inventory — these have stale Search & Discovery index entries. The facet COUNTS (In stock / Out of stock) in `ProductConnection.filters` are accurate; only the GraphQL input filter has the stale-index edge case. |
| `price` | **PASS** | `{price: {min: 10.0, max: 50.0}}` returned 5 correctly price-ranged products, `hasNextPage: true` |

### 4b. The four reconfirmation checks

**1. `ProductConnection.filters` returns facets for Dinnerware despite >5,000 Liquid limitation**
**CONFIRMED.** Five filter groups on 2026-07:
- `[LIST]` Product Size — 100 non-zero values
- `[LIST]` Availability — In stock: 4,976 / Out of stock: 44 (underreported; actual 5,991 but usable)
- `[PRICE_RANGE]` Price
- `[LIST]` Brand — 14 vendors: CAC 1,737 / Thunder Group 1,134 / Yanco China 857 / Ariane 621 / Serv-Ware 257 / Porto Brasil 208 / Unox 115 / Cambro 46 / Winco 14 / Acopa 4 / Servewell 3 / Vollrath 2 / American MetalCraft 1 / GET 1
- `[LIST]` product type (tag-based) — 100 values

**2. Facet counts narrow correctly after a filter**
**CONFIRMED.** Applying `{productVendor: "Winco"}`:
- Availability before: In stock 4,976 / Out of stock 44
- Availability after: In stock 14 / Out of stock 0
- Brand group retains all 14 vendors (standard AND-narrowing), Product Size drops to all-zero (correct)

**3. Cursor pagination continues beyond product #5,000**
**CONFIRMED.** Full exhaustion run:
```
1000 → hasNextPage: true
2000 → hasNextPage: true
3000 → hasNextPage: true
4000 → hasNextPage: true
5000 → hasNextPage: true   ← Shopify Liquid stops filtering here; API does not
5250 → hasNextPage: true
5500 → hasNextPage: true
5991 → hasNextPage: false  ← collection exhausted, matches Admin published count exactly
```

**4. URL filter params filter `collection.products` on the oversized collection**
**FAIL — this CORRECTS the original POC report from the previous session.**

The previous report incorrectly stated URL filter params still apply to `collection.products` for oversized collections. They do not. Confirmed with direct measurement:

```
Dinnerware + ?filter.p.vendor=Winco:
  Unfiltered:  557 product links, "Thunder Group" 30 mentions
  Filtered:    557 product links, "Thunder Group" 30 mentions  ← unchanged

Commercial Ovens (small L3) + ?filter.p.vendor=Rational:
  Unfiltered:  541 links, 6 Rational mentions, 1.16 MB
  Filtered:    446 links, 177 Rational mentions, 0.84 MB  ← genuinely filtered
```

Both `collection.filters` AND `collection.products` URL filtering are suppressed for the >5,000 Dinnerware collection. The page renders identically regardless of any `filter.*` URL parameters.

---

## 5. Architecture — what must be built

### What WORKS without changes (do not touch)
- L3 pill selection on Dinnerware (click "Porcelain Dinnerware" → L3 collection loads, filters work natively — that L3 is <5,000 products)
- All 26 other L2 collections — native filters work, no changes needed
- Normal L3 collection pages — unaffected

### What must be built (Dinnerware "All Products" only)

Because URL filter params are ignored for oversized Liquid renders, the Storefront API must handle BOTH the sidebar AND the filtered product list when a filter is active on Dinnerware "All Products."

**Trigger condition (Liquid emits this flag):**
```liquid
{% if collection.filters.size == 0 %}
  <script>window.cfOversizedCollection = true;</script>
{% endif %}
```

**When NO filter is active (All Products, no selection):**
- Products: rendered by Liquid as normal (100/page, native pagination) — no change
- Sidebar: JS fires one Storefront API call → `ProductConnection.filters` → builds sidebar HTML in JS using existing CSS classes

**When a filter IS active on Dinnerware All Products:**
- Sidebar: rebuilt from Storefront API `ProductConnection.filters` (with the applied filter, so counts narrow correctly)
- Products: fetched from Storefront API `products(first: 100, filters: [...])` with cursor pagination → rendered as product card HTML in JavaScript
- Load More: next-page cursor stored in JS, Load More button appends next 100 products via another API call

**JS-rendered product cards must preserve:**
- `data-cf-product-id`, `data-cf-variant-id`, `data-cf-price`, `data-cf-compare-at-price`, `data-cf-handle`, `data-cf-collection-ids` (for BDR pricing)
- Wishlist button (`data-product-id`)
- ATC button
- Vendor CTA logic (is_own_brand / is_member)
- Compare-at-price strikethrough
- Free Shipping badge (if metafield available)

**After every product swap:** fire `cf:products-added`, call `window.cfWholesalePricingInit()`, call `CelebrateFestivalWishlist.updateAllIcons()` — same pattern as cfL2 reinit.

**When "All Products" is restored (filter cleared):** revert to normal Liquid render via cfL2-style swap back to the base Dinnerware URL.

### Storefront API access
No token is required. The store is a live public store; Shopify grants unauthenticated Storefront API access to public catalog data. This was confirmed — all POC queries ran without a token. If rate-limiting becomes a concern in production, a public Storefront token can be created via Shopify Partners dashboard → Headless channel (requires user to authorize).

**Storefront API endpoint to use:**
```
POST https://celebratefestivalinc.myshopify.com/api/2026-07/graphql.json
Content-Type: application/json
```

**Core query pattern (sidebar facets + first product page):**
```graphql
{
  collection(handle: "dinnerware") {
    products(first: 100, filters: [{productVendor: "CAC"}]) {
      pageInfo { hasNextPage endCursor }
      filters {
        id label type
        values { id label count input }
      }
      nodes {
        id title handle vendor productType availableForSale
        priceRange {
          minVariantPrice { amount }
          maxVariantPrice { amount }
        }
        compareAtPriceRange { minVariantPrice { amount } }
        featuredImage { url altText }
        variants(first: 1) {
          nodes { id price compareAtPrice availableForSale }
        }
        collections(first: 10) { nodes { id } }
        metafields(identifiers: [{namespace: "custom", key: "free_shipping"}]) {
          value
        }
      }
    }
  }
}
```

**Filters to pass (from URL params → API input):**
- `filter.p.vendor=X` → `{productVendor: "X"}`
- `filter.v.price.gte=10&filter.v.price.lte=50` → `{price: {min: 10.0, max: 50.0}}`
- `filter.v.availability=1` → `{available: true}`
- `filter.v.availability=0` → `{available: false}` (caveat: minor stale-index edge cases)

---

## 6. Files that will need changes (implementation scope)

| File | Change |
|------|--------|
| `sections/main-collection-cf.liquid` | 1. Emit `window.cfOversizedCollection = true` when `collection.filters.size == 0`. 2. Add JS module (~150–200 lines): detect flag, fetch API for sidebar, build sidebar HTML from existing CSS classes, handle filter selection → API product fetch → card render, cursor pagination via Load More, reinit BDR/wishlist/ATC after each render. |
| Possibly `snippets/product-card.liquid` | Read-only reference to understand the card HTML structure so the JS renderer can match it exactly. No Liquid changes required — the JS duplicates its output. |
| `assets/cf-wholesale-pricing.js` | No changes expected — already listens for `cf:products-added`. Verify `data-cf-*` attributes are correctly emitted by the JS card renderer. |

**No changes to:** collection memberships, menus, templates, BDR integration, cfL2 module, wishlist, ATC, product-card.liquid (Liquid side), any other collection pages.

---

## 7. Implementation status

| Phase | Status |
|-------|--------|
| POC investigation | ✅ Complete |
| Architecture reviewed and corrected | ✅ Complete |
| Architecture approved by user | ✅ Approved (2026-08-11) |
| Storefront API token (if needed) | Not required; unauthenticated access confirmed |
| Implementation | ❌ NOT STARTED |
| Push to DEV | ❌ NOT STARTED |
| QA | ❌ NOT STARTED |

**Next session should start implementing.** No further investigation needed before coding.

---

## 8. Storefront API collection GID (for reference)

```
gid://shopify/Collection/312422727725   (Dinnerware)
handle: dinnerware
```

Admin REST collection endpoint: accessible via `products/count.json?collection_id=312422727725` but NOT via `collections/:id` or Admin GraphQL (known `CollectionSubCollectionsSource` limitation — see existing memory).

---

## 9. Environment / workflow notes (unchanged)

- **Push method:** CLI `theme push` fails (device-auth expired). Push via Admin Asset API with `SHOPIFY_API_TOKEN` from `.env`.
- 🔒 **LIVE theme `148264910893` is READ-ONLY.** All pushes → DEV `186619461677` only.
- **Commit after every task** with `Fix task #<id>: ...` message.
- **Storefront API version:** use `2026-07` — `2024-01` is retired.
- **`productType` filter:** currently FAILS (not in S&D). If needed, enable in Shopify Admin → Apps → Search & Discovery → Filters. Tag-based "product type" filter (`filter.p.tag`) IS configured and works.
- **L2 collections not visible via Admin API:** resolve handles from menu `cf-menu-31-12-2026` instead.

# Shopify Homepage Merchandising — 2026-08-12

**Source:** `templates/index.json` (local repo) + Shopify Admin API
**Read-only. No data modified.**

---

## Homepage Section Order

| Position | Section Type | Status | Description |
|----------|-------------|--------|-------------|
| 1 | `home-restaurant-partners` | **DISABLED** | Restaurant Partners section (Task #89 — pending) |
| 2 | `hero-diagonal-slider` | Active | 4-slide hero banner |
| 3 | `featured-categories` | Active | Category grid with 13 blocks (4 visible by default) |
| 4 | `hexagon-grid` | Active | "100+ Trusted Brands" hexagon logo grid |
| 5 | `category-icon-row` | Active | 9 quick-nav icons |
| 6 | `industry-use-cases` | Active | 8 restaurant type use cases |
| 7 | `featured-products-grid` | Active | "Limited Time Sales" — collection `new-theme-staff-picks-copy` |
| 8 | `partner-section` | Active | "Your Complete Restaurant Equipment Partner" about section |
| 9 | `staff-picks` | Active | Staff Picks slider — collection `new-theme-staff-picks` |
| 10 | `journey-promo-banner` | show_section=false | Full-service journey steps (hidden) |
| 11 | `cart-showcase` | Active | Multi-Use Catering Cart feature |
| 12 | `testimonials` | Active | 10 Google review testimonials |

---

## Hero Slider (4 Slides)

| # | Badge | Headline | CTA Primary | Image |
|---|-------|----------|-------------|-------|
| 1 | Free Consultation | From Kitchen Dreams to **Restaurant Reality** | Shop Equipment → /collections/restaurant-equipment | 0003_Slider_3.jpg |
| 2 | Price Match Guarantee | Never Pay More for **Restaurant Equipment** | Shop Equipment → /collections/restaurant-equipment | banner-image-1.png |
| 3 | Authentic Equipment | Authentic Indian Kitchen **Equipment Specialists** | Shop Equipment → /collections/restaurant-equipment | hero-tandoor-new.jpg |
| 4 | Full-Service Restaurant Solutions | Your Partner From Design to **Grand Opening** | See Our Journey → /pages/journey | journey-hero-slider.png |

FACT: All 4 CTAs on slides 1–3 link to the same `/collections/restaurant-equipment` page.
NEEDS CONFIRMATION: Is this intentional? Slide 3 (Indian Equipment Specialists) could more usefully link to `/collections/indian-specialty-cooking-equipment`.

---

## Featured Categories Grid

13 category blocks defined. Visibility:

| Category | Default Visible | Link | Badge |
|----------|----------------|------|-------|
| Refrigeration | ✅ Yes | /collections/refrigeration | HOT |
| Food Prep Equipment | ✅ Yes | /collections/food-preparation | Sale |
| Commercial Ovens | ✅ Yes | /collections/commercial-ovens | hot |
| Smallwares | ✅ Yes | /collections/smallwares | SALE |
| Burners & Griddles | No (expand) | /collections/new-theme-burners-and-griddles | — |
| Wet Grinder & Chocolate Melanger | No (expand) | /collections/wet-grinder | SALE |
| Tandoor Equipment | No (expand) | /collections/new-theme-tandoor-and-parts | — |
| Indian Specialty Equipment | No (expand) | /collections/indian-specialty-cooking-equipment | HOT |
| Indian Serveware | No (expand) | /collections/indian-specialty-serveware | — |
| Food Display and Merchandising | No (expand) | /collections/food-display-and-merchandising | — |
| Work Tables | No (expand) | /collections/new-theme-stainless-steel-work-tables… | — |
| Tabletop & Serving | No (expand) | /collections/tabletop | — |
| Dishwashers | **Disabled** | (no URL) | — |

The "View all categories" button expands the hidden items.

---

## Hexagon Brand Grid (5 Rows, 8–9 Logos Each)

Brands featured in the homepage hexagon grid (40 logos total):

**Row 1:** True · Dukers · Waring · Turbo Air · Imperial · Doyon/NU-VU · Rational · Robot Coupe
**Row 2:** GSW · Sammic · Serv-Ware · Sharp · Krowne · Accutemp · American Range · Admiral Craft · Yanco China
**Row 3:** Winco · Arctic Air · Dexter Russell · American MetalCraft · Eurodib · Nemco · Atosa · **Rotoquip**
**Row 4:** Globe · **Hoshizaki** · Howard McCray · Southbend · Somerset · Shaan · Global Solutions · Omcan · Thunder Group
**Row 5:** Migali · Ariane · Porto Brasil · Comstock Castle · **Alto-Shaam** · Belshaw · **Angaar Tandoor** · Vitamix

All 4 spotlight brands (Rotoquip, Hoshizaki, Alto-Shaam, Angaar) ARE present in the homepage brand grid.

---

## Quick-Nav Icon Row (9 Icons)

| Icon | Label | Collection Handle |
|------|-------|------------------|
| 1 | Refrigeration | refrigeration |
| 2 | Griddle | new-theme-gas-griddles |
| 3 | Planetary Mixer | new-theme-planetary-spiral-mixers |
| 4 | Tandoor | new-theme-tandoor-and-parts |
| 5 | Combi Oven | new-theme-convection-ovens-copy |
| 6 | Hot Display | new-theme-hot-food-display-cases |
| 7 | Blender | new-theme-commercial-blenders |
| 8 | Fryer | new-theme-commercial-fryers |
| 9 | Wet Grinder | wet-grinder |

---

## Industry Use Cases (8 Cards)

Pizza Restaurants · Italian Restaurants · French Bistros · Fast Casual · Indian Restaurants · Bakeries & Cafes · Hotels & Banquets · Food Trucks & Catering

Each CTA links to a dedicated `/pages/cf-*` use case page.

---

## Testimonials Section

10 testimonials displayed. All attributed to Google Reviews. Rating shown: 4.4 stars ("20+ reviews").

NEEDS CONFIRMATION: Is 4.4/20+ the current Google Business Profile rating? This is a static value in the theme — it must be manually updated if the rating changes.

---

## Disabled / Hidden Sections

| Section | Reason |
|---------|--------|
| `home_restaurant_partners` | `disabled: true` — Task #89 pending; section exists but no content |
| `journey_promo_banner` | `show_section: false` — Journey steps banner toggled off |

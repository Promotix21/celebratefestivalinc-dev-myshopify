# Celebrate Festival Inc — Account Review
**Date:** 2026-08-12 | **Prepared by:** Hiraya Digital
**Purpose:** Factual evidence for client meeting — read-only data pull, no production data modified

---

## Sources Used

| System | Access Method | Data As Of |
|--------|--------------|-----------|
| CMS Task Tracker | SSH → SQLite `tracker.sqlite` at `cms.hiraya.digital` | 2026-08-12 |
| Klaviyo | API v2024-10-15, Account UVM8cY | 2026-08-12 |
| Shopify | Admin API v2024-01, Store `celebratefestivalinc.myshopify.com` | 2026-08-12 |
| Theme files | Local repo `celebrate-festival/` | 2026-08-12 (last push: Aug 10) |

All sections clearly distinguish: **FACT** (direct read from data), **CALCULATED METRIC** (derived from data), and **INFERENCE** (interpretation — flagged as such).

---

## A. Work Completed Since May 2026

FACT (from CMS tracker, tasks sorted by completion date):

### May 2026
| Task # | Title | Type | Completed |
|--------|-------|------|-----------|
| 65 | Estimate Shipping — sidebar cart modal | Feature | May 18 |
| 60 | Load More instead of pagination (CPH/Hashtag portal) | Feature | May 2 |
| 80 | Contact form Technical Support not sending | Bug | May 5 |
| 81 | Inbound form submissions tracking | Feature | May 13 |
| 93 | Track Order button update | UI Change | May 13 |
| 95 | Use Case industry pages (initial 6) | Feature | May 26 |
| 74 | Online Traffic Analytics Reports | Feature | May 2 |
| 56 | Zero-price handling + product card notes | Feature | Apr–May |
| 57 | Outbound customer notifications (8 templates built) | Feature | May 21 |

### June 2026
| Task # | Title | Type | Completed |
|--------|-------|------|-----------|
| 85 | Sale section — $0 products hidden | Bug | Jun 1 |
| 87 | Display actual color swatches for variants | UI Change | Jun 2 |
| 92 | Track Order button landing page update | UI Change | Jun 1 |
| 99 | SGS Certificate into Product Certificates metafield | Feature | Jun 4 |
| 90 | Repeated "Free Shipping" label in SPP | Bug | (resolved Jul) |

### July 2026
| Task # | Title | Type | Completed |
|--------|-------|------|-----------|
| 96 | Outbound notifications: Order confirmation (push to live) | Feature | Jul 31 |
| 97 | Outbound notifications: Shipping confirmation (push to live) | Feature | Jul 27 |
| 54 (partial) | Journey page UI refinement (pushed to dev) | UI Change | Jul 27 |
| 100 | Free Shipping Badge on Category Page | UI Change | Jul 27 |
| 104 | Contact Us button in SPP | Bug | Jul 28 |

### August 2026 (1–12)
| Task # | Title | Type | Completed |
|--------|-------|------|-----------|
| 83 | Brands Hexagon + all brands page: new brands | UI Change | Aug 6 |
| 105 | Additional Use Case industry pages | Feature | Aug 6 |
| 108 | Brands Page — hardcode A-Z grid for instant load | Feature | Aug 6 |
| 109 (partial) | L2 Mega collections — AJAX filtering (partial: cfL2 module) | Bug | Aug 10 |

FACT: git commits `de9b4dc` and `bbbb962` implement L2 Mega same-page filtering. The Dinnerware Storefront API implementation (oversized collection) is architecturally approved but code not yet written.

**Total tasks completed since May 1, 2026: approximately 23** (excludes pre-May tasks and tasks #3–#48 completed in March).

---

## B. Current Unresolved CMS Backlog

FACT: 10 tasks remain in Pending status as of 2026-08-12.

| ID | Title | Priority | Classification | Days Open |
|----|-------|----------|---------------|-----------|
| 54 | Journey page UI refinement | Medium | WAITING_FOR_CLIENT | 132 |
| 76 | Inventory status — 2nd iteration | **High** | **ACTIVE_PRIORITY** | 114 |
| 89 | Restaurant Partners page + map | **High** | WAITING_FOR_CLIENT | 93 |
| 98 | WSH Price Box / Volume Discount | Medium | **ACTIVE_PRIORITY** | 77 |
| 101 | AI ChatBot live implementation | **High** | BACKLOG | 27 |
| 102 | Rebate Interface | Medium | BACKLOG | 27 |
| 103 | Klaviyo Marketing Strategy | Low | WAITING_FOR_CLIENT | 27 |
| 106 | Out for Delivery email template | Low | BACKLOG | 15 |
| 107 | Order Delivered email template | Low | BACKLOG | 15 |
| 109 | L2 Mega collections (Dinnerware API) | Medium | **ACTIVE_PRIORITY** | 8 |

**ACTIVE_PRIORITY items (3):** Tasks 76, 98, 109 — actionable on Hiraya's side now.
**WAITING_FOR_CLIENT (3):** Tasks 54, 89, 103 — Hiraya needs client input/decision to proceed.
**BACKLOG (4):** Tasks 101, 102, 106, 107 — scoped, queued.

---

## C. Long-Running / Complex Tasks and Why They Remain Unresolved

### Task #76 — Inventory Status 2nd Iteration (114 days, High priority)
FACT: Created Apr 20 with ETA May 11 (93 days overdue). 13 comments.
FACT: Requires per-vendor detection for 8 Indian brands to show "Notify me when back in stock" vs default USA text.
INFERENCE: Complexity is moderate — vendor tag detection exists in codebase. The 13-comment back-and-forth likely involved iteration on requirements or reported regressions. Root cause of delay unclear from tracker comments alone; requires human review of the 13 comment thread.

### Task #89 — Restaurant Partners Page (93 days, High priority)
FACT: ETA was June 1 (72 days overdue). Only 2 comments. The `home_restaurant_partners` section exists in `templates/index.json` but is set to `disabled: true`.
INFERENCE: The section skeleton is ready; the delay is likely content availability — partner logos, map markers, and client confirmation of the 6 featured chains have not been provided in the tracker.

### Task #98 — WSH Price Box / Volume Discount (77 days, Medium priority)
FACT: WSH team deployed an updated integration ("Celebrate-festival-PT - preWPD -- WPD_BDR") that broke the Price Box UI. Client filed May 27. 1 comment (Jul 7 from client). No visible Hiraya action in git since filing.
INFERENCE: This task has sat for 77 days without recorded Hiraya response. It is the most notable case of a pending client-reported breakage that has received no visible update.

---

## D. Klaviyo Campaign Activity — May to Aug 12, 2026

FACT (all from Klaviyo API):

- **17 email campaigns sent** (all broadcast — no automated flows active)
- **58,691 total delivered** across 17 campaigns
- **Audience:** All campaigns sent to list `YwXV3d` (SUBSCRIBER LIST OF CELEBRATE — ~3,400–3,600 subscribers)
- **0 SMS campaigns** (no SMS channel configured)

Monthly summary:

| Month | Campaigns | Delivered | Avg Open Rate | Avg CTR |
|-------|-----------|-----------|--------------|---------|
| May 2026 | 8 | 27,078 | 15.07% | 0.31% |
| June 2026 | 5 | 17,310 | 14.75% | 0.38% |
| July 2026 | 4 | 14,303 | 12.34% | 0.31% |

FACT: **All 17 campaigns show 0 Placed Order conversions** in Klaviyo.

---

## E. Klaviyo Engagement and Unsubscribe Trends

### Open Rate
CALCULATED METRIC: Declined from 15.1% (May) → 14.75% (June) → 12.3% (July).
INFERENCE: Consistent monotonic decline over 3 months. Could reflect seasonal B2B slowdown, subject line fatigue, or iOS MPP effects. Evidence does NOT confirm email fatigue (unsubscribe rate is very low).

### Click-Through Rate
FACT: CTR has been 0.17–0.52% across all 17 campaigns.
CALCULATED METRIC: Klaviyo's 2024 benchmark for the "Internet Services" category is approximately 2% CTR.
INFERENCE: Celebrate Festival's CTR is 4–10x below benchmark. This is a content/CTA effectiveness issue. Subscribers are opening but not clicking.

### Unsubscribes
FACT: 35 total unsubscribes over 58,691 deliveries = 0.06% cumulative unsubscribe rate.
INFERENCE: List health is acceptable. No evidence of mass unsubscription or list fatigue.

### Spam Complaints
FACT: 7 total spam complaints = 0.012% complaint rate.
INFERENCE: Well within safe threshold. Deliverability is not at risk from spam signals.

### Anomaly
FACT: June 5 campaign shows 212 clicks vs typical 7–38 range. Cause unconfirmed — may be a tracking artifact.

---

## F. What Klaviyo Functionality Is Actually Configured

FACT:
| Capability | Status |
|------------|--------|
| Email broadcasts | ✅ Active (135 sent all-time) |
| Automated flows | ✗ **All 3 flows are in Draft — zero live automation** |
| Welcome series | ✗ Draft only, never activated |
| Abandoned cart | ✗ Not configured |
| Post-purchase flow | ✗ Draft only |
| Behavioral segments | ✗ 0 segments configured |
| A/B testing | ✗ None used in any campaign |
| Shopify order attribution | ✗ 0 conversions tracked (Placed Order webhook likely not connected) |
| Templates | ✅ 90 templates (59 production-named, 31 scratch/untitled) |
| Lists | ✅ 4 lists (1 primary subscriber list, 1 testing, 1 Curry Pizza House, 1 Rupesh prospect) |

INFERENCE: The email program is entirely manual broadcast-only. No lifecycle automation, no behavioral targeting, no conversion tracking. This explains why Task #103 exists — the client is asking for a strategy to move beyond basic broadcast.

---

## G. Current Shopify Merchandising and Product Facts

FACT:
- **Total products:** 20,314
- **Total collections:** 1,093 (449 custom + 644 smart)

### Homepage — 4 Default-Visible Categories
Refrigeration · Food Prep Equipment · Commercial Ovens · Smallwares

### Brand Presence on Homepage
Rotoquip, Alto-Shaam, Hoshizaki, and Angaar are all present in the hexagon brand grid.

### Brand Catalog Facts

**Angaar (19 products in collection):**
- CA-30 ($5,799.99, active ✓) · CA-30E ($0.00, draft) · PKG-36 ($4,999.00, active ✓) · Mini Tandoor ($179, active ✓)
- ISSUE: CA-40, CA-50, CA-60, PKG-24, PKG-48, PKG-60 — **active status but $0.00 price**

**Rotoquip (6 products):**
- All priced ($5,499–$6,399). All active except one draft variant.

**Alto-Shaam (115 products):**
- All sampled products active with valid pricing ($1,687–$16,136).

**Hoshizaki (161 products):**
- All sampled products active with valid pricing ($3,000–$4,705 for ice machines).

**Atosa:**
- Largest brand footprint in catalog. Default sort in `atosa-all` collection surfaces "(Discontinued)" products first — a merchandising sort order issue.

---

## H. Facts That Need Human/Client Confirmation

1. **Angaar $0.00 pricing:** Are CA-40, CA-50, CA-60, PKG-24, PKG-48, PKG-60 intentionally priced at $0 (call-for-price), or are prices missing from Shopify? Should they be draft status instead of active?

2. **Task #89 content:** Are the 6 partner restaurant logos and map data available for Hiraya to build the Partners page?

3. **Task #54 Journey page:** Where does the client want the Journey page linked from (homepage? header nav?)? Is the July 27 dev theme version approved?

4. **Task #98 WSH Volume Discount:** Has the client confirmed whether the Price Box breakage is still occurring, or did a subsequent WSH update resolve it? No Hiraya response to the May 27 ticket is visible in the tracker.

5. **Task #101 AI ChatBot:** The chatbot backend exists. Is the request to simply unhide the floating widget, or does it require new customer-profile-linked chat history (a larger backend feature)?

6. **Klaviyo Placed Order webhook:** Is the Klaviyo–Shopify order event integration configured? The API shows 0 conversions across all campaigns. If B2B orders happen by phone/quote and not online checkout, this is expected behavior and should be documented accordingly.

7. **June 5 campaign 212 clicks:** Was this a tracking anomaly or a deliberate campaign element (e.g., a link to a landing page that was widely shared)?

8. **Homepage hero CTAs:** All three primary CTA buttons on hero slides 1–3 link to `/collections/restaurant-equipment`. Is this intentional?

9. **Google Review rating:** The testimonials section shows "4.4 stars / 20+ reviews" — a static value. Is this still current?

---

## I. Contradictions Found Between Systems

1. **Task #103 says "Klaviyo strategy you mentioned in the meeting"** — but Klaviyo has been actively used for campaigns since at least 2024 (90 templates, 135 campaigns sent). The "strategy" reference implies a gap between what has been promised/discussed and what has been formally documented in the tracker. NEEDS CONFIRMATION: Was a specific strategy document promised in a meeting?

2. **Task #76 is High priority with 93-day overdue ETA** — yet it does not appear in any recent git commit messages from the past month. The disconnect between tracker priority and visible development activity warrants discussion.

3. **CMS tracker shows Task #109 as "Bug"** — but the description and session notes describe it as a new feature (Storefront API filter for oversized L2 collections). Classification in tracker does not match scope.

4. **Task #83 (Brands page) shows 13 comments and was completed Aug 6** — but two comment IDs (195, 196) have `task_id = 0` in the database, suggesting a referential integrity issue in the tracker (comments orphaned from task record). This is a CMS tracker bug, not a project issue.

---

## Output Files

All evidence files are in:
`evidence/celebrate-festival/2026-08-12-account-review/`

| File | Description | Rows/Size |
|------|-------------|-----------|
| `cms-tasks.csv` | All 103 CMS tasks with classification | 103 rows |
| `cms-pending-analysis.md` | Detailed analysis of 10 pending tasks | — |
| `cms-summary.json` | JSON summary of CMS state | — |
| `klaviyo-campaigns.csv` | 17 sent campaigns with full metrics | 17 rows |
| `klaviyo-monthly-summary.csv` | Monthly aggregates May–Aug | 3 rows |
| `klaviyo-analysis.md` | Campaign performance analysis | — |
| `klaviyo-raw-summary.json` | Full Klaviyo account summary | — |
| `klaviyo-configuration-audit.md` | Templates, flows, lists, segments | — |
| `klaviyo-templates.csv` | All 90 templates | 90 rows |
| `klaviyo-flows.csv` | All 3 flows | 3 rows |
| `shopify-current-products.csv` | Sample products from 12 key categories | 63 rows |
| `shopify-homepage-merchandising.md` | Homepage section analysis | — |
| `shopify-brand-check.md` | Rotoquip, Angaar, Alto-Shaam, Atosa, Hoshizaki | — |
| `ACCOUNT_REVIEW.md` | This file | — |

Supporting raw data:
- `cms-tasks-raw.csv` — raw tasks from SQLite
- `cms-comments-raw.csv` — all 196 task comments
- `cms-activity-raw.csv` — activity log
- `klaviyo-campaigns-raw.json` — all 166 campaign records
- `klaviyo-campaign-messages.json` — message details for 17 in-range campaigns
- `klaviyo-campaign-metrics-raw.json` — raw API response for campaign metrics
- `klaviyo-config-raw.json` — templates, flows, lists, segments raw

**Nothing committed to GitHub. All files are local.**

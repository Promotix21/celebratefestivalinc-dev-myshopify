# Klaviyo Campaign Performance Analysis — May 1 to Aug 12, 2026

**Source:** Klaviyo API v2024-10-15, Account UVM8cY (Celebrate Festival Inc)
**Pulled:** 2026-08-12 | **Read-only. No data modified.**

---

## Data Availability

All metrics below come directly from the Klaviyo API `campaign-values-reports` endpoint.

**Metrics available and used:**
- `delivered`, `opens`, `open_rate`, `clicks`, `click_rate`
- `unsubscribes`, `unsubscribe_rate`, `bounce_rate`
- `spam_complaints`, `conversions` (Placed Order), `conversion_value`

**Metrics NOT available via API revision 2024-10-15 for this account:**
- `unique_opens` and `unique_clicks` (not valid stats in this API version — `opens` and `clicks` are used; `open_rate` is based on unique openers / delivered per Klaviyo documentation)
- Per-campaign `bounces` raw count (only `bounce_rate` available)
- Recipients count (total sent before filtering) — not returned by this endpoint

---

## Campaign Volume — All Time vs Reporting Period

| Category | Count |
|----------|-------|
| Total email campaigns (all time) | 166 |
| Sent (all time) | 135 |
| Draft (any date) | 26 |
| Cancelled / No Recipients | 5 |
| Scheduled | 0 |
| **Sent — May 1 to Aug 12, 2026** | **17** |
| SMS campaigns | 0 |

FACT: Campaigns from pre-May 2026 exist but their metrics were not queried in this report.

---

## Sent Campaigns — May 1 to Aug 12, 2026

All campaigns targeted list `YwXV3d` (SUBSCRIBER LIST OF CELEBRATE - Updated 07.27.2026). List was updated July 27, which may affect July delivery counts.

| Date | Campaign Name | Subject (excerpt) | Delivered | Opens | Open Rate | Clicks | CTR | Unsubs | Spam | Convs |
|------|--------------|-------------------|-----------|-------|-----------|--------|-----|--------|------|-------|
| 2026-05-01 | Email 1 | Simplifying Your Kitchen Setup | 3,408 | 698 | 14.70% | 7 | 0.18% | 1 | 0 | 0 |
| 2026-05-05 | Email 1 | When Your Kitchen Works Hard… | 3,393 | 611 | 13.41% | 15 | 0.24% | 3 | 1 | 0 |
| 2026-05-08 | Email 1 | Prepare for Order Surge | 3,388 | 732 | 15.97% | 19 | 0.41% | 2 | 0 | 0 |
| 2026-05-12 | Email 1 | Why Guess? Equip Your Kitchen Right! | 3,386 | 692 | 14.89% | 17 | 0.38% | 5 | 1 | 0 |
| 2026-05-18 | Email 1 | Stay On Track with Reliable Equipment | 3,377 | 691 | 15.16% | 14 | 0.36% | 0 | 0 | 0 |
| 2026-05-22 | Campaign May 22 | Don't Let Delays Slow Your Kitchen | 3,379 | 761 | 16.48% | 14 | 0.36% | 2 | 0 | 0 |
| 2026-05-26 | Campaign May 26 | From Heated Displays to Holding Cabinets | 3,379 | 706 | 15.45% | 10 | 0.27% | 6 | 1 | 0 |
| 2026-05-29 | Campaign May 29 | The Right Equipment Changes the Pace | 3,368 | 687 | 14.49% | 18 | 0.30% | 3 | 0 | 0 |
| 2026-06-03 | Campaign Jun 3 | Kickstart Your Prep with Pro Equipment! | 3,475 | 740 | 15.14% | 17 | 0.37% | 3 | 1 | 0 |
| 2026-06-05 | Campaign Jun 5 | Keep Every Dish Hot, Fresh, and Ready | 3,462 | 742 | 15.22% | **212** | 0.32% | 0 | 0 | 0 |
| 2026-06-12 | Campaign Jun 12 | Boost Freshness with the Right Equipment | 3,460 | 726 | 14.94% | 15 | 0.32% | 3 | 0 | 0 |
| 2026-06-16 | June 16th | Master Your Kitchen with Essential Tools | 3,453 | 722 | 14.68% | 17 | 0.38% | 1 | 0 | 0 |
| 2026-06-26 | Campaign Jun 26 | Keep Every Dish Hot Until It's Served | 3,460 | 692 | 13.79% | 38 | 0.52% | 0 | 0 | 0 |
| 2026-07-08 | Campaign Jul 8 | From Prep to Peak Service | 3,591 | 624 | 12.14% | 19 | 0.33% | 1 | 1 | 0 |
| 2026-07-14 | Campaign Jul 14 | Keep Every Plate Hot, Every Customer Happy | 3,575 | 631 | 12.22% | 23 | 0.50% | 1 | 1 | 0 |
| 2026-07-22 | Campaign Jul 22 | New Arrivals to Enhance Your Kitchen | 3,569 | 620 | 12.38% | 13 | 0.22% | 1 | 0 | 0 |
| 2026-07-30 | Campaign Jul 30 | Power Every Service. Oven Solutions | 3,568 | 607 | 12.61% | 9 | 0.17% | 3 | 1 | 0 |

**ANOMALY — Jun 5 campaign:** 212 clicks vs. the typical 7–38 range. This appears to be a data outlier. Possible causes: a link to a popular page that was shared or indexed, a tracking redirect loop, or a Klaviyo reporting artifact. **NEEDS CONFIRMATION.**

---

## Monthly Aggregates

| Month | Campaigns | Delivered | Avg Open Rate | Avg CTR | Unsubscribes | Spam Complaints | Convs (Placed Order) |
|-------|-----------|-----------|--------------|---------|--------------|-----------------|---------------------|
| May 2026 | 8 | 27,078 | **15.07%** | **0.310%** | 22 | 3 | 0 |
| June 2026 | 5 | 17,310 | **14.75%** | **0.381%** | 7 | 1 | 0 |
| July 2026 | 4 | 14,303 | **12.34%** | **0.307%** | 6 | 3 | 0 |
| **Total May–Aug 12** | **17** | **58,691** | **~14.2% avg** | **~0.33% avg** | **35** | **7** | **0** |

---

## Trend Analysis

### Open Rate Trend
CALCULATED METRIC: Open rate declined from ~15.1% (May) to ~14.75% (June) to ~12.3% (July).

INFERENCE: A 2.8 percentage-point drop over 3 months. The decline is consistent and monotonic. Possible explanations:
1. **Seasonal disengagement** — summer slow-down common in B2B
2. **Subject line fatigue** — all subjects follow similar generic-benefit patterns ("Keep Every Dish Hot…", "Boost Freshness…") without product specificity or personalization
3. **iOS Mail Privacy Protection (MPP)** effect — Klaviyo `opens` includes machine-generated Apple opens; if MPP-inflated opens fall, real opens may not have changed meaningfully

EVIDENCE DOES NOT SUPPORT a conclusion of email fatigue based on this data alone — unsubscribe rate is very low (35 total over 58,691 deliveries = 0.06%), which argues against active subscriber disengagement.

### Click Rate Trend
FACT: CTR is consistently 0.17–0.52% across all 17 campaigns.
CALCULATED METRIC: Industry benchmark for B2B commercial equipment email is approximately 2–3% CTR (Klaviyo 2024 benchmark).
INFERENCE: Celebrate Festival's CTR is 4–15x below industry benchmark. This points to a content/CTA issue rather than a deliverability issue. The emails are being opened but subscribers are not clicking through.

### Unsubscribe Trend
FACT: 22 unsubscribes in May, 7 in June, 6 in July from ~3,400–3,600 delivered per campaign.
CALCULATED METRIC: Monthly unsub rate is 0.08% (May), 0.04% (June), 0.04% (July). All below 0.1% — considered low.
EVIDENCE DOES NOT SUPPORT a conclusion that the list is churning at a concerning rate.

### Spam Complaints
FACT: 7 spam complaints total over 58,691 deliveries = 0.012%.
Industry threshold: Gmail generally treats >0.1% as problematic.
INFERENCE: Spam complaint rate is well within safe range.

### Conversion Attribution
FACT: **All 17 campaigns report 0 Placed Order conversions.**
This is likely explained by one or more of:
1. The Klaviyo–Shopify integration may not have the `Placed Order` event webhook connected
2. B2B sales at Celebrate Festival may predominantly occur via phone, quote form, or offline channels — not direct online checkout
3. Attribution window may be too short for the B2B sales cycle

NEEDS CONFIRMATION: Is the Klaviyo–Shopify "Placed Order" webhook active? Shopify Admin → Settings → Notifications → Scripts shows no active webhooks as of 2026-08-12 (confirmed via API).

---

## Frequency Assessment

| Period | Campaigns | Avg Gap Between Sends |
|--------|-----------|----------------------|
| May 1–29 (8 campaigns) | 8 | ~4 days |
| Jun 3–26 (5 campaigns) | 5 | ~6 days |
| Jul 8–30 (4 campaigns) | 4 | ~7 days |

FACT: Send frequency decreased from ~2x/week in May to ~weekly in July.
INFERENCE: The reduction in frequency is consistent with the declining open rates and may reflect deliberate adjustment or reduced content output. Evidence does not confirm either interpretation.

---

## Draft Campaigns (Upcoming — as of Aug 12)

Four templates marked `ready_to_review` were created Aug 10-12 and are likely for upcoming August sends:
- `11.Aug.Emailer_3.ready_to_review`
- `11.Aug.Emailer_4.ready_to_review`
- `11.Aug.Emailer_5.ready_to_review`
- `11.Aug.Emailer_6.ready_to_review`

No August campaigns had been sent as of the query date.

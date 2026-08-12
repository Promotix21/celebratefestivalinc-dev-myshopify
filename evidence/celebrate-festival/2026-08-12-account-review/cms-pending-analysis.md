# CMS Pending Task Analysis — 2026-08-12

**Source:** cms.hiraya.digital `tracker.sqlite` (read-only SSH query)
**Total tasks in tracker:** 103 (IDs 3–109)
**Completed:** 93 | **Pending:** 10
**Query date:** 2026-08-12

---

## Classification Legend

| Code | Meaning |
|------|---------|
| ACTIVE_PRIORITY | Clear scope; actionable; should be worked on now |
| WAITING_FOR_CLIENT | Hiraya cannot proceed without client input or decision |
| BACKLOG | Scoped but no urgency signal; queued |
| BLOCKED | External dependency preventing progress |

---

## Task #54 — Journey Page UI Refinement
**Type:** UI Change | **Priority:** Medium | **Classification:** WAITING_FOR_CLIENT
**Created:** 2026-04-02 | **Last activity:** 2026-07-27 (7 comments total)

**Description:** Tighter spacing, more compact layout for the Journey page.

**History:**
- Apr 15: Hiraya verified basic timeline compaction done (git c6f227d)
- May 2: Hiraya added Journey slide to homepage hero slider
- Jul 16: Client (Jielin) re-opened: "Rupesh asks for Architecture Consultation page — make it more prominent, floating badge?"
- Jul 27: Hiraya pushed refined version to dev theme (186619461677) with 4 files updated
- Jul 27: Client replied: "Where are you planning to embed this page?" + sent attachment with improvement requests

**FACT:** Client's Jul 27 question ("where will it be embedded?") and attachment have not received a visible Hiraya response in the tracker. The page exists at `/pages/journey` but its homepage prominence is unclear.

**NEEDS CONFIRMATION:** Where does the client want the Journey page linked from? Is the dev theme version (Jul 27 push) approved?

---

## Task #76 — Inventory Status Feature (2nd Iteration)
**Type:** Feature | **Priority:** High | **Classification:** ACTIVE_PRIORITY
**Created:** 2026-04-20 | **ETA set:** 2026-05-11 | **Days overdue as of 2026-08-12:** 93
**Last activity:** 2026-08-04 (13 comments total)

**Scope:** For out-of-stock products, differentiate text by vendor:
- Indian product vendors (`Celebrate Festival Inc`, `Hawkins`, `Shaan`, `Kwitex`, `Rotoquip`, `Prestige`, `Preethi`, `Milton`): show **"Notify me when back in stock"**
- USA products: no change to existing behavior

**History:**
- Apr 20: Task created
- May 2: Hiraya noted progress
- May-Aug: 13 comments (details in cms-comments-raw.csv, task_id=76)
- Aug 4: Last comment activity

**FACT:** This task has been open 115 days against a 21-day original ETA. It has 13 comments, indicating ongoing iteration. The last comment was Aug 4, 2026.

**INFERENCE:** Complex because it requires per-vendor detection logic + likely a "back in stock" notification integration. The vendor list crosses US-legal-market brands (Rotoquip = tandoor/Indian, but Prestige/Hawkins are Indian kitchen brands).

---

## Task #89 — Restaurant Partners Page + Homepage Section
**Type:** Feature | **Priority:** High | **Classification:** WAITING_FOR_CLIENT
**Created:** 2026-05-11 | **ETA set:** 2026-06-01 | **Days overdue:** 72
**Last activity:** 2026-07-07 (2 comments total)

**Scope:**
1. US map showing business presence (excluding: Alaska, Maine, Mississippi, South Dakota, Vermont)
2. Featured chain restaurant partners: Paris Baguette, Tous les Jours, Curry Pizza House, Hashtag India, Mylapore, Deccan Morsels
3. Homepage section + dedicated partners page

**FACT:** Only 2 comments. ETA passed 72 days ago. Last discussed Jul 7. The `home_restaurant_partners` section exists in `templates/index.json` but is marked `"disabled": true`.

**NEEDS CONFIRMATION:** Are the 6 partner logos/content available? Has the client approved the map design? The section is ready to enable once content is provided.

---

## Task #98 — WSH Price Box Update (Volume Discount Integration)
**Type:** Feature | **Priority:** Medium | **Classification:** ACTIVE_PRIORITY
**Created:** 2026-05-27 | **Last activity:** 2026-07-07 (1 comment total)
**Days since filing:** 77

**Scope:**
1. Recover broken Price Box UI caused by WSH Volume Discount integration update
2. Improve new "Volume Discount" display box (client referenced WebRestaurant's SPP implementation as model)

**Test product URL provided by client:** `/products/ariane-cruise-amalfi-9-round-porcelain-deep-plate-case-of-12`

**FACT:** WSH team deployed a new theme integration ("Celebrate-festival-PT - preWPD -- WPD_BDR") that broke the Price Box. Only 1 comment (Jul 7 from client). No Hiraya response recorded in tracker. No relevant git commits found after May 27.

**INFERENCE:** This has been waiting 77 days without visible action. It is a medium-complexity development task requiring understanding the new WSH BDR integration behavior.

---

## Task #101 — AI ChatBot Implementation
**Type:** Feature | **Priority:** High | **Classification:** BACKLOG
**Created:** 2026-07-16 | **Last activity:** None (0 comments)

**Client request:** "Please implement your AI Kitchen Consultant to our page. Ideal Situation: the chat history for the same customer is stored under his profile data and AI remember it."

**FACT:** The AI chatbot backend already exists at `cf-chatbot.hiraya.digital` (built April 2026, per project memory). The floating widget is present in the theme but commented out in `layout/theme.liquid`. The dedicated page exists at `/pages/ai-assistant`. The task appears to be asking for the widget to be made live, plus chat history per customer profile.

**NEEDS CONFIRMATION:** Is the request simply to unhide the existing floating widget, or does it require new customer-profile-linked history storage (which would be a significant backend feature)?

---

## Task #102 — Rebate Interface
**Type:** Feature | **Priority:** Medium | **Classification:** BACKLOG
**Created:** 2026-07-16 | **Last activity:** None (0 comments)

**Scope:** Design an interface/workflow for product rebates. When any rebate-eligible product is added to a Shopify Invoice, show a reminder that it is rebate-eligible.

**Collection referenced:** "Rebates Eligible Products: California" — exists in Shopify catalog.

**FACT:** No expected_behavior or acceptance criteria defined. No prior discussion in tracker. This is a novel feature with no prior implementation reference in the codebase.

---

## Task #103 — Klaviyo Marketing Strategy
**Type:** Feature | **Priority:** Low | **Classification:** WAITING_FOR_CLIENT
**Created:** 2026-07-16 | **Last activity:** None (0 comments)

**Client note:** "This task is only a reminder to present us the Klaviyo strategy you mentioned in the meeting. Need to see improvements."

**FACT:** Klaviyo IS connected to the account (166 campaigns sent to date). This task is asking Hiraya to present a strategic plan for improving Klaviyo performance, not to complete a development task.

---

## Task #106 — Out for Delivery Email Template
**Type:** Feature | **Priority:** Low | **Classification:** BACKLOG
**Created:** 2026-07-28 | **Last activity:** None (0 comments)

**Client requirements for the template:**
1. Fix broken CFI logo
2. Remove emojis
3. Move "SHIPPING TO" section above item lines
4. Item lines are blank — include image, title, quantity
5. Add Delivery Checking Policy content

**FACT:** Related to the email template work in Tasks #57/96/97. Client reviewed a forwarded preview and provided specific change requests.

---

## Task #107 — Order Delivered Email Template
**Type:** Feature | **Priority:** Low | **Classification:** BACKLOG
**Created:** 2026-07-28 | **Last activity:** None (0 comments)

**Client requirements (same pattern as #106):**
1. Fix broken CFI logo
2. Remove emojis
3. Add "SHIPPING TO" section before item lines
4. Item lines blank — add image, title, quantity
5. Add Delivery Checking Policy content

---

## Task #109 — L2 Mega Collections for All L2 Category Pages
**Type:** Bug | **Priority:** Medium | **Classification:** ACTIVE_PRIORITY
**Created:** 2026-08-04 | **Last activity:** None (0 comments)

**Scope:** Switch current L2 category pages to use "Mega Collection" layout. Client referenced a Google Sheets doc with corresponding L2/Mega collection name mappings.

**FACT:** Architecture for this work was fully designed and approved on 2026-08-11 (see SESSION-HANDOVER.md). The Storefront API POC was validated — Dinnerware (5,991 products) confirmed to be filterable via API even though Liquid cannot filter it. Two recent commits are attributed to this task (`de9b4dc`, `bbbb962`). The Dinnerware-specific Storefront API implementation has NOT been started.

**Implementation scope (from SESSION-HANDOVER.md):**
- `sections/main-collection-cf.liquid` — ~150–200 JS lines
- No changes to product-card.liquid, collections, menus, or BDR integration

---

## Summary Table

| ID | Title | Priority | Classification | Days Open | ETA Status |
|----|-------|----------|---------------|-----------|------------|
| 54 | Journey page UI refinement | Medium | WAITING_FOR_CLIENT | 132 | No ETA |
| 76 | Inventory status 2nd iteration | High | ACTIVE_PRIORITY | 114 | 93 days overdue |
| 89 | Restaurant Partners page | High | WAITING_FOR_CLIENT | 93 | 72 days overdue |
| 98 | WSH Price Box / Volume Discount | Medium | ACTIVE_PRIORITY | 77 | No ETA |
| 101 | AI ChatBot live | High | BACKLOG | 27 | No ETA |
| 102 | Rebate Interface | Medium | BACKLOG | 27 | No ETA |
| 103 | Klaviyo Strategy presentation | Low | WAITING_FOR_CLIENT | 27 | No ETA |
| 106 | Out for Delivery email | Low | BACKLOG | 15 | No ETA |
| 107 | Order Delivered email | Low | BACKLOG | 15 | No ETA |
| 109 | L2 Mega collections | Medium | ACTIVE_PRIORITY | 8 | No ETA |


# Simple Product Setup Guide
## Quick Reference for Product Data Entry

---

## 1. EXISTING METAFIELDS AUDIT

### What You Already Have in Shopify

| Metafield Name | Used For | Priority | Fill This? | Example |
|----------------|----------|----------|------------|---------|
| **Color** | Product color attribute | 🟢 Optional | If applicable | "Stainless Steel", "Black", "White" |
| **Material** | Product material | 🟡 Important | Yes for most | "Stainless Steel", "Aluminum", "Cast Iron" |
| **Handle material** | Handle/grip material | 🟢 Optional | If product has handle | "Plastic", "Wood", "Stainless Steel" |
| **Blade material** | Blade material (knives, etc) | 🟢 Optional | Only for cutting tools | "High Carbon Steel", "Ceramic" |
| **Tool/Utensil material** | Utensil material | 🟢 Optional | For smallwares | "Stainless Steel", "Silicone" |
| **Display technology** | LED signs, displays | 🟢 Optional | Only for electronics | "LED", "LCD", "Neon" |
| **Mounting type** | How item mounts | 🟢 Optional | If wall/ceiling mount | "Wall Mount", "Countertop", "Floor Standing" |
| **Open/Closed sign design** | Sign style | 🟢 Optional | Only for signs | "Vertical", "Horizontal" |
| **Portability** | Is it portable? | 🟢 Optional | If relevant | "Portable", "Stationary", "On Wheels" |
| **Suitable space** | Where to use it | 🟢 Optional | If applicable | "Indoor", "Outdoor", "Both" |
| **Warranty Document** | Warranty PDF file | 🟡 Important | Upload if you have it | Upload PDF file |
| **Specification** | Product specs table | 🔴 CRITICAL | YES - all products | See table below |
| **Instructions/Manual** | Manual PDF file | 🟡 Important | Upload if you have it | Upload PDF file |
| **Certifications** | Safety certifications | 🟡 Important | If certified | "ETL US, NSF, CSA" |
| **Warranty** | Warranty text | 🟡 Important | Write warranty terms | "1 year parts and labor" |
| **Specification Sheet** | Spec sheet PDF | 🟡 Important | Upload if you have it | Upload PDF file |
| **Shipment text** | Shipping info | 🟡 Important | Fill for all | "Ships in 3-5 business days" |
| **Shipment text sub** | Additional shipping | 🟢 Optional | If needed | "Freight delivery to dock" |
| **Shipment tooltip text** | Shipping tooltip | 🟢 Optional | If needed | "Special handling required" |
| **Google: Custom Product** | Google Shopping | 🟢 Optional | For Google ads | Leave empty unless using |
| **Complementary products** | Related items | 🟢 Optional | Old system | Don't use - use new system below |
| **Related products settings** | Related items config | 🟢 Optional | Old system | Don't use - use new system below |
| **Related products** | Related items | 🟢 Optional | Old system | Don't use - use new system below |
| **Search product boosts** | Search ranking | 🟢 Optional | Advanced | Leave empty for now |

---

## 2. NEW METAFIELDS TO CREATE

### What You Need to Add in Shopify

| Metafield Name | Type | Used For | How to Create |
|----------------|------|----------|---------------|
| **works_with_products** | Product List | "Works With" section | Settings → Custom Data → Products → Add "Works With Products" (type: List of Products) |
| **feature_sections** | JSON/Text | Feature accordion sections | Settings → Custom Data → Products → Add "Feature Sections" (type: Multi-line text) |
| **member_price** | Decimal | Member pricing | Settings → Custom Data → Products → Add "Member Price" (type: Decimal) |
| **free_shipping** | True/False | Free shipping badge | Settings → Custom Data → Products → Add "Free Shipping" (type: True/False) |

---

## 3. PRODUCT TAGGING RULES

### What Tags to Add Based on Product Type

| Product Type | Tags to Add | Why? | Example Product |
|--------------|-------------|------|-----------------|
| **Main Equipment with Accessories** | `show:works-with` | Shows "Works With" section | Tandoor Oven, Refrigerator, Gas Range |
| **Equipment with Optional Add-ons** | `show:accessories` | Shows accessories dropdown | Mixer (bowl options), Oven (rack options) |
| **Equipment with Replacement Parts** | `show:parts` | Shows "Parts & Accessories" | Dishwasher, Food Processor |
| **Tandoor Accessories** | `accessory-tandoor` | Links to tandoor ovens | Skewers, Clay Pots, Hot Rocks |
| **Refrigeration Accessories** | `accessory-refrigeration` | Links to fridges/freezers | Door Gaskets, Shelves, Temp Monitors |
| **Gas Range Accessories** | `accessory-gas-range` | Links to gas ranges | Burner Grates, Cleaning Kits, Griddle Tops |
| **Mixer Accessories** | `accessory-mixer` | Links to mixers | Dough Hooks, Beaters, Bowls |
| **Dishwasher Accessories** | `accessory-dishwasher` | Links to dishwashers | Rack Parts, Wash Arms |
| **Products with Free Shipping** | `free-shipping` | Shows free shipping badge | (If applicable) |
| **MAP Restricted Products** | `contact-for-price` | Hides price, shows contact | (If manufacturer requires) |
| **Heavy Equipment** | `heavy-equipment` | Shows installation option | Ovens, Refrigerators, Ranges |

---

## 4. AUTOMATED COLLECTION SETUP

### Collections That Auto-Populate Based on Tags

**How to Create:** Products → Collections → Create collection → Set to "Automated" → Add condition

| Collection Name | Condition | What It Does |
|-----------------|-----------|--------------|
| **Tandoor Accessories** | Product tag = `accessory-tandoor` | Auto-adds all tandoor accessories |
| **Refrigeration Accessories** | Product tag = `accessory-refrigeration` | Auto-adds all fridge/freezer parts |
| **Gas Range Accessories** | Product tag = `accessory-gas-range` | Auto-adds all range accessories |
| **Mixer Accessories** | Product tag = `accessory-mixer` | Auto-adds all mixer attachments |
| **Dishwasher Accessories** | Product tag = `accessory-dishwasher` | Auto-adds all dishwasher parts |
| **Indian Specialty Equipment** | Product type = `Indian Equipment` | Auto-adds all Indian cookware |
| **Commercial Ovens** | Product type = `Oven` | Auto-adds all ovens |
| **Commercial Refrigeration** | Product type = `Refrigeration` | Auto-adds all fridges/freezers |
| **Cooking Equipment** | Product type = `Cooking` | Auto-adds all cooking equipment |
| **Free Shipping Items** | Product tag = `free-shipping` | Auto-adds free shipping products |
| **Heavy Equipment** | Product tag = `heavy-equipment` | Auto-adds items needing installation |
| **Avantco Brand** | Product vendor = `Avantco` | Auto-adds all Avantco products |
| **Imperial Brand** | Product vendor = `Imperial` | Auto-adds all Imperial products |
| **True Brand** | Product vendor = `True` | Auto-adds all True products |

**Note:** Once you create these automated collections, just tag products correctly and they'll appear automatically!

---

## 5. QUICK SETUP BY PRODUCT TYPE

### Main Equipment Products (Examples: Tandoor, Refrigerator, Gas Range, Oven)

| Step | What to Do | Example |
|------|------------|---------|
| 1. **Add Tags** | `show:works-with` | Enables "Works With" section |
| 2. **Set Product Type** | Choose type | "Cooking Equipment", "Refrigeration", etc. |
| 3. **Fill Specification** | Add dimensions & specs | Width: 54", Depth: 31.5", Height: 82.75", Voltage: 115V, etc. |
| 4. **Fill Key Features** | Write 6-10 bullet points | "49 cu. ft. capacity\|Stainless steel exterior\|Self-closing doors" |
| 5. **Select Works With Products** | Choose 4-6 related items | Door gasket, shelf, temp monitor, casters |
| 6. **Fill Certifications** | List certifications | "ETL US, ETL Sanitation, NSF" |
| 7. **Add Member Price** | Set discounted price | Regular: $2,619, Member: $2,469 |
| 8. **Upload Files** | Warranty PDF, Manual PDF | If you have them |
| 9. **Write Warranty Text** | Copy warranty terms | "1 year parts and labor, 3 year compressor" |
| 10. **Set Free Shipping** | Check Yes/No | Yes for qualifying items |

---

### Accessory Products (Examples: Skewers, Shelves, Replacement Parts)

| Step | What to Do | Example |
|------|------------|---------|
| 1. **Add Tag** | `accessory-[type]` | `accessory-tandoor` for tandoor items |
| 2. **Set Product Type** | "Accessory" or specific | "Smallware", "Accessory", etc. |
| 3. **Fill Specification** | Material, size, specs | Material: Stainless Steel, Length: 24", Qty: 12 pieces |
| 4. **Fill Key Features** | Write 3-5 bullet points | "Set of 12 skewers\|24-inch length\|Dishwasher safe" |
| 5. **Skip Works With** | Not needed for accessories | (Accessories don't need this field) |

---

## 6. SPECIFICATION FORMAT

### How to Fill the "Specification" Field

**Format:** Use categories with simple text

```
Overall Dimensions:
Width: 54 inches
Depth: 31 1/2 inches
Height: 82 3/4 inches
Weight: 425 lbs

Electrical:
Voltage: 115 Volts
Phase: 1 Phase
Plug Type: NEMA 5-15P

Construction:
Exterior: Stainless steel
Interior: Aluminum
Doors: Solid, self-closing

Operational:
Temperature Range: -10°F to 0°F
Capacity: 49 cubic feet
Shelves: 6 adjustable
```

**Or use HTML table if you prefer:**

```html
<table>
  <tr><td>Width</td><td>54 inches</td></tr>
  <tr><td>Depth</td><td>31 1/2 inches</td></tr>
  <tr><td>Height</td><td>82 3/4 inches</td></tr>
</table>
```

---

## 7. KEY FEATURES FORMAT

### How to Fill "Key Features"

**Format:** Separate features with pipe symbol `|`

```
49 cu. ft. interior capacity|Stainless steel exterior|Self-closing solid doors|Temperature range -10°F to 0°F|Bottom-mounted compressor|4-inch heavy-duty casters|Digital temperature display|Energy-efficient R290 refrigerant|ETL Sanitation certified
```

**Display as:**
- ✓ 49 cu. ft. interior capacity
- ✓ Stainless steel exterior
- ✓ Self-closing solid doors
- ✓ Temperature range -10°F to 0°F
- (etc.)

---

## 8. COMPLETE EXAMPLES

### Example 1: Commercial Tandoor Oven (Main Equipment)

| Field | Value |
|-------|-------|
| **Product Name** | 36-Inch Commercial Clay Tandoor Oven - Natural Gas |
| **SKU** | TAND-36-NG |
| **Price** | $1,299.00 |
| **Vendor** | Shaan Tandoor |
| **Product Type** | Cooking Equipment |
| **Tags** | `show:works-with`, `product-type:cooking`, `heavy-equipment` |
| **Specification** | Height: 36 inches<br>Diameter: 20 inches<br>Weight: 285 lbs<br>Fuel: Natural Gas<br>BTU: 65,000<br>Temp: Up to 900°F |
| **Key Features** | Traditional clay-lined interior\|Reaches 900°F\|Double-wall stainless steel\|Natural gas 65,000 BTU\|20-inch interior diameter\|NSF certified |
| **Works With Products** | Select: Tandoor Skewers, Clay Hot Rocks, Cleaning Brush, Clay Pot Insert, Naan Paddle |
| **Certifications** | NSF, CSA, ANSI Z83.11 |
| **Member Price** | $1,199.00 |
| **Free Shipping** | No (too heavy) |
| **Warranty** | 1 year clay liner, 2 years exterior |
| **Collections** | Will auto-add to: "Cooking Equipment", "Indian Specialty Equipment" |

---

### Example 2: Tandoor Skewers (Accessory)

| Field | Value |
|-------|-------|
| **Product Name** | Tandoor Skewers - Stainless Steel Set of 12 |
| **SKU** | TAND-SKEW-12 |
| **Price** | $34.99 |
| **Vendor** | Generic/Your Brand |
| **Product Type** | Smallware |
| **Tags** | `accessory-tandoor` |
| **Specification** | Quantity: 12 skewers<br>Length: 24 inches<br>Material: 18/8 stainless steel<br>Weight: 3.2 lbs |
| **Key Features** | Set of 12 stainless steel skewers\|24-inch length\|Pointed tips\|Flat blade prevents spinning\|Dishwasher safe |
| **Works With Products** | (Leave empty - accessories don't need this) |
| **Collections** | Will auto-add to: "Tandoor Accessories", "Smallware" |

---

### Example 3: Commercial Refrigerator (Main Equipment)

| Field | Value |
|-------|-------|
| **Product Name** | Avantco SS-2F-HC 54" Two Section Solid Door Reach-In Freezer |
| **SKU** | 178SS2FHC |
| **Price** | $2,619.00 |
| **Vendor** | Avantco |
| **Product Type** | Refrigeration |
| **Tags** | `show:works-with`, `free-shipping`, `heavy-equipment` |
| **Specification** | Width: 54"<br>Depth: 31.5"<br>Height: 82.75"<br>Capacity: 49 cu. ft.<br>Voltage: 115V<br>Temp: -10°F to 0°F<br>Shelves: 6 adjustable |
| **Key Features** | 49 cu. ft. capacity\|Stainless steel exterior\|Self-closing doors\|-10°F to 0°F range\|Bottom-mounted compressor\|4-inch casters\|Digital controls\|R290 refrigerant\|ETL certified |
| **Works With Products** | Select: Door Gasket, Wire Shelf, Temp Monitor, Caster Wheels, Door Lock |
| **Certifications** | ETL US, ETL Sanitation, ENERGY STAR |
| **Member Price** | $2,469.00 |
| **Free Shipping** | Yes |
| **Warranty** | 1 year parts/labor, 3 years compressor |
| **Collections** | Will auto-add to: "Refrigeration Equipment", "Free Shipping Items" |

---

### Example 4: Replacement Door Gasket (Accessory)

| Field | Value |
|-------|-------|
| **Product Name** | Replacement Door Gasket - Avantco Compatible |
| **SKU** | DOOR-GASKET-AV-54 |
| **Price** | $45.99 |
| **Vendor** | Generic/Your Brand |
| **Product Type** | Replacement Part |
| **Tags** | `accessory-refrigeration` |
| **Specification** | Compatible: Avantco 54" models<br>Length: 54 inches<br>Material: Vinyl<br>Installation: Snap-in |
| **Key Features** | Avantco compatible\|Snap-in installation\|54-inch length\|Durable vinyl\|Maintains temperature seal |
| **Works With Products** | (Leave empty) |
| **Collections** | Will auto-add to: "Refrigeration Accessories", "Replacement Parts" |

---

## 9. PRIORITY CHECKLIST

### What to Fill First (Start Here!)

**🔴 CRITICAL - Must Fill:**
- [ ] Product Name, SKU, Price
- [ ] At least 1 product image
- [ ] Basic description
- [ ] Product Type (for automated collections)
- [ ] Specification (basic dimensions at minimum)
- [ ] Key Features (at least 5)

**🟡 IMPORTANT - Fill Soon:**
- [ ] Tags (for "Works With" and collections)
- [ ] Works With Products (for main equipment)
- [ ] Certifications (if certified)
- [ ] Member Price
- [ ] Warranty text
- [ ] Shipment text

**🟢 OPTIONAL - Fill When You Can:**
- [ ] Upload warranty PDF
- [ ] Upload manual PDF
- [ ] Upload spec sheet PDF
- [ ] Material fields
- [ ] Color fields
- [ ] Other attribute fields

---

## 10. TIME ESTIMATES

| Product Type | Time Needed | Priority |
|--------------|-------------|----------|
| **Main Equipment** (full setup) | 30-45 minutes | Start with top 20 sellers |
| **Accessory** (basic setup) | 10-15 minutes | Do after main equipment |
| **Update Existing** (add missing data) | 15-20 minutes | Do gradually |

**Recommendation:** Start with your 20 best-selling main equipment products first. Add their accessories next. Then expand from there.

---

## 11. COMMON QUESTIONS

**Q: Do I need to fill ALL metafields for EVERY product?**
A: No! Only fill what's marked 🔴 CRITICAL and 🟡 IMPORTANT. Optional fields are nice to have but not required.

**Q: What if I don't have warranty PDFs?**
A: That's okay! Just write the warranty text in the "Warranty" field. PDFs are optional.

**Q: How do I know which products go in "Works With"?**
A: Think: What accessories, parts, or items does a customer typically buy WITH this product? For a tandoor: skewers, clay pots. For a fridge: shelves, door gaskets.

**Q: Do accessories need the "Works With" field?**
A: No! Only main equipment needs this. Accessories are what get selected IN the "Works With" field.

**Q: What if I make a mistake with tags?**
A: Easy to fix! Just edit the product and change the tags. Automated collections will update automatically.

**Q: How long will this take for my whole catalog?**
A: Depends on size:
- 50 products: ~40 hours
- 200 products: ~150 hours
- 500 products: ~350 hours

Start with priority items first!

---

## 12. NEED HELP?

**Contact:** [Your contact information]

**Tips:**
- Start small (20 products)
- Test on a few products first
- Use automated collections (saves time!)
- Focus on best sellers first
- Add more data over time

---

**END OF GUIDE**

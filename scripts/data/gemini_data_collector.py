#!/usr/bin/env python3
"""
Gemini Data Collector — Shopify + Klaviyo
=========================================

A single "method" that lets Gemini (or any caller) access BOTH platforms,
collect raw business data, and save the export to the Downloads folder.

Design
------
- The heavy lifting lives in plain Python functions:
      collect_shopify_data()   -> dict
      collect_klaviyo_data()   -> dict
      collect_all()            -> dict  (both + store meta)
      save_to_downloads()      -> (md_path, json_path)
- Those same functions are registered as **Gemini tools** (function calling),
  so Gemini can decide to call them and drive the collection itself.
- No summaries / recommendations are produced. Raw evidence only.
  Any metric that the API scope does not allow is recorded as "Data unavailable".

Credentials (never hard-coded)
------------------------------
- Shopify:  read from project .env  (SHOPIFY_STORE / SHOPIFY_API_TOKEN / SHOPIFY_API_VERSION)
- Klaviyo:  read from  ~/Documents/klaviyo-private-api-key.txt  (last pk_ token in file)
            or the KLAVIYO_API_KEY env var.
- Gemini:   GEMINI_API_KEY env var (only needed for the --gemini driver mode).

Usage
-----
    # 1. Direct collection (no Gemini needed) — recommended, always works:
    python3 scripts/data/gemini_data_collector.py

    # 2. Let Gemini drive the tools (requires: pip install google-generativeai
    #    and export GEMINI_API_KEY=...):
    python3 scripts/data/gemini_data_collector.py --gemini

Output
------
    ~/Downloads/celebrate_festival_data_<UTC-timestamp>.json
    ~/Downloads/celebrate_festival_data_<UTC-timestamp>.md
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

# --------------------------------------------------------------------------- #
# Configuration helpers
# --------------------------------------------------------------------------- #

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"

# Prefer the real user home from env (survives sandbox path remapping)
_REAL_HOME = Path(os.environ.get("HOME_REAL", os.environ.get("HOME", str(Path.home()))))
KLAVIYO_KEY_FILE = _REAL_HOME / "Documents" / "klaviyo-private-api-key.txt"
DOWNLOADS = _REAL_HOME / "Downloads"
KLAVIYO_REVISION = "2024-10-15"
UNAVAILABLE = "Data unavailable."


def _load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def _load_klaviyo_key() -> str | None:
    if os.environ.get("KLAVIYO_API_KEY"):
        return os.environ["KLAVIYO_API_KEY"].strip()
    if KLAVIYO_KEY_FILE.exists():
        # File may contain a header line; take the last token that looks like a key.
        for tok in reversed(KLAVIYO_KEY_FILE.read_text().split()):
            if tok.startswith("pk_"):
                return tok.strip()
    return None


ENV = _load_env(ENV_FILE)
SHOPIFY_STORE = ENV.get("SHOPIFY_STORE", "")
SHOPIFY_TOKEN = ENV.get("SHOPIFY_API_TOKEN", "")
SHOPIFY_VERSION = ENV.get("SHOPIFY_API_VERSION", "2024-01")
KLAVIYO_KEY = _load_klaviyo_key()


# --------------------------------------------------------------------------- #
# Low-level HTTP (stdlib only — no external deps required for collection)
# --------------------------------------------------------------------------- #

def _http(method: str, url: str, headers: dict, body: dict | None = None,
          retries: int = 3) -> tuple[int, dict | list | None, str]:
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode()
                try:
                    return resp.status, json.loads(raw), ""
                except json.JSONDecodeError:
                    return resp.status, None, raw
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            if e.code == 429 and attempt < retries - 1:      # rate limited
                time.sleep(2 * (attempt + 1))
                continue
            try:
                return e.code, json.loads(raw), ""
            except json.JSONDecodeError:
                return e.code, None, raw
        except Exception as e:  # noqa: BLE001
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
                continue
            return 0, None, str(e)
    return 0, None, "request failed"


def _shopify(path: str) -> tuple[int, dict | list | None, str]:
    url = f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_VERSION}/{path}"
    return _http("GET", url, {"X-Shopify-Access-Token": SHOPIFY_TOKEN})


def _klaviyo(path: str, method: str = "GET",
             body: dict | None = None) -> tuple[int, dict | list | None, str]:
    url = f"https://a.klaviyo.com/api/{path}"
    headers = {
        "Authorization": f"Klaviyo-API-Key {KLAVIYO_KEY}",
        "revision": KLAVIYO_REVISION,
        "accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
    return _http(method, url, headers, body)


def _meta(source: str, date_range: str, confidence: str,
          value, extra: dict | None = None) -> dict:
    m = {
        "metric_value": value,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "date_range": date_range,
        "confidence": confidence,
    }
    if extra:
        m.update(extra)
    return m


# --------------------------------------------------------------------------- #
# SHOPIFY collection
# --------------------------------------------------------------------------- #

def collect_shopify_data() -> dict:
    """Collect raw Shopify business data. Returns a dict of metrics.

    Scope-restricted endpoints (orders, gift cards, locations, checkouts) are
    recorded as 'Data unavailable.' rather than raising.
    """
    out: dict = {}
    src = "Shopify Admin REST API"
    all_ts = "point-in-time snapshot"

    # ---- STORE ----------------------------------------------------------- #
    status, data, _ = _shopify("shop.json")
    if status == 200 and isinstance(data, dict):
        shop = data["shop"]
        out["store"] = {
            "store_name": _meta(src, all_ts, "high", shop.get("name")),
            "currency": _meta(src, all_ts, "high", shop.get("currency")),
            "timezone": _meta(src, all_ts, "high", shop.get("iana_timezone")),
            "plan": _meta(src, all_ts, "high", shop.get("plan_display_name")),
            "domain": _meta(src, all_ts, "high", shop.get("domain")),
            "myshopify_domain": _meta(src, all_ts, "high", shop.get("myshopify_domain")),
        }
    else:
        out["store"] = {"error": _meta(src, all_ts, "none", UNAVAILABLE)}

    # ---- COUNTS ---------------------------------------------------------- #
    def _count(path, key):
        s, d, _ = _shopify(path)
        if s == 200 and isinstance(d, dict) and "count" in d:
            return _meta(src, all_ts, "high", d["count"])
        return _meta(src, all_ts, "none", UNAVAILABLE)

    out["counts"] = {
        "products": _count("products/count.json", "count"),
        "customers": _count("customers/count.json", "count"),
        "smart_collections": _count("smart_collections/count.json", "count"),
        "custom_collections": _count("custom_collections/count.json", "count"),
        "orders": _count("orders/count.json?status=any", "count"),
        "abandoned_checkouts": _count("checkouts/count.json", "count"),
        "gift_cards": _count("gift_cards/count.json", "count"),
    }

    # ---- PRODUCTS + INVENTORY (paginated) -------------------------------- #
    products = _fetch_all_products()
    out["products_inventory"] = _analyze_products(products, src, all_ts)

    # ---- COLLECTIONS ----------------------------------------------------- #
    out["collections"] = _collect_collections(src, all_ts)

    # ---- DISCOUNTS ------------------------------------------------------- #
    s, d, _ = _shopify("price_rules.json?limit=250")
    if s == 200 and isinstance(d, dict):
        rules = d.get("price_rules", [])
        out["discounts"] = {
            "discount_codes_count": _meta(src, all_ts, "high", len(rules)),
            "discount_codes": _meta(src, all_ts, "high",
                                    [{"id": r["id"], "title": r.get("title"),
                                      "value_type": r.get("value_type"),
                                      "value": r.get("value")} for r in rules[:100]]),
            "coupon_usage": _meta(src, all_ts, "none", UNAVAILABLE),  # needs read_orders
        }
    else:
        out["discounts"] = {"error": _meta(src, all_ts, "none", UNAVAILABLE)}

    # ---- SALES / ORDERS / REVENUE / CHECKOUT / WHOLESALE ----------------- #
    # All of these require read_orders (not granted on this token).
    sales_note = _meta(src, all_ts, "none", UNAVAILABLE,
                       {"reason": "read_orders scope not granted on API token"})
    out["sales"] = {k: sales_note for k in [
        "total_orders", "gross_sales", "net_sales", "taxes", "shipping_revenue",
        "discounts", "refunds", "cancelled_orders", "average_order_value",
        "average_items_per_order"]}
    out["orders_timeseries"] = {k: sales_note for k in [
        "orders_by_day", "orders_by_week", "orders_by_month"]}
    out["revenue_timeseries"] = {k: sales_note for k in [
        "revenue_by_day", "revenue_by_week", "revenue_by_month",
        "revenue_by_product", "revenue_by_vendor", "revenue_by_product_type"]}
    out["checkout"] = {
        "abandoned_checkouts": out["counts"]["abandoned_checkouts"],
        "checkout_completion_rate": sales_note,
    }
    out["wholesale"] = {
        "wholesale_orders": sales_note,
        "b2b_customers": _collect_wholesale_customers(src, all_ts),
    }
    out["customers"] = _collect_customers(src, all_ts, sales_note)
    out["product_performance"] = {k: sales_note for k in [
        "top_selling_products", "lowest_selling_products",
        "products_never_purchased", "products_highest_revenue",
        "products_highest_quantity_sold", "products_lowest_conversion"]}

    return out


def _fetch_all_products(max_pages: int = 40) -> list:
    """Paginate through products via Link header cursor."""
    products, page_info, pages = [], None, 0
    while pages < max_pages:
        q = "products.json?limit=250&fields=id,title,vendor,product_type,status,variants"
        url = f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_VERSION}/{q}"
        if page_info:
            url = (f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_VERSION}/"
                   f"products.json?limit=250&page_info={page_info}")
        req = urllib.request.Request(url, headers={"X-Shopify-Access-Token": SHOPIFY_TOKEN})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                batch = json.loads(resp.read().decode()).get("products", [])
                products.extend(batch)
                link = resp.headers.get("Link", "")
        except Exception:
            break
        page_info = None
        for part in link.split(","):
            if 'rel="next"' in part and "page_info=" in part:
                page_info = part.split("page_info=")[1].split(">")[0].split("&")[0]
        pages += 1
        if not page_info:
            break
        time.sleep(0.3)
    return products


def _analyze_products(products: list, src: str, ts: str) -> dict:
    if not products:
        return {"error": _meta(src, ts, "none", UNAVAILABLE)}
    out_of_stock, low_stock = [], []
    by_vendor, by_type = {}, {}
    for p in products:
        inv = sum(v.get("inventory_quantity", 0) or 0 for v in p.get("variants", []))
        vendor = p.get("vendor") or "Unknown"
        ptype = p.get("product_type") or "Uncategorized"
        by_vendor.setdefault(vendor, {"products": 0, "inventory": 0})
        by_vendor[vendor]["products"] += 1
        by_vendor[vendor]["inventory"] += inv
        by_type.setdefault(ptype, {"products": 0, "inventory": 0})
        by_type[ptype]["products"] += 1
        by_type[ptype]["inventory"] += inv
        rec = {"id": p["id"], "title": p.get("title"), "vendor": vendor, "inventory": inv}
        if inv <= 0:
            out_of_stock.append(rec)
        elif inv <= 5:
            low_stock.append(rec)

    conf = "high" if len(products) >= 250 else "medium"
    return {
        "products_scanned": _meta(src, ts, conf, len(products)),
        "out_of_stock_count": _meta(src, ts, conf, len(out_of_stock)),
        "low_stock_count": _meta(src, ts, conf, len(low_stock)),
        "out_of_stock_products": _meta(src, ts, conf, out_of_stock[:200]),
        "low_stock_products": _meta(src, ts, conf, low_stock[:200]),
        "inventory_by_vendor": _meta(src, ts, conf, by_vendor),
        "inventory_by_product_type": _meta(src, ts, conf, by_type),
    }


def _collect_collections(src: str, ts: str) -> dict:
    result = {}
    for kind in ("smart_collections", "custom_collections"):
        items, page_info, pages = [], None, 0
        while pages < 20:
            url = (f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_VERSION}/"
                   f"{kind}.json?limit=250&fields=id,title,handle")
            if page_info:
                url = (f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_VERSION}/"
                       f"{kind}.json?limit=250&page_info={page_info}")
            req = urllib.request.Request(
                url, headers={"X-Shopify-Access-Token": SHOPIFY_TOKEN})
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    items.extend(json.loads(resp.read().decode()).get(kind, []))
                    link = resp.headers.get("Link", "")
            except Exception:
                break
            page_info = None
            for part in link.split(","):
                if 'rel="next"' in part and "page_info=" in part:
                    page_info = part.split("page_info=")[1].split(">")[0].split("&")[0]
            pages += 1
            if not page_info:
                break
            time.sleep(0.3)
        result[kind] = _meta(src, ts, "high",
                             [{"id": c["id"], "title": c.get("title"),
                               "handle": c.get("handle")} for c in items])
    # Revenue/orders by collection need read_orders
    note = _meta(src, ts, "none", UNAVAILABLE,
                 {"reason": "read_orders scope not granted"})
    result.update({
        "revenue_by_collection": note,
        "orders_by_collection": note,
        "best_performing_collections": note,
        "lowest_performing_collections": note,
    })
    return result


def _collect_customers(src: str, ts: str, sales_note: dict) -> dict:
    s, d, _ = _shopify("customers/count.json")
    total = (_meta(src, ts, "high", d["count"])
             if s == 200 and isinstance(d, dict) else sales_note)
    return {
        "total_customers": total,
        "new_customers": sales_note,
        "returning_customers": sales_note,
        "returning_customer_rate": sales_note,
        "customer_tags": _meta(src, ts, "medium",
                               "Known WSH tags: CPH, ROU (per project config)"),
        "customer_segments": sales_note,
        "customer_lifetime_value": sales_note,
    }


def _collect_wholesale_customers(src: str, ts: str) -> dict:
    # Attempt customer search for wholesale tags (needs read_customers)
    s, d, _ = _shopify("customers/search.json?query=tag:wholesale&limit=1")
    if s == 200:
        return _meta(src, ts, "low",
                     "read_customers available — run tag search for full B2B list")
    return _meta(src, ts, "none", UNAVAILABLE)


# --------------------------------------------------------------------------- #
# KLAVIYO collection
# --------------------------------------------------------------------------- #

CONVERSION_METRIC_ID = "R73A9Q"  # "Fulfilled Order" (Shopify) — placed-order metric
CAMPAIGN_STATS = ["open_rate", "click_rate", "conversion_rate", "conversion_value",
                  "recipients", "delivered", "bounced", "spam_complaints",
                  "unsubscribes", "opens_unique", "clicks_unique", "conversion_uniques"]


def collect_klaviyo_data() -> dict:
    if not KLAVIYO_KEY:
        return {"error": _meta("Klaviyo", "n/a", "none", UNAVAILABLE,
                               {"reason": "no API key found"})}
    out = {}
    src = "Klaviyo API"
    rng = "last_365_days"

    # ---- ACCOUNT: lists, segments, metrics ------------------------------- #
    s, d, _ = _klaviyo("lists/")
    lists = d.get("data", []) if s == 200 and isinstance(d, dict) else []
    out["lists"] = _meta(src, "point-in-time", "high" if lists else "none",
                         [{"id": x["id"], "name": x["attributes"]["name"]} for x in lists]
                         if lists else UNAVAILABLE)

    s, d, _ = _klaviyo("segments/")
    segs = d.get("data", []) if s == 200 and isinstance(d, dict) else []
    out["segments"] = _meta(src, "point-in-time", "high" if s == 200 else "none",
                            [{"id": x["id"], "name": x["attributes"]["name"]}
                             for x in segs] if segs else (segs if s == 200 else UNAVAILABLE))

    out["profiles"] = {
        "total_profiles": _meta(src, "point-in-time", "none", UNAVAILABLE,
                                {"note": "Klaviyo API returns no aggregate total; "
                                         "use list/segment counts or a full paginated scan"}),
        "active_profiles": _meta(src, "point-in-time", "none", UNAVAILABLE),
        "suppressed_profiles": _meta(src, "point-in-time", "none", UNAVAILABLE),
    }

    # ---- FLOWS ----------------------------------------------------------- #
    s, d, _ = _klaviyo("flows/")
    flows = d.get("data", []) if s == 200 and isinstance(d, dict) else []
    out["flows"] = _meta(src, "point-in-time", "high" if flows else "none",
                         [{"id": f["id"], "name": f["attributes"]["name"],
                           "status": f["attributes"]["status"],
                           "trigger_type": f["attributes"].get("trigger_type"),
                           "created": f["attributes"].get("created")}
                          for f in flows] if flows else UNAVAILABLE)

    # ---- CAMPAIGNS (email) ---------------------------------------------- #
    campaigns = _klaviyo_all_campaigns()
    out["campaigns_list"] = _meta(src, "point-in-time",
                                  "high" if campaigns else "none",
                                  [{"id": c["id"],
                                    "name": c["attributes"]["name"],
                                    "status": c["attributes"]["status"],
                                    "send_time": c["attributes"].get("send_time"),
                                    "created": c["attributes"].get("created_at")}
                                   for c in campaigns] if campaigns else UNAVAILABLE)

    # ---- CAMPAIGN performance (values report) --------------------------- #
    out["campaign_performance"] = _klaviyo_values_report(
        "campaign-values-reports", "campaign-values-report", src, rng)

    # ---- FLOW performance (values report) ------------------------------- #
    out["flow_performance"] = _klaviyo_values_report(
        "flow-values-reports", "flow-values-report", src, rng)

    # ---- EMAIL REVENUE totals (derived from the reports) ---------------- #
    out["email_revenue"] = _derive_email_revenue(out, src, rng)

    return out


def _klaviyo_all_campaigns(max_pages: int = 10) -> list:
    campaigns, cursor, pages = [], None, 0
    while pages < max_pages:
        path = "campaigns/?filter=equals(messages.channel,'email')"
        if cursor:
            path += f"&page[cursor]={cursor}"
        s, d, _ = _klaviyo(path)
        if s != 200 or not isinstance(d, dict):
            break
        campaigns.extend(d.get("data", []))
        nxt = d.get("links", {}).get("next")
        if not nxt or "page%5Bcursor%5D=" not in nxt and "page[cursor]=" not in nxt:
            break
        cursor = nxt.split("cursor%5D=")[-1].split("&")[0] if "cursor%5D=" in nxt \
            else nxt.split("cursor]=")[-1].split("&")[0]
        pages += 1
        time.sleep(0.4)
    return campaigns


def _klaviyo_values_report(endpoint: str, rtype: str, src: str, rng: str) -> dict:
    body = {"data": {"type": rtype, "attributes": {
        "timeframe": {"key": rng},
        "conversion_metric_id": CONVERSION_METRIC_ID,
        "statistics": CAMPAIGN_STATS,
    }}}
    s, d, raw = _klaviyo(f"{endpoint}/", method="POST", body=body)
    if s == 200 and isinstance(d, dict):
        results = d.get("data", {}).get("attributes", {}).get("results", [])
        return _meta(src, rng, "high", results)
    return _meta(src, rng, "none", UNAVAILABLE, {"api_status": s, "detail": raw[:200] if raw else d})


def _derive_email_revenue(out: dict, src: str, rng: str) -> dict:
    def _sum(node_key):
        node = out.get(node_key, {})
        vals = node.get("metric_value")
        if not isinstance(vals, list):
            return None
        return round(sum(r.get("statistics", {}).get("conversion_value", 0) or 0
                         for r in vals), 2)
    camp = _sum("campaign_performance")
    flow = _sum("flow_performance")
    total = None
    if camp is not None or flow is not None:
        total = round((camp or 0) + (flow or 0), 2)
    conf = "high" if total is not None else "none"
    return {
        "total_email_revenue": _meta(src, rng, conf,
                                     total if total is not None else UNAVAILABLE),
        "campaign_revenue": _meta(src, rng, "high" if camp is not None else "none",
                                  camp if camp is not None else UNAVAILABLE),
        "flow_revenue": _meta(src, rng, "high" if flow is not None else "none",
                              flow if flow is not None else UNAVAILABLE),
    }


# --------------------------------------------------------------------------- #
# Orchestration + output
# --------------------------------------------------------------------------- #

def collect_all() -> dict:
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "shopify": collect_shopify_data(),
        "klaviyo": collect_klaviyo_data(),
    }


def _flatten(prefix: str, node, rows: list):
    """Turn nested metric dicts into flat metric rows for the JSON/MD export."""
    if isinstance(node, dict) and "metric_value" in node and "source" in node:
        rows.append({
            "metric_name": prefix,
            "metric_value": node.get("metric_value"),
            "source": node.get("source"),
            "timestamp": node.get("timestamp"),
            "date_range": node.get("date_range"),
            "confidence": node.get("confidence"),
        })
        return
    if isinstance(node, dict):
        for k, v in node.items():
            _flatten(f"{prefix}.{k}" if prefix else k, v, rows)


def save_to_downloads(payload: dict) -> tuple[Path, Path]:
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    base = f"celebrate_festival_data_{stamp}"

    rows: list = []
    _flatten("shopify", payload.get("shopify", {}), rows)
    _flatten("klaviyo", payload.get("klaviyo", {}), rows)

    json_path = DOWNLOADS / f"{base}.json"
    json_path.write_text(json.dumps(
        {"generated_at": payload["generated_at"],
         "nested": payload,
         "metrics": rows}, indent=2, default=str))

    md = [f"# Celebrate Festival — Raw Data Export",
          f"Generated (UTC): {payload['generated_at']}", "",
          "| metric_name | metric_value | source | date_range | confidence |",
          "|---|---|---|---|---|"]
    for r in rows:
        val = r["metric_value"]
        if isinstance(val, (list, dict)):
            val = f"({type(val).__name__}, {len(val)} items)"
        val = str(val).replace("|", "\\|").replace("\n", " ")
        if len(val) > 120:
            val = val[:117] + "..."
        md.append(f"| {r['metric_name']} | {val} | {r['source']} "
                  f"| {r['date_range']} | {r['confidence']} |")
    md_path = DOWNLOADS / f"{base}.md"
    md_path.write_text("\n".join(md))
    return md_path, json_path


# --------------------------------------------------------------------------- #
# Gemini function-calling driver (optional)
# --------------------------------------------------------------------------- #

def run_with_gemini() -> None:
    """Register the collectors as Gemini tools and let the model drive them."""
    try:
        import google.generativeai as genai
    except ImportError:
        sys.exit("google-generativeai not installed. Run: pip install google-generativeai")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("Set GEMINI_API_KEY to use --gemini mode.")

    genai.configure(api_key=api_key)

    # Tools Gemini can call. Each returns JSON-serialisable data.
    def shopify_tool() -> dict:
        """Collect all raw Shopify business data (store, products, inventory,
        collections, discounts; order-scoped metrics reported as unavailable)."""
        return collect_shopify_data()

    def klaviyo_tool() -> dict:
        """Collect all raw Klaviyo data (lists, segments, flows, campaigns,
        campaign & flow performance, email revenue) for the last 365 days."""
        return collect_klaviyo_data()

    def save_tool(shopify: dict, klaviyo: dict) -> dict:
        """Save the collected Shopify + Klaviyo data to the Downloads folder as
        Markdown and JSON. Returns the written file paths."""
        payload = {"generated_at": datetime.now(timezone.utc).isoformat(),
                   "shopify": shopify, "klaviyo": klaviyo}
        md, js = save_to_downloads(payload)
        return {"markdown": str(md), "json": str(js)}

    model = genai.GenerativeModel(
        "gemini-2.0-flash",
        tools=[shopify_tool, klaviyo_tool, save_tool],
        system_instruction=(
            "You are a data collector. Call shopify_tool and klaviyo_tool to "
            "gather raw data, then call save_tool with both results to write the "
            "export to Downloads. Do not summarise, explain, or recommend. "
            "Report only the saved file paths."),
    )
    chat = model.start_chat(enable_automatic_function_calling=True)
    resp = chat.send_message(
        "Collect all Shopify and Klaviyo data and save it to Downloads.")
    print(resp.text)


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #

def main() -> None:
    if "--gemini" in sys.argv:
        run_with_gemini()
        return
    print("Collecting Shopify + Klaviyo data ...", file=sys.stderr)
    payload = collect_all()
    md, js = save_to_downloads(payload)
    print(f"Saved:\n  {md}\n  {js}")


if __name__ == "__main__":
    main()

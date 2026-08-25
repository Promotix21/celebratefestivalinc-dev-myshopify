#!/usr/bin/env python3
"""Idempotent importer for the CF Product & Brand Library.

Creates/migrates the marketing_* tables (matching lib/db.php's
db_ensure_marketing_schema) and imports the workbook-derived brand,
product and link/placement data from data-seed/marketing-workbook-links.json.

Safe to re-run: brands/categories are upserted by name, products are
upserted by (product_name, source_sheet, source_cell), and links are
upserted by (source_sheet, source_cell) -- a link's url is intentionally
NOT unique, since multiple workbook cells may point at the same
destination. Re-running never overwrites rows that already exist, so
manual edits made through the admin CRUD UI are preserved.

Usage: python3 seed_marketing.py
"""
import json
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DB_PATH = SCRIPT_DIR / 'data' / 'tracker.sqlite'
SEED_PATH = SCRIPT_DIR / 'data-seed' / 'marketing-workbook-links.json'


def backup_db(db_path: Path) -> Path | None:
    if not db_path.exists():
        return None
    ts = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup_path = db_path.with_name(f'{db_path.stem}.pre-marketing-migration-{ts}{db_path.suffix}')
    shutil.copy2(db_path, backup_path)
    print(f"Backed up {db_path} -> {backup_path}")
    return backup_path


def links_url_is_unique(cur) -> bool:
    """Detect a legacy UNIQUE(url) constraint (column-level or index-level)."""
    row = cur.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='marketing_links'"
    ).fetchone()
    if row and row[0] and 'url text unique' in row[0].lower():
        return True
    for idx in cur.execute("PRAGMA index_list('marketing_links')").fetchall():
        if idx[2] == 1:  # unique index
            cols = [c[2] for c in cur.execute(f"PRAGMA index_info({idx[1]!r})").fetchall()]
            if cols == ['url']:
                return True
    return False


def migrate_links_drop_unique(conn, cur) -> None:
    """Safe table-rebuild: drop UNIQUE(url), preserve ids/data/FKs."""
    print("Detected legacy UNIQUE(url) constraint on marketing_links -- migrating...")
    cur.execute("PRAGMA foreign_keys=OFF")
    cur.execute("""
        CREATE TABLE marketing_links__new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER REFERENCES marketing_products(id),
          category_id INTEGER REFERENCES marketing_categories(id),
          label TEXT,
          url TEXT,
          link_type TEXT CHECK(link_type IN ('celebrate_product','celebrate_collection','google_drive_asset','manufacturer','supplier','external_reference','other')),
          source_sheet TEXT,
          source_cell TEXT,
          verification_status TEXT,
          last_verified_at DATETIME,
          notes TEXT
        )
    """)
    cur.execute("""
        INSERT INTO marketing_links__new
            (id, product_id, category_id, label, url, link_type, source_sheet, source_cell, verification_status, last_verified_at, notes)
        SELECT id, product_id, category_id, label, url, link_type, source_sheet, source_cell, verification_status, last_verified_at, notes
        FROM marketing_links
    """)
    cur.execute("DROP TABLE marketing_links")
    cur.execute("ALTER TABLE marketing_links__new RENAME TO marketing_links")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_marketing_links_cell ON marketing_links(source_sheet, source_cell)")
    cur.execute("PRAGMA foreign_keys=ON")
    conn.commit()
    print("Migration complete: UNIQUE(url) removed, row IDs preserved.")


def ensure_schema(conn, cur) -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"tracker.sqlite not found at {DB_PATH}. Run the CMS once first so lib/db.php can bootstrap it.")

    # If an older install still has UNIQUE(url), migrate it away (with a
    # pre-migration backup) before anything else touches the table.
    has_links_table = cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='marketing_links'"
    ).fetchone()
    if has_links_table and links_url_is_unique(cur):
        backup_db(DB_PATH)
        migrate_links_drop_unique(conn, cur)

    cur.executescript('''
    CREATE TABLE IF NOT EXISTS marketing_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      origin TEXT CHECK(origin IN ('excel','current_addition','manual')),
      marketing_status TEXT CHECK(marketing_status IN ('approved','restricted','needs_verification','inactive')),
      notes TEXT,
      source_sheet TEXT,
      source_cell TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      updated_by INTEGER REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS marketing_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      historical_status TEXT,
      current_status TEXT,
      sort_order INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS marketing_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      brand_id INTEGER REFERENCES marketing_brands(id),
      category_id INTEGER REFERENCES marketing_categories(id),
      product_type TEXT,
      marketing_status TEXT,
      description TEXT,
      celebrate_url TEXT,
      image_url TEXT,
      manufacturer_url TEXT,
      notes TEXT,
      source TEXT,
      source_sheet TEXT,
      source_cell TEXT,
      last_verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      updated_by INTEGER REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS marketing_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES marketing_products(id),
      category_id INTEGER REFERENCES marketing_categories(id),
      label TEXT,
      url TEXT,
      link_type TEXT CHECK(link_type IN ('celebrate_product','celebrate_collection','google_drive_asset','manufacturer','supplier','external_reference','other')),
      source_sheet TEXT,
      source_cell TEXT,
      verification_status TEXT,
      last_verified_at DATETIME,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS marketing_restrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER REFERENCES marketing_brands(id),
      product_id INTEGER REFERENCES marketing_products(id),
      link_id INTEGER REFERENCES marketing_links(id),
      restriction TEXT,
      severity TEXT,
      active INTEGER DEFAULT 1,
      source TEXT,
      target_type TEXT,
      target_label TEXT,
      asset_url TEXT,
      target_scope TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS marketing_restriction_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restriction_id INTEGER NOT NULL REFERENCES marketing_restrictions(id) ON DELETE CASCADE,
      evidence_type TEXT CHECK(evidence_type IN ('image','screenshot','document','url')) DEFAULT 'image',
      source TEXT CHECK(source IN ('synergy_account_intelligence','github','cms_upload','manual')) DEFAULT 'cms_upload',
      source_reference TEXT,
      source_path TEXT,
      public_url TEXT,
      local_path TEXT,
      caption TEXT,
      original_filename TEXT,
      archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_restriction_evidence ON marketing_restriction_evidence(restriction_id, archived);
    ''')

    cols = [c[1] for c in cur.execute("PRAGMA table_info(marketing_restrictions)").fetchall()]
    if 'link_id' not in cols:
        cur.execute("ALTER TABLE marketing_restrictions ADD COLUMN link_id INTEGER REFERENCES marketing_links(id)")
    # A restriction can target something that is neither a brand, product nor a
    # concrete link row -- e.g. a previously rejected creative/image that only
    # exists as a client-feedback screenshot and has no URL in the workbook.
    # target_type/target_label/asset_url/target_scope describe such targets
    # explicitly instead of mis-attaching them to an unrelated product page.
    for col, ddl in (
        ('target_type', "ALTER TABLE marketing_restrictions ADD COLUMN target_type TEXT"),
        ('target_label', "ALTER TABLE marketing_restrictions ADD COLUMN target_label TEXT"),
        ('asset_url', "ALTER TABLE marketing_restrictions ADD COLUMN asset_url TEXT"),
        ('target_scope', "ALTER TABLE marketing_restrictions ADD COLUMN target_scope TEXT"),
    ):
        if col not in cols:
            cur.execute(ddl)

    conn.commit()


def migrate_drive_link_types(cur) -> None:
    """The historical Account Intelligence source classifies every
    drive.google.com placement as a Google Drive creative asset. Older seeds
    stored them as 'other'; re-point any such existing rows to
    'google_drive_asset' (idempotent -- only touches rows still on 'other')."""
    n = cur.execute(
        "UPDATE marketing_links SET link_type='google_drive_asset' "
        "WHERE url LIKE '%drive.google.com%' AND link_type='other'"
    ).rowcount
    if n:
        print(f"Migrated {n} drive.google.com link(s) from 'other' -> 'google_drive_asset'.")


def migrate_product_url_fields(cur) -> None:
    """Some products stored a manufacturer/supplier URL in celebrate_url.
    celebrate_url must only ever hold celebratefestivalinc.com URLs; anything
    else belongs in manufacturer_url. Idempotent and non-destructive: only
    moves a URL into manufacturer_url when that field is empty (never clobbers
    an admin-entered manufacturer_url), and only clears the mis-filed
    celebrate_url. Rows already correct are left untouched."""
    rows = cur.execute(
        "SELECT id, celebrate_url, manufacturer_url FROM marketing_products "
        "WHERE celebrate_url IS NOT NULL AND celebrate_url <> '' "
        "AND celebrate_url NOT LIKE '%celebratefestivalinc.com%'"
    ).fetchall()
    moved = 0
    for pid, cel, man in rows:
        if not man:
            cur.execute("UPDATE marketing_products SET manufacturer_url=? WHERE id=?", (cel, pid))
        cur.execute("UPDATE marketing_products SET celebrate_url=NULL WHERE id=?", (pid,))
        moved += 1
    if moved:
        print(f"Normalized {moved} product(s): moved manufacturer URL out of celebrate_url.")


def seed_brands_and_categories(cur) -> None:
    original_brands = [
        "ATOSA", "TRUE", "Turbo Air", "Lincoln", "Turbochef", "Omcan", "Waring", "Dukers", "Winco",
        "Krowne", "Hoshizaki", "GSW", "Howard McCray", "Shaan", "Rotoquip", "Bharat Overseas",
        "Globe", "Rational", "Robot Coupe", "Somerset", "Doyon", "Imperial", "Vulcan", "Amana",
        "Sharp", "Eurodib", "American Range", "John Boos", "Nemco", "US Cooler", "Norlake",
        "Pitco", "Thunderbird", "Vollrath", "Bunn", "Metro", "Toastmaster", "Southbend",
        "American MetalCraft", "CMA", "Accutemp", "Lloyd Pans", "Dexter", "Hatco", "Lakshmi - India",
        "Rishab - India", "Fri-Jado"
    ]
    added_brands = ["Alto-Shaam", "Angaar Tandoors"]

    for b in original_brands:
        status = 'restricted' if b == "Rotoquip" else 'approved'
        cur.execute('''
            INSERT INTO marketing_brands (name, origin, marketing_status)
            VALUES (?, 'excel', ?)
            ON CONFLICT(name) DO NOTHING
        ''', (b, status))

    for b in added_brands:
        cur.execute('''
            INSERT INTO marketing_brands (name, origin, marketing_status)
            VALUES (?, 'current_addition', 'approved')
            ON CONFLICT(name) DO NOTHING
        ''', (b,))

    categories = [
        "Beverage Solution", "Pizza", "Food Display", "Cooking Equipment",
        "Food Preparation Equipment / Tools", "Refrigeration", "Storage / Tables / Sinks",
        "Cafe / Ice Cream", "Indian", "Serveware", "Cookware", "Top Categories"
    ]
    for idx, c in enumerate(categories):
        cur.execute('''
            INSERT INTO marketing_categories (name, sort_order)
            VALUES (?, ?)
            ON CONFLICT(name) DO NOTHING
        ''', (c, idx))


def brand_id_by_name(cur, name):
    if not name:
        return None
    row = cur.execute("SELECT id FROM marketing_brands WHERE name=?", (name,)).fetchone()
    return row[0] if row else None


def category_id_by_name(cur, name):
    if not name:
        return None
    row = cur.execute("SELECT id FROM marketing_categories WHERE name=?", (name,)).fetchone()
    return row[0] if row else None


def import_products(cur, products) -> dict:
    """Insert products that don't already exist (by product_name+source_sheet+source_cell).
    Returns a map of (product_name, source_sheet, source_cell) -> id for link resolution."""
    product_ids = {}
    inserted = 0
    for p in products:
        key = (p['product_name'], p.get('source_sheet'), p.get('source_cell'))
        row = cur.execute(
            "SELECT id FROM marketing_products WHERE product_name=? AND source_sheet IS ? AND source_cell IS ?",
            key
        ).fetchone()
        if row:
            product_ids[key] = row[0]
            continue

        brand_id = brand_id_by_name(cur, p.get('brand'))
        category_id = category_id_by_name(cur, p.get('category'))
        cur.execute('''
            INSERT INTO marketing_products
                (product_name, brand_id, category_id, product_type, marketing_status, description,
                 celebrate_url, image_url, manufacturer_url, notes, source, source_sheet, source_cell)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p['product_name'], brand_id, category_id, p.get('product_type'),
            p.get('marketing_status', 'needs_verification'), p.get('description'),
            p.get('celebrate_url'), p.get('image_url'), p.get('manufacturer_url'),
            p.get('notes'), p.get('source', 'excel'), p.get('source_sheet'), p.get('source_cell'),
        ))
        product_ids[key] = cur.lastrowid
        inserted += 1
    print(f"Products: {inserted} inserted, {len(products) - inserted} already present.")
    return product_ids


def import_links(cur, links, product_ids) -> None:
    inserted = 0
    for l in links:
        key = (l.get('source_sheet'), l.get('source_cell'))
        row = cur.execute(
            "SELECT id FROM marketing_links WHERE source_sheet IS ? AND source_cell IS ?",
            key
        ).fetchone()
        if row:
            continue

        product_id = None
        ref = l.get('product')
        if ref:
            pkey = (ref['product_name'], ref.get('source_sheet'), ref.get('source_cell'))
            product_id = product_ids.get(pkey)

        category_id = category_id_by_name(cur, l.get('category'))
        cur.execute('''
            INSERT INTO marketing_links
                (product_id, category_id, label, url, link_type, source_sheet, source_cell, verification_status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product_id, category_id, l.get('label'), l.get('url'), l.get('link_type'),
            l.get('source_sheet'), l.get('source_cell'), l.get('verification_status', 'pending'), l.get('notes'),
        ))
        inserted += 1
    print(f"Links: {inserted} inserted, {len(links) - inserted} already present.")


def add_brand_restriction(cur, brand_name, text, severity):
    b_id = brand_id_by_name(cur, brand_name)
    if not b_id:
        return
    row = cur.execute(
        "SELECT id FROM marketing_restrictions WHERE brand_id=? AND link_id IS NULL AND restriction=?",
        (b_id, text)
    ).fetchone()
    if not row:
        cur.execute(
            "INSERT INTO marketing_restrictions (brand_id, restriction, severity) VALUES (?, ?, ?)",
            (b_id, text, severity)
        )


def add_link_restriction(cur, source_sheet, source_cell, text, severity):
    """Restrict a *specific* link/creative rather than the whole brand."""
    row = cur.execute(
        "SELECT id, product_id FROM marketing_links WHERE source_sheet=? AND source_cell=?",
        (source_sheet, source_cell)
    ).fetchone()
    if not row:
        print(f"WARNING: link {source_sheet}!{source_cell} not found -- skipping link-level restriction.")
        return
    link_id, product_id = row
    exists = cur.execute(
        "SELECT id FROM marketing_restrictions WHERE link_id=? AND restriction=?",
        (link_id, text)
    ).fetchone()
    if not exists:
        cur.execute(
            "INSERT INTO marketing_restrictions (link_id, product_id, restriction, severity) VALUES (?, ?, ?, ?)",
            (link_id, product_id, text, severity)
        )


# The one previously-rejected Rational creative. Per the Account Intelligence
# source this blocks a specific historical IMAGE used in the Combination Oven
# creative -- NOT the Rational brand and NOT the Rational product page at
# Index!G24. The rejected image URL is not present in the workbook (it only
# exists as a historical client-feedback screenshot), so asset_url stays NULL
# rather than being invented.
RATIONAL_CREATIVE = {
    'restriction': (
        'REJECTED / DO NOT USE. Image only. Applies to the previously rejected '
        'Rational / Combination Oven creative image, NOT the Rational brand '
        '(Approved) nor the Index!G24 Rational product page.'
    ),
    'severity': 'medium',
    'target_type': 'creative_asset',
    'target_label': 'Previously rejected Rational / Combination Oven image',
    'target_scope': 'image_only',
    'asset_url': None,
}


def converge_rational_creative_restriction(cur) -> None:
    """Ensure the previously-rejected Rational creative is represented as an
    image-only creative-asset restriction with no brand/product/link target.

    Historically this note has been mis-attached two different ways:
      * as a brand-level ban on Rational (brand_id set, link_id NULL), and
      * as a link/product restriction on Index!G24 -- but G24 is the Rational
        *product page*, which the image rule does NOT restrict.
    Either way, detach it from those targets and store it as a creative asset.
    Idempotent: converts any legacy variant, else inserts one clean row."""
    b_id = brand_id_by_name(cur, 'Rational')

    # G24 is a celebrate_product page; capture its ids only so we can DETACH
    # any restriction currently (wrongly) pointed at it.
    g24 = cur.execute(
        "SELECT id, product_id FROM marketing_links WHERE source_sheet='Index' AND source_cell='G24'"
    ).fetchone()
    g24_link_id = g24[0] if g24 else None
    g24_product_id = g24[1] if g24 else None

    # Find any existing form of this restriction (brand ban, G24 link, or the
    # already-converged creative_asset row).
    candidates = cur.execute(
        "SELECT id FROM marketing_restrictions WHERE "
        "target_type='creative_asset' "
        "OR (restriction LIKE '%rejected%' AND ("
        "    (brand_id IS NOT NULL AND brand_id=?) "
        " OR (link_id IS NOT NULL AND link_id=?) "
        " OR (product_id IS NOT NULL AND product_id=?)))",
        (b_id or -1, g24_link_id or -1, g24_product_id or -1)
    ).fetchall()

    if candidates:
        target_id = candidates[0][0]
        cur.execute(
            "UPDATE marketing_restrictions SET brand_id=NULL, product_id=NULL, link_id=NULL, "
            "restriction=?, severity=?, target_type=?, target_label=?, target_scope=?, asset_url=?, "
            "active=1, updated_at=CURRENT_TIMESTAMP WHERE id=?",
            (RATIONAL_CREATIVE['restriction'], RATIONAL_CREATIVE['severity'],
             RATIONAL_CREATIVE['target_type'], RATIONAL_CREATIVE['target_label'],
             RATIONAL_CREATIVE['target_scope'], RATIONAL_CREATIVE['asset_url'], target_id)
        )
        # Deactivate any duplicate legacy rows so only one clean row remains.
        for (dup_id,) in candidates[1:]:
            cur.execute("UPDATE marketing_restrictions SET active=0, updated_at=CURRENT_TIMESTAMP WHERE id=?", (dup_id,))
        print(f"Converged Rational creative restriction to creative_asset (id={target_id}); "
              f"detached from Index!G24 product page.")
    else:
        cur.execute(
            "INSERT INTO marketing_restrictions "
            "(restriction, severity, target_type, target_label, target_scope, asset_url, source, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, 'account_intelligence', CURRENT_TIMESTAMP)",
            (RATIONAL_CREATIVE['restriction'], RATIONAL_CREATIVE['severity'],
             RATIONAL_CREATIVE['target_type'], RATIONAL_CREATIVE['target_label'],
             RATIONAL_CREATIVE['target_scope'], RATIONAL_CREATIVE['asset_url'])
        )
        print("Inserted Rational creative-asset (image-only) restriction.")


def seed_restrictions(cur) -> None:
    converge_rational_creative_restriction(cur)
    add_brand_restriction(
        cur, 'Rotoquip',
        'Historical workbook reference exists, but do not currently promote unless explicitly approved again.',
        'high'
    )
    row = cur.execute("SELECT id FROM marketing_restrictions WHERE restriction=?", ('DO NOT PROMOTE - WEB RESTAURANT',)).fetchone()
    if not row:
        cur.execute("INSERT INTO marketing_restrictions (restriction, severity) VALUES (?, ?)", ('DO NOT PROMOTE - WEB RESTAURANT', 'high'))


def main():
    if not SEED_PATH.exists():
        raise SystemExit(f"Seed file not found: {SEED_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    ensure_schema(conn, cur)
    seed_brands_and_categories(cur)
    conn.commit()

    with open(SEED_PATH, encoding='utf-8') as f:
        data = json.load(f)

    product_ids = import_products(cur, data['products'])
    conn.commit()

    import_links(cur, data['links'], product_ids)
    conn.commit()

    # Data-quality migrations for rows that predate the corrected seed. All are
    # idempotent and non-destructive to admin edits.
    migrate_drive_link_types(cur)
    migrate_product_url_fields(cur)
    conn.commit()

    seed_restrictions(cur)
    conn.commit()

    conn.close()
    print("Seeding complete.")


if __name__ == '__main__':
    sys.exit(main())

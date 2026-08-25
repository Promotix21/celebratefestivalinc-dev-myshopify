import sqlite3
import datetime

db_path = '/home/rajthecypher/projects/celebrate-festival/cms_public_html/data/tracker.sqlite'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Create Tables
cur.execute('''
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
)
''')

cur.execute('''
CREATE TABLE IF NOT EXISTS marketing_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  historical_status TEXT,
  current_status TEXT,
  sort_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
)
''')

cur.execute('''
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
)
''')

cur.execute('''
CREATE TABLE IF NOT EXISTS marketing_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES marketing_products(id),
  category_id INTEGER REFERENCES marketing_categories(id),
  label TEXT,
  url TEXT UNIQUE,
  link_type TEXT CHECK(link_type IN ('celebrate_product','celebrate_collection','google_drive_asset','manufacturer','supplier','external_reference','other')),
  source_sheet TEXT,
  source_cell TEXT,
  verification_status TEXT,
  last_verified_at DATETIME,
  notes TEXT
)
''')

cur.execute('''
CREATE TABLE IF NOT EXISTS marketing_restrictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_id INTEGER REFERENCES marketing_brands(id),
  product_id INTEGER REFERENCES marketing_products(id),
  restriction TEXT,
  severity TEXT,
  active INTEGER DEFAULT 1,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
)
''')

# Seed Brands
original_brands = [
    "ATOSA", "TRUE", "Turbo Air", "Lincoln", "Turbochef", "Omcan", "Waring", "Dukers", "Winco",
    "Krowne", "Hoshizaki", "GSW", "Howard McCray", "Shaan", "Rotoquip", "Bharat Overseas",
    "Globe", "Rational", "Robot Coupe", "Somerset", "Doyon", "Imperial", "Vulcan", "Amana",
    "Sharp", "Eurodib", "American Range", "John Boos", "Nemco", "US Cooler", "Norlake",
    "Pitco", "Thunderbird", "Vollrath", "Bunn", "Metro", "Toastmaster", "Southbend",
    "American MetalCraft", "CMA", "Accutemp", "Lloyd Pans", "Dexter", "Hatco", "Lakshmi - India",
    "Rishab - India", "Fri-Jado"
]

added_brands = [
    "Alto-Shaam", "Angaar Tandoors"
]

for b in original_brands:
    status = 'approved'
    if b == "Rotoquip":
        status = 'restricted'
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

# Categories
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

def add_restriction(brand_name, text, severity):
    cur.execute("SELECT id FROM marketing_brands WHERE name=?", (brand_name,))
    row = cur.fetchone()
    if row:
        b_id = row[0]
        cur.execute("SELECT id FROM marketing_restrictions WHERE brand_id=? AND restriction=?", (b_id, text))
        if not cur.fetchone():
            cur.execute("INSERT INTO marketing_restrictions (brand_id, restriction, severity) VALUES (?, ?, ?)",
                        (b_id, text, severity))

add_restriction('Rotoquip', 'Historical workbook reference exists, but do not currently promote unless explicitly approved again.', 'high')
add_restriction('Rational', 'Brand allowed. Specific previously rejected Rational/combi-oven creative remains blocked. Do not interpret that as a brand-level ban.', 'medium')

cur.execute("SELECT id FROM marketing_restrictions WHERE restriction=?", ('DO NOT PROMOTE - WEB RESTAURANT',))
if not cur.fetchone():
    cur.execute("INSERT INTO marketing_restrictions (restriction, severity) VALUES (?, ?)", ('DO NOT PROMOTE - WEB RESTAURANT', 'high'))

conn.commit()
conn.close()
print("Seeding complete")

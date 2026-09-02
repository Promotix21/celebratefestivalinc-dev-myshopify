<?php
declare(strict_types=1);

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $dbFile = __DIR__ . '/../data/tracker.sqlite';
    $fresh  = !file_exists($dbFile);

    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON');

    if ($fresh) {
        db_bootstrap($pdo);
        db_seed($pdo);
    }

    // Idempotent schema upgrades for existing DBs
    db_ensure_marketing_schema($pdo);

    return $pdo;
}

function db_bootstrap(PDO $pdo): void {
    $pdo->exec(<<<SQL
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','client')),
      display_name TEXT,
      api_token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      task_type TEXT CHECK(task_type IN ('Bug','Feature','UI Change')) DEFAULT 'Feature',
      priority TEXT CHECK(priority IN ('Low','Medium','High')) DEFAULT 'Medium',
      status TEXT CHECK(status IN ('Pending','In Progress','Ready for Review','Needs Clarification','Completed')) DEFAULT 'Pending',
      expected_behavior TEXT,
      eta_date TEXT,
      deadline TEXT,
      eta_set_by INTEGER REFERENCES users(id),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    );

    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size_bytes INTEGER,
      kind TEXT CHECK(kind IN ('before','after','other')) DEFAULT 'other',
      uploaded_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('Requested','Under Review','Approved for Planning','Scheduled','In Progress','Ready for Review','Completed')) DEFAULT 'Requested',
      demo_url TEXT,
      completion_date DATE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE feature_tasks (
      feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      relation_type TEXT NOT NULL CHECK(relation_type IN ('request','implementation')) DEFAULT 'implementation',
      PRIMARY KEY(feature_id, task_id)
    );

    CREATE TABLE docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT CHECK(category IN ('Setup','SEO','Features','Guides','Other')) DEFAULT 'Other',
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      caption TEXT,
      hashtags TEXT,
      media_type TEXT CHECK(media_type IN ('Image','Reel','Video','Carousel','Story','Post')) DEFAULT 'Post',
      platform TEXT CHECK(platform IN ('Instagram','Facebook','TikTok','YouTube','LinkedIn','X','Other')) DEFAULT 'Instagram',
      status TEXT CHECK(status IN ('Idea','Drafting','Ready','Scheduled','Published')) DEFAULT 'Idea',
      scheduled_for DATE,
      published_at DATETIME,
      link TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE content_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size_bytes INTEGER,
      uploaded_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_content_scheduled ON content_items(scheduled_for);
    CREATE INDEX idx_content_status ON content_items(status);
    CREATE INDEX idx_tasks_status ON tasks(status);
    CREATE INDEX idx_comments_task ON comments(task_id);
    CREATE INDEX idx_attachments_task ON attachments(task_id);
    CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
    CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
    SQL);
}

function db_seed(PDO $pdo): void {
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?,?,?,?)');
    $stmt->execute(['admin', password_hash('admin123', PASSWORD_BCRYPT), 'admin', 'Developer']);
    $stmt->execute(['jielin', password_hash('client123', PASSWORD_BCRYPT), 'client', 'Jielin']);

    // Seed a couple of demo rows for a livelier first-run dashboard.
    $adminId = 1; $clientId = 2;
    $t = $pdo->prepare('INSERT INTO tasks (title, description, task_type, priority, status, expected_behavior, created_by, created_at) VALUES (?,?,?,?,?,?,?,datetime("now",?))');
    $t->execute(['Fix header logo alignment', 'Logo is shifted on mobile.', 'Bug', 'High', 'Pending', 'Logo stays centered across breakpoints.', $clientId, '-2 days']);
    $t->execute(['Add SEO meta tags to collection pages', 'Collection pages missing OG tags.', 'Feature', 'Medium', 'In Progress', 'Each collection renders title/description/OG image.', $clientId, '-1 day']);
    $pdo->exec("UPDATE tasks SET started_at=datetime('now','-6 hours'), eta_date=date('now','+2 days'), deadline=date('now','+2 days'), eta_set_by={$adminId} WHERE id=2");

    $f = $pdo->prepare('INSERT INTO features (title, description, status, completion_date, created_by) VALUES (?,?,?,?,?)');
    $f->execute(['System Dashboard', 'Single-pane overview of active work.', 'Completed', date('Y-m-d'), $adminId]);
    $f->execute(['Core SEO Architecture', 'Meta, sitemap, and schema foundations.', 'In Progress', null, $adminId]);

    $d = $pdo->prepare('INSERT INTO docs (title, content, category, created_by) VALUES (?,?,?,?)');
    $d->execute(['How Collections Work', "# Collections\n\nCollections are grouped by tag. Each tag maps to a landing page.\n\n- Tag prefix: `collection:`\n- Auto-generated sitemap entry\n- Custom meta via the admin module", 'Features', $adminId]);
    $d->execute(['SEO Setup Checklist', "# SEO Checklist\n\n- robots.txt\n- sitemap.xml\n- canonical tags\n- OG / Twitter meta\n- Structured data", 'SEO', $adminId]);
}

function db_ensure_marketing_schema(PDO $pdo): void {
    $pdo->exec(<<<SQL
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
    SQL);
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_restriction_evidence ON marketing_restriction_evidence(restriction_id, archived)");

    // Backfill columns that older installs may be missing.
    $cols = array_column($pdo->query("PRAGMA table_info(marketing_restrictions)")->fetchAll(), 'name');
    $add = [
        'link_id'      => "ALTER TABLE marketing_restrictions ADD COLUMN link_id INTEGER REFERENCES marketing_links(id)",
        'target_type'  => "ALTER TABLE marketing_restrictions ADD COLUMN target_type TEXT",
        'target_label' => "ALTER TABLE marketing_restrictions ADD COLUMN target_label TEXT",
        'asset_url'    => "ALTER TABLE marketing_restrictions ADD COLUMN asset_url TEXT",
        'target_scope' => "ALTER TABLE marketing_restrictions ADD COLUMN target_scope TEXT",
    ];
    foreach ($add as $name => $ddl) {
        if (!in_array($name, $cols, true)) {
            $pdo->exec($ddl);
        }
    }
}

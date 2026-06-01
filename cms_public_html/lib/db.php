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
      status TEXT CHECK(status IN ('Planned','In Progress','Completed')) DEFAULT 'Planned',
      demo_url TEXT,
      completion_date DATE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE feature_tasks (
      feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
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

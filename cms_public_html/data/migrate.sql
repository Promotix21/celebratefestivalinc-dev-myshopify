-- =============================================================================
-- Celebrate Festival CMS — Feature/Task classification migration
-- Purpose: introduce the Feature lifecycle, separate CLIENT-REQUESTED work from
--          TEAM-COMMITTED work, and reclassify the 9 open tasks correctly.
--
-- Safe to run against a pristine live pull (tracker_live.sqlite). Wrapped in a
-- single transaction, guarded so re-running is idempotent, preserves all IDs,
-- descriptions, created_by/created_at, demo_url, completion dates, and
-- feature_tasks relationships.
--
-- NOTE on eta_hours: the tasks table DOES contain an `eta_hours` REAL column
-- (verified via PRAGMA table_info(tasks)). Clearing it below is valid.
-- =============================================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- -----------------------------------------------------------------------------
-- 1. Widen the `features.status` CHECK to the full lifecycle.
--    SQLite cannot ALTER a CHECK constraint, so we rebuild the table.
--    Idempotent: a stale temp table is dropped first; the 'Planned' ->
--    'Approved for Planning' remap is a no-op on an already-migrated DB.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS features_new;

CREATE TABLE features_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN (
      'Requested',
      'Under Review',
      'Approved for Planning',
      'Scheduled',
      'In Progress',
      'Ready for Review',
      'Completed'
  )) DEFAULT 'Requested',
  demo_url TEXT,
  completion_date DATE,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO features_new (id, title, description, status, demo_url, completion_date, created_by, created_at)
SELECT id, title, description,
       CASE status
         WHEN 'Planned' THEN 'Approved for Planning'
         ELSE status
       END,
       demo_url, completion_date, created_by, created_at
FROM features;

DROP TABLE features;
ALTER TABLE features_new RENAME TO features;

-- Keep AUTOINCREMENT counter consistent after the rebuild.
DELETE FROM sqlite_sequence WHERE name IN ('features', 'features_new');
INSERT INTO sqlite_sequence (name, seq)
SELECT 'features', COALESCE(MAX(id), 0) FROM features;

-- -----------------------------------------------------------------------------
-- 1b. Add relation_type to feature_tasks so we can tell an ORIGINAL CLIENT
--     REQUEST / history record apart from an actual IMPLEMENTATION task.
--       'request'        -> original ask, preserved as history, NEVER active
--       'implementation' -> real work; may appear in Active Delivery / Review
--     Rebuilt (not ALTER ADD COLUMN) so the migration is idempotent whether or
--     not the column already exists: we only ever SELECT feature_id/task_id
--     from the old table, then re-assert 'request' for the four request links.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS feature_tasks_new;

CREATE TABLE feature_tasks_new (
  feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK(relation_type IN ('request','implementation')) DEFAULT 'implementation',
  PRIMARY KEY(feature_id, task_id)
);

-- Carry existing links over. Everything defaults to 'implementation'; the four
-- migrated request links are re-labelled in step 5b below. Task 82 (4->82) is
-- an implementation task: it is Completed with delivered output ("First batch
-- published — 3 articles now live"), not a preserved request stub.
INSERT INTO feature_tasks_new (feature_id, task_id, relation_type)
SELECT feature_id, task_id, 'implementation' FROM feature_tasks;

DROP TABLE feature_tasks;
ALTER TABLE feature_tasks_new RENAME TO feature_tasks;

-- -----------------------------------------------------------------------------
-- 2. Reclassify the open tasks by EVIDENCE (task_type was inconsistent in prod).
--    Bugs/Corrections: something broke or is incorrect.
--      98  - "recover the broken Price Box UI"
--      106 - "Fix the broken CFI logo / blank item lines" (Out for delivery)
--      107 - "Fix the broken CFI logo / blank item lines" (Order delivered)
-- -----------------------------------------------------------------------------
UPDATE tasks SET task_type = 'Bug' WHERE id IN (98, 106, 107);

-- Task 109 (L2 Mega collections) is an implemented enhancement, NOT a bug.
-- It was mislabelled task_type='Bug' in production. Correct the type and move
-- it to Ready for Review (implementation complete on DEV, awaiting sign-off).
UPDATE tasks SET task_type = 'Feature', status = 'Ready for Review' WHERE id = 109;

-- -----------------------------------------------------------------------------
-- 3. Promote the four CLIENT FEATURE REQUESTS into Feature records.
--      54  - Journey page UI refinement
--      89  - Our Trusted Restaurant Partners (new section + page)
--      101 - AI ChatBot implementation
--      102 - Rebate Interface
--    The original Tasks are preserved untouched (comments/attachments/activity)
--    and linked to the Feature via feature_tasks for history. Guarded so it
--    only creates a Feature for a task that isn't already linked.
-- -----------------------------------------------------------------------------
INSERT INTO features (title, description, status, created_by, created_at)
SELECT t.title, t.description, 'Requested', t.created_by, t.created_at
FROM tasks t
WHERE t.id IN (54, 89, 101, 102)
  AND t.id NOT IN (SELECT task_id FROM feature_tasks);

INSERT INTO feature_tasks (feature_id, task_id, relation_type)
SELECT f.id, t.id, 'request'
FROM tasks t
JOIN features f
  ON f.title = t.title
 AND f.created_by = t.created_by
 AND f.created_at = t.created_at
WHERE t.id IN (54, 89, 101, 102)
  AND t.id NOT IN (SELECT task_id FROM feature_tasks);

-- 5b. Idempotent re-assert: the four migrated tasks are ORIGINAL REQUESTS.
--     (No-op after the first run; guarantees correct labelling on re-run.)
UPDATE feature_tasks SET relation_type = 'request' WHERE task_id IN (54, 89, 101, 102);

-- -----------------------------------------------------------------------------
-- 4. A feature request is NOT a commitment: strip any ETA/schedule signal from
--    the four request tasks so they never look "scheduled" or "overdue".
--    (Task 89 carried a stray eta_date of 2026-06-01.)
-- -----------------------------------------------------------------------------
UPDATE tasks
SET eta_date = NULL,
    eta_hours = NULL,
    deadline = NULL,
    eta_set_by = NULL
WHERE id IN (54, 89, 101, 102);

COMMIT;
PRAGMA foreign_keys = ON;

-- Integrity check (prints rows only on violation).
PRAGMA foreign_key_check;

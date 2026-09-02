<?php
declare(strict_types=1);

// --- Static file passthrough for PHP built-in server ---------------------
// Mirrors the Apache rule that exposes /public assets at the site root
// (RewriteRule ^(...\.css|js|png|...)$ public/$1). Only runs under `php -S`;
// production asset routing is handled by Apache and is untouched.
if (PHP_SAPI === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
    if ($path !== '/') {
        foreach ([__DIR__ . '/public' . $path, __DIR__ . $path] as $file) {
            if (is_file($file)) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $types = [
                    'css'=>'text/css', 'js'=>'application/javascript',
                    'png'=>'image/png', 'jpg'=>'image/jpeg', 'jpeg'=>'image/jpeg',
                    'gif'=>'image/gif', 'webp'=>'image/webp', 'svg'=>'image/svg+xml',
                    'ico'=>'image/x-icon', 'woff'=>'font/woff', 'woff2'=>'font/woff2',
                    'pdf'=>'application/pdf', 'mp4'=>'video/mp4', 'webm'=>'video/webm',
                    'mov'=>'video/quicktime',
                ];
                if (isset($types[$ext])) header('Content-Type: ' . $types[$ext]);
                readfile($file);
                exit;
            }
        }
    }
}

// --- Session & bootstrap --------------------------------------------------
$isHttps = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_name('PTSID');
session_start();

require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/helpers.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/activity.php';
require __DIR__ . '/lib/mailer.php';

db(); // ensure schema

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$uri    = '/' . trim($uri, '/');

// CSRF enforced on all POST except login form (login checks its own).
if ($method === 'POST' && $uri !== '/login') csrf_check();

// --- Public routes --------------------------------------------------------
if ($uri === '/login') {
    if ($method === 'POST') {
        csrf_check();
        $ok = attempt_login((string)post('username', ''), (string)post('password', ''));
        if ($ok) redirect('/');
        flash('Invalid credentials or too many attempts. Try again in a minute.', 'error');
        redirect('/login');
    }
    render('login', ['title' => 'Sign in', 'bare' => true]);
    exit;
}

if ($uri === '/logout') {
    logout();
    redirect('/login');
}

// --- Protected routes -----------------------------------------------------
$me = require_login();

if ($uri === '/') {
    require_page_access('dashboard');
    $pdo = db();

    // Model: CLIENT REQUEST task -> FEATURE -> IMPLEMENTATION task(s).
    // An original request/history task (feature_tasks.relation_type = 'request')
    // is NEVER surfaced as Active Delivery or Ready for Review, no matter what
    // lifecycle its Feature reaches. Committed work is driven by the FEATURE
    // lifecycle plus real implementation/standalone tasks.
    // NOTE: there is no true "owner" column on tasks — Owner is intentionally
    // omitted this release (do NOT surface eta_set_by / created_by as owner).

    // ACTIVE DELIVERY (tasks): open, not a bug, not in review — and not an
    // original client-request/history record.
    $active_tasks = $pdo->query("
        SELECT t.id, t.title, t.status, t.eta_date, t.created_at
        FROM tasks t
        WHERE t.status NOT IN ('Completed', 'Ready for Review')
          AND t.task_type != 'Bug'
          AND t.id NOT IN (SELECT task_id FROM feature_tasks WHERE relation_type = 'request')
        ORDER BY t.id DESC
    ")->fetchAll();

    // ACTIVE DELIVERY (features): Features the team has committed to.
    $active_features = $pdo->query("
        SELECT f.id, f.title, f.status, f.created_at
        FROM features f
        WHERE f.status IN ('Scheduled', 'In Progress')
        ORDER BY f.id DESC
    ")->fetchAll();

    // READY FOR REVIEW (tasks): implementation/standalone tasks awaiting sign-off
    // (never an original request/history record).
    $ready_tasks = $pdo->query("
        SELECT t.id, t.title, t.status, t.created_at
        FROM tasks t
        WHERE t.status = 'Ready for Review'
          AND t.id NOT IN (SELECT task_id FROM feature_tasks WHERE relation_type = 'request')
        ORDER BY t.id DESC
    ")->fetchAll();

    // READY FOR REVIEW (features): Features implemented, awaiting client sign-off.
    $ready_features = $pdo->query("
        SELECT f.id, f.title, f.status, f.created_at
        FROM features f
        WHERE f.status = 'Ready for Review'
        ORDER BY f.id DESC
    ")->fetchAll();

    // BUGS & CORRECTIONS: something broke / is incorrect and still open.
    $bugs_corrections = $pdo->query("
        SELECT t.id, t.title, t.status, t.eta_date, t.created_at
        FROM tasks t
        WHERE t.status NOT IN ('Completed', 'Ready for Review')
          AND t.task_type = 'Bug'
        ORDER BY t.id DESC
    ")->fetchAll();

    // FEATURE BACKLOG: requested features not yet committed to a schedule.
    $feature_backlog = $pdo->query("
        SELECT f.id, f.title, f.description, f.status, f.created_at, u.display_name AS requested_by
        FROM features f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.status IN ('Requested', 'Under Review', 'Approved for Planning')
        ORDER BY f.id DESC
    ")->fetchAll();

    // WORKSTREAMS: the major fronts of the engagement. Counts are computed from
    // real links only — an unassigned item is never counted (no fabrication).
    // Active count = open (non-Completed) implementation/standalone tasks +
    // non-Completed features linked to the workstream. Original request/history
    // tasks are excluded. Blockers = linked open tasks needing clarification.
    // Next ETA = earliest real eta_date among open linked tasks, else null.
    $workstreams = $pdo->query("
        SELECT w.*,
          (
            (SELECT COUNT(*) FROM tasks t
               WHERE t.workstream_id = w.id
                 AND t.status NOT IN ('Completed')
                 AND t.id NOT IN (SELECT task_id FROM feature_tasks WHERE relation_type = 'request'))
          + (SELECT COUNT(*) FROM features f
               WHERE f.workstream_id = w.id
                 AND f.status NOT IN ('Completed'))
          ) AS active_count,
          (SELECT COUNT(*) FROM tasks t
             WHERE t.workstream_id = w.id
               AND t.status = 'Needs Clarification') AS blocker_count,
          (SELECT MIN(t.eta_date) FROM tasks t
             WHERE t.workstream_id = w.id
               AND t.eta_date IS NOT NULL
               AND t.status NOT IN ('Completed')) AS next_eta
        FROM workstreams w
        WHERE w.active = 1
        ORDER BY w.sort_order ASC, w.id ASC
    ")->fetchAll();

    $activity = activity_recent(6);

    // Metric-card counts (derived from the buckets above — single source of truth).
    $counts = [
        'active'  => count($active_features) + count($active_tasks),
        'review'  => count($ready_features) + count($ready_tasks),
        'bugs'    => count($bugs_corrections),
        'backlog' => count($feature_backlog),
    ];

    render('dashboard', compact(
        'active_tasks', 'active_features', 'ready_tasks', 'ready_features',
        'bugs_corrections', 'feature_backlog', 'activity', 'workstreams', 'counts'
    ) + ['title' => 'Project Overview']);
    exit;
}

// --- Tasks ----------------------------------------------------------------
if (str_starts_with($uri, '/tasks')) require_page_access('tasks');
if ($uri === '/tasks/export' && $method === 'GET') {
    $sql = 'SELECT t.*, u.display_name AS creator FROM tasks t JOIN users u ON u.id = t.created_by WHERE 1=1';
    $args = [];
    if ($s = q('status'))   { $sql .= ' AND t.status = ?';    $args[] = $s; }
    if ($tp = q('type'))    { $sql .= ' AND t.task_type = ?'; $args[] = $tp; }
    if ($p = q('priority')) { $sql .= ' AND t.priority = ?';  $args[] = $p; }
    $sql .= ' ORDER BY t.id ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute($args);
    $rows = $stmt->fetchAll();

    $filename = 'tasks-' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store');

    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel auto-detects encoding
    fputcsv($out, [
        'ID','Title','Type','Priority','Status','Expected Behavior',
        'ETA Date','Created','Started','Completed','Creator','Description',
    ]);
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['id'], $r['title'], $r['task_type'], $r['priority'], $r['status'],
            $r['expected_behavior'], $r['eta_date'], $r['deadline'],
            $r['created_at'], $r['started_at'], $r['completed_at'],
            $r['creator'], $r['description'],
        ]);
    }
    fclose($out);
    exit;
}

if ($uri === '/tasks' && $method === 'GET') {
    $sql = 'SELECT t.*, u.display_name AS creator FROM tasks t JOIN users u ON u.id = t.created_by WHERE 1=1';
    $args = [];
    if ($s = q('status'))   { $sql .= ' AND t.status = ?';    $args[] = $s; }
    if ($t = q('type'))     { $sql .= ' AND t.task_type = ?'; $args[] = $t; }
    if ($p = q('priority')) { $sql .= ' AND t.priority = ?';  $args[] = $p; }
    // By default, hide original client-request / history records (the source
    // tasks behind a Feature). They stay reachable via ?show=all, the linked
    // Feature ("Original Request / Source"), or a direct /tasks/ID. Implementation
    // tasks are never hidden.
    $show_backlog = (q('show') === 'all');
    if (!$show_backlog) {
        $sql .= " AND t.id NOT IN (SELECT task_id FROM feature_tasks WHERE relation_type = 'request')";
    }
    $sql .= ' ORDER BY CASE t.status
        WHEN "Needs Clarification" THEN 0
        WHEN "In Progress" THEN 1
        WHEN "Ready for Review" THEN 2
        WHEN "Pending" THEN 3
        WHEN "Completed" THEN 4 END, t.id DESC';
    $stmt = db()->prepare($sql);
    $stmt->execute($args);
    // Count how many original request/history records are hidden, for the toggle.
    $hidden_backlog = (int)db()->query("
        SELECT COUNT(*) FROM feature_tasks WHERE relation_type = 'request'
    ")->fetchColumn();
    render('tasks/list', ['tasks' => $stmt->fetchAll(), 'show_backlog' => $show_backlog, 'hidden_backlog' => $hidden_backlog, 'title' => 'Tasks']);
    exit;
}

if ($uri === '/tasks/new') {
    render('tasks/form', ['task' => null, 'title' => 'New Task']);
    exit;
}

if ($uri === '/tasks' && $method === 'POST') { /* unreachable due to earlier match */ }

if (preg_match('#^/tasks/(\d+)$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('SELECT t.*, u.display_name AS creator, s.display_name AS eta_setter FROM tasks t JOIN users u ON u.id = t.created_by LEFT JOIN users s ON s.id = t.eta_set_by WHERE t.id = ?');
    $stmt->execute([$id]);
    $task = $stmt->fetch();
    if (!$task) { http_response_code(404); exit('Task not found'); }

    $cstmt = db()->prepare('SELECT c.*, u.display_name, u.username, u.role FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.id ASC');
    $cstmt->execute([$id]);
    $comments = $cstmt->fetchAll();

    $astmt = db()->prepare('SELECT * FROM attachments WHERE task_id = ? ORDER BY id DESC');
    $astmt->execute([$id]);
    $attachments = $astmt->fetchAll();

    $activity = activity_recent(20, 'task', $id);
    render('tasks/detail', compact('task', 'comments', 'attachments', 'activity') + ['title' => 'Task #' . $id]);
    exit;
}

if ($uri === '/tasks' && $method === 'POST') {
    // fallthrough intentionally unreachable — POST /tasks handled below via explicit check
}

if ($method === 'POST' && $uri === '/tasks') {
    $title = trim((string)post('title', ''));
    if ($title === '') { flash('Title is required.', 'error'); redirect('/tasks/new'); }
    $stmt = db()->prepare('INSERT INTO tasks (title, description, task_type, priority, expected_behavior, created_by) VALUES (?,?,?,?,?,?)');
    $stmt->execute([
        $title,
        (string)post('description', ''),
        (string)post('task_type', 'Feature'),
        (string)post('priority', 'Medium'),
        (string)post('expected_behavior', ''),
        $me['id'],
    ]);
    $newId = (int)db()->lastInsertId();
    activity_log('task', $newId, 'created', $title);
    notify_task_event($me, $newId, $title, 'created');

    // Multi-file attachments on create (images / video / pdf, incl. pasted screenshots)
    if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
        $count = count($_FILES['files']['name']);
        $errors = [];
        for ($i = 0; $i < $count; $i++) {
            if (empty($_FILES['files']['tmp_name'][$i])) continue;
            $single = [
                'tmp_name' => $_FILES['files']['tmp_name'][$i],
                'name'     => $_FILES['files']['name'][$i],
                'size'     => (int)$_FILES['files']['size'][$i],
                'error'    => (int)$_FILES['files']['error'][$i],
                'type'     => $_FILES['files']['type'][$i] ?? '',
            ];
            [$ok, $msg] = save_task_attachment($single, $newId, $me['id']);
            if ($ok) activity_log('task', $newId, 'uploaded', $single['name']);
            else $errors[] = $msg;
        }
        if ($errors) flash('Created, but some files skipped: ' . implode(' · ', $errors), 'error');
        else flash('Task created.', 'success');
    } else {
        flash('Task created.', 'success');
    }

    redirect('/tasks/' . $newId);
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/edit$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('UPDATE tasks SET title=?, description=?, task_type=?, priority=?, expected_behavior=? WHERE id=?');
    $stmt->execute([
        (string)post('title', ''),
        (string)post('description', ''),
        (string)post('task_type', 'Feature'),
        (string)post('priority', 'Medium'),
        (string)post('expected_behavior', ''),
        $id,
    ]);
    activity_log('task', $id, 'edited', 'Metadata updated');
    flash('Task updated.', 'success');
    redirect('/tasks/' . $id);
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/status$#', $uri, $m)) {
    $id = (int)$m[1];
    $new = (string)post('status', '');
    $valid = ['Pending', 'In Progress', 'Ready for Review', 'Needs Clarification', 'Completed'];
    if (!in_array($new, $valid, true)) { http_response_code(400); exit('Invalid status'); }

    // Server-side role enforcement. Non-admins can only set statuses their
    // users.can_mark_complete flag and role allow (see lib/auth.php).
    $allowedForMe = allowed_task_statuses($me);
    if (!in_array($new, $allowedForMe, true)) {
        http_response_code(403);
        flash('You do not have permission to set that status.', 'error');
        redirect('/tasks/' . $id);
    }

    $stmt = db()->prepare('SELECT * FROM tasks WHERE id = ?');
    $stmt->execute([$id]);
    $task = $stmt->fetch();
    if (!$task) { http_response_code(404); exit('Not found'); }

    if ($new === 'In Progress') {
        if (empty(trim((string)$task['expected_behavior']))) { flash('Set Expected Behavior before starting.', 'error'); redirect('/tasks/' . $id); }
        if (empty($task['eta_date'])) { flash('Set an ETA date before starting.', 'error'); redirect('/tasks/' . $id); }
    }

    $sets = ['status = ?']; $args = [$new];
    if ($new === 'In Progress' && empty($task['started_at'])) {
        $sets[] = "started_at = datetime('now')";
        $sets[] = "deadline = eta_date";
    }
    if ($new === 'Completed' && empty($task['completed_at'])) {
        $sets[] = "completed_at = datetime('now')";
    }
    $args[] = $id;
    $sql = 'UPDATE tasks SET ' . implode(', ', $sets) . ' WHERE id = ?';
    $stmt = db()->prepare($sql);
    $stmt->execute($args);

    activity_log('task', $id, 'status:' . $new, $task['status'] . ' → ' . $new);
    notify_task_event($me, $id, $task['title'], 'status', $task['status'] . ' → ' . $new);
    flash('Status updated to ' . $new, 'success');
    redirect('/tasks/' . $id);
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/eta$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];
    $etaDate = trim((string)post('eta_date', ''));
    if (!$etaDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $etaDate)) { flash('Please select a valid date.', 'error'); redirect('/tasks/' . $id); }
    $stmt = db()->prepare('UPDATE tasks SET eta_date=?, eta_set_by=?, deadline=? WHERE id=?');
    $stmt->execute([$etaDate, $me['id'], $etaDate, $id]);
    activity_log('task', $id, 'eta', 'Scheduled for ' . date('M j, Y', strtotime($etaDate)));
    $etaTask = db()->prepare('SELECT title FROM tasks WHERE id=?'); $etaTask->execute([$id]); $etaRow = $etaTask->fetch();
    if ($etaRow) notify_task_event($me, $id, $etaRow['title'], 'eta', 'Scheduled for ' . date('M j, Y', strtotime($etaDate)));
    flash('ETA set to ' . date('M j, Y', strtotime($etaDate)), 'success');
    redirect('/tasks/' . $id);
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/delete$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];
    db()->prepare('DELETE FROM tasks WHERE id = ?')->execute([$id]);
    activity_log('task', $id, 'deleted');
    flash('Task deleted.', 'success');
    redirect('/tasks');
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/comments$#', $uri, $m)) {
    $id = (int)$m[1];
    $body = trim((string)post('body', ''));
    if ($body === '') { flash('Comment cannot be empty.', 'error'); redirect('/tasks/' . $id); }
    db()->prepare('INSERT INTO comments (task_id, user_id, body) VALUES (?,?,?)')
        ->execute([$id, $me['id'], $body]);
    activity_log('task', $id, 'commented', mb_substr($body, 0, 80));
    $cTask = db()->prepare('SELECT title FROM tasks WHERE id=?'); $cTask->execute([$id]); $cRow = $cTask->fetch();
    if ($cRow) notify_task_event($me, $id, $cRow['title'], 'commented', $body);
    redirect('/tasks/' . $id . '#comments');
}

if ($method === 'POST' && preg_match('#^/tasks/(\d+)/upload$#', $uri, $m)) {
    $id = (int)$m[1];
    if (empty($_FILES['file']['tmp_name'])) { flash('No file uploaded.', 'error'); redirect('/tasks/' . $id); }
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) { flash('Upload failed.', 'error'); redirect('/tasks/' . $id); }
    if ($f['size'] > 5 * 1024 * 1024) { flash('Max size is 5 MB.', 'error'); redirect('/tasks/' . $id); }
    $allowed = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp', 'application/pdf' => 'pdf'];
    $mime = mime_content_type($f['tmp_name']) ?: '';
    if (!isset($allowed[$mime])) { flash('File type not allowed.', 'error'); redirect('/tasks/' . $id); }
    $ext = $allowed[$mime];
    $name = bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = __DIR__ . '/public/uploads/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) { flash('Could not save file.', 'error'); redirect('/tasks/' . $id); }
    $kind = in_array(post('kind', 'other'), ['before', 'after', 'other'], true) ? post('kind') : 'other';
    db()->prepare('INSERT INTO attachments (task_id, filename, original_name, mime_type, size_bytes, kind, uploaded_by) VALUES (?,?,?,?,?,?,?)')
        ->execute([$id, $name, $f['name'], $mime, $f['size'], $kind, $me['id']]);
    activity_log('task', $id, 'uploaded', $f['name']);
    flash('Attachment uploaded.', 'success');
    redirect('/tasks/' . $id);
}

// --- Features -------------------------------------------------------------
if (str_starts_with($uri, '/features')) require_page_access('features');
if ($uri === '/features' && $method === 'GET') {
    // Per-feature aggregates: who requested it, the original request task (if
    // any), and objective implementation progress (completed / total linked
    // implementation tasks). No arbitrary percentages — only real counts.
    $rows = db()->query("
        SELECT f.*, u.display_name AS requested_by,
          (SELECT ft.task_id FROM feature_tasks ft
             WHERE ft.feature_id = f.id AND ft.relation_type = 'request'
             ORDER BY ft.task_id ASC LIMIT 1) AS request_task_id,
          (SELECT COUNT(*) FROM feature_tasks ft
             WHERE ft.feature_id = f.id AND ft.relation_type = 'implementation') AS impl_total,
          (SELECT COUNT(*) FROM feature_tasks ft JOIN tasks t ON t.id = ft.task_id
             WHERE ft.feature_id = f.id AND ft.relation_type = 'implementation'
               AND t.status = 'Completed') AS impl_done
        FROM features f
        LEFT JOIN users u ON u.id = f.created_by
        ORDER BY f.id DESC
    ")->fetchAll();

    // Real lifecycle counts for the summary strip / filter tabs.
    $stage_counts = [];
    foreach (feature_lifecycle_stages() as $st) $stage_counts[$st] = 0;
    foreach ($rows as $r) { if (isset($stage_counts[$r['status']])) $stage_counts[$r['status']]++; }

    render('features/list', [
        'features' => $rows,
        'stage_counts' => $stage_counts,
        'title' => 'Features & Deliverables',
    ]);
    exit;
}
if ($uri === '/features/new') {
    render('features/form', ['feature' => null, 'title' => 'New Feature']);
    exit;
}
if ($method === 'POST' && $uri === '/features') {
    $stmt = db()->prepare('INSERT INTO features (title, description, status, demo_url, completion_date, created_by) VALUES (?,?,?,?,?,?)');
    $stmt->execute([
        (string)post('title', ''),
        (string)post('description', ''),
        (string)post('status', 'Requested'),
        (string)post('demo_url', '') ?: null,
        (string)post('completion_date', '') ?: null,
        $me['id'],
    ]);
    $fid = (int)db()->lastInsertId();
    activity_log('feature', $fid, 'created', post('title'));
    flash('Feature added.', 'success');
    redirect('/features/' . $fid);
}
if (preg_match('#^/features/(\d+)$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('SELECT f.*, u.display_name AS creator FROM features f JOIN users u ON u.id = f.created_by WHERE f.id = ?');
    $stmt->execute([$id]);
    $feature = $stmt->fetch();
    if (!$feature) { http_response_code(404); exit('Feature not found'); }
    // Linked tasks, split by relationship: the original client request/history
    // record vs. actual implementation tasks. Preserves the request's
    // comments/attachments/activity as source context.
    $lstmt = db()->prepare('SELECT t.id, t.title, t.task_type, t.status, t.created_at, t.created_by, u.display_name AS requester, ft.relation_type FROM feature_tasks ft JOIN tasks t ON t.id = ft.task_id LEFT JOIN users u ON u.id = t.created_by WHERE ft.feature_id = ? ORDER BY t.id ASC');
    $lstmt->execute([$id]);
    $request_tasks = [];
    $implementation_tasks = [];
    foreach ($lstmt->fetchAll() as $lt) {
        if ($lt['relation_type'] === 'request') { $request_tasks[] = $lt; }
        else { $implementation_tasks[] = $lt; }
    }
    // The single canonical "Original Request / Source" (first request link).
    $source_task = $request_tasks[0] ?? null;

    // Workstream label + (admin only) the picklist for the edit form.
    $workstream = null;
    if (!empty($feature['workstream_id'])) {
        $ws = db()->prepare('SELECT id, name FROM workstreams WHERE id = ?');
        $ws->execute([(int)$feature['workstream_id']]);
        $workstream = $ws->fetch() ?: null;
    }
    $all_workstreams = is_admin()
        ? db()->query('SELECT id, name FROM workstreams WHERE active = 1 ORDER BY sort_order, id')->fetchAll()
        : [];

    render('features/detail', compact(
        'feature', 'request_tasks', 'implementation_tasks',
        'source_task', 'workstream', 'all_workstreams'
    ) + ['title' => $feature['title']]);
    exit;
}
if ($method === 'POST' && preg_match('#^/features/(\d+)/edit$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];

    // Validate lifecycle status against the seven real stages.
    $status = (string)post('status', 'Requested');
    if (!in_array($status, feature_lifecycle_stages(), true)) $status = 'Requested';

    // Optional planning metadata — all nullable, never required.
    $wsId = (string)post('workstream_id', '');
    $wsId = ($wsId === '' ? null : (int)$wsId);

    $stmt = db()->prepare('UPDATE features SET title=?, description=?, status=?, demo_url=?, completion_date=?, workstream_id=?, priority=?, planning_stage=?, eta_period=?, planning_notes=?, dependencies=?, business_context=? WHERE id=?');
    $stmt->execute([
        (string)post('title', ''),
        (string)post('description', ''),
        $status,
        (string)post('demo_url', '') ?: null,
        (string)post('completion_date', '') ?: null,
        $wsId,
        (string)post('priority', '') ?: null,
        (string)post('planning_stage', '') ?: null,
        (string)post('eta_period', '') ?: null,
        (string)post('planning_notes', '') ?: null,
        (string)post('dependencies', '') ?: null,
        (string)post('business_context', '') ?: null,
        $id,
    ]);
    activity_log('feature', $id, 'edited');
    flash('Feature updated.', 'success');
    redirect('/features/' . $id);
}

// Add an IMPLEMENTATION task to a feature (admin). Creates a fresh task and
// links it with relation_type='implementation'. Never touches the original
// request/source task.
if ($method === 'POST' && preg_match('#^/features/(\d+)/tasks$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];
    $chk = db()->prepare('SELECT id FROM features WHERE id = ?');
    $chk->execute([$id]);
    if (!$chk->fetch()) { http_response_code(404); exit('Feature not found'); }

    $title = trim((string)post('title', ''));
    if ($title === '') { flash('Task title is required.', 'error'); redirect('/features/' . $id); }
    $type = in_array(post('task_type', 'Feature'), ['Bug', 'Feature', 'UI Change'], true) ? post('task_type') : 'Feature';

    // Inherit the feature's workstream so the new task shows up on the right front.
    $wsStmt = db()->prepare('SELECT workstream_id FROM features WHERE id = ?');
    $wsStmt->execute([$id]);
    $featureWs = $wsStmt->fetchColumn();
    $featureWs = $featureWs ? (int)$featureWs : null;

    $ins = db()->prepare('INSERT INTO tasks (title, description, task_type, priority, workstream_id, created_by) VALUES (?,?,?,?,?,?)');
    $ins->execute([
        $title,
        (string)post('description', ''),
        $type,
        'Medium',
        $featureWs,
        $me['id'],
    ]);
    $newId = (int)db()->lastInsertId();
    db()->prepare("INSERT INTO feature_tasks (feature_id, task_id, relation_type) VALUES (?,?, 'implementation')")
        ->execute([$id, $newId]);
    activity_log('feature', $id, 'implementation-task', '#' . $newId . ' ' . $title);
    activity_log('task', $newId, 'created', $title);
    flash('Implementation task #' . $newId . ' added.', 'success');
    redirect('/features/' . $id);
}

// --- Docs -----------------------------------------------------------------
if (str_starts_with($uri, '/docs')) require_page_access('docs');
if ($uri === '/docs' && $method === 'GET') {
    $rows = db()->query('SELECT * FROM docs ORDER BY category, id DESC')->fetchAll();
    render('docs/list', ['docs' => $rows, 'title' => 'Documentation']);
    exit;
}
if ($uri === '/docs/new') {
    require_admin();
    render('docs/form', ['doc' => null, 'title' => 'New Doc']);
    exit;
}
if ($method === 'POST' && $uri === '/docs') {
    require_admin();
    $stmt = db()->prepare('INSERT INTO docs (title, content, category, created_by) VALUES (?,?,?,?)');
    $stmt->execute([(string)post('title', ''), (string)post('content', ''), (string)post('category', 'Other'), $me['id']]);
    $did = (int)db()->lastInsertId();
    activity_log('doc', $did, 'created', post('title'));
    flash('Doc created.', 'success');
    redirect('/docs/' . $did);
}
if (preg_match('#^/docs/(\d+)$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('SELECT d.*, u.display_name AS creator FROM docs d JOIN users u ON u.id = d.created_by WHERE d.id = ?');
    $stmt->execute([$id]);
    $doc = $stmt->fetch();
    if (!$doc) { http_response_code(404); exit('Doc not found'); }
    render('docs/detail', compact('doc') + ['title' => $doc['title']]);
    exit;
}
if ($method === 'POST' && preg_match('#^/docs/(\d+)/edit$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];
    $stmt = db()->prepare('UPDATE docs SET title=?, content=?, category=?, updated_at=datetime("now") WHERE id=?');
    $stmt->execute([(string)post('title', ''), (string)post('content', ''), (string)post('category', 'Other'), $id]);
    activity_log('doc', $id, 'edited');
    flash('Doc updated.', 'success');
    redirect('/docs/' . $id);
}

// --- Content Calendar -----------------------------------------------------
if (str_starts_with($uri, '/calendar')) require_page_access('calendar');
if ($uri === '/calendar' && $method === 'GET') {
    $month = q('m', date('Y-m'));
    if (!preg_match('/^\d{4}-\d{2}$/', (string)$month)) $month = date('Y-m');
    $start = $month . '-01';
    $end   = date('Y-m-t', strtotime($start));
    $stmt = db()->prepare("SELECT c.*, u.display_name AS creator FROM content_items c JOIN users u ON u.id = c.created_by WHERE (c.scheduled_for IS NOT NULL AND c.scheduled_for BETWEEN ? AND ?) OR (c.scheduled_for IS NULL AND strftime('%Y-%m', c.created_at) = ?) ORDER BY COALESCE(c.scheduled_for, date(c.created_at)) ASC, c.id DESC");
    $stmt->execute([$start, $end, $month]);
    $items = $stmt->fetchAll();
    // Also pull media for thumb previews
    $media = [];
    if ($items) {
        $ids = array_column($items, 'id');
        $in = implode(',', array_fill(0, count($ids), '?'));
        $mStmt = db()->prepare("SELECT * FROM content_media WHERE content_id IN ($in) ORDER BY id ASC");
        $mStmt->execute($ids);
        foreach ($mStmt->fetchAll() as $m) { $media[$m['content_id']][] = $m; }
    }
    render('calendar/month', compact('month','start','end','items','media') + ['title' => 'Content Calendar']);
    exit;
}
if ($uri === '/calendar/new' && $method === 'GET') {
    render('calendar/form', ['item' => null, 'title' => 'New Content']);
    exit;
}
if ($method === 'POST' && $uri === '/calendar') {
    $stmt = db()->prepare('INSERT INTO content_items (title, caption, hashtags, media_type, platform, status, scheduled_for, link, created_by) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        (string)post('title', ''),
        (string)post('caption', ''),
        (string)post('hashtags', ''),
        (string)post('media_type', 'Post'),
        (string)post('platform', 'Instagram'),
        (string)post('status', 'Idea'),
        (string)post('scheduled_for', '') ?: null,
        (string)post('link', '') ?: null,
        $me['id'],
    ]);
    $id = (int)db()->lastInsertId();
    activity_log('content', $id, 'created', post('title'));
    flash('Content added.', 'success');
    redirect('/calendar/' . $id);
}
if (preg_match('#^/calendar/(\d+)$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('SELECT c.*, u.display_name AS creator FROM content_items c JOIN users u ON u.id = c.created_by WHERE c.id = ?');
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) { http_response_code(404); exit('Content not found'); }
    $mStmt = db()->prepare('SELECT * FROM content_media WHERE content_id = ? ORDER BY id ASC');
    $mStmt->execute([$id]);
    $media = $mStmt->fetchAll();
    render('calendar/detail', compact('item', 'media') + ['title' => $item['title']]);
    exit;
}
if ($method === 'POST' && preg_match('#^/calendar/(\d+)/edit$#', $uri, $m)) {
    $id = (int)$m[1];
    $stmt = db()->prepare('UPDATE content_items SET title=?, caption=?, hashtags=?, media_type=?, platform=?, status=?, scheduled_for=?, link=?, updated_at=datetime("now") WHERE id=?');
    $stmt->execute([
        (string)post('title', ''),
        (string)post('caption', ''),
        (string)post('hashtags', ''),
        (string)post('media_type', 'Post'),
        (string)post('platform', 'Instagram'),
        (string)post('status', 'Idea'),
        (string)post('scheduled_for', '') ?: null,
        (string)post('link', '') ?: null,
        $id,
    ]);
    if (post('status') === 'Published' && empty(post('published_at'))) {
        db()->prepare('UPDATE content_items SET published_at=datetime("now") WHERE id=? AND published_at IS NULL')->execute([$id]);
    }
    activity_log('content', $id, 'edited');
    flash('Content updated.', 'success');
    redirect('/calendar/' . $id);
}
if ($method === 'POST' && preg_match('#^/calendar/(\d+)/upload$#', $uri, $m)) {
    $id = (int)$m[1];
    if (empty($_FILES['file']['tmp_name'])) { flash('No file uploaded.', 'error'); redirect('/calendar/' . $id); }
    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) { flash('Upload failed.', 'error'); redirect('/calendar/' . $id); }
    if ($f['size'] > 25 * 1024 * 1024) { flash('Max size is 25 MB.', 'error'); redirect('/calendar/' . $id); }
    $allowed = [
        'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp',
        'video/mp4' => 'mp4', 'video/quicktime' => 'mov', 'video/webm' => 'webm',
    ];
    $mime = mime_content_type($f['tmp_name']) ?: '';
    if (!isset($allowed[$mime])) { flash('File type not allowed.', 'error'); redirect('/calendar/' . $id); }
    $ext = $allowed[$mime];
    $name = 'c_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = __DIR__ . '/public/uploads/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) { flash('Could not save file.', 'error'); redirect('/calendar/' . $id); }
    db()->prepare('INSERT INTO content_media (content_id, filename, original_name, mime_type, size_bytes, uploaded_by) VALUES (?,?,?,?,?,?)')
        ->execute([$id, $name, $f['name'], $mime, $f['size'], $me['id']]);
    activity_log('content', $id, 'media', $f['name']);
    flash('Media attached.', 'success');
    redirect('/calendar/' . $id);
}
if ($method === 'POST' && preg_match('#^/calendar/(\d+)/delete$#', $uri, $m)) {
    require_admin();
    $id = (int)$m[1];
    db()->prepare('DELETE FROM content_items WHERE id = ?')->execute([$id]);
    activity_log('content', $id, 'deleted');
    flash('Content deleted.', 'success');
    redirect('/calendar');
}

// --- Activity -------------------------------------------------------------
if (str_starts_with($uri, '/activity')) require_page_access('activity');
if ($uri === '/activity') {
    $rows = activity_recent(100);
    render('activity', ['rows' => $rows, 'title' => 'Activity']);
    exit;
}



// --- Email Notification Templates ----------------------------------------
if (str_starts_with($uri, '/notifications')) require_page_access('notifications');
if ($uri === '/notifications') {
    require_login();
    $tpl_dir = __DIR__ . '/data/email-templates';
    $manifest = json_decode(file_get_contents($tpl_dir . '/manifest.json'), true);
    render('notifications/index', ['title' => 'Email Templates', 'manifest' => $manifest]);
    exit;
}
if ($uri === '/notifications/download' && $method === 'GET') {
    require_login();
    $file = preg_replace('#[^a-z0-9\-]#', '', $_GET['file'] ?? '');
    $path = __DIR__ . '/data/email-templates/' . $file . '.liquid';
    if (!is_file($path)) { http_response_code(404); exit('Not found'); }
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename=$file.liquid');
    readfile($path);
    exit;
}
// --- Product & Brand Library ----------------------------------------------
if (str_starts_with($uri, '/library')) require_page_access('library');
if (str_starts_with($uri, '/library')) {
    require_once __DIR__ . '/lib/library.php';
    handle_library_routes($uri, $method);
    exit;
}

// --- 404 ------------------------------------------------------------------
http_response_code(404);
render('404', ['title' => 'Not found']);

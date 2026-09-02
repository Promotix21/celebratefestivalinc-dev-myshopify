<?php
declare(strict_types=1);

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    static $cache = null;
    if ($cache && $cache['id'] === $_SESSION['uid']) return $cache;
    $stmt = db()->prepare('SELECT id, username, role, display_name, email, can_mark_complete FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['uid']]);
    $cache = $stmt->fetch() ?: null;
    return $cache;
}

function require_login(): array {
    $u = current_user();
    if (!$u) redirect('/login');
    return $u;
}

function is_admin(): bool {
    $u = current_user();
    return $u && $u['role'] === 'admin';
}

function require_admin(): void {
    require_login();
    if (!is_admin()) {
        http_response_code(403);
        exit('Forbidden — admin only');
    }
}

// Can this user mark a task as "Completed"? Admins always can;
// clients only when their users.can_mark_complete flag is set to 1.
function can_mark_task_complete(?array $user = null): bool {
    $u = $user ?? current_user();
    if (!$u) return false;
    if (($u['role'] ?? '') === 'admin') return true;
    return !empty($u['can_mark_complete']);
}

// Which task statuses is a given user allowed to set?
function allowed_task_statuses(?array $user = null): array {
    $u = $user ?? current_user();
    if (!$u) return [];
    if (($u['role'] ?? '') === 'admin') {
        return ['Pending', 'In Progress', 'Ready for Review', 'Needs Clarification', 'Completed'];
    }
    $allowed = ['Pending', 'Needs Clarification'];
    if (!empty($u['can_mark_complete'])) $allowed[] = 'Completed';
    return $allowed;
}

// Returns null (all pages allowed) or an array of allowed page slugs.
// Slugs: 'dashboard','tasks','features','calendar','docs','activity','library','notifications'
function allowed_pages_for_user(?array $user = null): ?array {
    $u = $user ?? current_user();
    if (!$u) return [];
    if (($u['role'] ?? '') === 'admin') return null; // admins: unrestricted
    $raw = $u['allowed_pages'] ?? null;
    if ($raw === null || trim($raw) === '') return null; // no restriction
    return array_filter(array_map('trim', explode(',', $raw)));
}

function can_access_page(string $slug, ?array $user = null): bool {
    $pages = allowed_pages_for_user($user);
    if ($pages === null) return true; // unrestricted
    return in_array($slug, $pages, true);
}

function require_page_access(string $slug): void {
    if (!can_access_page($slug)) {
        // Redirect staff to their first allowed page
        $pages = allowed_pages_for_user();
        $map = ['dashboard'=>'/','tasks'=>'/tasks','features'=>'/features',
                 'calendar'=>'/calendar','docs'=>'/docs','activity'=>'/activity',
                 'library'=>'/library','notifications'=>'/notifications'];
        foreach ($map as $key => $url) {
            if (in_array($key, (array)$pages, true)) { redirect($url); }
        }
        http_response_code(403);
        exit('Access denied.');
    }
}

function attempt_login(string $username, string $password): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'cli';
    $_SESSION['login_attempts'] ??= [];
    $rec = $_SESSION['login_attempts'][$ip] ?? ['count' => 0, 'until' => 0];
    if ($rec['until'] > time()) return false;

    $stmt = db()->prepare('SELECT id, password_hash FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $row = $stmt->fetch();

    if ($row && password_verify($password, $row['password_hash'])) {
        $_SESSION['uid'] = (int)$row['id'];
        session_regenerate_id(true);
        unset($_SESSION['login_attempts'][$ip]);
        return true;
    }

    $rec['count']++;
    if ($rec['count'] >= 5) { $rec['until'] = time() + 60; $rec['count'] = 0; }
    $_SESSION['login_attempts'][$ip] = $rec;
    return false;
}

function logout(): void {
    $_SESSION = [];
    session_destroy();
}

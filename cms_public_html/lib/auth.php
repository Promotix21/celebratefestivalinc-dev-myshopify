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

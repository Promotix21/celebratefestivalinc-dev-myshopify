<?php
declare(strict_types=1);

function api_json($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function api_error(string $msg, int $status = 400): void {
    api_json(['error' => $msg], $status);
}

function api_auth(): array {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+([A-Za-z0-9_\-]{20,})$/', $h, $m)) {
        api_error('Missing or malformed Authorization: Bearer <token>', 401);
    }
    $stmt = db()->prepare('SELECT id, username, role, display_name FROM users WHERE api_token = ?');
    $stmt->execute([$m[1]]);
    $u = $stmt->fetch();
    if (!$u) api_error('Invalid token', 401);
    return $u;
}

function api_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) api_error('Body must be a JSON object', 400);
    return $data;
}

function api_log(string $entity_type, int $entity_id, string $action, ?string $detail, int $userId): void {
    db()->prepare('INSERT INTO activity_log (entity_type, entity_id, action, detail, user_id) VALUES (?,?,?,?,?)')
        ->execute([$entity_type, $entity_id, $action, $detail, $userId]);
}

function task_to_array(array $t): array {
    return [
        'id' => (int)$t['id'],
        'title' => $t['title'],
        'description' => $t['description'],
        'task_type' => $t['task_type'],
        'priority' => $t['priority'],
        'status' => $t['status'],
        'expected_behavior' => $t['expected_behavior'],
        'eta_date' => $t['eta_date'] ?? null,
        'created_at' => $t['created_at'],
        'started_at' => $t['started_at'],
        'completed_at' => $t['completed_at'],
        'url' => '/tasks/' . (int)$t['id'],
    ];
}

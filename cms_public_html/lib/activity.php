<?php
declare(strict_types=1);

function activity_log(string $entity_type, int $entity_id, string $action, ?string $detail = null): void {
    $u = current_user();
    if (!$u) return;
    $stmt = db()->prepare('INSERT INTO activity_log (entity_type, entity_id, action, detail, user_id) VALUES (?,?,?,?,?)');
    $stmt->execute([$entity_type, $entity_id, $action, $detail, $u['id']]);
}

function activity_recent(int $limit = 20, ?string $entity_type = null, ?int $entity_id = null): array {
    $sql = 'SELECT a.*, u.display_name, u.username FROM activity_log a JOIN users u ON u.id = a.user_id';
    $args = [];
    if ($entity_type && $entity_id) {
        $sql .= ' WHERE a.entity_type = ? AND a.entity_id = ?';
        $args = [$entity_type, $entity_id];
    }
    $sql .= ' ORDER BY a.id DESC LIMIT ' . (int)$limit;
    $stmt = db()->prepare($sql);
    $stmt->execute($args);
    return $stmt->fetchAll();
}

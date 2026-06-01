<?php
/** @var array $rows */
require_once __DIR__ . '/_icons.php';
?>
<div class="page-head"><div><h1>Activity Log</h1><p class="muted">Every mutation, timestamped.</p></div></div>
<section class="card">
    <?php if (!$rows): ?>
        <div class="empty"><div class="empty-ico"><?= icon('clock', 22) ?></div>No activity yet.</div>
    <?php else: ?>
    <ul class="feed">
        <?php foreach ($rows as $a): $name = $a['display_name'] ?: $a['username']; ?>
            <li>
                <div class="feed-avatar"><?= h(strtoupper(substr($name, 0, 1))) ?></div>
                <div class="feed-body">
                    <strong><?= h($name) ?></strong>
                    <span class="action"><?= h($a['action']) ?></span>
                    on
                    <?php $href = $a['entity_type'] === 'task' ? '/tasks/' . (int)$a['entity_id']
                        : ($a['entity_type'] === 'feature' ? '/features/' . (int)$a['entity_id']
                        : '/docs/' . (int)$a['entity_id']); ?>
                    <a href="<?= h($href) ?>"><?= h($a['entity_type']) ?> #<?= (int)$a['entity_id'] ?></a>
                    <?php if ($a['detail']): ?><div class="muted tiny" style="margin-top:2px"><?= h($a['detail']) ?></div><?php endif; ?>
                </div>
                <div class="feed-time"><?= fmt_rel($a['created_at']) ?></div>
            </li>
        <?php endforeach; ?>
    </ul>
    <?php endif; ?>
</section>

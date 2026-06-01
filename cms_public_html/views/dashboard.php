<?php
/** @var array $counts; @var array $recent_features; @var array $upcoming; @var array $activity */
require_once __DIR__ . '/_icons.php';
$me = current_user();
$hour = (int)date('H');
$greet = $hour < 12 ? 'Good morning' : ($hour < 18 ? 'Good afternoon' : 'Good evening');
?>
<div class="page-head">
    <div>
        <p class="greet"><span class="greet-wave">👋</span> <?= h($greet) ?>, <?= h($me['display_name'] ?? $me['username']) ?></p>
        <h1>Curated Overview</h1>
        <p class="muted">Monitoring the pulse of your digital deliveries.</p>
    </div>
    <div class="page-head-actions">
        <a href="/tasks" class="btn btn-ghost"><?= icon('eye') ?> All tasks</a>
        <a href="/tasks/new" class="btn btn-accent"><?= icon('plus') ?> New Task</a>
    </div>
</div>

<div class="stats">
    <div class="stat">
        <div class="stat-head">
            <div class="stat-label">Open</div>
            <div class="stat-ico"><?= icon('inbox') ?></div>
        </div>
        <div class="stat-num"><?= (int)($counts['pending'] ?? 0) ?></div>
        <div class="stat-hint">Pending intake</div>
    </div>
    <div class="stat">
        <div class="stat-head">
            <div class="stat-label">In Progress</div>
            <div class="stat-ico"><?= icon('workflow') ?></div>
        </div>
        <div class="stat-num"><?= (int)($counts['in_progress'] ?? 0) ?></div>
        <div class="stat-hint up"><?= icon('trending-up', 12) ?> Actively building</div>
    </div>
    <div class="stat">
        <div class="stat-head">
            <div class="stat-label">Review</div>
            <div class="stat-ico amber"><?= icon('eye') ?></div>
        </div>
        <div class="stat-num"><?= (int)($counts['ready'] ?? 0) ?></div>
        <div class="stat-hint">Awaiting acceptance</div>
    </div>
    <div class="stat">
        <div class="stat-head">
            <div class="stat-label">Shipped</div>
            <div class="stat-ico green"><?= icon('check') ?></div>
        </div>
        <div class="stat-num"><?= (int)($counts['completed'] ?? 0) ?></div>
        <div class="stat-hint">Completed to date</div>
    </div>
</div>

<div class="grid-2">
    <section class="card">
        <div class="card-head">
            <h2>Recent Deliverables</h2>
            <a href="/features" class="link">View all <?= icon('chevron', 14) ?></a>
        </div>
        <?php if (!$recent_features): ?>
            <div class="empty"><div class="empty-ico"><?= icon('sparkles', 22) ?></div>No features yet. <a href="/features/new">Add the first</a>.</div>
        <?php else: ?>
        <div class="deliverables">
            <?php foreach ($recent_features as $f): ?>
                <a class="deliverable" href="/features/<?= (int)$f['id'] ?>">
                    <div class="deliverable-thumb"><?= h(mb_substr($f['title'], 0, 1)) ?></div>
                    <div class="deliverable-meta">
                        <div class="deliverable-title"><?= h($f['title']) ?></div>
                        <div><span class="<?= status_class($f['status']) ?>"><?= h($f['status']) ?></span></div>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </section>

    <section class="card">
        <div class="card-head"><h2>Upcoming Deadlines</h2></div>
        <?php if (!$upcoming): ?>
            <div class="empty"><div class="empty-ico"><?= icon('clock', 22) ?></div>No active deadlines.</div>
        <?php else: ?>
        <ul class="deadlines">
            <?php foreach ($upcoming as $t): ?>
                <li>
                    <a href="/tasks/<?= (int)$t['id'] ?>"><?= h($t['title']) ?></a>
                    <div class="muted tiny"><?= fmt_dt($t['deadline']) ?></div>
                </li>
            <?php endforeach; ?>
        </ul>
        <?php endif; ?>
    </section>
</div>

<section class="card">
    <div class="card-head">
        <h2>Activity Feed</h2>
        <a href="/activity" class="link">Full log <?= icon('chevron', 14) ?></a>
    </div>
    <?php if (!$activity): ?>
        <div class="empty"><div class="empty-ico"><?= icon('clock', 22) ?></div>No activity yet.</div>
    <?php else: ?>
    <ul class="feed">
        <?php foreach ($activity as $a): $name = $a['display_name'] ?: $a['username']; ?>
            <li>
                <div class="feed-avatar"><?= h(strtoupper(substr($name, 0, 1))) ?></div>
                <div class="feed-body">
                    <strong><?= h($name) ?></strong>
                    <span class="action"><?= h($a['action']) ?></span>
                    on <?= h($a['entity_type']) ?> #<?= (int)$a['entity_id'] ?>
                    <?php if ($a['detail']): ?><div class="muted tiny" style="margin-top:2px"><?= h($a['detail']) ?></div><?php endif; ?>
                </div>
                <div class="feed-time"><?= fmt_rel($a['created_at']) ?></div>
            </li>
        <?php endforeach; ?>
    </ul>
    <?php endif; ?>
</section>

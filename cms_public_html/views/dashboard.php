<?php
/**
 * @var array $active_tasks
 * @var array $active_features
 * @var array $ready_tasks
 * @var array $ready_features
 * @var array $bugs_corrections
 * @var array $feature_backlog
 * @var array $activity
 */
require_once __DIR__ . '/_icons.php';
$me = current_user();
$hour = (int)date('H');
$greet = $hour < 12 ? 'Good morning' : ($hour < 18 ? 'Good afternoon' : 'Good evening');
?>
<style>
.section-alert {
    background-color: #fff3cd;
    color: #856404;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
    border: 1px solid #ffeeba;
}
.board-section { margin-bottom: 30px; }
.card-head { display: flex; justify-content: space-between; align-items: center; }
.item-meta { font-size: 13px; color: #666; margin-top: 4px; }
.badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 11px; background: #eee; }
.badge-pending { background: #e0f2fe; color: #0369a1; }
.badge-progress { background: #dcfce7; color: #15803d; }
.badge-review { background: #fef08a; color: #854d0e; }
.badge-requested { background: #f3f4f6; color: #374151; }
</style>

<div class="page-head">
    <div>
        <p class="greet"><span class="greet-wave">👋</span> <?= h($greet) ?>, <?= h($me['display_name'] ?? $me['username']) ?></p>
        <h1>Curated Overview</h1>
        <p class="muted">Monitoring the pulse of your digital deliveries.</p>
    </div>
    <div class="page-head-actions">
        <a href="/tasks/new" class="btn btn-accent"><?= icon('plus') ?> New Task</a>
    </div>
</div>

<div class="grid-2">
    <!-- LEFT COLUMN -->
    <div>
        <section class="card board-section">
            <div class="card-head">
                <h2>Active Delivery</h2>
                <span class="muted tiny">Committed / Current Work</span>
            </div>
            <?php if (!$active_features && !$active_tasks): ?>
                <div class="empty"><div class="empty-ico"><?= icon('workflow', 22) ?></div>No committed work in flight.</div>
            <?php else: ?>
                <ul class="deadlines" style="list-style:none; padding:0; margin:0;">
                    <?php foreach ($active_features as $f): ?>
                        <li style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <a href="/features/<?= (int)$f['id'] ?>" style="font-weight:600;"><?= icon('sparkles', 13) ?> <?= h($f['title']) ?></a>
                                <span class="badge <?= $f['status'] === 'In Progress' ? 'badge-progress' : 'badge-pending' ?>"><?= h($f['status']) ?></span>
                            </div>
                            <div class="item-meta">Feature</div>
                        </li>
                    <?php endforeach; ?>
                    <?php foreach ($active_tasks as $t): ?>
                        <li style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <a href="/tasks/<?= (int)$t['id'] ?>" style="font-weight:600;"><?= h($t['title']) ?></a>
                                <span class="badge <?= $t['status'] === 'In Progress' ? 'badge-progress' : 'badge-pending' ?>"><?= h($t['status']) ?></span>
                            </div>
                            <?php if ($t['eta_date']): ?>
                            <div class="item-meta"><strong>ETA:</strong> <?= fmt_dt($t['eta_date']) ?></div>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </section>

        <section class="card board-section">
            <div class="card-head">
                <h2>Bugs & Corrections</h2>
                <span class="muted tiny">Broken / Issues</span>
            </div>
            <?php if (!$bugs_corrections): ?>
                <div class="empty"><div class="empty-ico"><?= icon('check', 22) ?></div>No known bugs.</div>
            <?php else: ?>
                <ul class="deadlines" style="list-style:none; padding:0; margin:0;">
                    <?php foreach ($bugs_corrections as $t): ?>
                        <li style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <div style="display:flex; justify-content:space-between;">
                                <a href="/tasks/<?= (int)$t['id'] ?>" style="font-weight:600; color: #dc2626;"><?= h($t['title']) ?></a>
                                <span class="badge <?= $t['status'] === 'In Progress' ? 'badge-progress' : 'badge-pending' ?>"><?= h($t['status']) ?></span>
                            </div>
                            <?php if ($t['eta_date']): ?>
                            <div class="item-meta"><strong>ETA:</strong> <?= fmt_dt($t['eta_date']) ?></div>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </section>
    </div>

    <!-- RIGHT COLUMN -->
    <div>
        <section class="card board-section">
            <div class="card-head">
                <h2>Feature Backlog</h2>
                <a href="/features" class="link">View all <?= icon('chevron', 14) ?></a>
            </div>
            <div class="section-alert">
                Feature requests are reviewed and prioritized before scheduling.
                Delivery dates are shown once a feature is scheduled.
            </div>
            <?php if (!$feature_backlog): ?>
                <div class="empty"><div class="empty-ico"><?= icon('sparkles', 22) ?></div>No pending feature requests.</div>
            <?php else: ?>
                <div class="deliverables">
                    <?php foreach ($feature_backlog as $f): ?>
                        <a class="deliverable" href="/features/<?= (int)$f['id'] ?>" style="display:block; padding:12px; border:1px solid #eee; border-radius:6px; margin-bottom:10px; text-decoration:none; color:inherit;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <div>
                                    <div style="font-weight:600;"><?= h($f['title']) ?></div>
                                    <div class="item-meta">Requested by <?= h($f['requested_by'] ?: 'Unknown') ?> on <?= date('M j, Y', strtotime($f['created_at'])) ?></div>
                                </div>
                                <span class="badge badge-requested"><?= h($f['status']) ?></span>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

        <section class="card board-section">
            <div class="card-head">
                <h2>Ready for Review</h2>
                <span class="muted tiny">Awaiting Validation</span>
            </div>
            <?php if (!$ready_features && !$ready_tasks): ?>
                <div class="empty"><div class="empty-ico"><?= icon('eye', 22) ?></div>Nothing currently in review.</div>
            <?php else: ?>
                <ul class="deadlines" style="list-style:none; padding:0; margin:0;">
                    <?php foreach ($ready_features as $f): ?>
                        <li style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <a href="/features/<?= (int)$f['id'] ?>" style="font-weight:600;"><?= icon('sparkles', 13) ?> <?= h($f['title']) ?></a>
                            <div class="item-meta">Feature · Awaiting Client Review</div>
                        </li>
                    <?php endforeach; ?>
                    <?php foreach ($ready_tasks as $t): ?>
                        <li style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <a href="/tasks/<?= (int)$t['id'] ?>" style="font-weight:600;"><?= h($t['title']) ?></a>
                            <div class="item-meta">Awaiting Client Review</div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </section>
    </div>
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

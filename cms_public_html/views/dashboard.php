<?php
/**
 * Project Overview — answers, at a glance:
 *   What are we actively working on · What needs client review ·
 *   What is broken · What has only been requested for the future.
 *
 * @var array $active_tasks
 * @var array $active_features
 * @var array $ready_tasks
 * @var array $ready_features
 * @var array $bugs_corrections
 * @var array $feature_backlog
 * @var array $workstreams
 * @var array $activity
 * @var array $counts   ['active','review','bugs','backlog']
 */
require_once __DIR__ . '/_icons.php';
$me = current_user();
$hour = (int)date('H');
$greet = $hour < 12 ? 'Good morning' : ($hour < 18 ? 'Good afternoon' : 'Good evening');
?>
<div class="page-head">
    <div>
        <p class="greet"><span class="greet-wave">👋</span> <?= h($greet) ?>, <?= h($me['display_name'] ?? $me['username']) ?></p>
        <h1>Project Overview</h1>
        <p class="muted">Celebrate Festival × Hiraya Digital — what the team is working on right now.</p>
    </div>
    <?php if (can_access_page('tasks')): ?>
    <div class="page-head-actions">
        <a href="/tasks/new" class="btn btn-accent"><?= icon('plus') ?> New Task</a>
    </div>
    <?php endif; ?>
</div>

<!-- ── Summary cards ─────────────────────────────────────────── -->
<div class="metrics">
    <div class="metric is-active">
        <div class="metric__top">
            <span class="metric__label">Active Delivery</span>
            <span class="metric__ico"><?= icon('workflow') ?></span>
        </div>
        <div class="metric__value"><?= (int)$counts['active'] ?></div>
        <div class="metric__hint">Committed, in-flight work</div>
    </div>
    <div class="metric is-review">
        <div class="metric__top">
            <span class="metric__label">Awaiting Client Review</span>
            <span class="metric__ico"><?= icon('eye') ?></span>
        </div>
        <div class="metric__value"><?= (int)$counts['review'] ?></div>
        <div class="metric__hint">Ready for your sign-off</div>
    </div>
    <div class="metric is-bugs">
        <div class="metric__top">
            <span class="metric__label">Bugs &amp; Corrections</span>
            <span class="metric__ico"><?= icon('bug') ?></span>
        </div>
        <div class="metric__value"><?= (int)$counts['bugs'] ?></div>
        <div class="metric__hint">Open issues being fixed</div>
    </div>
    <div class="metric is-backlog">
        <div class="metric__top">
            <span class="metric__label">Feature Backlog</span>
            <span class="metric__ico"><?= icon('sparkles') ?></span>
        </div>
        <div class="metric__value"><?= (int)$counts['backlog'] ?></div>
        <div class="metric__hint">Requested, not yet scheduled</div>
    </div>
</div>

<div class="dash-grid">
    <!-- ── LEFT: Workstreams + Recent Activity ──────────────── -->
    <div class="dash-col">
        <section class="panel">
            <div class="panel__head">
                <h2>Workstreams</h2>
                <span class="muted tiny">The major fronts of the engagement</span>
            </div>
            <div class="panel__body">
                <?php if (!$workstreams): ?>
                    <div class="empty-state">
                        <div class="empty-ico"><?= icon('grid', 22) ?></div>
                        <h3>No workstreams yet</h3>
                        <p>Workstreams group the engagement into its major fronts.</p>
                    </div>
                <?php else: ?>
                <div class="ws-list">
                    <?php foreach ($workstreams as $w):
                        $active = (int)$w['active_count'];
                        $blockers = (int)$w['blocker_count'];
                        $eta = $w['next_eta'] ? date('M j', strtotime($w['next_eta'])) : '—';
                    ?>
                        <div class="ws-row">
                            <div class="ws-main">
                                <span class="<?= workstream_status_class($w['status']) ?>"></span>
                                <div>
                                    <div class="ws-name"><?= h($w['name']) ?></div>
                                    <div class="ws-focus"><?= $w['current_focus'] ? h($w['current_focus']) : '—' ?></div>
                                    <div class="ws-status"><?= h($w['status'] ?: 'Not scheduled') ?></div>
                                </div>
                            </div>
                            <div class="ws-metrics">
                                <span class="ws-chip"><b><?= $active ?></b><span>Active</span></span>
                                <span class="ws-chip is-blocker"><b><?= $blockers ?></b><span>Blockers</span></span>
                                <span class="ws-chip is-eta"><b><?= h($eta) ?></b><span>Next ETA</span></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </section>

        <section class="panel">
            <div class="panel__head">
                <h2>Recent Activity</h2>
                <?php if (can_access_page('activity')): ?><a href="/activity" class="link">Full log <?= icon('chevron', 14) ?></a><?php endif; ?>
            </div>
            <div class="panel__body">
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
            </div>
        </section>
    </div>

    <!-- ── RIGHT: Feature Backlog + Awaiting Client Review ──── -->
    <div class="dash-col">
        <section class="panel">
            <div class="panel__head">
                <h2>Feature Backlog</h2>
                <?php if (can_access_page('features')): ?><a href="/features" class="link">View all <?= icon('chevron', 14) ?></a><?php endif; ?>
            </div>
            <div class="panel__body">
                <div class="info-note muted-note">
                    <?= icon('sparkles', 16) ?>
                    <span>Feature requests are reviewed and prioritized before scheduling. Delivery dates are shown once a feature is scheduled.</span>
                </div>
                <?php if (!$feature_backlog): ?>
                    <div class="empty"><div class="empty-ico"><?= icon('sparkles', 22) ?></div>No pending feature requests.</div>
                <?php else: ?>
                    <ul class="deadlines">
                        <?php foreach ($feature_backlog as $f): ?>
                            <li>
                                <a href="/features/<?= (int)$f['id'] ?>" style="min-width:0">
                                    <div style="font-weight:600" class="ws-name"><?= h($f['title']) ?></div>
                                    <div class="muted tiny" style="margin-top:2px">Requested by <?= h($f['requested_by'] ?: 'Unknown') ?> · <?= date('M j, Y', strtotime($f['created_at'])) ?></div>
                                </a>
                                <span class="<?= status_class($f['status']) ?>"><?= h($f['status']) ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </section>

        <section class="panel">
            <div class="panel__head">
                <h2>Awaiting Client Review</h2>
                <span class="panel__count"><?= (int)$counts['review'] ?></span>
            </div>
            <div class="panel__body">
                <?php if (!$ready_features && !$ready_tasks): ?>
                    <div class="empty"><div class="empty-ico"><?= icon('eye', 22) ?></div>Nothing currently in review.</div>
                <?php else: ?>
                    <ul class="deadlines">
                        <?php foreach ($ready_features as $f): ?>
                            <li>
                                <a href="/features/<?= (int)$f['id'] ?>" style="min-width:0">
                                    <div class="ws-name"><?= icon('sparkles', 13) ?> <?= h($f['title']) ?></div>
                                    <div class="muted tiny" style="margin-top:2px">Feature · ready for your review</div>
                                </a>
                                <span class="pill pill-amber">Review</span>
                            </li>
                        <?php endforeach; ?>
                        <?php foreach ($ready_tasks as $t): ?>
                            <li>
                                <a href="/tasks/<?= (int)$t['id'] ?>" style="min-width:0">
                                    <div class="ws-name"><?= h($t['title']) ?></div>
                                    <div class="muted tiny" style="margin-top:2px">Task #<?= (int)$t['id'] ?> · ready for your review</div>
                                </a>
                                <span class="pill pill-amber">Review</span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </section>

        <?php if ($bugs_corrections): ?>
        <section class="panel">
            <div class="panel__head">
                <h2>Bugs &amp; Corrections</h2>
                <span class="panel__count"><?= (int)$counts['bugs'] ?></span>
            </div>
            <div class="panel__body">
                <ul class="deadlines">
                    <?php foreach ($bugs_corrections as $t): ?>
                        <li>
                            <a href="/tasks/<?= (int)$t['id'] ?>" style="min-width:0">
                                <div class="ws-name" style="color:var(--rose-ink)"><?= h($t['title']) ?></div>
                                <div class="muted tiny" style="margin-top:2px">Bug #<?= (int)$t['id'] ?><?= $t['eta_date'] ? ' · ETA ' . h(date('M j', strtotime($t['eta_date']))) : '' ?></div>
                            </a>
                            <span class="<?= status_class($t['status']) ?>"><?= h($t['status']) ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </section>
        <?php endif; ?>
    </div>
</div>

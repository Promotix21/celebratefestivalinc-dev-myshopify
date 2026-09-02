<?php
/**
 * Features & Deliverables — every feature from request to delivery.
 *
 * @var array $features       each row + requested_by, request_task_id, impl_total, impl_done
 * @var array $stage_counts   status => count (real data)
 */
require_once __DIR__ . '/../_icons.php';

$total = count($features);

// Group features into the three real buckets, preserving id-desc order.
$groups = ['active' => [], 'backlog' => [], 'completed' => []];
foreach ($features as $f) { $groups[feature_group($f['status'])][] = $f; }

// Map a lifecycle status to the summary-strip accent class.
$stage_slug = [
    'Requested'             => 's-requested',
    'Under Review'          => 's-review',
    'Approved for Planning' => 's-approved',
    'Scheduled'             => 's-scheduled',
    'In Progress'           => 's-progress',
    'Ready for Review'      => 's-ready',
    'Completed'             => 's-completed',
];

/** Render one feature row. */
$render_row = function(array $f): string {
    ob_start();
    $reqOn = $f['created_at'] ? date('M j, Y', strtotime($f['created_at'])) : '—';
    $implTotal = (int)$f['impl_total'];
    $implDone  = (int)$f['impl_done'];
    // ETA / planned period: only show something real.
    $eta = trim((string)($f['eta_period'] ?? ''));
    if ($eta === '' && !empty($f['completion_date'])) $eta = date('M j, Y', strtotime($f['completion_date']));
    ?>
    <tr class="clickable" data-href="/features/<?= (int)$f['id'] ?>" data-status="<?= h($f['status']) ?>">
        <td>
            <div class="cell-title"><?= h($f['title']) ?></div>
            <div class="cell-sub">Feature #<?= (int)$f['id'] ?></div>
        </td>
        <td class="cell-req"><?= h($f['requested_by'] ?: '—') ?></td>
        <td class="cell-req cell-muted"><?= h($reqOn) ?></td>
        <td><span class="<?= status_class($f['status']) ?>"><?= h($f['status']) ?></span></td>
        <td>
            <?php if (!empty($f['request_task_id'])): ?>
                <a class="req-link" href="/tasks/<?= (int)$f['request_task_id'] ?>" onclick="event.stopPropagation()"><?= icon('arrow-right', 13) ?> #<?= (int)$f['request_task_id'] ?></a>
            <?php else: ?>
                <span class="cell-muted cell-req">—</span>
            <?php endif; ?>
        </td>
        <td>
            <?php if ($implTotal > 0): $pct = (int)round($implDone / $implTotal * 100); ?>
                <div class="impl">
                    <span class="impl-frac"><?= $implDone ?>/<?= $implTotal ?></span>
                    <span class="impl-bar"><i style="width:<?= $pct ?>%"></i></span>
                </div>
            <?php else: ?>
                <span class="impl-empty">None yet</span>
            <?php endif; ?>
        </td>
        <td class="cell-req">
            <?php if (!empty($f['dependencies'])): ?>
                <?= h(mb_strimwidth($f['dependencies'], 0, 48, '…')) ?>
            <?php else: ?>
                <span class="cell-muted">—</span>
            <?php endif; ?>
        </td>
        <td class="cell-req">
            <?php if ($eta !== ''): ?>
                <?= h($eta) ?>
            <?php elseif (feature_group($f['status']) === 'backlog'): ?>
                <span class="eta-none">No ETA yet</span>
            <?php else: ?>
                <span class="eta-none">Not scheduled</span>
            <?php endif; ?>
        </td>
    </tr>
    <?php
    return (string)ob_get_clean();
};
?>
<div class="page-head">
    <div>
        <h1>Features &amp; Deliverables</h1>
        <p class="muted">Track every feature from request to delivery.</p>
    </div>
    <?php if (is_admin()): ?>
    <div class="page-head-actions"><a href="/features/new" class="btn btn-accent"><?= icon('plus') ?> New Feature</a></div>
    <?php endif; ?>
</div>

<?php if (!$features): ?>
    <div class="card">
        <div class="empty">
            <div class="empty-ico"><?= icon('sparkles', 22) ?></div>
            <h2 style="margin:0 0 4px">No features yet</h2>
            <p>Features appear here as requests are logged and prioritized.</p>
        </div>
    </div>
<?php else: ?>

<!-- ── Lifecycle summary ─────────────────────────────────────── -->
<div class="lifecycle-counters">
    <div class="lc-count s-all"><b><?= $total ?></b><span>All</span></div>
    <?php foreach (feature_lifecycle_stages() as $st): ?>
        <div class="lc-count <?= $stage_slug[$st] ?>"><b><?= (int)($stage_counts[$st] ?? 0) ?></b><span><?= h($st) ?></span></div>
    <?php endforeach; ?>
</div>

<!-- ── Lifecycle filter tabs ─────────────────────────────────── -->
<div class="filter-tabs" data-feature-filter>
    <button class="filter-tab active" data-filter="all">All <span class="t-num"><?= $total ?></span></button>
    <?php foreach (feature_lifecycle_stages() as $st): ?>
        <button class="filter-tab" data-filter="<?= h($st) ?>"><?= h($st) ?> <span class="t-num"><?= (int)($stage_counts[$st] ?? 0) ?></span></button>
    <?php endforeach; ?>
</div>

<div class="table-scroll">
    <table class="table" data-feature-table>
        <thead>
            <tr>
                <th style="min-width:220px">Feature</th>
                <th>Requested By</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Original Request</th>
                <th>Implementation</th>
                <th>Dependencies / Notes</th>
                <th>ETA / Planned</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $sections = [
            'backlog'   => ['Backlog', 'Requested · Under Review · Approved for Planning'],
            'active'    => ['Planned &amp; Active', 'Scheduled · In Progress · Ready for Review'],
            'completed' => ['Completed', 'Shipped &amp; signed off'],
        ];
        foreach ($sections as $key => [$label, $hint]):
            if (!$groups[$key]) continue;
        ?>
            <tr class="ftable-group" data-group="<?= $key ?>">
                <td colspan="8"><?= $label ?><span class="g-hint"><?= $hint ?></span></td>
            </tr>
            <?php foreach ($groups[$key] as $f) echo $render_row($f); ?>
        <?php endforeach; ?>
        <tr data-empty-row hidden>
            <td colspan="8" class="muted" style="text-align:center;padding:26px">No features in this stage.</td>
        </tr>
        </tbody>
    </table>
</div>
<?php endif; ?>

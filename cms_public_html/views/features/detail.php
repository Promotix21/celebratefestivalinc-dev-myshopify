<?php
/**
 * Feature Detail (Mockup #3).
 *
 * @var array      $feature
 * @var array      $request_tasks
 * @var array      $implementation_tasks
 * @var array|null $source_task        first request/source task (or null)
 * @var array|null $workstream         ['id','name'] or null
 * @var array      $all_workstreams    admin picklist (empty for clients)
 */
require_once __DIR__ . '/../_icons.php';
$request_tasks = $request_tasks ?? [];
$implementation_tasks = $implementation_tasks ?? [];
$source_task = $source_task ?? null;
$workstream = $workstream ?? null;
$all_workstreams = $all_workstreams ?? [];

$group = feature_group($feature['status']);
$curIdx = lifecycle_index($feature['status']);
$reqOn = $feature['created_at'] ? date('M j, Y', strtotime($feature['created_at'])) : null;

// A small helper for meta-strip values that may be unset.
$metaVal = function (?string $v, string $unset = 'Not set') {
    $v = trim((string)$v);
    if ($v === '') return '<span class="meta-item__value is-unset">' . h($unset) . '</span>';
    return '<span class="meta-item__value">' . h($v) . '</span>';
};
?>
<div class="detail-head">
    <div class="eyebrow">
        <a href="/features">Features</a> <?= icon('chevron', 12) ?>
        <span>Feature #<?= (int)$feature['id'] ?></span>
        <?php if ($workstream): ?><?= icon('chevron', 12) ?> <span><?= h($workstream['name']) ?></span><?php endif; ?>
    </div>
    <h1><?= h($feature['title']) ?></h1>
    <div class="pill-row">
        <span class="<?= status_class($feature['status']) ?>"><?= h($feature['status']) ?></span>
        <span class="muted tiny">Requested by <?= h($feature['creator']) ?><?= $reqOn ? ' · ' . h($reqOn) : '' ?></span>
    </div>
    <?php if (!empty($feature['description'])): ?>
        <p class="detail-lead" style="margin-top:12px"><?= h(mb_strimwidth($feature['description'], 0, 220, '…')) ?></p>
    <?php endif; ?>
</div>

<!-- ── Metadata strip ────────────────────────────────────────── -->
<div class="meta-strip">
    <div class="meta-item">
        <div class="meta-item__label">Requested By</div>
        <?= $metaVal($feature['creator']) ?>
    </div>
    <div class="meta-item">
        <div class="meta-item__label">Requested On</div>
        <?= $metaVal($reqOn) ?>
    </div>
    <div class="meta-item">
        <div class="meta-item__label">Status</div>
        <div class="meta-item__value"><span class="<?= status_class($feature['status']) ?>"><?= h($feature['status']) ?></span></div>
    </div>
    <div class="meta-item">
        <div class="meta-item__label">Planning Stage</div>
        <?= $metaVal($feature['planning_stage'] ?? '', 'Not set') ?>
    </div>
    <div class="meta-item">
        <div class="meta-item__label">Priority</div>
        <?php if (!empty($feature['priority'])): ?>
            <div class="meta-item__value"><span class="<?= priority_class($feature['priority']) ?>"><?= h($feature['priority']) ?></span></div>
        <?php else: ?>
            <span class="meta-item__value is-unset">Not set</span>
        <?php endif; ?>
    </div>
    <div class="meta-item">
        <div class="meta-item__label">ETA</div>
        <?php
        $eta = trim((string)($feature['eta_period'] ?? ''));
        if ($eta === '' && !empty($feature['completion_date'])) $eta = date('M j, Y', strtotime($feature['completion_date']));
        echo $metaVal($eta, $group === 'backlog' ? 'Not scheduled' : 'Not set');
        ?>
    </div>
</div>

<?php if ($group === 'backlog'): ?>
<div class="info-note">
    <?= icon('sparkles', 16) ?>
    <span>Feature requests are reviewed and prioritized before scheduling. Once approved, they move into planning and implementation.</span>
</div>
<?php endif; ?>

<div class="grid-feature">
    <!-- ── MAIN COLUMN ──────────────────────────────────────── -->
    <div class="stack">
        <section class="card section-block">
            <h2><?= icon('book', 16) ?> Overview / Description</h2>
            <?php if (!empty($feature['description'])): ?>
                <div class="body-text"><?= h($feature['description']) ?></div>
            <?php else: ?>
                <div class="section-empty">No description provided yet.</div>
            <?php endif; ?>
            <?php if (!empty($feature['demo_url'])): ?>
                <p style="margin-top:14px"><a class="btn btn-ghost btn-sm" href="<?= h($feature['demo_url']) ?>" target="_blank" rel="noopener">Open demo ↗</a></p>
            <?php endif; ?>
        </section>

        <section class="card section-block">
            <h2><?= icon('workflow', 16) ?> Planning Notes</h2>
            <?php if (!empty($feature['planning_notes'])): ?>
                <div class="body-text"><?= h($feature['planning_notes']) ?></div>
            <?php else: ?>
                <div class="section-empty">No planning notes yet. Added once the feature moves into planning.</div>
            <?php endif; ?>
        </section>

        <section class="card section-block">
            <h2><?= icon('bug', 16) ?> Dependencies / Blockers</h2>
            <?php if (!empty($feature['dependencies'])): ?>
                <div class="body-text"><?= h($feature['dependencies']) ?></div>
            <?php else: ?>
                <div class="section-empty">No dependencies or blockers recorded.</div>
            <?php endif; ?>
        </section>

        <section class="card section-block">
            <h2><?= icon('inbox', 16) ?> Original Business Context</h2>
            <?php if (!empty($feature['business_context'])): ?>
                <div class="body-text"><?= h($feature['business_context']) ?></div>
            <?php else: ?>
                <div class="section-empty">No additional business context recorded.</div>
            <?php endif; ?>
        </section>

        <!-- Implementation tasks — ONLY relation_type='implementation'. -->
        <section class="card section-block">
            <div class="card-head">
                <h2 style="margin:0"><?= icon('check', 16) ?> Implementation Tasks</h2>
                <?php if ($implementation_tasks): ?>
                    <span class="muted tiny"><?= count($implementation_tasks) ?> linked</span>
                <?php endif; ?>
            </div>
            <?php if ($implementation_tasks): ?>
                <p class="muted tiny">The actual delivery work for this feature. These are the tasks that surface in Active Delivery / Ready for Review.</p>
                <div class="table-scroll" style="margin-top:8px">
                    <table class="table">
                        <thead><tr><th>#</th><th>Task</th><th>Type</th><th>Status</th></tr></thead>
                        <tbody>
                        <?php foreach ($implementation_tasks as $lt): ?>
                            <tr class="clickable" data-href="/tasks/<?= (int)$lt['id'] ?>">
                                <td class="muted">#<?= (int)$lt['id'] ?></td>
                                <td><a href="/tasks/<?= (int)$lt['id'] ?>"><?= h($lt['title']) ?></a></td>
                                <td class="muted tiny"><?= h($lt['task_type']) ?></td>
                                <td><span class="<?= status_class($lt['status']) ?>"><?= h($lt['status']) ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <div class="empty-ico"><?= icon('check', 22) ?></div>
                    <h3>No implementation tasks yet</h3>
                    <p>Once this feature is scheduled, break it into implementation work — architecture, integration, UI, QA and deployment.</p>
                </div>
            <?php endif; ?>

            <?php if (is_admin()): ?>
                <details style="margin-top:14px">
                    <summary class="btn btn-ghost btn-sm" style="display:inline-flex; cursor:pointer;"><?= icon('plus', 14) ?> Add Implementation Task</summary>
                    <form class="form" method="post" action="/features/<?= (int)$feature['id'] ?>/tasks" style="margin-top:14px; max-width:520px">
                        <?= csrf_field() ?>
                        <label>Task title<input name="title" required placeholder="e.g. Build BDR API integration"></label>
                        <div class="form-row">
                            <label>Type<select name="task_type">
                                <?php foreach (['Feature', 'UI Change', 'Bug'] as $tt): ?><option><?= h($tt) ?></option><?php endforeach; ?>
                            </select></label>
                        </div>
                        <label>Description<textarea name="description" rows="3" placeholder="Scope of this implementation task…"></textarea></label>
                        <button class="btn btn-accent btn-sm">Create &amp; link task</button>
                        <p class="muted tiny" style="margin-top:8px">Linked as an implementation task. The original request/source task is never modified.</p>
                    </form>
                </details>
            <?php endif; ?>
        </section>
    </div>

    <!-- ── RIGHT SIDEBAR ────────────────────────────────────── -->
    <aside>
        <!-- Original Request / Source -->
        <div class="side-card">
            <div class="side-card__head">
                <h2>Original Request / Source</h2>
                <p class="sub">Preserved with its comments, attachments &amp; activity history.</p>
            </div>
            <div class="side-card__body">
                <?php if ($source_task): ?>
                    <dl class="source-kv">
                        <dt>Task</dt><dd><a href="/tasks/<?= (int)$source_task['id'] ?>">#<?= (int)$source_task['id'] ?></a></dd>
                        <dt>Requester</dt><dd><?= h($source_task['requester'] ?: '—') ?></dd>
                        <dt>Created</dt><dd><?= $source_task['created_at'] ? h(date('M j, Y', strtotime($source_task['created_at']))) : '—' ?></dd>
                        <dt>Type</dt><dd><?= h($source_task['task_type']) ?></dd>
                        <dt>Status</dt><dd><span class="<?= status_class($source_task['status']) ?>"><?= h($source_task['status']) ?></span></dd>
                    </dl>
                    <a href="/tasks/<?= (int)$source_task['id'] ?>" class="btn btn-ghost btn-sm btn-block" style="margin-top:14px"><?= icon('arrow-right', 14) ?> Open original request</a>
                <?php else: ?>
                    <div class="section-empty">No linked source request. This feature was created directly by the team.</div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Lifecycle timeline (7 real stages) -->
        <div class="side-card">
            <div class="side-card__head"><h2>Lifecycle</h2></div>
            <div class="side-card__body">
                <ul class="rail">
                    <?php foreach (feature_lifecycle_stages() as $i => $stage):
                        $cls = $i < $curIdx ? 'is-done' : ($i === $curIdx ? 'is-current' : '');
                    ?>
                        <li class="<?= $cls ?>">
                            <span class="rail-name"><?= h($stage) ?></span>
                            <?php if ($i === $curIdx): ?><span class="rail-tag">Current</span><?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>

        <?php if (is_admin()): ?>
        <!-- Admin: edit feature + planning metadata -->
        <div class="side-card">
            <div class="side-card__head"><h2>Manage Feature</h2></div>
            <div class="side-card__body">
                <form class="form" method="post" action="/features/<?= (int)$feature['id'] ?>/edit">
                    <?= csrf_field() ?>
                    <label>Title<input name="title" value="<?= h($feature['title']) ?>" required></label>
                    <label>Description<textarea name="description" rows="3"><?= h($feature['description']) ?></textarea></label>
                    <div class="form-row">
                        <label>Lifecycle status<select name="status">
                            <?php foreach (feature_lifecycle_stages() as $v): ?><option <?= $feature['status'] === $v ? 'selected' : '' ?>><?= h($v) ?></option><?php endforeach; ?>
                        </select></label>
                        <label>Workstream<select name="workstream_id">
                            <option value="">— None —</option>
                            <?php foreach ($all_workstreams as $w): ?><option value="<?= (int)$w['id'] ?>" <?= (int)($feature['workstream_id'] ?? 0) === (int)$w['id'] ? 'selected' : '' ?>><?= h($w['name']) ?></option><?php endforeach; ?>
                        </select></label>
                    </div>
                    <div class="form-row">
                        <label>Priority<select name="priority">
                            <option value="">— Not set —</option>
                            <?php foreach (['Low', 'Medium', 'High'] as $p): ?><option <?= ($feature['priority'] ?? '') === $p ? 'selected' : '' ?>><?= h($p) ?></option><?php endforeach; ?>
                        </select></label>
                        <label>Planning stage<input name="planning_stage" value="<?= h($feature['planning_stage'] ?? '') ?>" placeholder="e.g. Discovery"></label>
                    </div>
                    <div class="form-row">
                        <label>ETA / period<input name="eta_period" value="<?= h($feature['eta_period'] ?? '') ?>" placeholder="e.g. May–Jun 2026"></label>
                        <label>Completion date<input type="date" name="completion_date" value="<?= h($feature['completion_date']) ?>"></label>
                    </div>
                    <label>Planning notes<textarea name="planning_notes" rows="3"><?= h($feature['planning_notes'] ?? '') ?></textarea></label>
                    <label>Dependencies / blockers<textarea name="dependencies" rows="2"><?= h($feature['dependencies'] ?? '') ?></textarea></label>
                    <label>Original business context<textarea name="business_context" rows="3"><?= h($feature['business_context'] ?? '') ?></textarea></label>
                    <label>Demo URL<input name="demo_url" value="<?= h($feature['demo_url']) ?>"></label>
                    <button class="btn btn-accent btn-block">Save changes</button>
                </form>
            </div>
        </div>
        <?php endif; ?>
    </aside>
</div>

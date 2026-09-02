<?php
/** @var array $tasks */
/** @var bool $show_backlog */
/** @var int $hidden_backlog */
require_once __DIR__ . '/../_icons.php';
$show_backlog = $show_backlog ?? false;
$hidden_backlog = $hidden_backlog ?? 0;
?>
<div class="page-head">
    <div>
        <h1>Tasks</h1>
        <p class="muted">Active, pending, and shipped work. Original client requests live in the <a href="/features" class="link">Feature Backlog</a> as their source records.</p>
    </div>
    <div class="page-head-actions">
        <?php $qs = http_build_query(array_filter(['status'=>q('status'),'type'=>q('type'),'priority'=>q('priority')])); ?>
        <a href="/tasks/export<?= $qs ? '?' . h($qs) : '' ?>" class="btn btn-ghost"><?= icon('upload') ?> Export to Excel</a>
        <a href="/tasks/new" class="btn btn-accent"><?= icon('plus') ?> New Task</a>
    </div>
</div>

<form method="get" class="filters">
    <select name="status" data-autosubmit>
        <option value="">All statuses</option>
        <?php foreach (['Pending','In Progress','Ready for Review','Needs Clarification','Completed'] as $s): ?>
            <option <?= q('status')===$s?'selected':'' ?>><?= h($s) ?></option>
        <?php endforeach; ?>
    </select>
    <select name="type" data-autosubmit>
        <option value="">All types</option>
        <?php foreach (['Bug','Feature','UI Change'] as $t): ?>
            <option <?= q('type')===$t?'selected':'' ?>><?= h($t) ?></option>
        <?php endforeach; ?>
    </select>
    <select name="priority" data-autosubmit>
        <option value="">Any priority</option>
        <?php foreach (['High','Medium','Low'] as $p): ?>
            <option <?= q('priority')===$p?'selected':'' ?>><?= h($p) ?></option>
        <?php endforeach; ?>
    </select>
    <?php if (q('status') || q('type') || q('priority')): ?>
        <a href="/tasks" class="btn btn-ghost btn-sm">Clear filters</a>
    <?php endif; ?>
    <?php if ($show_backlog): ?>
        <a href="/tasks" class="btn btn-ghost btn-sm">Hide request/history records</a>
    <?php elseif ($hidden_backlog > 0): ?>
        <a href="/tasks?show=all" class="btn btn-ghost btn-sm">Show <?= (int)$hidden_backlog ?> request/history record<?= $hidden_backlog === 1 ? '' : 's' ?></a>
    <?php endif; ?>
</form>

<?php if (!$tasks): ?>
    <div class="card">
        <div class="empty">
            <div class="empty-ico"><?= icon('inbox', 22) ?></div>
            <h2 style="margin:0 0 4px">No tasks yet</h2>
            <p>Create the first task to start tracking.</p>
            <a href="/tasks/new" class="btn btn-accent" style="margin-top:10px"><?= icon('plus') ?> New Task</a>
        </div>
    </div>
<?php else: ?>
<div class="card card-flush">
    <table class="table">
        <thead>
            <tr><th>#</th><th>Task</th><th>Priority</th><th>Status</th><th>Scheduled</th><th>Created</th></tr>
        </thead>
        <tbody>
        <?php foreach ($tasks as $t): ?>
            <tr data-href="/tasks/<?= (int)$t['id'] ?>" class="clickable">
                <td class="muted">#<?= (int)$t['id'] ?></td>
                <td>
                    <div class="task-title">
                        <?= task_type_icon($t['task_type']) ?>
                        <div>
                            <strong><?= h($t['title']) ?></strong>
                            <div class="muted tiny"><?= h($t['task_type']) ?> · opened by <?= h($t['creator']) ?></div>
                        </div>
                    </div>
                </td>
                <td><span class="<?= priority_class($t['priority']) ?>"><?= h($t['priority']) ?></span></td>
                <td><span class="<?= status_class($t['status']) ?>"><?= h($t['status']) ?></span></td>
                <td><?= $t['eta_date'] ? date('M j, Y', strtotime($t['eta_date'])) : '<span class="muted">—</span>' ?></td>
                <td class="muted tiny"><?= fmt_rel($t['created_at']) ?></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php endif; ?>

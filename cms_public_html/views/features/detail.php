<?php
/** @var array $feature */
/** @var array $request_tasks */
/** @var array $implementation_tasks */
$request_tasks = $request_tasks ?? [];
$implementation_tasks = $implementation_tasks ?? [];
?>
<div class="page-head">
    <div>
        <div class="muted tiny">Feature #<?= (int)$feature['id'] ?> · by <?= h($feature['creator']) ?></div>
        <h1><?= h($feature['title']) ?></h1>
        <div class="pill-row">
            <span class="<?= status_class($feature['status']) ?>"><?= h($feature['status']) ?></span>
            <?php if ($feature['completion_date']): ?><span class="muted">Shipped <?= h($feature['completion_date']) ?></span><?php endif; ?>
        </div>
    </div>
</div>
<div class="grid-detail">
    <section class="card">
        <h2>Description</h2>
        <?php if ($feature['description']): ?><p><?= nl2br(h($feature['description'])) ?></p><?php else: ?><p class="muted">No description.</p><?php endif; ?>
        <?php if ($feature['demo_url']): ?>
            <p><a class="btn btn-ghost" href="<?= h($feature['demo_url']) ?>" target="_blank">Open demo ↗</a></p>
        <?php endif; ?>
    </section>

    <?php if ($request_tasks): ?>
    <section class="card">
        <h2>Original Request / Source</h2>
        <p class="muted tiny">The original client request this feature came from. Preserved as history — its wording, comments, attachments and activity stay intact. Not active delivery.</p>
        <table class="table">
            <thead><tr><th>#</th><th>Request</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
            <?php foreach ($request_tasks as $lt): ?>
                <tr data-href="/tasks/<?= (int)$lt['id'] ?>" class="clickable">
                    <td class="muted">#<?= (int)$lt['id'] ?></td>
                    <td><a href="/tasks/<?= (int)$lt['id'] ?>"><?= h($lt['title']) ?></a></td>
                    <td class="muted tiny"><?= h($lt['task_type']) ?></td>
                    <td><span class="<?= status_class($lt['status']) ?>"><?= h($lt['status']) ?></span></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </section>
    <?php endif; ?>

    <section class="card">
        <h2>Implementation Tasks</h2>
        <?php if ($implementation_tasks): ?>
        <p class="muted tiny">Actual work delivering this feature. These are the tasks that appear in Active Delivery / Ready for Review.</p>
        <table class="table">
            <thead><tr><th>#</th><th>Task</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
            <?php foreach ($implementation_tasks as $lt): ?>
                <tr data-href="/tasks/<?= (int)$lt['id'] ?>" class="clickable">
                    <td class="muted">#<?= (int)$lt['id'] ?></td>
                    <td><a href="/tasks/<?= (int)$lt['id'] ?>"><?= h($lt['title']) ?></a></td>
                    <td class="muted tiny"><?= h($lt['task_type']) ?></td>
                    <td><span class="<?= status_class($lt['status']) ?>"><?= h($lt['status']) ?></span></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
        <p class="muted">No implementation tasks yet. Create tasks and link them here once this feature is scheduled.</p>
        <?php endif; ?>
    </section>
    <aside>
        <?php if (is_admin()): ?>
        <section class="card form">
            <h2>Edit</h2>
            <form method="post" action="/features/<?= (int)$feature['id'] ?>/edit">
                <?= csrf_field() ?>
                <label>Title<input name="title" value="<?= h($feature['title']) ?>" required></label>
                <label>Description<textarea name="description" rows="4"><?= h($feature['description']) ?></textarea></label>
                <div class="form-row">
                    <label>Status<select name="status">
                        <?php foreach (['Requested', 'Under Review', 'Approved for Planning', 'Scheduled', 'In Progress', 'Ready for Review', 'Completed'] as $v): ?><option <?= $feature['status']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
                    </select></label>
                    <label>Completion<input type="date" name="completion_date" value="<?= h($feature['completion_date']) ?>"></label>
                </div>
                <label>Demo URL<input name="demo_url" value="<?= h($feature['demo_url']) ?>"></label>
                <button class="btn btn-accent btn-block">Save</button>
            </form>
        </section>
        <?php endif; ?>
    </aside>
</div>

<?php /** @var array $feature */ ?>
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
                        <?php foreach (['Planned','In Progress','Completed'] as $v): ?><option <?= $feature['status']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
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

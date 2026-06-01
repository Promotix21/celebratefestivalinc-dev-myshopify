<?php $f = $feature ?? []; $isEdit = !empty($f); ?>
<div class="page-head"><div><h1><?= $isEdit ? 'Edit Feature' : 'New Feature' ?></h1></div></div>
<form method="post" action="<?= $isEdit ? '/features/' . (int)$f['id'] . '/edit' : '/features' ?>" class="card form">
    <?= csrf_field() ?>
    <label>Title<input name="title" required value="<?= h($f['title'] ?? '') ?>"></label>
    <label>Description<textarea name="description" rows="4"><?= h($f['description'] ?? '') ?></textarea></label>
    <div class="form-row">
        <label>Status<select name="status">
            <?php foreach (['Planned','In Progress','Completed'] as $v): ?>
                <option <?= ($f['status'] ?? 'Planned')===$v?'selected':'' ?>><?= h($v) ?></option>
            <?php endforeach; ?>
        </select></label>
        <label>Completion Date<input type="date" name="completion_date" value="<?= h($f['completion_date'] ?? '') ?>"></label>
    </div>
    <label>Demo URL<input name="demo_url" value="<?= h($f['demo_url'] ?? '') ?>" placeholder="https://…"></label>
    <div class="form-actions">
        <a href="<?= $isEdit ? '/features/' . (int)$f['id'] : '/features' ?>" class="btn btn-ghost">Cancel</a>
        <button class="btn btn-accent">Save</button>
    </div>
</form>

<?php $d = $doc ?? []; $isEdit = !empty($d); ?>
<div class="page-head"><div><h1><?= $isEdit ? 'Edit Doc' : 'New Doc' ?></h1></div></div>
<form method="post" action="<?= $isEdit ? '/docs/' . (int)$d['id'] . '/edit' : '/docs' ?>" class="card form">
    <?= csrf_field() ?>
    <label>Title<input name="title" required value="<?= h($d['title'] ?? '') ?>"></label>
    <label>Category<select name="category">
        <?php foreach (['Setup','SEO','Features','Guides','Other'] as $v): ?>
            <option <?= ($d['category'] ?? 'Other')===$v?'selected':'' ?>><?= h($v) ?></option>
        <?php endforeach; ?>
    </select></label>
    <label>Content (Markdown)<textarea name="content" rows="16"><?= h($d['content'] ?? '') ?></textarea></label>
    <div class="form-actions">
        <a href="<?= $isEdit ? '/docs/' . (int)$d['id'] : '/docs' ?>" class="btn btn-ghost">Cancel</a>
        <button class="btn btn-accent">Save</button>
    </div>
</form>

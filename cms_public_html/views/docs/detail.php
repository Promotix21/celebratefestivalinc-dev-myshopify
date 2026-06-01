<?php /** @var array $doc */ ?>
<div class="page-head">
    <div>
        <div class="muted tiny"><?= h($doc['category']) ?> · by <?= h($doc['creator']) ?></div>
        <h1><?= h($doc['title']) ?></h1>
        <div class="muted tiny">Updated <?= fmt_rel($doc['updated_at'] ?: $doc['created_at']) ?></div>
    </div>
</div>
<div class="grid-detail">
    <article class="card doc-article"><?= md($doc['content'] ?? '') ?></article>
    <?php if (is_admin()): ?>
    <aside>
        <section class="card form">
            <h2>Edit</h2>
            <form method="post" action="/docs/<?= (int)$doc['id'] ?>/edit">
                <?= csrf_field() ?>
                <label>Title<input name="title" value="<?= h($doc['title']) ?>" required></label>
                <label>Category<select name="category">
                    <?php foreach (['Setup','SEO','Features','Guides','Other'] as $v): ?><option <?= $doc['category']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
                </select></label>
                <label>Content<textarea name="content" rows="12"><?= h($doc['content']) ?></textarea></label>
                <button class="btn btn-accent btn-block">Save</button>
            </form>
        </section>
    </aside>
    <?php endif; ?>
</div>

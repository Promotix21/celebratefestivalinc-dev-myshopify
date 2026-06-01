<?php /** @var array $docs */ ?>
<div class="page-head">
    <div><h1>Documentation</h1><p class="muted">Shared knowledge — setup, SEO, features, guides.</p></div>
    <?php if (is_admin()): ?>
        <div class="page-head-actions"><a href="/docs/new" class="btn btn-accent">+ New Doc</a></div>
    <?php endif; ?>
</div>
<?php
$grouped = [];
foreach ($docs as $d) { $grouped[$d['category']][] = $d; }
?>
<?php if (!$docs): ?>
    <div class="card"><p class="muted">No docs yet.</p></div>
<?php endif; ?>
<?php foreach ($grouped as $cat => $rows): ?>
    <section class="card">
        <div class="card-head"><h2><?= h($cat) ?></h2></div>
        <ul class="doc-list">
            <?php foreach ($rows as $d): ?>
                <li>
                    <a href="/docs/<?= (int)$d['id'] ?>"><?= h($d['title']) ?></a>
                    <span class="muted tiny"><?= fmt_rel($d['updated_at'] ?: $d['created_at']) ?></span>
                </li>
            <?php endforeach; ?>
        </ul>
    </section>
<?php endforeach; ?>

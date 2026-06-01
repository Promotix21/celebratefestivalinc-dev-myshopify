<?php
/** @var array $features */
require_once __DIR__ . '/../_icons.php';
?>
<div class="page-head">
    <div>
        <h1>Features &amp; Deliverables</h1>
        <p class="muted">Proof of work — every shipped outcome in one view.</p>
    </div>
    <div class="page-head-actions"><a href="/features/new" class="btn btn-accent"><?= icon('plus') ?> New Feature</a></div>
</div>

<?php if (!$features): ?>
    <div class="card">
        <div class="empty">
            <div class="empty-ico"><?= icon('sparkles', 22) ?></div>
            <h2 style="margin:0 0 4px">No features yet</h2>
            <p>Start documenting the outcomes you ship.</p>
            <a href="/features/new" class="btn btn-accent" style="margin-top:10px"><?= icon('plus') ?> Add feature</a>
        </div>
    </div>
<?php else: ?>
<div class="feature-grid">
    <?php foreach ($features as $f): ?>
        <a class="feature-card" href="/features/<?= (int)$f['id'] ?>">
            <div class="feature-thumb"><?= h(mb_substr($f['title'], 0, 1)) ?></div>
            <div class="feature-body">
                <div class="feature-title"><?= h($f['title']) ?></div>
                <p class="feature-desc"><?= h(mb_substr($f['description'] ?? '', 0, 90)) ?></p>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="<?= status_class($f['status']) ?>"><?= h($f['status']) ?></span>
                    <?php if ($f['completion_date']): ?><span class="muted tiny"><?= h($f['completion_date']) ?></span><?php endif; ?>
                </div>
            </div>
        </a>
    <?php endforeach; ?>
</div>
<?php endif; ?>

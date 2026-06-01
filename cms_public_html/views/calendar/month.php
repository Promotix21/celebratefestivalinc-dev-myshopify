<?php
/** @var string $month; @var array $items; @var array $media */
require_once __DIR__ . '/../_icons.php';

$firstDow = (int)date('w', strtotime($start));
$daysInMonth = (int)date('t', strtotime($start));
$prev = date('Y-m', strtotime($start . ' -1 month'));
$next = date('Y-m', strtotime($start . ' +1 month'));
$label = date('F Y', strtotime($start));

// Group items by day
$byDay = [];
foreach ($items as $it) {
    $d = $it['scheduled_for'] ?: substr($it['created_at'], 0, 10);
    $byDay[$d][] = $it;
}

function media_class(string $type): string {
    return match($type) {
        'Reel','Video' => 'cal-tag cal-tag-rose',
        'Image','Carousel' => 'cal-tag cal-tag-indigo',
        'Story' => 'cal-tag cal-tag-amber',
        default => 'cal-tag cal-tag-gray',
    };
}
?>
<div class="page-head">
    <div>
        <h1>Content Calendar</h1>
        <p class="muted">Plan, draft, schedule, and ship content — with media, captions and hashtags in one view.</p>
    </div>
    <div class="page-head-actions">
        <a href="/calendar?m=<?= h($prev) ?>" class="btn btn-ghost btn-sm">← <?= h(date('M', strtotime($prev . '-01'))) ?></a>
        <a href="/calendar?m=<?= h(date('Y-m')) ?>" class="btn btn-ghost btn-sm">Today</a>
        <a href="/calendar?m=<?= h($next) ?>" class="btn btn-ghost btn-sm"><?= h(date('M', strtotime($next . '-01'))) ?> →</a>
        <a href="/calendar/new" class="btn btn-accent"><?= icon('plus') ?> New Content</a>
    </div>
</div>

<div class="cal-head">
    <h2 style="margin:0"><?= h($label) ?></h2>
    <div class="cal-legend">
        <span class="cal-tag cal-tag-indigo">Image / Carousel</span>
        <span class="cal-tag cal-tag-rose">Reel / Video</span>
        <span class="cal-tag cal-tag-amber">Story</span>
        <span class="cal-tag cal-tag-gray">Post</span>
    </div>
</div>

<div class="cal-grid">
    <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

    <?php for ($i = 0; $i < $firstDow; $i++): ?>
        <div class="cal-day cal-day-empty"></div>
    <?php endfor; ?>

    <?php for ($d = 1; $d <= $daysInMonth; $d++):
        $date = sprintf('%s-%02d', $month, $d);
        $dayItems = $byDay[$date] ?? [];
        $isToday = $date === date('Y-m-d');
    ?>
        <div class="cal-day <?= $isToday ? 'cal-day-today' : '' ?>">
            <div class="cal-day-num"><?= $d ?><?php if ($isToday): ?> <span class="cal-today-dot"></span><?php endif; ?></div>
            <?php foreach ($dayItems as $it):
                $thumb = $media[$it['id']][0] ?? null;
            ?>
                <a class="cal-card" href="/calendar/<?= (int)$it['id'] ?>" title="<?= h($it['title']) ?>">
                    <?php if ($thumb && str_starts_with($thumb['mime_type'], 'image/')): ?>
                        <img class="cal-card-thumb" src="/uploads/<?= h($thumb['filename']) ?>" alt="">
                    <?php elseif ($thumb && str_starts_with($thumb['mime_type'], 'video/')): ?>
                        <div class="cal-card-thumb cal-card-video"><?= icon('film', 18) ?></div>
                    <?php else: ?>
                        <div class="cal-card-thumb cal-card-placeholder"><?= icon('image', 18) ?></div>
                    <?php endif; ?>
                    <div class="cal-card-body">
                        <div class="cal-card-title"><?= h($it['title']) ?></div>
                        <div class="cal-card-meta">
                            <span class="<?= media_class($it['media_type']) ?>"><?= h($it['media_type']) ?></span>
                            <span class="<?= status_class($it['status']) ?>"><?= h($it['status']) ?></span>
                        </div>
                    </div>
                </a>
            <?php endforeach; ?>
            <?php if (!$dayItems): ?>
                <a class="cal-add" href="/calendar/new?scheduled_for=<?= h($date) ?>">+ add</a>
            <?php endif; ?>
        </div>
    <?php endfor; ?>
</div>

<?php if ($items): ?>
<section class="card" style="margin-top:24px">
    <div class="card-head"><h2>All items this month <span class="muted">(<?= count($items) ?>)</span></h2></div>
    <div class="feature-grid">
        <?php foreach ($items as $it): $thumb = $media[$it['id']][0] ?? null; ?>
            <a class="feature-card" href="/calendar/<?= (int)$it['id'] ?>">
                <?php if ($thumb && str_starts_with($thumb['mime_type'], 'image/')): ?>
                    <div class="feature-thumb" style="padding:0;background:#0b0f1c">
                        <img src="/uploads/<?= h($thumb['filename']) ?>" style="width:100%;height:120px;object-fit:cover;display:block">
                    </div>
                <?php else: ?>
                    <div class="feature-thumb"><?= h(mb_substr($it['title'], 0, 1)) ?></div>
                <?php endif; ?>
                <div class="feature-body">
                    <div class="feature-title"><?= h($it['title']) ?></div>
                    <p class="feature-desc"><?= h(mb_substr($it['caption'] ?? '', 0, 100)) ?></p>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        <span class="<?= media_class($it['media_type']) ?>"><?= h($it['media_type']) ?></span>
                        <span class="<?= status_class($it['status']) ?>"><?= h($it['status']) ?></span>
                        <span class="muted tiny" style="margin-left:auto"><?= h($it['scheduled_for'] ?? '—') ?></span>
                    </div>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</section>
<?php endif; ?>

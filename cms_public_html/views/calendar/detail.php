<?php
/** @var array $item; @var array $media */
require_once __DIR__ . '/../_icons.php';
$mediaClass = match($item['media_type']) {
    'Reel','Video' => 'cal-tag cal-tag-rose',
    'Image','Carousel' => 'cal-tag cal-tag-indigo',
    'Story' => 'cal-tag cal-tag-amber',
    default => 'cal-tag cal-tag-gray',
};
?>
<div class="page-head">
    <div>
        <div class="muted tiny">Content #<?= (int)$item['id'] ?> · <?= h($item['platform']) ?></div>
        <h1><?= h($item['title']) ?></h1>
        <div class="pill-row">
            <span class="<?= $mediaClass ?>"><?= h($item['media_type']) ?></span>
            <span class="<?= status_class($item['status']) ?>"><?= h($item['status']) ?></span>
            <?php if ($item['scheduled_for']): ?><span class="muted tiny"><?= icon('calendar', 12) ?> Scheduled <?= h($item['scheduled_for']) ?></span><?php endif; ?>
            <?php if ($item['published_at']): ?><span class="muted tiny">Published <?= fmt_rel($item['published_at']) ?></span><?php endif; ?>
        </div>
    </div>
    <div class="page-head-actions">
        <?php if ($item['link']): ?>
            <a href="<?= h($item['link']) ?>" target="_blank" class="btn btn-ghost btn-sm">Open live ↗</a>
        <?php endif; ?>
        <?php if (is_admin()): ?>
            <form method="post" action="/calendar/<?= (int)$item['id'] ?>/delete" data-confirm="Delete this content item?" class="inline">
                <?= csrf_field() ?>
                <button class="btn btn-ghost btn-sm danger">Delete</button>
            </form>
        <?php endif; ?>
    </div>
</div>

<div class="grid-detail">
    <div>
        <section class="card">
            <div class="card-head"><h2>Media <span class="muted">(<?= count($media) ?>)</span></h2></div>
            <?php if ($media): ?>
                <div class="cal-media-grid">
                    <?php foreach ($media as $m): ?>
                        <a class="cal-media" href="/uploads/<?= h($m['filename']) ?>" target="_blank">
                            <?php if (str_starts_with($m['mime_type'], 'image/')): ?>
                                <img src="/uploads/<?= h($m['filename']) ?>" alt="">
                            <?php else: ?>
                                <video src="/uploads/<?= h($m['filename']) ?>" muted preload="metadata" playsinline></video>
                            <?php endif; ?>
                            <div class="cal-media-meta">
                                <span><?= h($m['original_name']) ?></span>
                                <span class="muted tiny"><?= round($m['size_bytes']/1024) ?> KB</span>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <p class="muted tiny">No media yet. Upload an image or video below.</p>
            <?php endif; ?>

            <form method="post" action="/calendar/<?= (int)$item['id'] ?>/upload" enctype="multipart/form-data" class="form" style="margin-top:10px">
                <?= csrf_field() ?>
                <label class="upload-drop" style="cursor:pointer;display:block">
                    <?= icon('upload', 20) ?>
                    <div style="margin-top:6px">Click to attach image or video (max 25 MB)</div>
                    <input type="file" name="file" accept="image/*,video/*" required style="display:none" data-autosubmit>
                </label>
            </form>
        </section>

        <section class="card">
            <div class="card-head"><h2>Caption</h2></div>
            <?php if ($item['caption']): ?>
                <p style="font-size:14px;color:var(--ink-700);white-space:pre-wrap"><?= h($item['caption']) ?></p>
            <?php else: ?>
                <p class="muted">No caption yet.</p>
            <?php endif; ?>
        </section>

        <section class="card">
            <div class="card-head"><h2>Hashtags</h2></div>
            <?php if ($item['hashtags']): ?>
                <div class="hashtags">
                    <?php foreach (preg_split('/[\s,]+/', trim($item['hashtags'])) as $tag): if (!$tag) continue; ?>
                        <span class="hashtag"><?= h(str_starts_with($tag, '#') ? $tag : '#' . $tag) ?></span>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <p class="muted">No hashtags yet.</p>
            <?php endif; ?>
        </section>
    </div>

    <aside>
        <section class="card form">
            <h2 style="margin-bottom:14px">Edit</h2>
            <form method="post" action="/calendar/<?= (int)$item['id'] ?>/edit">
                <?= csrf_field() ?>
                <label>Title<input name="title" required value="<?= h($item['title']) ?>"></label>
                <div class="form-row">
                    <label>Type<select name="media_type">
                        <?php foreach (['Image','Carousel','Reel','Video','Story','Post'] as $v): ?><option <?= $item['media_type']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
                    </select></label>
                    <label>Platform<select name="platform">
                        <?php foreach (['Instagram','Facebook','TikTok','YouTube','LinkedIn','X','Other'] as $v): ?><option <?= $item['platform']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
                    </select></label>
                </div>
                <div class="form-row">
                    <label>Status<select name="status">
                        <?php foreach (['Idea','Drafting','Ready','Scheduled','Published'] as $v): ?><option <?= $item['status']===$v?'selected':'' ?>><?= h($v) ?></option><?php endforeach; ?>
                    </select></label>
                    <label>Date<input type="date" name="scheduled_for" value="<?= h($item['scheduled_for']) ?>"></label>
                </div>
                <label>Caption<textarea name="caption" rows="4"><?= h($item['caption']) ?></textarea></label>
                <label>Hashtags<textarea name="hashtags" rows="2"><?= h($item['hashtags']) ?></textarea></label>
                <label>Link<input name="link" value="<?= h($item['link']) ?>"></label>
                <button class="btn btn-accent btn-block">Save</button>
            </form>
        </section>
    </aside>
</div>

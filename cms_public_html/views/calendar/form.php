<?php
/** @var ?array $item */
require_once __DIR__ . '/../_icons.php';
$i = $item ?? [];
$isEdit = !empty($i);
$presetDate = $_GET['scheduled_for'] ?? ($i['scheduled_for'] ?? '');
?>
<div class="page-head">
    <div>
        <h1><?= $isEdit ? 'Edit Content' : 'New Content' ?></h1>
        <p class="muted">Add the piece you created — image, reel, or video — with caption and hashtags.</p>
    </div>
</div>

<form method="post" action="<?= $isEdit ? '/calendar/' . (int)$i['id'] . '/edit' : '/calendar' ?>" class="card form">
    <?= csrf_field() ?>
    <label>Title<input name="title" required value="<?= h($i['title'] ?? '') ?>" placeholder="Short internal name — e.g. &quot;Walk-in fridge reel, Apr week 2&quot;"></label>

    <div class="form-row">
        <label>Media Type
            <select name="media_type">
                <?php foreach (['Image','Carousel','Reel','Video','Story','Post'] as $v): ?>
                    <option <?= ($i['media_type'] ?? 'Post')===$v?'selected':'' ?>><?= h($v) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Platform
            <select name="platform">
                <?php foreach (['Instagram','Facebook','TikTok','YouTube','LinkedIn','X','Other'] as $v): ?>
                    <option <?= ($i['platform'] ?? 'Instagram')===$v?'selected':'' ?>><?= h($v) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <div class="form-row">
        <label>Status
            <select name="status">
                <?php foreach (['Idea','Drafting','Ready','Scheduled','Published'] as $v): ?>
                    <option <?= ($i['status'] ?? 'Idea')===$v?'selected':'' ?>><?= h($v) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Scheduled for<input type="date" name="scheduled_for" value="<?= h($presetDate) ?>"></label>
    </div>

    <label>Caption
        <textarea name="caption" rows="5" placeholder="The copy that goes with the post…"><?= h($i['caption'] ?? '') ?></textarea>
    </label>

    <label>Hashtags
        <textarea name="hashtags" rows="3" placeholder="#kitchen #restaurantlife #hirayadigital"><?= h($i['hashtags'] ?? '') ?></textarea>
    </label>

    <label>Link (live URL, if published)
        <input name="link" value="<?= h($i['link'] ?? '') ?>" placeholder="https://…">
    </label>

    <div class="form-actions">
        <a href="<?= $isEdit ? '/calendar/' . (int)$i['id'] : '/calendar' ?>" class="btn btn-ghost">Cancel</a>
        <button class="btn btn-accent"><?= $isEdit ? 'Save changes' : 'Add content' ?></button>
    </div>
</form>

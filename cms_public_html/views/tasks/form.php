<?php
/** @var ?array $task */
require_once __DIR__ . '/../_icons.php';
$t = $task ?? [];
$isEdit = !empty($t);
?>
<div class="page-head">
    <div>
        <h1><?= $isEdit ? 'Edit Task' : 'New Task' ?></h1>
        <p class="muted">Structured input beats a WhatsApp paragraph.</p>
    </div>
</div>

<form method="post" action="<?= $isEdit ? '/tasks/' . (int)$t['id'] . '/edit' : '/tasks' ?>" class="card form" enctype="multipart/form-data">
    <?= csrf_field() ?>

    <label>Title
        <input name="title" required value="<?= h($t['title'] ?? '') ?>" placeholder="Short, action-oriented title">
    </label>

    <div class="form-row">
        <label>Task Type
            <select name="task_type">
                <?php foreach (['Bug','Feature','UI Change'] as $v): ?>
                    <option <?= ($t['task_type'] ?? 'Feature')===$v?'selected':'' ?>><?= h($v) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Priority
            <select name="priority">
                <?php foreach (['Low','Medium','High'] as $v): ?>
                    <option <?= ($t['priority'] ?? 'Medium')===$v?'selected':'' ?>><?= h($v) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>

    <label>Description
        <textarea name="description" rows="4" placeholder="What needs to happen and why. You can paste screenshots below."><?= h($t['description'] ?? '') ?></textarea>
    </label>

    <label>Expected Behavior <span class="muted tiny">(required before work can start)</span>
        <textarea name="expected_behavior" rows="3" placeholder="Concrete, observable outcome. What should be true when this is done?"><?= h($t['expected_behavior'] ?? '') ?></textarea>
    </label>

    <?php if (!$isEdit): ?>
    <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:500;color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">
            Attachments
        </div>
        <div class="media-zone" data-paste-zone tabindex="0">
            <input type="file" name="files[]" multiple accept="image/*,video/*,application/pdf" hidden data-file-input>
            <div class="media-zone-inner" data-media-prompt>
                <div class="media-zone-ico"><?= icon('upload', 24) ?></div>
                <div class="media-zone-title">Drop files, click to browse, or paste screenshots</div>
                <div class="media-zone-hint">PNG · JPG · GIF · WebP · MP4 · MOV · PDF — up to 25 MB each</div>
            </div>
            <div class="media-previews" data-previews></div>
        </div>
    </div>
    <?php endif; ?>

    <div class="form-actions">
        <a href="<?= $isEdit ? '/tasks/' . (int)$t['id'] : '/tasks' ?>" class="btn btn-ghost">Cancel</a>
        <button class="btn btn-accent" type="submit"><?= $isEdit ? 'Save' : 'Create task' ?></button>
    </div>
</form>

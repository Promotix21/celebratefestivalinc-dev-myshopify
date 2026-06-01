<?php
/** @var string $__content */
/** @var string $__title */
require_once __DIR__ . '/_icons.php';
$me = current_user();
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$f = flash();
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= h($__title) ?> · Project Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css?v=<?= h(@filemtime(__DIR__ . '/../public/style.css') ?: time()) ?>">
</head>
<body<?= !empty($bare) ? ' class="bare"' : '' ?>>
<?php if (!empty($bare)): ?>
    <?= $__content ?>
<?php else: ?>
<div class="app">
    <aside class="sidebar">
        <a href="/" class="brand brand-logo" aria-label="Hiraya Digital">
            <img src="/hiraya-white.png" alt="Hiraya Digital">
        </a>

        <div>
            <div class="nav-section-label">Workspace</div>
            <nav class="nav">
                <a href="/"         class="<?= $path === '/' ? 'active' : '' ?>"><span class="nav-ico"><?= icon('grid') ?></span> Dashboard</a>
                <a href="/tasks"    class="<?= str_starts_with($path, '/tasks') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('check') ?></span> Tasks</a>
                <a href="/features" class="<?= str_starts_with($path, '/features') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('sparkles') ?></span> Features</a>
                <a href="/calendar" class="<?= str_starts_with($path, '/calendar') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('calendar') ?></span> Content Calendar</a>
                <a href="/docs"     class="<?= str_starts_with($path, '/docs') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('book') ?></span> Documentation</a>
                <a href="/activity" class="<?= str_starts_with($path, '/activity') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('clock') ?></span> Activity</a>
                <a href="/notifications" class="<?= str_starts_with($path, '/notifications') ? 'active' : '' ?>"><span class="nav-ico"><?= icon('bell') ?></span> Email Templates</a>
            </nav>
        </div>

        <div class="sidebar-foot">
            <a href="/tasks/new" class="btn btn-accent btn-block"><?= icon('plus',14) ?> New Task</a>
            <div class="workspace-card">
                <span class="dot"></span>
                <div>
                    <div style="font-size:12.5px;font-weight:600;color:#fff"><?= h($me['display_name'] ?? $me['username']) ?></div>
                    <small><?= h(ucfirst($me['role'])) ?> · signed in</small>
                </div>
            </div>
        </div>
    </aside>

    <main class="main">
        <header class="topbar">
            <div class="crumb">
                <?= icon('chevron', 14) ?>
                <strong><?= h($__title) ?></strong>
            </div>
            <div class="search">
                <?= icon('search') ?>
                <input type="search" data-search placeholder="Quick search — tasks, features, docs…">
                <span class="kbd">⌘K</span>
            </div>
            <div class="topbar-right">
                <button class="icon-btn" title="Notifications"><?= icon('bell') ?><span class="badge"></span></button>
                <div class="user">
                    <div class="avatar"><?= h(strtoupper(substr($me['display_name'] ?? $me['username'], 0, 1))) ?></div>
                    <div>
                        <div class="user-name"><?= h($me['display_name'] ?? $me['username']) ?></div>
                        <div class="user-role"><?= h(ucfirst($me['role'])) ?></div>
                    </div>
                </div>
                <form method="post" action="/logout" class="inline">
                    <?= csrf_field() ?>
                    <button class="btn btn-ghost btn-sm">Sign out</button>
                </form>
            </div>
        </header>

        <?php if ($f): ?>
            <div class="flash flash-<?= h($f['type']) ?>"><?= h($f['msg']) ?></div>
        <?php endif; ?>

        <section class="content">
            <?= $__content ?>
        </section>
    </main>
</div>
<?php endif; ?>
<script src="/app.js?v=<?= h(@filemtime(__DIR__ . '/../public/app.js') ?: time()) ?>"></script>
</body>
</html>

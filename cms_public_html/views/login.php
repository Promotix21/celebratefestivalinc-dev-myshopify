<?php require_once __DIR__ . '/_icons.php'; $f = flash(); ?>
<div class="login-split">
    <aside class="login-side">
        <div class="login-side-inner">
            <header class="login-top">
                <a href="/" class="brand brand-logo">
                    <img src="/hiraya-white.png" alt="Hiraya Digital">
                </a>
            </header>

            <div class="login-copy">
                <div class="kicker">Project Workspace</div>
                <h1 class="login-headline">From scattered chats to a single, structured kitchen for every task.</h1>
                <p class="login-sub">Track every bug, feature, deliverable and deadline in one place — with timestamps, accountability, and a clean paper trail.</p>
                <ul class="login-bullets">
                    <li><?= icon('check', 18) ?> Structured intake — no more ambiguous requests</li>
                    <li><?= icon('check', 18) ?> Live ETAs, timelines &amp; audit trail for every task</li>
                    <li><?= icon('check', 18) ?> A dedicated space for shipped features &amp; docs</li>
                </ul>
            </div>

            <footer class="login-quote">
                "Unstructured communication → structured execution.<br>Task executor → system owner."
            </footer>
        </div>
    </aside>

    <div class="login-form-wrap">
        <div class="login-card">
            <h1>Welcome back</h1>
            <p class="sub">Sign in to continue to your workspace.</p>

            <?php if ($f): ?><div class="flash flash-<?= h($f['type']) ?>"><?= h($f['msg']) ?></div><?php endif; ?>

            <form method="post" action="/login" class="form">
                <?= csrf_field() ?>
                <label>Username<input name="username" required autofocus autocomplete="username"></label>
                <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
                <button class="btn btn-accent btn-block" type="submit">Sign in <?= icon('arrow-right', 15) ?></button>
            </form>

            <p class="muted tiny" style="margin-top:20px;text-align:center">
                Protected workspace · access by invitation only.
            </p>
        </div>
    </div>
</div>

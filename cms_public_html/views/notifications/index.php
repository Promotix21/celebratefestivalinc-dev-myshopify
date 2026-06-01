<?php
/** @var array $manifest */
require_once __DIR__ . '/../_icons.php';
?>
<div class="page-head">
    <div>
        <h1>Email Templates</h1>
        <p class="muted">Shopify notification email templates — copy the code and paste it in <strong>Shopify Admin → Settings → Notifications</strong>.</p>
    </div>
</div>

<div class="card" style="padding:0;overflow:hidden">
    <div style="padding:16px 24px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:10px">
        <span style="font-size:13px;color:#6b7280"><?= icon('bell',14) ?></span>
        <span style="font-size:13px;color:#374151;font-weight:500">How to use: Click <strong>Copy Code</strong> on any template, then go to Shopify Admin → Settings → Notifications → select the notification type → paste the code.</span>
    </div>

    <div class="tpl-list">
        <?php foreach ($manifest as $slug => $tpl): ?>
        <div class="tpl-row" id="tpl-<?= h($slug) ?>">
            <div class="tpl-info">
                <div class="tpl-label"><?= h($tpl['label']) ?></div>
                <div class="tpl-desc muted"><?= h($tpl['description']) ?></div>
                <div class="tpl-subject">
                    <span class="tpl-subject-tag">Subject</span>
                    <code><?= h($tpl['subject']) ?></code>
                </div>
            </div>
            <div class="tpl-actions">
                <button class="btn btn-ghost btn-sm tpl-copy-btn" data-slug="<?= h($slug) ?>" title="Copy template code to clipboard">
                    <?= icon('upload', 14) ?> Copy Code
                </button>
                <a href="/notifications/download?file=<?= h($slug) ?>" class="btn btn-ghost btn-sm" title="Download as .liquid file">
                    <?= icon('arrow-right', 14) ?> Download
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<style>
.tpl-list { display: flex; flex-direction: column; }
.tpl-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 24px;
    border-bottom: 1px solid #f1f3f4;
    transition: background 0.15s;
}
.tpl-row:last-child { border-bottom: none; }
.tpl-row:hover { background: #fafafa; }
.tpl-info { flex: 1; min-width: 0; }
.tpl-label { font-weight: 600; font-size: 14.5px; color: #111827; margin-bottom: 2px; }
.tpl-desc { font-size: 13px; margin-bottom: 8px; }
.tpl-subject {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.tpl-subject-tag {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6366f1;
    background: #eef2ff;
    padding: 2px 7px;
    border-radius: 4px;
    white-space: nowrap;
}
.tpl-subject code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #374151;
    background: #f3f4f6;
    padding: 2px 7px;
    border-radius: 4px;
    word-break: break-all;
}
.tpl-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}
.tpl-copy-btn.copied {
    color: #059669;
    border-color: #059669;
}
</style>

<script>
(function() {
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function(resolve, reject) {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
                resolve();
            } catch(err) {
                reject(err);
            }
            document.body.removeChild(ta);
        });
    }

    document.querySelectorAll('.tpl-copy-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var slug = btn.dataset.slug;
            fetch('/notifications/download?file=' + encodeURIComponent(slug))
                .then(function(r) { return r.text(); })
                .then(function(code) {
                    copyText(code).then(function() {
                        var orig = btn.innerHTML;
                        btn.classList.add('copied');
                        btn.textContent = '✓ Copied!';
                        setTimeout(function() {
                            btn.classList.remove('copied');
                            btn.innerHTML = orig;
                        }, 2200);
                    }).catch(function() {
                        alert('Copy failed — please use the Download button instead.');
                    });
                })
                .catch(function() {
                    alert('Could not load template — please use the Download button instead.');
                });
        });
    });
})();
</script>

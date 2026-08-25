<?php
/**
 * @var array $stats
 * @var array $brands
 * @var array $products
 * @var array $categories
 * @var array $links
 * @var array $restrictions
 * @var bool $is_admin
 */
?>
<style>
.lib-stats { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.lib-stat-card { background: var(--bg-card); padding: 1.2rem; border-radius: 8px; border: 1px solid var(--border); flex: 1; min-width: 150px; text-align: center; }
.lib-stat-val { font-size: 2rem; font-weight: 700; color: var(--text-main); line-height: 1; margin-bottom: 0.5rem; }
.lib-stat-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.lib-tabs { display: flex; gap: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
.lib-tab { padding: 0.5rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500; color: var(--text-muted); }
.lib-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

.lib-pane { display: none; }
.lib-pane.active { display: block; }

.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.badge.approved { background: #d1fae5; color: #065f46; }
.badge.restricted { background: #fee2e2; color: #991b1b; }
.badge.needs_verification { background: #fef3c7; color: #92400e; }
.badge.inactive { background: #f3f4f6; color: #374151; }
.badge.excel { background: #e0e7ff; color: #3730a3; }
.badge.manual, .badge.current_addition { background: #ede9fe; color: #5b21b6; }

.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th, .table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); text-align: left; }
.table th { color: var(--text-muted); font-weight: 600; }
.table tbody tr:hover { background: var(--bg-card); }
</style>

<div class="header-split" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
    <h1 style="margin:0;">Product & Brand Library</h1>
    <?php if ($is_admin): ?>
        <button class="btn btn-accent btn-sm" onclick="alert('Demo: open add modal')">+ Add New</button>
    <?php endif; ?>
</div>

<div class="lib-stats">
    <div class="lib-stat-card"><div class="lib-stat-val"><?= $stats['brands'] ?></div><div class="lib-stat-label">Brands</div></div>
    <div class="lib-stat-card"><div class="lib-stat-val"><?= $stats['refs'] ?></div><div class="lib-stat-label">References</div></div>
    <div class="lib-stat-card"><div class="lib-stat-val"><?= $stats['original_placements'] ?></div><div class="lib-stat-label">Original Placements</div></div>
    <div class="lib-stat-card"><div class="lib-stat-val"><?= $stats['approved'] ?></div><div class="lib-stat-label">Approved</div></div>
    <div class="lib-stat-card"><div class="lib-stat-val"><?= $stats['restricted'] ?></div><div class="lib-stat-label" style="color:var(--danger)">Restricted</div></div>
</div>

<div class="lib-tabs">
    <div class="lib-tab active" data-target="brands">BRANDS</div>
    <div class="lib-tab" data-target="products">PRODUCTS</div>
    <div class="lib-tab" data-target="categories">CATEGORIES</div>
    <div class="lib-tab" data-target="links">LINKS / ASSETS</div>
    <div class="lib-tab" data-target="restrictions">RESTRICTIONS</div>
</div>

<div id="brands" class="lib-pane active">
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Origin</th>
                    <th>Notes</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($brands as $b): ?>
                <tr>
                    <td><strong><?= h($b['name']) ?></strong></td>
                    <td><span class="badge <?= h($b['marketing_status']) ?>"><?= h(strtoupper($b['marketing_status'])) ?></span></td>
                    <td><span class="badge <?= h($b['origin']) ?>"><?= h(str_replace('_', ' ', $b['origin'])) ?></span></td>
                    <td style="color:var(--text-muted); font-size:0.8rem"><?= h($b['notes'] ?: '-') ?></td>
                    <?php if ($is_admin): ?>
                        <td><button class="btn btn-ghost btn-sm">Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<div id="products" class="lib-pane">
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Status</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($products)): ?>
                    <tr><td colspan="5" style="text-align:center; padding: 2rem;">No products yet.</td></tr>
                <?php else: ?>
                    <?php foreach ($products as $p): ?>
                    <tr>
                        <td><strong><?= h($p['product_name']) ?></strong></td>
                        <td><?= h($p['brand_name'] ?: '-') ?></td>
                        <td><?= h($p['category_name'] ?: '-') ?></td>
                        <td><span class="badge <?= h($p['marketing_status'] ?: 'inactive') ?>"><?= h($p['marketing_status'] ?: 'N/A') ?></span></td>
                        <?php if ($is_admin): ?>
                            <td><button class="btn btn-ghost btn-sm">Edit</button></td>
                        <?php endif; ?>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<div id="categories" class="lib-pane">
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Sort Order</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($categories as $c): ?>
                <tr>
                    <td><strong><?= h($c['name']) ?></strong></td>
                    <td><?= h($c['sort_order']) ?></td>
                    <?php if ($is_admin): ?>
                        <td><button class="btn btn-ghost btn-sm">Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<div id="links" class="lib-pane">
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Label</th>
                    <th>URL</th>
                    <th>Type</th>
                    <th>Associated</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($links)): ?>
                    <tr><td colspan="4" style="text-align:center; padding: 2rem;">No links seeded yet.</td></tr>
                <?php else: ?>
                    <?php foreach ($links as $l): ?>
                    <tr>
                        <td><?= h($l['label']) ?></td>
                        <td><a href="<?= h($l['url']) ?>" target="_blank">Open Link</a></td>
                        <td><span class="badge excel"><?= h($l['link_type']) ?></span></td>
                        <td><?= h($l['product_name'] ?: $l['category_name'] ?: '-') ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<div id="restrictions" class="lib-pane">
    <div class="card" style="padding:0; border: 1px solid var(--danger);">
        <table class="table">
            <thead>
                <tr>
                    <th>Target</th>
                    <th>Restriction</th>
                    <th>Severity</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($restrictions as $r): ?>
                <tr>
                    <td><strong><?= h($r['brand_name'] ?: $r['product_name'] ?: 'Global') ?></strong></td>
                    <td><?= h($r['restriction']) ?></td>
                    <td><span class="badge restricted"><?= h(strtoupper($r['severity'])) ?></span></td>
                    <?php if ($is_admin): ?>
                        <td><button class="btn btn-ghost btn-sm">Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
document.querySelectorAll('.lib-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lib-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
    });
});
</script>

<script>
// Simple client-side search and filter logic
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('[data-search]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('.lib-pane.active tbody tr').forEach(tr => {
                const text = tr.textContent.toLowerCase();
                tr.style.display = text.includes(val) ? '' : 'none';
            });
        });
    }
});
</script>

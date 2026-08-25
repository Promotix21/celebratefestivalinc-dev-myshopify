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
$brand_statuses = ['approved', 'restricted', 'needs_verification', 'inactive'];
$brand_origins = ['excel', 'current_addition', 'manual'];
$link_types = ['celebrate_product', 'celebrate_collection', 'google_drive_asset', 'manufacturer', 'supplier', 'external_reference', 'other'];
$verification_statuses = ['pending', 'verified', 'broken', 'outdated'];
$severities = ['low', 'medium', 'high'];
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

.lib-toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem; }
.lib-toolbar input[type="search"], .lib-toolbar select { padding: 0.45rem 0.7rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-main); font-size: 0.85rem; }
.lib-toolbar input[type="search"] { min-width: 220px; }
.lib-toolbar .spacer { flex: 1; }

.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.badge.approved { background: #d1fae5; color: #065f46; }
.badge.restricted { background: #fee2e2; color: #991b1b; }
.badge.needs_verification { background: #fef3c7; color: #92400e; }
.badge.inactive { background: #f3f4f6; color: #374151; }
.badge.excel { background: #e0e7ff; color: #3730a3; }
.badge.manual, .badge.current_addition { background: #ede9fe; color: #5b21b6; }
.badge.high { background: #fee2e2; color: #991b1b; }
.badge.medium { background: #fef3c7; color: #92400e; }
.badge.low { background: #f3f4f6; color: #374151; }

.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th, .table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); text-align: left; }
.table th { color: var(--text-muted); font-weight: 600; }
.table tbody tr:hover { background: var(--bg-card); }
.table .empty-row td { text-align: center; padding: 2rem; color: var(--text-muted); }

.lib-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); display: flex; align-items: flex-start; justify-content: center; padding: 4vh 1rem; overflow-y: auto; z-index: 100; }
.lib-modal-overlay.hidden { display: none; }
.lib-modal { background: var(--bg-card, #fff); border-radius: 10px; padding: 1.5rem; width: 100%; max-width: 520px; border: 1px solid var(--border); }
.lib-modal h3 { margin-top: 0; }
.lib-modal label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin: 0.75rem 0 0.25rem; }
.lib-modal input, .lib-modal select, .lib-modal textarea { width: 100%; padding: 0.5rem 0.6rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-main, #fff); color: var(--text-main); font-size: 0.9rem; box-sizing: border-box; }
.lib-modal textarea { resize: vertical; min-height: 60px; }
.lib-modal .lib-modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem; }
.lib-target-group { display: none; }
.lib-target-group.active { display: block; }

/* ---- Restrictions tab polish ---- */
.lib-restrictions-table td { vertical-align: top; }
.lib-restrictions-table tbody tr { transition: background 0.15s ease; }
.lib-restr-target-title { font-weight: 700; color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.4rem; line-height: 1.35; }
.lib-restr-type-chip { display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.12rem 0.45rem; border-radius: 999px; margin-right: 0.4rem; vertical-align: middle; }
.lib-restr-type-chip.creative_asset { background: #fee2e2; color: #991b1b; }
.lib-restr-type-chip.brand { background: #e0e7ff; color: #3730a3; }
.lib-restr-type-chip.product { background: #dbeafe; color: #1e40af; }
.lib-restr-type-chip.link { background: #ede9fe; color: #5b21b6; }
.lib-restr-type-chip.global { background: #f3f4f6; color: #374151; }
.lib-restr-meta { font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; }
.lib-restr-meta strong { color: var(--text-main); }
.lib-pill-reject { display: inline-block; background: var(--danger, #dc2626); color: #fff; font-weight: 700; font-size: 0.68rem; letter-spacing: 0.04em; padding: 0.14rem 0.5rem; border-radius: 5px; }
.lib-note { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem; font-style: italic; }

.lib-evidence { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-start; margin-top: 0.65rem; }
.lib-ev-thumb { position: relative; padding: 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: zoom-in; background: var(--bg-card); width: 92px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.lib-ev-thumb img { display: block; width: 92px; height: 72px; object-fit: cover; }
.lib-ev-thumb .lib-ev-label { display: block; font-size: 0.6rem; font-weight: 600; text-align: center; padding: 0.2rem; color: var(--text-muted); background: var(--bg-card); border-top: 1px solid var(--border); }
.lib-ev-thumb:hover { border-color: var(--accent); }
.lib-ev-doc { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; padding: 0.4rem 0.6rem; border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text-main); background: var(--bg-card); }
.lib-ev-chip { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; padding: 0.35rem 0.55rem; border: 1px solid var(--border); border-radius: 999px; text-decoration: none; color: var(--accent); background: var(--bg-card); }
.lib-ev-empty { font-size: 0.72rem; color: var(--text-muted); font-style: italic; padding: 0.3rem 0; }
.lib-ev-archive { position: absolute; top: 2px; right: 2px; }
.lib-ev-archive button { background: rgba(15,23,42,0.72); color: #fff; border: 0; border-radius: 50%; width: 18px; height: 18px; line-height: 1; font-size: 0.7rem; cursor: pointer; padding: 0; }
.lib-ev-cell { display: inline-flex; flex-direction: column; align-items: center; }
.btn-xs { font-size: 0.7rem !important; padding: 0.25rem 0.5rem !important; }

.lib-preview-img { max-width: 100%; max-height: 62vh; border-radius: 8px; display: block; margin: 0 auto; border: 1px solid var(--border); }
.lib-preview-meta { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.85rem; line-height: 1.7; }
.lib-preview-meta strong { color: var(--text-main); }
</style>

<div class="header-split" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
    <h1 style="margin:0;">Product & Brand Library</h1>
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

<div class="lib-toolbar">
    <input type="search" data-lib-search placeholder="Search the active tab…">
</div>

<!-- ===================== BRANDS ===================== -->
<div id="brands" class="lib-pane active">
    <div class="lib-toolbar">
        <select data-lib-filter="status">
            <option value="">All statuses</option>
            <?php foreach ($brand_statuses as $s): ?><option value="<?= h($s) ?>"><?= h(ucwords(str_replace('_',' ',$s))) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="origin">
            <option value="">All origins</option>
            <?php foreach ($brand_origins as $o): ?><option value="<?= h($o) ?>"><?= h(ucwords(str_replace('_',' ',$o))) ?></option><?php endforeach; ?>
        </select>
        <div class="spacer"></div>
        <?php if ($is_admin): ?><button type="button" class="btn btn-accent btn-sm" data-modal-open="modal-brand-add">+ Add Brand</button><?php endif; ?>
    </div>
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
                <?php if (empty($brands)): ?>
                    <tr class="empty-row"><td colspan="5">No brands yet.</td></tr>
                <?php endif; ?>
                <?php foreach ($brands as $b): ?>
                <tr data-row-id="<?= (int)$b['id'] ?>" data-f-status="<?= h($b['marketing_status']) ?>" data-f-origin="<?= h($b['origin']) ?>">
                    <td><strong><?= h($b['name']) ?></strong></td>
                    <td><span class="badge <?= h($b['marketing_status']) ?>"><?= h(strtoupper($b['marketing_status'])) ?></span></td>
                    <td><span class="badge <?= h($b['origin']) ?>"><?= h(str_replace('_', ' ', $b['origin'])) ?></span></td>
                    <td style="color:var(--text-muted); font-size:0.8rem"><?= h($b['notes'] ?: '-') ?></td>
                    <?php if ($is_admin): ?>
                        <td><button type="button" class="btn btn-ghost btn-sm"
                            data-modal-open="modal-brand-edit"
                            data-edit-action="/library/brands/<?= (int)$b['id'] ?>/edit"
                            data-edit-row='<?= h(json_encode(['name'=>$b['name'],'status'=>$b['marketing_status'],'origin'=>$b['origin'],'notes'=>$b['notes']])) ?>'
                        >Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ===================== PRODUCTS ===================== -->
<div id="products" class="lib-pane">
    <div class="lib-toolbar">
        <select data-lib-filter="brand">
            <option value="">All brands</option>
            <?php foreach ($brands as $b): ?><option value="<?= h($b['name']) ?>"><?= h($b['name']) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="category">
            <option value="">All categories</option>
            <?php foreach ($categories as $c): ?><option value="<?= h($c['name']) ?>"><?= h($c['name']) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="status">
            <option value="">All statuses</option>
            <?php foreach ($brand_statuses as $s): ?><option value="<?= h($s) ?>"><?= h(ucwords(str_replace('_',' ',$s))) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="source">
            <option value="">All sources</option>
            <option value="excel">Excel</option>
            <option value="manual">Manual</option>
        </select>
        <div class="spacer"></div>
        <?php if ($is_admin): ?><button type="button" class="btn btn-accent btn-sm" data-modal-open="modal-product-add">+ Add Product</button><?php endif; ?>
    </div>
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
                    <tr class="empty-row"><td colspan="5">No products yet.</td></tr>
                <?php else: ?>
                    <?php foreach ($products as $p): ?>
                    <tr data-row-id="<?= (int)$p['id'] ?>"
                        data-f-brand="<?= h($p['brand_name'] ?? '') ?>"
                        data-f-category="<?= h($p['category_name'] ?? '') ?>"
                        data-f-status="<?= h($p['marketing_status'] ?: '') ?>"
                        data-f-source="<?= h($p['source'] ?: '') ?>">
                        <td><strong><?= h($p['product_name']) ?></strong></td>
                        <td><?= h($p['brand_name'] ?: '-') ?></td>
                        <td><?= h($p['category_name'] ?: '-') ?></td>
                        <td><span class="badge <?= h($p['marketing_status'] ?: 'inactive') ?>"><?= h($p['marketing_status'] ?: 'N/A') ?></span></td>
                        <?php if ($is_admin): ?>
                            <td><button type="button" class="btn btn-ghost btn-sm"
                                data-modal-open="modal-product-edit"
                                data-edit-action="/library/products/<?= (int)$p['id'] ?>/edit"
                                data-edit-row='<?= h(json_encode([
                                    'product_name'=>$p['product_name'],'brand_id'=>$p['brand_id'],'category_id'=>$p['category_id'],
                                    'marketing_status'=>$p['marketing_status'],'celebrate_url'=>$p['celebrate_url'],'image_url'=>$p['image_url'],
                                    'manufacturer_url'=>$p['manufacturer_url'],'notes'=>$p['notes'],'last_verified_at'=>$p['last_verified_at'],
                                ])) ?>'
                            >Edit</button></td>
                        <?php endif; ?>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ===================== CATEGORIES ===================== -->
<div id="categories" class="lib-pane">
    <div class="lib-toolbar">
        <div class="spacer"></div>
        <?php if ($is_admin): ?><button type="button" class="btn btn-accent btn-sm" data-modal-open="modal-category-add">+ Add Category</button><?php endif; ?>
    </div>
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Sort Order</th>
                    <th>Current Status</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($categories)): ?>
                    <tr class="empty-row"><td colspan="4">No categories yet.</td></tr>
                <?php endif; ?>
                <?php foreach ($categories as $c): ?>
                <tr data-row-id="<?= (int)$c['id'] ?>">
                    <td><strong><?= h($c['name']) ?></strong></td>
                    <td><?= h($c['sort_order']) ?></td>
                    <td><?= h($c['current_status'] ?: '-') ?></td>
                    <?php if ($is_admin): ?>
                        <td><button type="button" class="btn btn-ghost btn-sm"
                            data-modal-open="modal-category-edit"
                            data-edit-action="/library/categories/<?= (int)$c['id'] ?>/edit"
                            data-edit-row='<?= h(json_encode(['name'=>$c['name'],'sort_order'=>$c['sort_order'],'historical_status'=>$c['historical_status'],'current_status'=>$c['current_status']])) ?>'
                        >Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ===================== LINKS / ASSETS ===================== -->
<div id="links" class="lib-pane">
    <div class="lib-toolbar">
        <select data-lib-filter="linktype">
            <option value="">All link types</option>
            <?php foreach ($link_types as $lt): ?><option value="<?= h($lt) ?>"><?= h(str_replace('_',' ',$lt)) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="category">
            <option value="">All categories</option>
            <?php foreach ($categories as $c): ?><option value="<?= h($c['name']) ?>"><?= h($c['name']) ?></option><?php endforeach; ?>
        </select>
        <select data-lib-filter="verification">
            <option value="">All verification states</option>
            <?php foreach ($verification_statuses as $vs): ?><option value="<?= h($vs) ?>"><?= h(ucfirst($vs)) ?></option><?php endforeach; ?>
        </select>
        <div class="spacer"></div>
        <?php if ($is_admin): ?><button type="button" class="btn btn-accent btn-sm" data-modal-open="modal-link-add">+ Add Link</button><?php endif; ?>
    </div>
    <div class="card" style="padding:0">
        <table class="table">
            <thead>
                <tr>
                    <th>Label</th>
                    <th>URL</th>
                    <th>Type</th>
                    <th>Associated</th>
                    <th>Verification</th>
                    <?php if ($is_admin): ?><th>Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($links)): ?>
                    <tr class="empty-row"><td colspan="6">No links seeded yet.</td></tr>
                <?php else: ?>
                    <?php foreach ($links as $l): ?>
                    <tr data-row-id="<?= (int)$l['id'] ?>"
                        data-f-linktype="<?= h($l['link_type']) ?>"
                        data-f-category="<?= h($l['category_name'] ?? '') ?>"
                        data-f-verification="<?= h($l['verification_status'] ?: '') ?>">
                        <td><?= h($l['label']) ?></td>
                        <td><a href="<?= h($l['url']) ?>" target="_blank" rel="noopener">Open Link</a></td>
                        <td><span class="badge excel"><?= h($l['link_type']) ?></span></td>
                        <td><?= h($l['product_name'] ?: $l['category_name'] ?: '-') ?></td>
                        <td><?= h($l['verification_status'] ?: 'pending') ?></td>
                        <?php if ($is_admin): ?>
                            <td><button type="button" class="btn btn-ghost btn-sm"
                                data-modal-open="modal-link-edit"
                                data-edit-action="/library/links/<?= (int)$l['id'] ?>/edit"
                                data-edit-row='<?= h(json_encode([
                                    'label'=>$l['label'],'url'=>$l['url'],'link_type'=>$l['link_type'],'product_id'=>$l['product_id'],
                                    'category_id'=>$l['category_id'],'source_sheet'=>$l['source_sheet'],'source_cell'=>$l['source_cell'],
                                    'verification_status'=>$l['verification_status'],'notes'=>$l['notes'],
                                ])) ?>'
                            >Edit</button></td>
                        <?php endif; ?>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ===================== RESTRICTIONS ===================== -->
<div id="restrictions" class="lib-pane">
    <div class="lib-toolbar">
        <select data-lib-filter="severity">
            <option value="">All severities</option>
            <?php foreach ($severities as $sv): ?><option value="<?= h($sv) ?>"><?= h(ucfirst($sv)) ?></option><?php endforeach; ?>
        </select>
        <div class="spacer"></div>
        <?php if ($is_admin): ?><button type="button" class="btn btn-accent btn-sm" data-modal-open="modal-restriction-add">+ Add Restriction</button><?php endif; ?>
    </div>
    <div class="card" style="padding:0; border: 1px solid var(--danger); overflow:hidden;">
        <table class="table lib-restrictions-table">
            <thead>
                <tr>
                    <th style="width:44%">Target &amp; Evidence</th>
                    <th>Restriction</th>
                    <th style="width:110px">Severity</th>
                    <?php if ($is_admin): ?><th style="width:150px">Actions</th><?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($restrictions)): ?>
                    <tr class="empty-row"><td colspan="<?= $is_admin ? 4 : 3 ?>">No active restrictions.</td></tr>
                <?php endif; ?>
                <?php foreach ($restrictions as $r):
                    // A stored target_type (e.g. an image-only creative asset with no
                    // brand/product/link row) always wins; otherwise infer from ids.
                    if (($r['target_type'] ?? '') === 'creative_asset') {
                        $target_type = 'creative_asset';
                        $target_label = 'Creative Asset — ' . ($r['target_label'] ?: 'Restricted image');
                    } elseif (!empty($r['link_id'])) {
                        $target_type = 'link';
                        $target_label = 'Asset: ' . $r['link_label'];
                    } elseif (!empty($r['brand_id'])) {
                        $target_type = 'brand';
                        $target_label = 'Brand: ' . $r['brand_name'];
                    } elseif (!empty($r['product_id'])) {
                        $target_type = 'product';
                        $target_label = 'Product: ' . $r['product_name'];
                    } else {
                        $target_type = 'global';
                        $target_label = 'Global';
                    }
                    $evs = $evidence[$r['id']] ?? [];
                ?>
                <tr data-row-id="<?= (int)$r['id'] ?>" data-f-severity="<?= h($r['severity']) ?>">
                    <td>
                        <div class="lib-restr-target-title">
                            <span class="lib-restr-type-chip <?= h($target_type) ?>"><?= h(str_replace('_',' ',$target_type)) ?></span>
                            <?= h($target_label) ?>
                        </div>
                        <?php if ($target_type === 'creative_asset'): ?>
                            <div class="lib-restr-meta">
                                <div><strong>Status:</strong> <span class="lib-pill-reject">REJECTED / DO NOT USE</span></div>
                                <div><strong>Scope:</strong> <?= h(($r['target_scope'] ?? '') === 'image_only' ? 'Image only' : ($r['target_scope'] ?: 'Image only')) ?></div>
                                <div><strong>Asset URL:</strong> <?= !empty($r['asset_url']) ? '<a href="'.h($r['asset_url']).'" target="_blank" rel="noopener">Open asset</a>' : 'Not available in workbook / historical client-feedback screenshot' ?></div>
                            </div>
                            <div class="lib-note">Image-only creative restriction — the Rational brand stays Approved and the Index!G24 Rational product page is not restricted by this image rule.</div>
                        <?php elseif ($target_type === 'link'): ?>
                            <div class="lib-restr-meta">
                                <div><a href="<?= h($r['link_url']) ?>" target="_blank" rel="noopener">Open asset</a></div>
                                <?php if ($r['product_name']): ?><div>Product: <?= h($r['product_name']) ?></div><?php endif; ?>
                            </div>
                            <div class="lib-note">Specific-creative restriction — not a brand-wide ban.</div>
                        <?php endif; ?>

                        <div class="lib-evidence">
                            <?php foreach ($evs as $ev):
                                $ev_json = h(json_encode([
                                    'url' => $ev['public_url'],
                                    'type' => $ev['evidence_type'],
                                    'caption' => $ev['caption'],
                                    'original_filename' => $ev['original_filename'],
                                    'source' => $ev['source'],
                                    'source_reference' => $ev['source_reference'],
                                    'uploaded_by' => $ev['uploaded_by_name'] ?? null,
                                    'target' => $target_label,
                                ]));
                                $ev_label = $target_type === 'creative_asset' ? 'Rejected creative' : ($ev['caption'] ?: 'Evidence');
                            ?>
                                <?php if ($ev['evidence_type'] === 'url'): ?>
                                    <a class="lib-ev-chip" href="<?= h($ev['public_url']) ?>" target="_blank" rel="noopener">🔗 <?= h($ev['caption'] ?: 'Evidence link') ?></a>
                                <?php elseif ($ev['evidence_type'] === 'document'): ?>
                                    <span class="lib-ev-cell">
                                        <a class="lib-ev-doc" href="<?= h($ev['public_url']) ?>" target="_blank" rel="noopener">📄 <?= h($ev['original_filename'] ?: 'Document') ?></a>
                                        <?php if ($is_admin): ?><span class="lib-ev-archive"><form method="post" action="/library/evidence/<?= (int)$ev['id'] ?>/archive" onsubmit="return confirm('Archive this evidence?');"><?= csrf_field() ?><button type="submit" title="Archive">×</button></form></span><?php endif; ?>
                                    </span>
                                <?php else: ?>
                                    <span class="lib-ev-cell" style="position:relative;">
                                        <button type="button" class="lib-ev-thumb" data-ev-preview data-ev='<?= $ev_json ?>'>
                                            <img src="<?= h($ev['public_url']) ?>" alt="<?= h($ev_label) ?>" loading="lazy">
                                            <span class="lib-ev-label"><?= h($ev_label) ?></span>
                                        </button>
                                        <?php if ($is_admin): ?><span class="lib-ev-archive"><form method="post" action="/library/evidence/<?= (int)$ev['id'] ?>/archive" onsubmit="return confirm('Archive this evidence?');"><?= csrf_field() ?><button type="submit" title="Archive">×</button></form></span><?php endif; ?>
                                    </span>
                                <?php endif; ?>
                            <?php endforeach; ?>

                            <?php if (empty($evs)): ?><span class="lib-ev-empty">No visual evidence attached yet.</span><?php endif; ?>
                            <?php if ($is_admin): ?>
                                <button type="button" class="btn btn-ghost btn-xs" data-modal-open="modal-evidence-add"
                                    data-evidence-restriction="<?= (int)$r['id'] ?>" data-evidence-target="<?= h($target_label) ?>">+ Attach evidence</button>
                            <?php endif; ?>
                        </div>
                    </td>
                    <td><?= h($r['restriction']) ?></td>
                    <td><span class="badge <?= h($r['severity']) ?>"><?= h(strtoupper($r['severity'])) ?></span></td>
                    <?php if ($is_admin): ?>
                        <td><button type="button" class="btn btn-ghost btn-sm"
                            data-modal-open="modal-restriction-edit"
                            data-edit-action="/library/restrictions/<?= (int)$r['id'] ?>/edit"
                            data-edit-row='<?= h(json_encode([
                                'restriction'=>$r['restriction'],'severity'=>$r['severity'],'active'=>(string)$r['active'],
                                'target_type'=>$target_type,'brand_id'=>$r['brand_id'],'product_id'=>$r['product_id'],'link_id'=>$r['link_id'],
                                'target_label'=>$r['target_label'] ?? '','asset_url'=>$r['asset_url'] ?? '','target_scope'=>$r['target_scope'] ?? '',
                            ])) ?>'
                        >Edit</button></td>
                    <?php endif; ?>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php if ($is_admin): ?>
<!-- ===================== MODALS ===================== -->

<?php
function lib_brand_fields($brand_statuses, $brand_origins) { ?>
    <label>Name<input name="name" required></label>
    <label>Status<select name="status">
        <?php foreach ($brand_statuses as $s): ?><option value="<?= h($s) ?>"><?= h(ucwords(str_replace('_',' ',$s))) ?></option><?php endforeach; ?>
    </select></label>
    <label>Origin<select name="origin">
        <?php foreach ($brand_origins as $o): ?><option value="<?= h($o) ?>"><?= h(ucwords(str_replace('_',' ',$o))) ?></option><?php endforeach; ?>
    </select></label>
    <label>Notes<textarea name="notes"></textarea></label>
<?php }
?>

<div id="modal-brand-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Add Brand</h3>
        <form method="post" action="/library/brands/add">
            <?= csrf_field() ?>
            <?php lib_brand_fields($brand_statuses, $brand_origins); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Brand</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-brand-edit" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Edit Brand</h3>
        <form method="post" action="/library/brands/0/edit">
            <?= csrf_field() ?>
            <?php lib_brand_fields($brand_statuses, $brand_origins); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<?php
function lib_category_fields() { ?>
    <label>Name<input name="name" required></label>
    <label>Sort Order<input name="sort_order" type="number" value="0"></label>
    <label>Historical Status<input name="historical_status"></label>
    <label>Current Status<input name="current_status"></label>
<?php }
?>
<div id="modal-category-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Add Category</h3>
        <form method="post" action="/library/categories/add">
            <?= csrf_field() ?>
            <?php lib_category_fields(); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Category</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-category-edit" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Edit Category</h3>
        <form method="post" action="/library/categories/0/edit">
            <?= csrf_field() ?>
            <?php lib_category_fields(); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<?php
function lib_product_fields($brands, $categories, $brand_statuses) { ?>
    <label>Product Name<input name="product_name" required></label>
    <label>Brand<select name="brand_id">
        <option value="">—</option>
        <?php foreach ($brands as $b): ?><option value="<?= (int)$b['id'] ?>"><?= h($b['name']) ?></option><?php endforeach; ?>
    </select></label>
    <label>Category<select name="category_id">
        <option value="">—</option>
        <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>"><?= h($c['name']) ?></option><?php endforeach; ?>
    </select></label>
    <label>Status<select name="marketing_status">
        <?php foreach ($brand_statuses as $s): ?><option value="<?= h($s) ?>"><?= h(ucwords(str_replace('_',' ',$s))) ?></option><?php endforeach; ?>
    </select></label>
    <label>Celebrate URL<input name="celebrate_url" type="url"></label>
    <label>Image URL<input name="image_url" type="url"></label>
    <label>Manufacturer URL<input name="manufacturer_url" type="url"></label>
    <label>Notes<textarea name="notes"></textarea></label>
    <label>Verification Date<input name="last_verified_at" type="date"></label>
<?php }
?>
<div id="modal-product-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Add Product</h3>
        <form method="post" action="/library/products/add">
            <?= csrf_field() ?>
            <?php lib_product_fields($brands, $categories, $brand_statuses); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Product</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-product-edit" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Edit Product</h3>
        <form method="post" action="/library/products/0/edit">
            <?= csrf_field() ?>
            <?php lib_product_fields($brands, $categories, $brand_statuses); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<?php
function lib_link_fields($link_types, $products, $categories, $verification_statuses) { ?>
    <label>Label<input name="label" required></label>
    <label>URL<input name="url" type="url" required></label>
    <label>Link Type<select name="link_type">
        <?php foreach ($link_types as $lt): ?><option value="<?= h($lt) ?>"><?= h(str_replace('_',' ',$lt)) ?></option><?php endforeach; ?>
    </select></label>
    <label>Product<select name="product_id">
        <option value="">—</option>
        <?php foreach ($products as $p): ?><option value="<?= (int)$p['id'] ?>"><?= h($p['product_name']) ?></option><?php endforeach; ?>
    </select></label>
    <label>Category<select name="category_id">
        <option value="">—</option>
        <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>"><?= h($c['name']) ?></option><?php endforeach; ?>
    </select></label>
    <label>Source Sheet<input name="source_sheet"></label>
    <label>Source Cell<input name="source_cell"></label>
    <label>Verification Status<select name="verification_status">
        <?php foreach ($verification_statuses as $vs): ?><option value="<?= h($vs) ?>"><?= h(ucfirst($vs)) ?></option><?php endforeach; ?>
    </select></label>
    <label>Notes<textarea name="notes"></textarea></label>
<?php }
?>
<div id="modal-link-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Add Link</h3>
        <form method="post" action="/library/links/add">
            <?= csrf_field() ?>
            <?php lib_link_fields($link_types, $products, $categories, $verification_statuses); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Link</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-link-edit" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Edit Link</h3>
        <form method="post" action="/library/links/0/edit">
            <?= csrf_field() ?>
            <?php lib_link_fields($link_types, $products, $categories, $verification_statuses); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<?php
function lib_restriction_fields($brands, $products, $links, $severities) { ?>
    <label>Target Type<select name="target_type" data-target-type-select>
        <option value="global">Global (no specific target)</option>
        <option value="brand">Brand</option>
        <option value="product">Product</option>
        <option value="link">Link / Asset (specific creative)</option>
        <option value="creative_asset">Creative Asset (image only, no URL)</option>
    </select></label>
    <div class="lib-target-group" data-target-group="brand">
        <label>Brand<select name="brand_id">
            <option value="">—</option>
            <?php foreach ($brands as $b): ?><option value="<?= (int)$b['id'] ?>"><?= h($b['name']) ?></option><?php endforeach; ?>
        </select></label>
    </div>
    <div class="lib-target-group" data-target-group="product">
        <label>Product<select name="product_id">
            <option value="">—</option>
            <?php foreach ($products as $p): ?><option value="<?= (int)$p['id'] ?>"><?= h($p['product_name']) ?></option><?php endforeach; ?>
        </select></label>
    </div>
    <div class="lib-target-group" data-target-group="link">
        <label>Link / Asset<select name="link_id">
            <option value="">—</option>
            <?php foreach ($links as $l): ?><option value="<?= (int)$l['id'] ?>"><?= h($l['label']) ?></option><?php endforeach; ?>
        </select></label>
    </div>
    <div class="lib-target-group" data-target-group="creative_asset">
        <label>Creative / Image Label<input name="target_label" placeholder="e.g. Previously rejected Rational / Combination Oven image"></label>
        <label>Asset URL (optional — leave blank if not available)<input name="asset_url" placeholder="Leave blank if the image only exists as a client-feedback screenshot"></label>
        <label>Scope<select name="target_scope">
            <option value="image_only">Image only</option>
            <option value="creative">Whole creative</option>
        </select></label>
    </div>
    <label>Restriction Text<textarea name="restriction" required></textarea></label>
    <label>Severity<select name="severity">
        <?php foreach ($severities as $sv): ?><option value="<?= h($sv) ?>"><?= h(ucfirst($sv)) ?></option><?php endforeach; ?>
    </select></label>
    <label><input type="checkbox" name="active" value="1" checked style="width:auto; display:inline-block; margin-right:0.4rem;">Active</label>
<?php }
?>
<div id="modal-restriction-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Add Restriction</h3>
        <form method="post" action="/library/restrictions/add">
            <?= csrf_field() ?>
            <?php lib_restriction_fields($brands, $products, $links, $severities); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Restriction</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-restriction-edit" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Edit Restriction</h3>
        <form method="post" action="/library/restrictions/0/edit">
            <?= csrf_field() ?>
            <?php lib_restriction_fields($brands, $products, $links, $severities); ?>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>
<div id="modal-evidence-add" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal">
        <h3>Attach Evidence</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0;">Attaching to: <strong data-evidence-target-label>—</strong></p>
        <form method="post" action="/library/restrictions/0/evidence/add" enctype="multipart/form-data" data-evidence-form>
            <?= csrf_field() ?>
            <label>Image / Document (png, jpg, gif, webp, pdf — max 25 MB)
                <input type="file" name="evidence_file" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf">
            </label>
            <label>…or Evidence URL (if it already lives at a stable link)
                <input type="url" name="public_url" placeholder="https://…">
            </label>
            <label>Source
                <select name="source">
                    <option value="cms_upload">CMS upload</option>
                    <option value="synergy_account_intelligence">Synergy / Account Intelligence</option>
                    <option value="github">GitHub</option>
                    <option value="manual">Manual</option>
                </select>
            </label>
            <label>Source reference (record ID / path / note — optional)
                <input name="source_reference" placeholder="e.g. Account Intelligence record, Drive file id, client email date">
            </label>
            <label>Caption (optional)
                <input name="caption" placeholder='e.g. "Rejected creative — client feedback"'>
            </label>
            <div class="lib-modal-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-modal-close>Cancel</button>
                <button class="btn btn-accent btn-sm">Attach Evidence</button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>

<!-- Evidence preview modal — available to all roles (read-only viewing) -->
<div id="modal-evidence-preview" class="lib-modal-overlay hidden" data-modal-close-overlay>
    <div class="lib-modal" style="max-width:760px;">
        <h3 data-ev-title>Evidence</h3>
        <div data-ev-body></div>
        <div class="lib-modal-actions">
            <a class="btn btn-ghost btn-sm" data-ev-original href="#" target="_blank" rel="noopener" style="display:none;">View original</a>
            <button type="button" class="btn btn-accent btn-sm" data-modal-close>Close</button>
        </div>
    </div>
</div>

<script src="/library.js?v=<?= h(@filemtime(__DIR__ . '/../../public/library.js') ?: time()) ?>"></script>

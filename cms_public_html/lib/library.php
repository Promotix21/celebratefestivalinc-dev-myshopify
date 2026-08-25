<?php
declare(strict_types=1);

const LIB_BRAND_STATUSES = ['approved', 'restricted', 'needs_verification', 'inactive'];
const LIB_BRAND_ORIGINS = ['excel', 'current_addition', 'manual'];
const LIB_LINK_TYPES = ['celebrate_product', 'celebrate_collection', 'google_drive_asset', 'manufacturer', 'supplier', 'external_reference', 'other'];
const LIB_VERIFICATION_STATUSES = ['pending', 'verified', 'broken', 'outdated'];
const LIB_SEVERITIES = ['low', 'medium', 'high'];

function lib_fetch_data(PDO $pdo): array {
    $stats = [
        'brands' => $pdo->query("SELECT COUNT(*) FROM marketing_brands")->fetchColumn(),
        'refs' => $pdo->query("SELECT COUNT(DISTINCT url) FROM marketing_links")->fetchColumn(),
        'categories' => $pdo->query("SELECT COUNT(*) FROM marketing_categories")->fetchColumn(),
        'approved' => $pdo->query("SELECT COUNT(*) FROM marketing_products WHERE marketing_status='approved'")->fetchColumn(),
        'needs_verification' => $pdo->query("SELECT COUNT(*) FROM marketing_products WHERE marketing_status='needs_verification'")->fetchColumn(),
        'restricted' => $pdo->query("SELECT COUNT(*) FROM marketing_restrictions WHERE active=1")->fetchColumn(),
        'original_placements' => $pdo->query("SELECT COUNT(*) FROM marketing_links")->fetchColumn(),
    ];

    $brands = $pdo->query("SELECT * FROM marketing_brands ORDER BY name ASC")->fetchAll();
    $products = $pdo->query("
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM marketing_products p
        LEFT JOIN marketing_brands b ON p.brand_id = b.id
        LEFT JOIN marketing_categories c ON p.category_id = c.id
        ORDER BY p.product_name ASC
    ")->fetchAll();
    $categories = $pdo->query("SELECT * FROM marketing_categories ORDER BY sort_order ASC, name ASC")->fetchAll();
    $links = $pdo->query("
        SELECT l.*, p.product_name, c.name as category_name
        FROM marketing_links l
        LEFT JOIN marketing_products p ON l.product_id = p.id
        LEFT JOIN marketing_categories c ON l.category_id = c.id
        ORDER BY l.label ASC
    ")->fetchAll();
    // link_id is joined so link-specific restrictions (e.g. one rejected
    // creative) can be shown distinctly from brand-wide restrictions —
    // a link restriction must never be rendered as a brand-level ban.
    $restrictions = $pdo->query("
        SELECT r.*, b.name as brand_name, p.product_name, l.label as link_label, l.url as link_url
        FROM marketing_restrictions r
        LEFT JOIN marketing_brands b ON r.brand_id = b.id
        LEFT JOIN marketing_products p ON r.product_id = p.id
        LEFT JOIN marketing_links l ON r.link_id = l.id
        WHERE r.active = 1
        ORDER BY r.severity DESC, r.created_at DESC
    ")->fetchAll();

    // Visual evidence (screenshots / rejected creatives) attached to each
    // restriction, keyed by restriction_id. A restriction may have many.
    $evidence = [];
    foreach ($pdo->query("
        SELECT e.*, u.display_name AS uploaded_by_name
        FROM marketing_restriction_evidence e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.archived = 0
        ORDER BY e.created_at ASC
    ")->fetchAll() as $ev) {
        $evidence[$ev['restriction_id']][] = $ev;
    }

    return compact('stats', 'brands', 'products', 'categories', 'links', 'restrictions', 'evidence');
}

function lib_render_index(PDO $pdo, bool $is_admin): void {
    $data = lib_fetch_data($pdo);
    render('library/index', [
        'title' => 'Product & Brand Library',
        'stats' => $data['stats'],
        'brands' => $data['brands'],
        'products' => $data['products'],
        'categories' => $data['categories'],
        'links' => $data['links'],
        'restrictions' => $data['restrictions'],
        'evidence' => $data['evidence'],
        'is_admin' => $is_admin,
    ]);
    exit;
}

function lib_in(string $val, array $allowed, string $default): string {
    return in_array($val, $allowed, true) ? $val : $default;
}

function lib_nullable_int($val): ?int {
    $val = trim((string)$val);
    return $val === '' ? null : (int)$val;
}

function lib_redirect_tab(string $tab): void {
    // The fragment isn't sent to the server, but the view's JS reads
    // location.hash on load to re-activate the tab the admin was on.
    redirect('/library#' . $tab);
}

function handle_library_routes($uri, $method) {
    $pdo = db();
    $me = current_user();
    $is_admin = $me['role'] === 'admin';

    if ($uri === '/library' && $method === 'GET') {
        lib_render_index($pdo, $is_admin);
    }

    if ($method !== 'POST') {
        http_response_code(404);
        render('404', ['title' => 'Not found']);
        exit;
    }

    // Admin-only + CSRF-protected for every mutation below. The router in
    // index.php already runs csrf_check() globally for all non-/login POSTs,
    // but we check again here explicitly so this file is self-defending if
    // it is ever reached through a different entry point.
    require_admin();
    csrf_check();

    // ---- Brands --------------------------------------------------------
    if ($uri === '/library/brands/add') {
        $name = trim((string)post('name', ''));
        if ($name === '') { flash('Brand name is required.', 'error'); lib_redirect_tab('brands'); }
        $status = lib_in((string)post('status', ''), LIB_BRAND_STATUSES, 'needs_verification');
        $origin = lib_in((string)post('origin', ''), LIB_BRAND_ORIGINS, 'manual');
        $notes = trim((string)post('notes', '')) ?: null;

        $stmt = $pdo->prepare("INSERT INTO marketing_brands (name, origin, marketing_status, notes, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        try {
            $stmt->execute([$name, $origin, $status, $notes, $me['id']]);
            $id = (int)$pdo->lastInsertId();
            activity_log('brand', $id, 'added', "Added brand \"$name\" ($status)");
            flash("Brand added.", "success");
        } catch (Exception $e) {
            flash("Error adding brand: " . $e->getMessage(), "error");
        }
        lib_redirect_tab('brands');
    }

    if (preg_match('#^/library/brands/(\d+)/edit$#', $uri, $m)) {
        $id = (int)$m[1];
        $name = trim((string)post('name', ''));
        if ($name === '') { flash('Brand name is required.', 'error'); lib_redirect_tab('brands'); }
        $status = lib_in((string)post('status', ''), LIB_BRAND_STATUSES, 'needs_verification');
        $origin = lib_in((string)post('origin', ''), LIB_BRAND_ORIGINS, 'manual');
        $notes = trim((string)post('notes', '')) ?: null;

        $stmt = $pdo->prepare("UPDATE marketing_brands SET name=?, origin=?, marketing_status=?, notes=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
        $stmt->execute([$name, $origin, $status, $notes, $me['id'], $id]);
        activity_log('brand', $id, 'edited', "Updated brand \"$name\" ($status)");
        flash("Brand updated.", "success");
        lib_redirect_tab('brands');
    }

    // ---- Categories -----------------------------------------------------
    if ($uri === '/library/categories/add') {
        $name = trim((string)post('name', ''));
        if ($name === '') { flash('Category name is required.', 'error'); lib_redirect_tab('categories'); }
        $sort = (int)post('sort_order', 0);
        $historical = trim((string)post('historical_status', '')) ?: null;
        $current = trim((string)post('current_status', '')) ?: null;

        $stmt = $pdo->prepare("INSERT INTO marketing_categories (name, sort_order, historical_status, current_status, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
        try {
            $stmt->execute([$name, $sort, $historical, $current]);
            $id = (int)$pdo->lastInsertId();
            activity_log('category', $id, 'added', "Added category \"$name\"");
            flash("Category added.", "success");
        } catch (Exception $e) {
            flash("Error adding category: " . $e->getMessage(), "error");
        }
        lib_redirect_tab('categories');
    }

    if (preg_match('#^/library/categories/(\d+)/edit$#', $uri, $m)) {
        $id = (int)$m[1];
        $name = trim((string)post('name', ''));
        if ($name === '') { flash('Category name is required.', 'error'); lib_redirect_tab('categories'); }
        $sort = (int)post('sort_order', 0);
        $historical = trim((string)post('historical_status', '')) ?: null;
        $current = trim((string)post('current_status', '')) ?: null;

        $stmt = $pdo->prepare("UPDATE marketing_categories SET name=?, sort_order=?, historical_status=?, current_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
        $stmt->execute([$name, $sort, $historical, $current, $id]);
        activity_log('category', $id, 'edited', "Updated category \"$name\"");
        flash("Category updated.", "success");
        lib_redirect_tab('categories');
    }

    // ---- Products ---------------------------------------------------------
    if ($uri === '/library/products/add' || preg_match('#^/library/products/(\d+)/edit$#', $uri, $m)) {
        $id = isset($m[1]) ? (int)$m[1] : null;
        $name = trim((string)post('product_name', ''));
        if ($name === '') { flash('Product name is required.', 'error'); lib_redirect_tab('products'); }
        $brand_id = lib_nullable_int(post('brand_id', ''));
        $category_id = lib_nullable_int(post('category_id', ''));
        $status = lib_in((string)post('marketing_status', ''), LIB_BRAND_STATUSES, 'needs_verification');
        $celebrate_url = trim((string)post('celebrate_url', '')) ?: null;
        $image_url = trim((string)post('image_url', '')) ?: null;
        $manufacturer_url = trim((string)post('manufacturer_url', '')) ?: null;
        $notes = trim((string)post('notes', '')) ?: null;
        $verified_at = trim((string)post('last_verified_at', '')) ?: null;

        if ($id === null) {
            $stmt = $pdo->prepare("INSERT INTO marketing_products
                (product_name, brand_id, category_id, marketing_status, celebrate_url, image_url, manufacturer_url, notes, source, last_verified_at, updated_by, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$name, $brand_id, $category_id, $status, $celebrate_url, $image_url, $manufacturer_url, $notes, $verified_at, $me['id']]);
            $id = (int)$pdo->lastInsertId();
            activity_log('product', $id, 'added', "Added product \"$name\" ($status)");
            flash("Product added.", "success");
        } else {
            $stmt = $pdo->prepare("UPDATE marketing_products SET product_name=?, brand_id=?, category_id=?, marketing_status=?, celebrate_url=?, image_url=?, manufacturer_url=?, notes=?, last_verified_at=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
            $stmt->execute([$name, $brand_id, $category_id, $status, $celebrate_url, $image_url, $manufacturer_url, $notes, $verified_at, $me['id'], $id]);
            activity_log('product', $id, 'edited', "Updated product \"$name\" ($status)");
            flash("Product updated.", "success");
        }
        lib_redirect_tab('products');
    }

    // ---- Links / Assets -----------------------------------------------
    if ($uri === '/library/links/add' || preg_match('#^/library/links/(\d+)/edit$#', $uri, $m)) {
        $id = isset($m[1]) ? (int)$m[1] : null;
        $label = trim((string)post('label', ''));
        $url = trim((string)post('url', ''));
        if ($label === '' || $url === '') { flash('Label and URL are required.', 'error'); lib_redirect_tab('links'); }
        $link_type = lib_in((string)post('link_type', ''), LIB_LINK_TYPES, 'other');
        $product_id = lib_nullable_int(post('product_id', ''));
        $category_id = lib_nullable_int(post('category_id', ''));
        $source_sheet = trim((string)post('source_sheet', '')) ?: null;
        $source_cell = trim((string)post('source_cell', '')) ?: null;
        $verification_status = lib_in((string)post('verification_status', ''), LIB_VERIFICATION_STATUSES, 'pending');
        $notes = trim((string)post('notes', '')) ?: null;

        if ($id === null) {
            $stmt = $pdo->prepare("INSERT INTO marketing_links (product_id, category_id, label, url, link_type, source_sheet, source_cell, verification_status, notes, last_verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$product_id, $category_id, $label, $url, $link_type, $source_sheet, $source_cell, $verification_status, $notes]);
            $id = (int)$pdo->lastInsertId();
            activity_log('link', $id, 'added', "Added link \"$label\" ($link_type)");
            flash("Link added.", "success");
        } else {
            $stmt = $pdo->prepare("UPDATE marketing_links SET product_id=?, category_id=?, label=?, url=?, link_type=?, source_sheet=?, source_cell=?, verification_status=?, notes=?, last_verified_at=CURRENT_TIMESTAMP WHERE id=?");
            $stmt->execute([$product_id, $category_id, $label, $url, $link_type, $source_sheet, $source_cell, $verification_status, $notes, $id]);
            activity_log('link', $id, 'edited', "Updated link \"$label\" ($link_type)");
            flash("Link updated.", "success");
        }
        lib_redirect_tab('links');
    }

    // ---- Restrictions ---------------------------------------------------
    if ($uri === '/library/restrictions/add' || preg_match('#^/library/restrictions/(\d+)/edit$#', $uri, $m)) {
        $id = isset($m[1]) ? (int)$m[1] : null;
        $restriction = trim((string)post('restriction', ''));
        if ($restriction === '') { flash('Restriction text is required.', 'error'); lib_redirect_tab('restrictions'); }
        $severity = lib_in((string)post('severity', ''), LIB_SEVERITIES, 'medium');
        $active = post('active', '1') === '1' ? 1 : 0;

        // Only one target applies at a time — brand, product, the specific
        // "link" target (a single creative/placement), or "creative_asset"
        // (an image-only restriction that has no brand/product/link row and
        // possibly no URL at all). Selecting a non-brand target must NOT be
        // stored as a brand-level restriction.
        $target_type = lib_in((string)post('target_type', ''), ['brand', 'product', 'link', 'creative_asset', 'global'], 'global');
        $brand_id = $target_type === 'brand' ? lib_nullable_int(post('brand_id', '')) : null;
        $product_id = $target_type === 'product' ? lib_nullable_int(post('product_id', '')) : null;
        $link_id = $target_type === 'link' ? lib_nullable_int(post('link_id', '')) : null;

        // Creative-asset descriptor fields (only meaningful for that target type).
        $stored_target_type = $target_type === 'creative_asset' ? 'creative_asset' : null;
        $target_label = $target_type === 'creative_asset' ? (trim((string)post('target_label', '')) ?: null) : null;
        $asset_url = $target_type === 'creative_asset' ? (trim((string)post('asset_url', '')) ?: null) : null;
        $target_scope = $target_type === 'creative_asset' ? lib_in((string)post('target_scope', ''), ['image_only', 'creative'], 'image_only') : null;

        if ($id === null) {
            $stmt = $pdo->prepare("INSERT INTO marketing_restrictions (brand_id, product_id, link_id, restriction, severity, active, source, target_type, target_label, asset_url, target_scope, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$brand_id, $product_id, $link_id, $restriction, $severity, $active, $stored_target_type, $target_label, $asset_url, $target_scope]);
            $id = (int)$pdo->lastInsertId();
            activity_log('restriction', $id, 'added', "Added restriction ($target_type, $severity)");
            flash("Restriction added.", "success");
        } else {
            $stmt = $pdo->prepare("UPDATE marketing_restrictions SET brand_id=?, product_id=?, link_id=?, restriction=?, severity=?, active=?, target_type=?, target_label=?, asset_url=?, target_scope=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
            $stmt->execute([$brand_id, $product_id, $link_id, $restriction, $severity, $active, $stored_target_type, $target_label, $asset_url, $target_scope, $id]);
            $action = $active ? 'edited' : 'deactivated';
            activity_log('restriction', $id, $action, "Updated restriction ($target_type, $severity, active=$active)");
            flash("Restriction updated.", "success");
        }
        lib_redirect_tab('restrictions');
    }

    // ---- Restriction evidence (attach image/screenshot/document or URL) ----
    if (preg_match('#^/library/restrictions/(\d+)/evidence/add$#', $uri, $m)) {
        $restriction_id = (int)$m[1];
        $exists = $pdo->prepare("SELECT id FROM marketing_restrictions WHERE id=?");
        $exists->execute([$restriction_id]);
        if (!$exists->fetchColumn()) { flash('Restriction not found.', 'error'); lib_redirect_tab('restrictions'); }

        $caption = trim((string)post('caption', '')) ?: null;
        $source = lib_in((string)post('source', ''), ['synergy_account_intelligence', 'github', 'cms_upload', 'manual'], 'cms_upload');
        $source_reference = trim((string)post('source_reference', '')) ?: null;
        $url = trim((string)post('public_url', ''));

        $has_file = isset($_FILES['evidence_file']) && ($_FILES['evidence_file']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;

        if ($has_file) {
            [$ok, $result] = lib_save_restriction_evidence_file($_FILES['evidence_file']);
            if (!$ok) { flash($result, 'error'); lib_redirect_tab('restrictions'); }
            $evidence_type = str_starts_with($result['mime'], 'image/') ? 'image' : 'document';
            $stmt = $pdo->prepare("INSERT INTO marketing_restriction_evidence
                (restriction_id, evidence_type, source, source_reference, public_url, local_path, caption, original_filename, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([
                $restriction_id, $evidence_type, $source, $source_reference,
                $result['public_url'], $result['local_path'], $caption, $result['original_filename'], $me['id'],
            ]);
            $eid = (int)$pdo->lastInsertId();
            activity_log('restriction_evidence', $eid, 'added', "Attached {$evidence_type} evidence to restriction #{$restriction_id} ({$result['original_filename']})");
            flash('Evidence attached.', 'success');
        } elseif ($url !== '') {
            if (!preg_match('#^https?://#i', $url)) { flash('Evidence URL must start with http:// or https://', 'error'); lib_redirect_tab('restrictions'); }
            $stmt = $pdo->prepare("INSERT INTO marketing_restriction_evidence
                (restriction_id, evidence_type, source, source_reference, public_url, caption, created_by, created_at)
                VALUES (?, 'url', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$restriction_id, $source, $source_reference, $url, $caption, $me['id']]);
            $eid = (int)$pdo->lastInsertId();
            activity_log('restriction_evidence', $eid, 'added', "Linked URL evidence to restriction #{$restriction_id}");
            flash('Evidence link added.', 'success');
        } else {
            flash('Provide an image/document file or an evidence URL.', 'error');
        }
        lib_redirect_tab('restrictions');
    }

    // ---- Archive (soft-remove) an evidence attachment ----
    if (preg_match('#^/library/evidence/(\d+)/archive$#', $uri, $m)) {
        $eid = (int)$m[1];
        $stmt = $pdo->prepare("UPDATE marketing_restriction_evidence SET archived=1 WHERE id=?");
        $stmt->execute([$eid]);
        activity_log('restriction_evidence', $eid, 'archived', "Archived evidence #{$eid}");
        flash('Evidence archived.', 'success');
        lib_redirect_tab('restrictions');
    }

    http_response_code(404);
    exit('Not found');
}

/**
 * Save an uploaded restriction-evidence file into the dedicated managed
 * location public/uploads/library/restrictions/ using a safe random filename,
 * preserving the original filename for the DB. Mirrors save_task_attachment()
 * but scoped to the library so no shared helper needs changing.
 *
 * @return array{0:bool,1:(string|array)}  [true, {public_url, local_path, mime, original_filename}] or [false, errorMessage]
 */
function lib_save_restriction_evidence_file(array $f) {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return [false, 'Upload error.'];
    if ($f['size'] > 25 * 1024 * 1024) return [false, "{$f['name']}: exceeds 25 MB."];
    $allowed = [
        'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif',
        'image/webp' => 'webp', 'application/pdf' => 'pdf',
    ];
    $mime = mime_content_type($f['tmp_name']) ?: ($f['type'] ?? '');
    if (!isset($allowed[$mime])) return [false, "{$f['name']}: type {$mime} not allowed (png, jpg, gif, webp, pdf only)."];

    $dir = __DIR__ . '/../public/uploads/library/restrictions';
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) return [false, 'Could not create evidence directory.'];

    $name = bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
    $dest = $dir . '/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) return [false, "{$f['name']}: could not save."];

    return [true, [
        'public_url' => '/uploads/library/restrictions/' . $name,
        'local_path' => 'public/uploads/library/restrictions/' . $name,
        'mime' => $mime,
        'original_filename' => $f['name'],
    ]];
}

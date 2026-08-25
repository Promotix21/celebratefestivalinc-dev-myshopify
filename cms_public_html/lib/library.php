<?php

function handle_library_routes($uri, $method) {
    $pdo = db();
    $me = current_user();
    $is_admin = $me['role'] === 'admin';

    if ($uri === '/library' && $method === 'GET') {
        $stats = [
            'brands' => $pdo->query("SELECT COUNT(*) FROM marketing_brands")->fetchColumn(),
            'refs' => $pdo->query("SELECT COUNT(DISTINCT url) FROM marketing_links")->fetchColumn(),
            'categories' => $pdo->query("SELECT COUNT(*) FROM marketing_categories")->fetchColumn(),
            'approved' => $pdo->query("SELECT COUNT(*) FROM marketing_products WHERE marketing_status='approved'")->fetchColumn(),
            'needs_verification' => $pdo->query("SELECT COUNT(*) FROM marketing_products WHERE marketing_status='needs_verification'")->fetchColumn(),
            'restricted' => $pdo->query("SELECT COUNT(*) FROM marketing_restrictions WHERE active=1")->fetchColumn(),
            'original_placements' => $pdo->query("SELECT COUNT(*) FROM marketing_links")->fetchColumn()
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
        $restrictions = $pdo->query("
            SELECT r.*, b.name as brand_name, p.product_name
            FROM marketing_restrictions r
            LEFT JOIN marketing_brands b ON r.brand_id = b.id
            LEFT JOIN marketing_products p ON r.product_id = p.id
            WHERE r.active = 1
            ORDER BY r.severity DESC, r.created_at DESC
        ")->fetchAll();

        render('library/index', [
            'title' => 'Product & Brand Library',
            'stats' => $stats,
            'brands' => $brands,
            'products' => $products,
            'categories' => $categories,
            'links' => $links,
            'restrictions' => $restrictions,
            'is_admin' => $is_admin
        ]);
        exit;
    }
    
    // Handle POST mutations
    if ($method === 'POST') {
        
        if (!$is_admin) {
            http_response_code(403);
            exit('Forbidden: Only admins can modify library data.');
        }

        if ($uri === '/library/brands/add') {
            $name = trim(post('name'));
            $status = post('status', 'approved');
            $origin = post('origin', 'manual');
            
            $stmt = $pdo->prepare("INSERT INTO marketing_brands (name, origin, marketing_status, updated_by) VALUES (?, ?, ?, ?)");
            try {
                $stmt->execute([$name, $origin, $status, $me['id']]);
                
                $pdo->prepare("INSERT INTO activity_log (entity_type, entity_id, action, detail, user_id) VALUES ('brand', ?, 'added', ?, ?)")
                    ->execute([$pdo->lastInsertId(), "Added Brand $name", $me['id']]);
                    
                flash("Brand added successfully", "success");
            } catch (Exception $e) {
                flash("Error adding brand: " . $e->getMessage(), "error");
            }
            redirect('/library');
        }
        
        // Catch-all for other POSTs to the library
        http_response_code(404);
        exit('Not found');
    }

    http_response_code(404);
    render('404', ['title' => 'Not found']);
    exit;
}

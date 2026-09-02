<?php
declare(strict_types=1);

function h($s): string {
    return htmlspecialchars((string)($s ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path): void {
    header('Location: ' . $path);
    exit;
}

function flash(?string $msg = null, string $type = 'info'): ?array {
    if ($msg !== null) {
        $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
        return null;
    }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function view(string $path, array $data = []): string {
    extract($data, EXTR_SKIP);
    ob_start();
    require __DIR__ . '/../views/' . $path . '.php';
    return (string)ob_get_clean();
}

function render(string $path, array $data = []): void {
    $content = view($path, $data);
    $data['__content'] = $content;
    $data['__title']   = $data['title'] ?? 'Project Tracker';
    extract($data, EXTR_SKIP);
    require __DIR__ . '/../views/layout.php';
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string {
    return '<input type="hidden" name="_token" value="' . h(csrf_token()) . '">';
}

function csrf_check(): void {
    if (($_POST['_token'] ?? '') !== ($_SESSION['csrf'] ?? '_none_')) {
        http_response_code(419);
        exit('CSRF token mismatch');
    }
}

function post(string $key, $default = null) {
    return $_POST[$key] ?? $default;
}

function q(string $key, $default = null) {
    return $_GET[$key] ?? $default;
}

function fmt_dt(?string $dt): string {
    if (!$dt) return '—';
    $ts = strtotime($dt);
    return $ts ? date('M j, g:i A', $ts) : h($dt);
}

function fmt_rel(?string $dt): string {
    if (!$dt) return '—';
    $ts = strtotime($dt);
    if (!$ts) return h($dt);
    $diff = time() - $ts;
    if ($diff < 60) return $diff . 's ago';
    if ($diff < 3600) return floor($diff / 60) . 'm ago';
    if ($diff < 86400) return floor($diff / 3600) . 'h ago';
    if ($diff < 604800) return floor($diff / 86400) . 'd ago';
    return date('M j', $ts);
}

function status_class(string $s): string {
    return match($s) {
        'Pending', 'Planned', 'Requested', 'Approved for Planning' => 'pill pill-gray',
        'Under Review', 'Ready for Review' => 'pill pill-amber',
        'In Progress', 'Scheduled' => 'pill pill-blue',
        'Needs Clarification' => 'pill pill-rose',
        'Completed' => 'pill pill-green',
        default => 'pill pill-gray',
    };
}

function priority_class(string $p): string {
    return match($p) {
        'High' => 'pill pill-rose',
        'Medium' => 'pill pill-amber',
        'Low' => 'pill pill-gray',
        default => 'pill pill-gray',
    };
}

// Minimal Markdown renderer — headings, bold, italic, code, lists, links, paragraphs.
function md(string $text): string {
    $text = str_replace(["\r\n", "\r"], "\n", $text);
    $lines = explode("\n", $text);
    $out = [];
    $inList = false; $inCode = false;

    foreach ($lines as $line) {
        if (preg_match('/^```/', $line)) {
            if ($inCode) { $out[] = '</code></pre>'; $inCode = false; }
            else { $out[] = '<pre><code>'; $inCode = true; }
            continue;
        }
        if ($inCode) { $out[] = h($line); continue; }

        if (preg_match('/^(#{1,6})\s+(.*)$/', $line, $m)) {
            if ($inList) { $out[] = '</ul>'; $inList = false; }
            $lvl = strlen($m[1]);
            $out[] = "<h{$lvl}>" . md_inline($m[2]) . "</h{$lvl}>";
            continue;
        }
        if (preg_match('/^\s*[-*]\s+(.*)$/', $line, $m)) {
            if (!$inList) { $out[] = '<ul>'; $inList = true; }
            $out[] = '<li>' . md_inline($m[1]) . '</li>';
            continue;
        }
        if (trim($line) === '') {
            if ($inList) { $out[] = '</ul>'; $inList = false; }
            $out[] = '';
            continue;
        }
        if ($inList) { $out[] = '</ul>'; $inList = false; }
        $out[] = '<p>' . md_inline($line) . '</p>';
    }
    if ($inList) $out[] = '</ul>';
    if ($inCode) $out[] = '</code></pre>';
    return implode("\n", $out);
}

/**
 * Save one uploaded file as a task attachment. Returns [ok, message].
 * Accepts a single-file tuple: [tmp_name, name, size, error, type(optional)].
 */
function save_task_attachment(array $f, int $taskId, int $userId, string $kind = 'other'): array {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return [false, 'Upload error'];
    if ($f['size'] > 25 * 1024 * 1024) return [false, "{$f['name']}: exceeds 25 MB"];
    $allowed = [
        'image/png'=>'png','image/jpeg'=>'jpg','image/gif'=>'gif','image/webp'=>'webp',
        'video/mp4'=>'mp4','video/quicktime'=>'mov','video/webm'=>'webm',
        'application/pdf'=>'pdf',
    ];
    $mime = mime_content_type($f['tmp_name']) ?: ($f['type'] ?? '');
    if (!isset($allowed[$mime])) return [false, "{$f['name']}: type {$mime} not allowed"];
    $name = bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
    $dest = __DIR__ . '/../public/uploads/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) return [false, "{$f['name']}: could not save"];
    $k = in_array($kind, ['before','after','other'], true) ? $kind : 'other';
    db()->prepare('INSERT INTO attachments (task_id, filename, original_name, mime_type, size_bytes, kind, uploaded_by) VALUES (?,?,?,?,?,?,?)')
        ->execute([$taskId, $name, $f['name'], $mime, $f['size'], $k, $userId]);
    return [true, $name];
}

function md_inline(string $s): string {
    $s = h($s);
    $s = preg_replace('/`([^`]+)`/', '<code>$1</code>', $s);
    $s = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $s);
    $s = preg_replace('/(?<!\*)\*([^*]+)\*(?!\*)/', '<em>$1</em>', $s);
    // Named markdown links first, then auto-link bare URLs
    $s = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/', '<a href="$2" target="_blank" rel="noopener">$1</a>', $s);
    $s = preg_replace('/(?<!=")(?<!\()(?<!>)(https?:\/\/[^\s<"\']+)/', '<a href="$1" target="_blank" rel="noopener">$1</a>', $s);
    return $s;
}

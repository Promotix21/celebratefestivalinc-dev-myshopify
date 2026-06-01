// Project Tracker — UI handlers (CSP-safe, no inline JS).
(function () {
    'use strict';

    // 1) Row navigation + toggle + zone click
    document.addEventListener('click', function (e) {
        // Open file picker when media zone is clicked (but not when clicking an existing preview's remove btn)
        var zone = e.target.closest('[data-paste-zone]');
        if (zone && !e.target.closest('[data-remove], a, button, input, textarea, select')) {
            var fi = zone.querySelector('[data-file-input]');
            if (fi) { fi.click(); return; }
        }

        // Remove a staged preview
        var rm = e.target.closest('[data-remove]');
        if (rm) {
            e.preventDefault();
            var idx = parseInt(rm.getAttribute('data-remove'), 10);
            var z = rm.closest('[data-paste-zone]');
            var input = z && z.querySelector('[data-file-input]');
            if (!input) return;
            var dt = new DataTransfer();
            Array.from(input.files).forEach(function (f, i) { if (i !== idx) dt.items.add(f); });
            input.files = dt.files;
            renderPreviews(input);
            return;
        }

        // Row navigation — <tr data-href="/tasks/42">
        var row = e.target.closest('[data-href]');
        if (row && !e.target.closest('a, button, input, select, textarea, form')) {
            window.location = row.getAttribute('data-href');
            return;
        }

        // Toggle element visibility — <a data-toggle="#id">
        var tog = e.target.closest('[data-toggle]');
        if (tog) {
            e.preventDefault();
            var tgt = document.querySelector(tog.getAttribute('data-toggle'));
            if (tgt) tgt.classList.toggle('hidden');
        }
    });

    // 2) File input change → render previews
    document.addEventListener('change', function (e) {
        var el = e.target;
        if (el.matches && el.matches('[data-file-input]')) {
            renderPreviews(el);
            return;
        }
        if (el.matches && el.matches('[data-autosubmit]') && el.form) {
            el.form.submit();
        }
    });

    // 3) Drag & drop into zone
    document.addEventListener('dragover', function (e) {
        var z = e.target.closest && e.target.closest('[data-paste-zone]');
        if (!z) return;
        e.preventDefault();
        z.classList.add('is-drop');
    });
    document.addEventListener('dragleave', function (e) {
        var z = e.target.closest && e.target.closest('[data-paste-zone]');
        if (z) z.classList.remove('is-drop');
    });
    document.addEventListener('drop', function (e) {
        var z = e.target.closest && e.target.closest('[data-paste-zone]');
        if (!z) return;
        e.preventDefault();
        z.classList.remove('is-drop');
        var input = z.querySelector('[data-file-input]');
        if (!input || !e.dataTransfer || !e.dataTransfer.files) return;
        var dt = new DataTransfer();
        Array.from(input.files).forEach(function (f) { dt.items.add(f); });
        Array.from(e.dataTransfer.files).forEach(function (f) { dt.items.add(f); });
        input.files = dt.files;
        renderPreviews(input);
    });

    // 4) Paste handler — capture any clipboard image when a paste zone is present
    document.addEventListener('paste', function (e) {
        var zone = document.querySelector('[data-paste-zone]');
        if (!zone) return;
        if (!e.clipboardData) return;
        var items = e.clipboardData.items || [];
        var files = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                var f = items[i].getAsFile();
                if (f) files.push(f);
            }
        }
        if (!files.length) return;
        // Don't hijack pastes into text inputs/textareas if they're not empty of images
        var active = document.activeElement;
        var inTextField = active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT');
        // Only block the default if we actually consumed files (keeps text paste working)
        e.preventDefault();
        var input = zone.querySelector('[data-file-input]');
        if (!input) return;
        var dt = new DataTransfer();
        Array.from(input.files).forEach(function (f) { dt.items.add(f); });
        files.forEach(function (f) {
            var ext = (f.type.split('/')[1] || 'png').replace('jpeg','jpg');
            var renamed = new File([f], 'pasted-' + Date.now() + '.' + ext, { type: f.type });
            dt.items.add(renamed);
        });
        input.files = dt.files;
        renderPreviews(input);
    });

    function renderPreviews(input) {
        var zone = input.closest('[data-paste-zone]');
        if (!zone) return;
        var box = zone.querySelector('[data-previews]');
        var prompt = zone.querySelector('[data-media-prompt]');
        if (!box) return;
        box.innerHTML = '';
        var files = Array.from(input.files || []);
        if (prompt) prompt.style.display = files.length ? 'none' : '';
        files.forEach(function (f, idx) {
            var tile = document.createElement('div');
            tile.className = 'media-preview';
            if (f.type.indexOf('image/') === 0) {
                var img = document.createElement('img');
                img.src = URL.createObjectURL(f);
                img.onload = function () { URL.revokeObjectURL(img.src); };
                tile.appendChild(img);
            } else if (f.type.indexOf('video/') === 0) {
                var v = document.createElement('video');
                v.src = URL.createObjectURL(f);
                v.muted = true; v.playsInline = true; v.preload = 'metadata';
                tile.appendChild(v);
            } else {
                var d = document.createElement('div');
                d.className = 'media-preview-file';
                d.textContent = (f.name.split('.').pop() || 'FILE').toUpperCase();
                tile.appendChild(d);
            }
            var meta = document.createElement('div');
            meta.className = 'media-preview-meta';
            meta.textContent = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name;
            tile.appendChild(meta);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'media-preview-remove';
            btn.setAttribute('data-remove', String(idx));
            btn.title = 'Remove';
            btn.textContent = '×';
            tile.appendChild(btn);

            box.appendChild(tile);
        });
    }

    // 5) Delete confirmation — <form data-confirm="Are you sure?">
    document.addEventListener('submit', function (e) {
        var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
        if (msg && !confirm(msg)) e.preventDefault();
    });

    // 6) Global search — press Enter inside [data-search]
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-search]')) {
            e.preventDefault();
            var q = encodeURIComponent(e.target.value.trim());
            if (q) window.location = '/tasks?status=' + q;
        }
        // ⌘K / Ctrl-K focuses the global search
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            var s = document.querySelector('[data-search]');
            if (s) { e.preventDefault(); s.focus(); s.select(); }
        }
    });
})();

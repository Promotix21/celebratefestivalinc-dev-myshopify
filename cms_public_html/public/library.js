(function () {
    // ---- Tabs (persist across redirect via location.hash) ----
    function activateTab(name) {
        var tab = document.querySelector('.lib-tab[data-target="' + name + '"]');
        var pane = document.getElementById(name);
        if (!tab || !pane) return;
        document.querySelectorAll('.lib-tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.lib-pane').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        pane.classList.add('active');
        applyLibraryFilters();
    }
    document.querySelectorAll('.lib-tab').forEach(function (tab) {
        tab.addEventListener('click', function () { activateTab(tab.dataset.target); });
    });
    var initial = (window.location.hash || '').replace('#', '');
    if (initial) activateTab(initial);

    // ---- Search + filters (scoped to the active pane) ----
    function applyLibraryFilters() {
        var pane = document.querySelector('.lib-pane.active');
        if (!pane) return;
        var searchEl = document.querySelector('[data-lib-search]');
        var searchVal = searchEl ? searchEl.value.toLowerCase().trim() : '';
        var filters = [];
        pane.querySelectorAll('[data-lib-filter]').forEach(function (sel) {
            if (sel.value) filters.push([sel.dataset.libFilter, sel.value]);
        });
        pane.querySelectorAll('tbody tr[data-row-id]').forEach(function (tr) {
            var visible = true;
            if (searchVal && tr.textContent.toLowerCase().indexOf(searchVal) === -1) visible = false;
            if (visible) {
                for (var i = 0; i < filters.length; i++) {
                    var key = filters[i][0], val = filters[i][1];
                    if ((tr.getAttribute('data-f-' + key) || '') !== val) { visible = false; break; }
                }
            }
            tr.style.display = visible ? '' : 'none';
        });
    }
    window.applyLibraryFilters = applyLibraryFilters;
    var searchInput = document.querySelector('[data-lib-search]');
    if (searchInput) searchInput.addEventListener('input', applyLibraryFilters);
    document.querySelectorAll('[data-lib-filter]').forEach(function (sel) {
        sel.addEventListener('change', applyLibraryFilters);
    });
    applyLibraryFilters();

    // ---- Modals ----
    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var modal = document.getElementById(btn.dataset.modalOpen);
            if (!modal) return;
            var form = modal.querySelector('form');
            if (btn.dataset.editAction && form) {
                form.action = btn.dataset.editAction;
                form.reset();
                var row = btn.dataset.editRow ? JSON.parse(btn.dataset.editRow) : {};
                Object.keys(row).forEach(function (key) {
                    var field = form.elements.namedItem(key);
                    if (!field) return;
                    var val = row[key];
                    if (field.type === 'checkbox') {
                        field.checked = val === '1' || val === 1 || val === true;
                    } else {
                        field.value = val === null || val === undefined ? '' : val;
                    }
                });
                // Fire target-type change so the right target select shows for restrictions
                var tts = form.querySelector('[data-target-type-select]');
                if (tts) tts.dispatchEvent(new Event('change'));
            } else if (form) {
                form.reset();
                var tts2 = form.querySelector('[data-target-type-select]');
                if (tts2) tts2.dispatchEvent(new Event('change'));
            }
            // Attach-evidence modal: point the form at the chosen restriction
            if (btn.dataset.evidenceRestriction && form) {
                form.action = '/library/restrictions/' + btn.dataset.evidenceRestriction + '/evidence/add';
                var lbl = modal.querySelector('[data-evidence-target-label]');
                if (lbl) lbl.textContent = btn.dataset.evidenceTarget || ('#' + btn.dataset.evidenceRestriction);
            }
            modal.classList.remove('hidden');
        });
    });

    // ---- Evidence preview modal ----
    var previewModal = document.getElementById('modal-evidence-preview');
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    document.querySelectorAll('[data-ev-preview]').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            if (!previewModal) return;
            var ev = {};
            try { ev = JSON.parse(thumb.dataset.ev); } catch (e) { return; }
            previewModal.querySelector('[data-ev-title]').textContent = ev.caption || ev.original_filename || 'Evidence';
            var body = previewModal.querySelector('[data-ev-body]');
            var metaRows = [];
            if (ev.target) metaRows.push('<div><strong>Restriction:</strong> ' + escapeHtml(ev.target) + '</div>');
            if (ev.original_filename) metaRows.push('<div><strong>Filename:</strong> ' + escapeHtml(ev.original_filename) + '</div>');
            if (ev.source) metaRows.push('<div><strong>Source:</strong> ' + escapeHtml(String(ev.source).replace(/_/g, ' ')) + '</div>');
            if (ev.source_reference) metaRows.push('<div><strong>Reference:</strong> ' + escapeHtml(ev.source_reference) + '</div>');
            if (ev.uploaded_by) metaRows.push('<div><strong>Uploaded by:</strong> ' + escapeHtml(ev.uploaded_by) + '</div>');
            var imgHtml = ev.url ? '<img class="lib-preview-img" src="' + escapeHtml(ev.url) + '" alt="evidence">' : '';
            body.innerHTML = imgHtml + '<div class="lib-preview-meta">' + metaRows.join('') + '</div>';
            var orig = previewModal.querySelector('[data-ev-original]');
            if (orig) {
                if (ev.url) { orig.href = ev.url; orig.style.display = ''; }
                else { orig.style.display = 'none'; }
            }
            previewModal.classList.remove('hidden');
        });
    });
    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            btn.closest('.lib-modal-overlay').classList.add('hidden');
        });
    });
    document.querySelectorAll('[data-modal-close-overlay]').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    // ---- Restriction target-type toggling ----
    document.querySelectorAll('[data-target-type-select]').forEach(function (sel) {
        sel.addEventListener('change', function () {
            var modal = sel.closest('.lib-modal');
            modal.querySelectorAll('[data-target-group]').forEach(function (g) {
                g.classList.toggle('active', g.dataset.targetGroup === sel.value);
            });
        });
    });
})();

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
            modal.classList.remove('hidden');
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

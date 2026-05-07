/* CF Apex_Forge mascot — large interactive variant.
   Ported from the React/Framer-Motion ForgeMascot reference:
   - Normalises pointer position to [-1, +1] across the container.
   - Layers translate / 3D-tilt with different multipliers for a parallax effect.
   - Hover ignites the forge; click toggles an ignited "processing" state.
   - Sparks spawn while hovered.
   - When the chat widget raises thinking/responding (via cf-chatbot.js), we
     mirror that on the mascot through cf-apex--thinking / cf-apex--responding. */
(function () {
  'use strict';

  // [txMultiplier, tyMultiplier] — strict 2D translation parallax.
  // 3D rotateX/rotateY were dropped because, combined with perspective and
  // preserve-3d, they let lower-z layers (e.g. spokes) tilt forward and paint
  // above higher-z layers (coils/thermostat). Flat translation keeps the
  // depth-layer feel without breaking z-index.
  var LAYERS = {
    ambient:    [  0,   0],
    casing:     [ -6,  -6],
    coils:      [ 14,  14],
    thermostat: [ 24,  24],
    gauge:      [-14, -14]
  };

  var SPARK_INTERVAL_MS = 90;

  function attach(root) {
    if (!root || root.__cfApexBound) return;
    root.__cfApexBound = true;

    var layerEls = root.querySelectorAll('[data-apex-layer]');
    var sparksRoot = root.querySelector('[data-apex-sparks]');
    var tempEl = root.querySelector('[data-apex-temp]');
    var labelEl = root.querySelector('[data-apex-label]');

    var state = {
      x: 0, y: 0,
      hovered: false,
      replying: false,
      chatState: null  // 'thinking' | 'responding' | null
    };

    function resolveTemp() {
      if (state.chatState === 'responding' || state.replying) return '1200°';
      if (state.chatState === 'thinking') return '650°';
      if (state.hovered) return '450°';
      return '120°';
    }
    function resolveLabel() {
      if (state.chatState === 'responding' || state.replying) return 'PROCESSING';
      if (state.chatState === 'thinking') return 'IGNITING';
      if (state.hovered) return 'IGNITION';
      return 'STANDBY';
    }

    function apply() {
      for (var i = 0; i < layerEls.length; i++) {
        var el = layerEls[i];
        var type = el.getAttribute('data-apex-layer');
        var m = LAYERS[type];
        if (!m) continue;
        var tx = state.x * m[0];
        var ty = state.y * m[1];
        el.style.transform =
          'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
      }
      if (tempEl)  tempEl.textContent = resolveTemp();
      if (labelEl) labelEl.textContent = resolveLabel();
      root.classList.toggle('is-hovered', state.hovered);
      root.classList.toggle('is-replying', state.replying);
    }

    function onMove(e) {
      var rect = root.getBoundingClientRect();
      var cx = ('touches' in e && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      var cy = ('touches' in e && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      state.x = ((cx - rect.left) / rect.width - 0.5) * 2;
      state.y = ((cy - rect.top) / rect.height - 0.5) * 2;
      // Clamp to [-1, 1] for defensiveness with touch edges
      if (state.x > 1) state.x = 1; else if (state.x < -1) state.x = -1;
      if (state.y > 1) state.y = 1; else if (state.y < -1) state.y = -1;
      apply();
    }
    function onEnter() { state.hovered = true; apply(); }
    function onLeave() { state.hovered = false; state.x = 0; state.y = 0; apply(); }
    function onClick() { state.replying = !state.replying; apply(); }

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('touchstart', function () { state.hovered = true; apply(); }, { passive: true });
    root.addEventListener('touchmove', onMove, { passive: true });
    root.addEventListener('touchend', onLeave);
    root.addEventListener('click', onClick);

    // Sparks while hovered
    var sparkTimer = null;
    function spawnSpark() {
      if (!sparksRoot) return;
      var s = document.createElement('span');
      s.className = 'cf-apex__spark';
      var dx = (Math.random() - 0.5) * 220;
      var dy = -140 - Math.random() * 80;
      var dur = 900 + Math.random() * 700;
      s.style.setProperty('--dx', dx.toFixed(0) + 'px');
      s.style.setProperty('--dy', dy.toFixed(0) + 'px');
      s.style.setProperty('--spark-dur', dur + 'ms');
      sparksRoot.appendChild(s);
      setTimeout(function () { if (s && s.parentNode) s.parentNode.removeChild(s); }, dur + 50);
    }
    function startSparks() {
      if (sparkTimer) return;
      sparkTimer = setInterval(function () {
        if (state.hovered || state.replying || state.chatState) spawnSpark();
      }, SPARK_INTERVAL_MS);
    }
    startSparks();

    // Expose a state hook so cf-chatbot.js (or anything else) can drive the mascot
    root.__cfApexSetChatState = function (s) {
      state.chatState = (s === 'thinking' || s === 'responding') ? s : null;
      root.classList.remove('cf-apex--idle', 'cf-apex--thinking', 'cf-apex--responding');
      root.classList.add('cf-apex--' + (s || 'idle'));
      apply();
    };

    apply();
  }

  function init() {
    var roots = document.querySelectorAll('[data-cf-apex]');
    for (var i = 0; i < roots.length; i++) attach(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for dynamic mounts
  window.CFApex = {
    attach: attach,
    initAll: init,
    setState: function (state) {
      var roots = document.querySelectorAll('[data-cf-apex]');
      for (var i = 0; i < roots.length; i++) {
        if (roots[i].__cfApexSetChatState) roots[i].__cfApexSetChatState(state);
      }
    }
  };
})();

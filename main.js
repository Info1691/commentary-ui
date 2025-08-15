/* commentary-ui/main.js – full, fixed */
(function () {
  // ===== DOM =====
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const els = {
    select: $('#commentarySelect'),
    jurisdiction: $('#jurisdiction'),
    reference: $('#reference'),
    source: $('#source'),
    text: $('#commentaryText'),
    status: $('#status'),
    exportBtn: $('#exportBtn'),
    printBtn: $('#printBtn'),
    drawerToggle: $('#drawerToggle'),
  };

  // init Drawer (single, no duplicates)
  if (window.__drawerInit !== true && typeof window.initRepoDrawer === 'function') {
    window.initRepoDrawer(els.drawerToggle);
  }

  // ===== Helpers =====
  const setStatus = (m) => (els.status.textContent = m || '');
  const safe = (s) => (s == null ? '' : String(s));

  async function fetchJSON(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return res.json();
  }

  async function fetchText(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return await res.text();
  }

  // Try multiple registry locations for resilience
  const registryPaths = ['commentary.json', 'data/commentary.json'];

  // ===== Load registry & hydrate select =====
  async function loadRegistry() {
    let registry = null;
    let usedPath = '';
    for (const p of registryPaths) {
      try {
        const data = await fetchJSON(p);
        if (Array.isArray(data)) {
          registry = data;
          usedPath = p;
          break;
        }
      } catch (_) {}
    }
    if (!registry) {
      setStatus('Error: could not load commentary.json from expected locations.');
      return [];
    }

    // build options
    els.select.innerHTML = '<option value="">Select a Commentary</option>';
    registry.forEach((item, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = item.title || '(untitled)';
      els.select.appendChild(opt);
    });

    setStatus(`Loaded registry: ${location.origin}${location.pathname.replace(/[^/]+$/,'')}${usedPath}`);
    return registry;
  }

  let REGISTRY = [];
  let CURRENT = null;

  // ===== Load selected commentary =====
  async function showEntry(entry) {
    CURRENT = entry || null;
    els.jurisdiction.textContent = entry?.jurisdiction || '—';
    els.reference.textContent = entry?.reference || '—';
    els.source.textContent = entry?.source || '—';
    els.text.value = '';

    if (!entry?.reference_url) {
      setStatus('No reference_url set for this entry.');
      return;
    }
    try {
      const txt = await fetchText(entry.reference_url);
      els.text.value = normalizeGlyphs(txt);
      setStatus(`Loaded: ${entry.reference_url}`);
    } catch (err) {
      els.text.value = '';
      setStatus(`Failed to load: ${entry.reference_url} → ${err.message}`);
    }
  }

  // Normalize bullets/squares/nbsp from PDFs etc
  function normalizeGlyphs(s) {
    if (!s) return '';
    return s
      .replace(/\u25A0|\u25AA|\u25CF|\u25E6/g, '•')
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n');
  }

  // ===== Events =====
  els.select.addEventListener('change', () => {
    const idx = parseInt(els.select.value, 10);
    if (Number.isFinite(idx) && REGISTRY[idx]) {
      showEntry(REGISTRY[idx]);
    } else {
      CURRENT = null;
      els.text.value = '';
      els.jurisdiction.textContent = '—';
      els.reference.textContent = '—';
      els.source.textContent = '—';
      setStatus('No commentary selected.');
    }
  });

  els.exportBtn.addEventListener('click', () => {
    if (!CURRENT) return;
    const blob = new Blob([els.text.value || ''], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    const safeTitle = (CURRENT.title || 'commentary').replace(/[^-_\w\s]+/g, '').trim().replace(/\s+/g, '_');
    a.download = `${safeTitle}.txt`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  });

  els.printBtn.addEventListener('click', () => window.print());

  // ===== Boot =====
  (async function init() {
    try {
      REGISTRY = await loadRegistry();
      // Auto-select first item if present (keeps prior behaviour)
      if (REGISTRY.length) {
        els.select.value = '0';
        await showEntry(REGISTRY[0]);
      }
    } catch (err) {
      setStatus(`Init error: ${err.message}`);
    }
  })();
})();

/* commentary-ui/main.js – restores the text panel, keeps drawer + branding */
(function () {
  // ------- DOM -------
  const $ = (id) => document.getElementById(id);
  const els = {
    select: $('commentSelect'),
    jurisdiction: $('jurisdiction'),
    reference: $('reference'),
    source: $('source'),
    text: $('commentText'),
    exportBtn: $('exportBtn'),
    printBtn: $('printBtn'),
    status: $('status'),
    drawerBtn: $('openDrawer'),
    repoLinks: $('repoLinks'),
  };

  // ------- helpers -------
  const REGISTRY_CANDIDATES = [
    'data/commentary/commentary.json',
    'commentary.json',
    'data/commentary.json'
  ];

  const toJSON = (v) => JSON.stringify(v, null, 2);
  const setStatus = (msg) => els.status.textContent = msg || '';

  async function fetchWithFallback(paths) {
    let lastErr;
    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (!res.ok) throw new Error(`${p} → ${res.status}`);
        return await res.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('No registry paths succeeded.');
  }

  function fillSelect(items) {
    els.select.innerHTML = '<option value="">Select a Commentary</option>';
    items.forEach((item, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = item.title;
      els.select.appendChild(opt);
    });
  }

  function renderMeta(item) {
    els.jurisdiction.textContent = item?.jurisdiction || '—';
    els.reference.textContent   = item?.reference || '—';
    els.source.textContent      = item?.source || '—';
  }

  async function loadText(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    const txt = await res.text();
    // Gentle cleanup only (do NOT alter content)
    els.text.textContent = txt;
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'commentary.txt';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  }

  // ------- main flow -------
  let registry = [];
  let current = null;
  let currentText = '';

  (async function init() {
    try {
      setStatus('Loading registry…');
      registry = await fetchWithFallback(REGISTRY_CANDIDATES);
      fillSelect(registry);
      setStatus(''); // ready
    } catch (e) {
      setStatus('Init error: Could not load commentary.json from expected locations');
      console.error(e);
    }
  })();

  els.select.addEventListener('change', async () => {
    const idx = Number(els.select.value);
    if (Number.isNaN(idx)) return;
    current = registry[idx];
    renderMeta(current);
    els.text.textContent = 'Fetching commentary text…';
    setStatus('');
    try {
      if (!current?.reference_url) throw new Error('No reference_url for this item.');
      await loadText(current.reference_url);
      currentText = els.text.textContent;
      setStatus('');
    } catch (e) {
      els.text.textContent = 'Unable to load the commentary text.';
      setStatus(String(e.message || e));
      console.error(e);
    }
  });

  els.exportBtn.addEventListener('click', () => {
    const name = (current?.reference || 'commentary').replace(/\s+/g, '_') + '.txt';
    const content = currentText || els.text.textContent || '';
    download(name, content);
  });

  els.printBtn.addEventListener('click', () => {
    // Simple print of the whole page (keeps header branding);
    // systems that need just the text can select/copy or export.
    window.print();
  });

  // ------- Drawer (non-intrusive init; no duplicate buttons) -------
  if (typeof window.initRepoDrawer === 'function') {
    window.initRepoDrawer({
      button: '#openDrawer',
      drawer: '#repoDrawer',
      list: '#repoLinks',
      links: [
        { label: 'Rules Repository',            href: 'https://info1691.github.io/rules-ui/' },
        { label: 'Laws Repository',             href: 'https://info1691.github.io/laws-ui/' },
        { label: 'Commentary Viewer',           href: 'https://info1691.github.io/commentary-ui/' },
        { label: 'Trust Law Textbooks',         href: 'https://info1691.github.io/Law-Texts-ui/' },
        { label: 'Compliance – Citations',      href: 'https://info1691.github.io/compliance-ui/' },
        { label: 'Citations – Bulk Upload',     href: 'https://info1691.github.io/compliance-ui/bulk/' },
        { label: 'Breaches Manager',            href: 'https://info1691.github.io/breaches-ui/' }
      ]
    });
  }
})();

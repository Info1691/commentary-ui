// commentary-ui/main.js v2 – robust ids + no duplicate drawer triggers
(function () {
  const byId = (id) => document.getElementById(id);
  const $ = (sel, root) => (root || document).querySelector(sel);

  // Try several ids for backward-compat, fall back to first <select> in the card
  function findSelect() {
    return byId('commentSelect') ||
           byId('commentarySelect') ||
           byId('selectCommentary') ||
           $('.card select');
  }

  const els = {
    select: findSelect(),
    jurisdiction: byId('jurisdiction'),
    reference: byId('reference'),
    source: byId('source'),
    text: byId('commentText'),
    exportBtn: byId('exportBtn'),
    printBtn: byId('printBtn'),
    status: byId('status'),
    drawerBtn: byId('openDrawer'),
    repoLinks: byId('repoLinks'),
    drawer: byId('repoDrawer')
  };

  function setStatus(m){ if (els.status) els.status.textContent = m || ''; }

  const REGISTRY_CANDIDATES = [
    'data/commentary/commentary.json',
    'commentary.json',
    'data/commentary.json'
  ];

  async function fetchJSON(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error(`${url} → ${r.status}`);
    return r.json();
  }
  async function fetchTxt(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error(`${url} → ${r.status}`);
    return r.text();
  }

  async function loadRegistry() {
    let lastErr;
    for (const p of REGISTRY_CANDIDATES) {
      try { return await fetchJSON(p); } catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('No registry found.');
  }

  function fillSelect(items) {
    if (!els.select) throw new Error('Select element not found.');
    els.select.innerHTML = '<option value="">Select a Commentary</option>';
    items.forEach((it, i) => {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = it.title;
      els.select.appendChild(o);
    });
  }

  function renderMeta(item){
    if (els.jurisdiction) els.jurisdiction.textContent = item?.jurisdiction || '—';
    if (els.reference)    els.reference.textContent    = item?.reference    || '—';
    if (els.source)       els.source.textContent       = item?.source       || '—';
  }

  function download(name, content){
    const blob = new Blob([content || ''], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name || 'commentary.txt';
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove();
  }

  // ---------- init ----------
  let registry = [];
  let current = null;
  let currentText = '';

  (async function init(){
    try{
      if (!els.select) throw new Error('Select element not found on page.');
      setStatus('Loading registry…');
      registry = await loadRegistry();
      fillSelect(registry);
      setStatus('');
    }catch(e){
      setStatus('Init error: Could not load commentary.json from expected locations');
      console.error(e);
    }

    // Safe drawer init (does not create extra trigger)
    if (typeof window.initRepoDrawer === 'function') {
      window.initRepoDrawer({
        button: '#openDrawer',
        drawer: '#repoDrawer',
        list:   '#repoLinks',
        links: [
          { label:'Rules Repository',        href:'https://info1691.github.io/rules-ui/' },
          { label:'Laws Repository',         href:'https://info1691.github.io/laws-ui/' },
          { label:'Commentary Viewer',       href:'https://info1691.github.io/commentary-ui/' },
          { label:'Trust Law Textbooks',     href:'https://info1691.github.io/Law-Texts-ui/' },
          { label:'Compliance – Citations',  href:'https://info1691.github.io/compliance-ui/' },
          { label:'Citations – Bulk Upload', href:'https://info1691.github.io/compliance-ui/bulk/' },
          { label:'Breaches Manager',        href:'https://info1691.github.io/breaches-ui/' }
        ]
      });
    }
  })();

  // ---------- events ----------
  if (els.select) {
    els.select.addEventListener('change', async () => {
      const idx = Number(els.select.value);
      if (Number.isNaN(idx)) return;
      current = registry[idx];
      renderMeta(current);
      if (els.text) els.text.textContent = 'Fetching commentary text…';
      setStatus('');
      try{
        const path = current?.reference_url;
        if (!path) throw new Error('No reference_url for this item.');
        const txt = await fetchTxt(path);
        currentText = txt;
        if (els.text) els.text.textContent = txt;
      }catch(e){
        if (els.text) els.text.textContent = 'Unable to load the commentary text.';
        setStatus(String(e.message || e));
        console.error(e);
      }
    });
  }

  if (els.exportBtn) {
    els.exportBtn.addEventListener('click', () => {
      const name = (current?.reference || 'commentary').replace(/\s+/g,'_') + '.txt';
      download(name, currentText || (els.text ? els.text.textContent : ''));
    });
  }
  if (els.printBtn) {
    els.printBtn.addEventListener('click', () => window.print());
  }
})();

/* commentary-ui/main.js
   - Looks for commentary.json in multiple safe locations
   - Populates the select, loads text files from reference_url
   - Keeps everything read-only (no writes)
*/
(function () {
  // ---------- tiny helpers ----------
  const $ = (s) => document.querySelector(s);
  const els = {
    select: $('#commentarySelect'),
    jurisdiction: $('#jurisdiction'),
    reference: $('#reference'),
    source: $('#source'),
    text: $('#commentaryText'),
    exportBtn: $('#exportBtn'),
    printBtn: $('#printBtn'),
    status: $('#status')
  };
  const setStatus = (m) => { if (els.status) els.status.textContent = m || ''; };

  // ---------- where to look for the registry ----------
  // Works on GitHub Pages regardless of subpath depth.
  const REGISTRY_PATHS = [
    'data/commentary/commentary.json', // preferred (yours)
    './data/commentary/commentary.json',
    'commentary.json',                 // root fallback
    './commentary.json'
  ];

  async function fetchFirst(paths) {
    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (!res.ok) continue;
        return await res.json();
      } catch (_) { /* try next */ }
    }
    throw new Error('Could not load commentary.json from expected locations');
  }

  function renderOptions(items) {
    // Clear existing
    els.select.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select a Commentary';
    els.select.appendChild(ph);

    items.forEach((it, idx) => {
      const o = document.createElement('option');
      o.value = String(idx);
      o.textContent = it.title || '(untitled)';
      o.dataset.jurisdiction = it.jurisdiction || '';
      o.dataset.reference = it.reference || '';
      o.dataset.source = it.source || '';
      o.dataset.url = it.reference_url || '';
      els.select.appendChild(o);
    });
  }

  async function loadText(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load: ${url}`);
    return await res.text();
  }

  function wireExport(filenameStem) {
    els.exportBtn.onclick = () => {
      const blob = new Blob([els.text.value || ''], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (filenameStem || 'commentary') + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    };
  }

  function wirePrint() {
    els.printBtn.onclick = () => window.print();
  }

  async function init() {
    try {
      setStatus('Loading…');
      const registry = await fetchFirst(REGISTRY_PATHS);

      // Expecting an array of items
      const items = Array.isArray(registry) ? registry : [];
      renderOptions(items);

      els.select.onchange = async (e) => {
        const opt = e.target.selectedOptions[0];
        if (!opt || !opt.dataset.url) {
          els.text.value = '';
          els.jurisdiction.textContent = '—';
          els.reference.textContent = '—';
          els.source.textContent = '—';
          return;
        }
        const url = opt.dataset.url.trim();
        els.jurisdiction.textContent = opt.dataset.jurisdiction || '—';
        els.reference.textContent = opt.dataset.reference || '—';
        els.source.textContent = opt.dataset.source || '—';

        try {
          setStatus('Fetching commentary text…');
          const txt = await loadText(url);
          els.text.value = txt;
          setStatus(''); // clear
          wireExport((opt.textContent || 'commentary').toLowerCase().replace(/\s+/g,'-'));
        } catch (err) {
          els.text.value = '';
          console.error(err);
          setStatus('Error: ' + err.message);
        }
      };

      wireExport('commentary');
      wirePrint();
      setStatus('Ready.');
    } catch (err) {
      console.error(err);
      setStatus('Init error: ' + err.message);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// commentary-ui/main.js — robust loader with path fallbacks
(function () {
  'use strict';

  // ---- DOM ----
  const $ = (s) => document.querySelector(s);
  const els = {
    select: $('#select'),
    docText: $('#docText'),
    jurisdiction: $('#jurisdiction'),
    reference: $('#reference'),
    source: $('#source'),
    exportBtn: $('#exportBtn'),
    printBtn: $('#printBtn'),
    status: $('#status'),
  };

  // Guard: if core elements missing, bail with a visible note
  function must(el, name) {
    if (!el) throw new Error(`Missing required element: ${name}`);
  }
  try {
    must(els.select, 'select#select');
    must(els.docText, 'textarea#docText');
    must(els.jurisdiction, '#jurisdiction');
    must(els.reference, '#reference');
    must(els.source, '#source');
    must(els.exportBtn, '#exportBtn');
    must(els.printBtn, '#printBtn');
  } catch (e) {
    console.error(e);
    if (els.status) els.status.textContent = `Init error: ${e.message}`;
    return;
  }

  // ---- Helpers ----
  const setStatus = (m) => { if (els.status) els.status.textContent = m || ''; };
  const toText = (v) => (v == null ? '' : String(v));

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return res.json();
  }
  async function fetchTXT(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return res.text();
  }

  async function fetchFirst(paths) {
    const errs = [];
    for (const p of paths) {
      try { return { data: await fetchJSON(p), path: p }; }
      catch (e) { errs.push(String(e.message || e)); }
    }
    throw new Error(`Could not load commentary.json from expected locations:\n- ${paths.join('\n- ')}\nErrors:\n${errs.join('\n')}`);
  }

  // Normalize entries to a common shape
  function normalizeEntry(e) {
    return {
      title: toText(e.title),
      jurisdiction: toText(e.jurisdiction),
      reference: toText(e.reference),
      source: toText(e.source),
      reference_url: toText(e.reference_url), // path to .txt
    };
  }

  // Render select options
  function renderSelect(entries) {
    els.select.innerHTML = ''; // safe now (we validated exists)
    const opt0 = document.createElement('option');
    opt0.textContent = 'Select a Commentary';
    opt0.value = '';
    els.select.appendChild(opt0);

    entries.forEach((e, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = e.title || `(untitled #${i + 1})`;
      els.select.appendChild(opt);
    });
  }

  // Load one commentary text + meta
  async function loadEntry(entry) {
    if (!entry) return;
    setStatus('Fetching commentary text…');
    els.jurisdiction.textContent = entry.jurisdiction || '—';
    els.reference.textContent = entry.reference || '—';
    els.source.textContent = entry.source || '—';
    els.docText.value = ''; // clear

    try {
      // reference_url is stored relative to the repo root (e.g., data/commentary/jersey/foo.txt)
      // fetchTXT will resolve it relative to current page automatically
      const txt = await fetchTXT(entry.reference_url);
      els.docText.value = txt;
      setStatus('Loaded.');
    } catch (err) {
      const msg = `Failed to load text: ${entry.reference_url} → ${err.message || err}`;
      console.error(msg);
      els.docText.value = msg;
      setStatus('Error.');
    }
  }

  // Export to .txt (downloads the current textarea content)
  function exportTxt(filenameBase) {
    const blob = new Blob([els.docText.value || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (filenameBase || 'commentary').replace(/[^\w.-]+/g, '_').slice(0, 80);
    a.href = url;
    a.download = `${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---- Init flow ----
  const registryPaths = [
    'data/commentary/commentary.json',
    'data/commentary.json',
    'commentary.json',
  ];

  let REGISTRY = [];

  async function init() {
    try {
      setStatus('Loading registry…');
      const { data, path } = await fetchFirst(registryPaths);
      // Expecting an array
      if (!Array.isArray(data)) throw new Error(`Registry is not an array (${path})`);
      REGISTRY = data.map(normalizeEntry);
      renderSelect(REGISTRY);
      setStatus(`Loaded registry: ${path}`);

      // If URL has ?i=n select it
      const url = new URL(window.location.href);
      const i = url.searchParams.get('i');
      if (i && REGISTRY[+i]) {
        els.select.value = String(+i);
        loadEntry(REGISTRY[+i]);
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || String(err));
    }
  }

  // ---- Events ----
  els.select.addEventListener('change', () => {
    const idx = +els.select.value;
    if (Number.isFinite(idx) && idx >= 0 && idx < REGISTRY.length) {
      loadEntry(REGISTRY[idx]);
      // keep index in URL for deep-linking
      const u = new URL(window.location.href);
      u.searchParams.set('i', String(idx));
      history.replaceState(null, '', u.toString());
    }
  });

  els.exportBtn.addEventListener('click', () => {
    const idx = +els.select.value;
    const base = (REGISTRY[idx]?.reference || REGISTRY[idx]?.title || 'commentary');
    exportTxt(base);
  });

  els.printBtn.addEventListener('click', () => window.print());

  // Kick off
  document.addEventListener('DOMContentLoaded', init);
})();

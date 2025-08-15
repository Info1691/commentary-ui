// commentary-ui/main.js
(function(){
  const $ = (s, c = document) => c.querySelector(s);
  const els = {};
  let REG = [], CUR = null;

  const setStatus = m => { const el = $('#status'); if (el) el.textContent = m || ''; };

  async function fetchJSON(p){ const r = await fetch(p,{cache:'no-store'}); if(!r.ok) throw new Error(`${p} → ${r.status}`); return r.json(); }
  async function fetchText(p){ const r = await fetch(p,{cache:'no-store'}); if(!r.ok) throw new Error(`${p} → ${r.status}`); return r.text(); }

  // Normalise text (NBSP, CRLF, common bullet squares, BOM)
  function normalise(txt){
    return String(txt || '')
      .replace(/^\uFEFF/, '')                // BOM
      .replace(/\u00A0/g,' ')                // NBSP
      .replace(/\r\n/g,'\n')                 // CRLF → LF
      .replace(/[\u25A0\u25AA\u25CF\u25E6]/g,'•'); // square/black bullets → •
  }

  // Try several URL candidates until one works
  async function loadTextWithFallbacks(raw){
    const here = new URL(window.location.href);
    const base = here.origin + here.pathname.replace(/\/[^/]*$/, '/'); // repo folder

    const isAbs = /^https?:\/\//i.test(raw||'');
    const cleaned = (raw||'').replace(/^\.\//,'').replace(/^\/+/,'');
    const enc = cleaned.split('/').map(encodeURIComponent).join('/');

    const candidates = [
      // as-given
      isAbs ? raw : cleaned,
      // encoded
      isAbs ? raw : enc,
      // prefix with data/commentary/
      'data/commentary/' + cleaned,
      'data/commentary/' + enc,
      // common subfolders
      'data/commentary/jersey/' + cleaned,
      'data/commentary/jersey/' + enc,
      'data/commentary/uk/' + cleaned,
      'data/commentary/uk/' + enc,
    ].map(u => isAbs ? u : (u.startsWith('http') ? u : base + u));

    const tried = [];
    for (const u of candidates){
      try {
        const txt = await fetchText(u);
        return { url:u, text: normalise(txt) };
      } catch (e) {
        tried.push(`${u} (${e.message})`);
      }
    }
    throw new Error(`No TXT found. Tried:\n- ` + tried.join('\n- '));
  }

  async function loadRegistry(){
    const paths = ['commentary.json','data/commentary.json','data/Commentary.json'];
    for (const p of paths){
      try{
        const data = await fetchJSON(p);
        if (Array.isArray(data)) { setStatus(`Loaded registry: ${p}`); return data; }
      }catch{}
    }
    throw new Error('Could not load commentary.json from expected locations.');
  }

  async function show(entry){
    CUR = entry || null;
    $('#jurisdiction').textContent = entry?.jurisdiction || '—';
    $('#reference').textContent    = entry?.reference    || '—';
    $('#source').textContent       = entry?.source       || '—';
    $('#commentaryText').value     = '';

    if (!entry?.reference_url){ setStatus('No reference_url on this item.'); return; }

    try{
      const { url, text } = await loadTextWithFallbacks(entry.reference_url);
      $('#commentaryText').value = text;
      setStatus(`Loaded: ${url}`);
    }catch(err){
      $('#commentaryText').value = '';
      setStatus(err.message);
      console.error(err);
    }
  }

  function bind(){
    els.select = $('#commentarySelect');
    $('#exportBtn').addEventListener('click', ()=>{
      if (!CUR) return;
      const blob = new Blob([$('#commentaryText').value||''], {type:'text/plain;charset=utf-8'});
      const a = document.createElement('a');
      a.download = `${(CUR.title||'commentary').replace(/[^-_\w\s]+/g,'').trim().replace(/\s+/g,'_')}.txt`;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#printBtn').addEventListener('click', ()=> window.print());

    els.select.addEventListener('change', ()=>{
      const i = Number(els.select.value);
      if (Number.isFinite(i) && REG[i]) show(REG[i]);
      else { CUR = null; $('#commentaryText').value=''; setStatus('No commentary selected.'); }
    });
  }

  async function init(){
    if (typeof window.initRepoDrawer==='function'){
      window.initRepoDrawer($('#drawerToggle'));
    }
    bind();
    try{
      REG = await loadRegistry();
      const sel = $('#commentarySelect');
      sel.innerHTML = '<option value="">Select a Commentary</option>';
      REG.forEach((it,idx)=>{
        const o = document.createElement('option');
        o.value = String(idx);
        o.textContent = it.title || '(untitled)';
        sel.appendChild(o);
      });
      if (REG.length){ sel.value='0'; show(REG[0]); }
    }catch(err){
      setStatus(`Init error: ${err.message}`);
      console.error(err);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();

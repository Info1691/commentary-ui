// commentary-ui/main.js – init AFTER drawer, AFTER DOM
(function(){
  const $ = (s, c = document) => c.querySelector(s);

  function setStatus(m){ const el=$('#status'); if(el) el.textContent=m||''; }
  async function fetchJSON(p){ const r = await fetch(p,{cache:'no-store'}); if(!r.ok) throw new Error(`${p} → ${r.status}`); return r.json(); }
  async function fetchText(p){ const r = await fetch(p,{cache:'no-store'}); if(!r.ok) throw new Error(`${p} → ${r.status}`); return r.text(); }
  function norm(s){ return (s||'').replace(/\u00A0/g,' ').replace(/\r\n/g,'\n').replace(/[\u25A0\u25AA\u25CF\u25E6]/g,'•'); }

  const els = {};
  let REG = [];
  let CUR = null;

  async function loadRegistry(){
    // Try multiple locations (case-sensitive on GH Pages)
    const paths = [
      'commentary.json',
      'data/commentary.json',
      'data/Commentary.json'
    ];
    for(const p of paths){
      try{
        const data = await fetchJSON(p);
        if(Array.isArray(data)){ setStatus(`Loaded registry: ${p}`); return data; }
      }catch(e){ /* continue */ }
    }
    throw new Error('Could not load commentary.json from expected locations');
  }

  async function show(entry){
    CUR = entry || null;
    $('#jurisdiction').textContent = entry?.jurisdiction || '—';
    $('#reference').textContent   = entry?.reference    || '—';
    $('#source').textContent      = entry?.source       || '—';
    $('#commentaryText').value = '';

    if(!entry?.reference_url){ setStatus('No reference_url on this item.'); return; }
    try{
      const txt = await fetchText(entry.reference_url);
      $('#commentaryText').value = norm(txt);
      setStatus(`Loaded: ${entry.reference_url}`);
    }catch(err){
      setStatus(`Failed to load: ${entry.reference_url} → ${err.message}`);
    }
  }

  function bind(){
    els.select = $('#commentarySelect');
    $('#exportBtn').addEventListener('click', ()=>{
      if(!CUR) return;
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
      if(Number.isFinite(i) && REG[i]) show(REG[i]);
      else { CUR=null; $('#commentaryText').value=''; setStatus('No commentary selected.'); }
    });
  }

  async function init(){
    // ensure drawer API exists before binding button
    if(typeof window.initRepoDrawer==='function'){
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
      if(REG.length){ sel.value='0'; show(REG[0]); }
    }catch(err){
      setStatus(`Init error: ${err.message}`);
      console.error(err);
    }
  }

  // Run only after DOM is ready
  window.addEventListener('DOMContentLoaded', init);
})();

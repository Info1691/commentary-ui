/* Minimal, self-initializing repo drawer
   Looks for ./repos.json (array of {name,url,desc?})
   Falls back to a sensible default list if missing.
*/
(function () {
  const BRAND_NAME = 'Navigator';
  const LOGO_PATH = 'logo.png';       // assumes logo.png at repo root next to index.html
  const REGISTRY  = 'repos.json';     // optional; if 404, fallback list is used

  const FALLBACK = [
    { name: 'Rules Repository',        url: 'https://info1691.github.io/rules-ui/' },
    { name: 'Laws Repository',         url: 'https://info1691.github.io/laws-ui/' },
    { name: 'Commentary Viewer',       url: 'https://info1691.github.io/commentary-ui/' },
    { name: 'Trust Law Textbooks',     url: 'https://info1691.github.io/Law-Texts-ui/' },
    { name: 'Compliance – Citations',  url: 'https://info1691.github.io/compliance-ui/' },
    { name: 'Citations – Bulk Upload', url: 'https://info1691.github.io/compliance-ui/bulk/' },
    { name: 'Breaches Manager',        url: 'https://info1691.github.io/breaches-ui/' }
  ];

  // ---- mount points
  const btn = document.createElement('button');
  btn.id = 'repoDrawer_toggle';
  btn.type = 'button';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z"/></svg>
    Repos
  `;
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'repoDrawer_overlay';
  document.body.appendChild(overlay);

  const shell = document.createElement('aside');
  shell.id = 'repoDrawer';
  shell.innerHTML = `
    <header>
      <img src="${LOGO_PATH}" alt="Logo"/>
      <h3>${BRAND_NAME}</h3>
    </header>
    <nav class="list" id="repoDrawer_list" role="navigation" aria-label="Repositories"></nav>
    <div class="foot">Press Esc to close • Swipe right to open, left to close</div>
  `;
  document.body.appendChild(shell);

  const els = {
    drawer: shell,
    list: shell.querySelector('#repoDrawer_list'),
    overlay
  };

  // ---- behavior
  const open = () => {
    shell.classList.add('open');
    overlay.classList.add('show');
  };
  const close = () => {
    shell.classList.remove('open');
    overlay.classList.remove('show');
  };
  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // basic swipe close on touch
  let startX = null;
  document.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchmove',  (e)=>{
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    // If drawer is open and user swipes left enough, close
    if (shell.classList.contains('open') && dx < -60) { close(); startX = null; }
    // If drawer is closed and user swipes right from edge, open
    if (!shell.classList.contains('open') && startX < 24 && dx > 60) { open(); startX = null; }
  }, {passive:true});
  document.addEventListener('touchend', ()=>{ startX = null; });

  // ---- load registry (optional)
  async function loadRegistry() {
    try {
      const res = await fetch(REGISTRY, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
      return FALLBACK;
    } catch {
      return FALLBACK;
    }
  }

  function render(list) {
    const curr = location.href.replace(/\/+$/, '');
    els.list.innerHTML = '';
    list.forEach((r) => {
      const a = document.createElement('a');
      a.href = r.url;
      a.className = 'item';
      a.innerHTML = `${r.name}${r.desc ? `<small>${r.desc}</small>` : ''}`;
      // Mark current repo (no hard styles; relies on hover styles)
      if (curr.startsWith(r.url.replace(/\/+$/, ''))) {
        a.style.borderColor = 'var(--drawer-line)';
        a.style.background = 'var(--drawer-hover)';
      }
      els.list.appendChild(a);
    });
  }

  loadRegistry().then(render);
})();

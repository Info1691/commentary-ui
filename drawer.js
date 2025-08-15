<script>
/* bc-drawer v2 — dynamic repo index for GitHub Pages
   - Builds links on the current host (user.github.io)
   - Safe class namespace (bc-), no collisions
   - Left-side drawer; right-side drawers remain unaffected
*/

/* Configure your repo slugs & titles once.
   The code will output https://{current-host}/{slug}/
*/
window.BC_REPOS = window.BC_REPOS || [
  { slug: 'compliance-ui', title: 'Compliance Citation Viewer' },
  { slug: 'compliance-ui/bulk', title: 'Citations – Bulk Uploader' },
  { slug: 'rules-ui', title: 'Rules Repository' },
  { slug: 'laws-ui', title: 'Laws Repository' },
  { slug: 'commentary-ui', title: 'Commentary Viewer' },
  { slug: 'textbooks-ui', title: 'Trust Law Textbooks' },
  { slug: 'breaches-ui', title: 'Breaches Repository' }
];

(function(){
  const ORIGIN = window.location.origin; // e.g. https://yourname.github.io

  const make = (tag, cls, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  };

  // Toggle button
  const btn = make('button', 'bc-drawer-toggle', 'Repos');
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'bc-drawer');

  // Dim overlay
  const dim = make('div', 'bc-dim');

  // Drawer shell
  const drawer = make('aside', 'bc-drawer');
  drawer.id = 'bc-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Repositories');

  // Header
  const head = make('div', 'bc-drawer__head',
    '<h2 class="bc-drawer__title">Repositories</h2>');
  const close = make('button', 'bc-drawer__close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  head.appendChild(close);

  // Search
  const searchWrap = make('div', 'bc-drawer__search');
  const search = make('input', '');
  search.type = 'search';
  search.placeholder = 'Filter…';
  searchWrap.appendChild(search);

  // List
  const ul = make('ul', 'bc-drawer__list');

  function buildHref(slug){
    // ensure single leading slash
    const path = slug.startsWith('/') ? slug : '/' + slug;
    // ensure trailing slash for GitHub Pages project sites
    return ORIGIN + path.replace(/\/?$/, '/');
  }

  function render(filter=''){
    const q = (filter||'').trim().toLowerCase();
    ul.innerHTML = '';
    (window.BC_REPOS || []).forEach(({slug, title})=>{
      if (!slug || !title) return;
      if (q && !title.toLowerCase().includes(q)) return;
      const href = buildHref(slug);
      const li = make('li', 'bc-drawer__item');
      const a = make('a','', `<span>${title}</span><small>${new URL(href).pathname}</small>`);
      a.href = href;
      a.rel = 'noopener';
      a.target = '_self'; // same tab
      li.appendChild(a);
      ul.appendChild(li);
    });
  }
  render();

  // Assemble & mount
  drawer.appendChild(head);
  drawer.appendChild(searchWrap);
  drawer.appendChild(ul);
  document.body.appendChild(btn);
  document.body.appendChild(dim);
  document.body.appendChild(drawer);

  // Open/close behavior
  const open = () => {
    drawer.classList.add('open');
    dim.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    setTimeout(()=> search.focus(), 0);
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    dim.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    btn.focus();
  };

  btn.addEventListener('click', open);
  close.addEventListener('click', closeDrawer);
  dim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });
  search.addEventListener('input', ()=> render(search.value));
})();
</script>

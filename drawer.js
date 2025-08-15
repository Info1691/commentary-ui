/* drawer.js v2 — robust left drawer for all repos */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const el = (t, p={}) => Object.assign(document.createElement(t), p);

  // ---- Links registry (fallback if window.REPO_LINKS is missing)
  const FALLBACK_LINKS = [
    { label: "Rules Repository",        url: "https://info1691.github.io/rules-ui/" },
    { label: "Laws Repository",         url: "https://info1691.github.io/laws-ui/" },
    { label: "Commentary Viewer",       url: "https://info1691.github.io/commentary-ui/" },
    { label: "Trust Law Textbooks",     url: "https://info1691.github.io/Law-Texts-ui/" },
    { label: "Compliance – Citations",  url: "https://info1691.github.io/compliance-ui/" },
    { label: "Citations – Bulk Upload", url: "https://info1691.github.io/compliance-ui/bulk/" },
    { label: "Breaches Manager",        url: "https://info1691.github.io/breaches-ui/" }
  ];
  const LINKS = (Array.isArray(window.REPO_LINKS) && window.REPO_LINKS.length)
    ? window.REPO_LINKS : FALLBACK_LINKS;

  // ---- Ensure single mount
  let root = $('#repoDrawer');
  if (!root) {
    root = el('div', { id: 'repoDrawer' });
    document.body.prepend(root);
  }
  root.innerHTML = `
    <div class="drawer-overlay" aria-hidden="true"></div>
    <aside class="drawer-panel" role="navigation" aria-label="Repos navigator">
      <div class="drawer-head">
        <span class="drawer-title">Repos</span>
        <button class="drawer-close" type="button" aria-label="Close">×</button>
      </div>
      <ul class="drawer-list" id="drawerList"></ul>
    </aside>
  `;

  // Populate list
  const ul = $('#drawerList', root);
  LINKS.forEach(link => {
    const li = el('li');
    const a  = el('a', { href: link.url, target: '_self', rel: 'noopener', textContent: link.label });
    li.appendChild(a);
    ul.appendChild(li);
  });

  // Toggle hookup
  let btn = $('#drawerBtn');
  if (!btn) {
    // create a default button if one isn’t present
    const header = document.querySelector('.app-header') || document.body;
    btn = el('button', { id: 'drawerBtn', type: 'button', textContent: 'Repos' });
    header.prepend(btn);
  }

  const overlay = $('.drawer-overlay', root);
  const panel   = $('.drawer-panel', root);
  const close   = $('.drawer-close', root);
  const openCls = 'drawer-open';

  const open = () => {
    document.documentElement.classList.add(openCls);
    root.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    // focus first link
    const first = $('#drawerList a', root);
    if (first) first.focus({ preventScroll:true });
  };
  const closeDrawer = () => {
    document.documentElement.classList.remove(openCls);
    root.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    btn.focus({ preventScroll:true });
  };
  const isOpen = () => document.documentElement.classList.contains(openCls);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    isOpen() ? closeDrawer() : open();
  });
  overlay.addEventListener('click', closeDrawer);
  close.addEventListener('click', closeDrawer);

  // Keyboard: Esc closes; trap focus inside panel when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); closeDrawer(); }
    if (!isOpen()) return;
    if (e.key === 'Tab') {
      const focusables = $$('.drawer-panel a, .drawer-close', root);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Prevent content from scrolling horizontally when drawer opens
  panel.addEventListener('wheel', (e) => {
    // allow vertical scroll inside; nothing else special
  }, { passive:true });
})();

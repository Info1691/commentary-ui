// drawer.js v2 — uses an existing trigger if provided; never injects a second button
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function toggle(el, show) {
    if (!el) return;
    if (typeof show === 'boolean') {
      el.hidden = !show;
      document.body.classList.toggle('drawer-open', show);
    } else {
      el.hidden = !el.hidden;
      document.body.classList.toggle('drawer-open', !el.hidden);
    }
  }

  function populateLinks(ul, links) {
    if (!ul) return;
    ul.innerHTML = '';
    links.forEach(l => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  window.initRepoDrawer = function initRepoDrawer(opts) {
    const button = typeof opts.button === 'string' ? qs(opts.button) : opts.button;
    const drawer = typeof opts.drawer === 'string' ? qs(opts.drawer) : opts.drawer;
    const list   = typeof opts.list   === 'string' ? qs(opts.list)   : opts.list;

    // DO NOT create any extra trigger; only wire the one we were given
    // Also remove any previously auto-inserted trigger (defensive)
    qsa('.drawer-trigger-auto').forEach(n => n.remove());

    populateLinks(list, opts.links || []);

    if (button && drawer) {
      button.addEventListener('click', () => toggle(drawer));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggle(drawer, false);
      });
      // Click outside to close
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) toggle(drawer, false);
      });
    }
  };
})();

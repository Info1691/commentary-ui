(function(){
  if (window.__drawerInit) return;

  const REPOS = [
    { name:'Rules Repository',         url:'https://info1691.github.io/rules-ui/' },
    { name:'Laws Repository',          url:'https://info1691.github.io/laws-ui/' },
    { name:'Commentary Viewer',        url:'https://info1691.github.io/commentary-ui/' },
    { name:'Trust Law Textbooks',      url:'https://info1691.github.io/Law-Texts-ui/' },
    { name:'Compliance – Citations',   url:'https://info1691.github.io/compliance-ui/' },
    { name:'Citations – Bulk Upload',  url:'https://info1691.github.io/compliance-ui/bulk/' },
    { name:'Breaches Manager',         url:'https://info1691.github.io/compliance-ui/breaches/' },
  ];

  function buildDrawer(){
    const backdrop = document.createElement('div');
    backdrop.id = 'drawerBackdrop';

    const drawer = document.createElement('nav');
    drawer.id = 'drawer';
    drawer.setAttribute('aria-label','Repos navigator');
    drawer.innerHTML = `
      <div class="drawer-header">
        <img src="logo.png" alt="" class="drawer-logo">
        <h2 class="drawer-title">Repos</h2>
      </div>
      <ul class="drawer-list" id="drawerList"></ul>
      <div class="drawer-muted">Press Esc to close • Swipe right to open, left to close</div>
    `;

    document.body.append(backdrop, drawer);

    const list = drawer.querySelector('#drawerList');
    REPOS.forEach(r => {
      const li = document.createElement('li');
      li.className = 'drawer-item';
      li.innerHTML = `<a href="${r.url}">${r.name}</a>`;
      list.appendChild(li);
    });

    function open(){ backdrop.classList.add('open'); drawer.classList.add('open'); }
    function close(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); }

    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });

    // basic swipe
    let startX=null;
    document.addEventListener('touchstart',(e)=>{ startX = e.touches[0].clientX; },{passive:true});
    document.addEventListener('touchend',(e)=>{
      if(startX==null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if(!drawer.classList.contains('open') && startX<30 && dx>40) open();
      if(drawer.classList.contains('open') && dx<-40) close();
      startX=null;
    });

    return { open, close };
  }

  let api=null;
  window.initRepoDrawer = function(toggleBtn){
    if(!api) api = buildDrawer();
    if(toggleBtn && !toggleBtn.__drawerBound){
      toggleBtn.addEventListener('click', ()=> api.open());
      toggleBtn.__drawerBound = true;
    }
  };

  window.__drawerInit = true;
})();

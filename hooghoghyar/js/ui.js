// ui.js — UI helpers, theme, drawer, vh, haptic, sanitize

export function escapeHtml(str){
  if(str==null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
export function sanitizeHTML(html){
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelectorAll('script').forEach(el=> el.remove());
  t.content.querySelectorAll('*').forEach(el=>{
    [...el.attributes].forEach(attr=>{
      if(attr.name.startsWith('on')) el.removeAttribute(attr.name);
    });
    if(el.getAttribute('href')?.startsWith('javascript:')) el.removeAttribute('href');
  });
  return t.innerHTML;
}

export function toast(msg){
  let el = document.querySelector('.toast');
  if(!el){
    el = document.createElement('div');
    el.className='toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('show'), 2200);
}


export function initDrawer(){
  const drawer=document.getElementById('drawer');
  const toggle=document.getElementById('menuToggle');
  const closeBtn=document.getElementById('drawerClose');
  // create backdrop if not exists
  let backdrop = document.getElementById('drawerBackdrop');
  if(!backdrop){
    backdrop = document.createElement('div');
    backdrop.id='drawerBackdrop';
    backdrop.style.cssText='position:fixed; inset:0; background:oklch(0 0 0 / 0.32); backdrop-filter:blur(2px); z-index:49; display:none';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', ()=> closeDrawer());
  }
  function openDrawer(){
    if(!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    toggle?.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    if(backdrop) backdrop.style.display='block';
    const first = drawer.querySelector('button, a, input');
    first?.focus();
  }
  function closeDrawer(){
    if(!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    toggle?.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    if(backdrop) backdrop.style.display='none';
    toggle?.focus();
  }
  toggle?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  drawer?.addEventListener('click', (e)=>{ if(e.target===drawer) closeDrawer(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && drawer?.classList.contains('open')) closeDrawer(); });
  let startX=0;
  drawer?.addEventListener('touchstart', e=> startX=e.touches[0].clientX, {passive:true});
  drawer?.addEventListener('touchmove', e=>{
    const dx=e.touches[0].clientX-startX;
    if(dx>40) closeDrawer();
  }, {passive:true});
  window.openDrawer=openDrawer; window.closeDrawer=closeDrawer;
}

export function initVH(){
  function setVH(){
    const vh=window.innerHeight*0.01;
    document.documentElement.style.setProperty('--vh', vh+'px');
    const svh=window.visualViewport ? window.visualViewport.height*0.01 : vh;
    document.documentElement.style.setProperty('--svh', svh+'px');
  }
  setVH();
  window.addEventListener('resize', setVH, {passive:true});
  window.addEventListener('orientationchange', ()=> setTimeout(setVH,200));
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', setVH, {passive:true});
  }
  let ticking=false, t;
  window.addEventListener('scroll', ()=>{
    if(!ticking){ document.documentElement.classList.add('is-scrolling'); ticking=true; }
    clearTimeout(t);
    t=setTimeout(()=>{ document.documentElement.classList.remove('is-scrolling'); ticking=false; }, 180);
  }, {passive:true});
}

export function isDesktop(){ return window.innerWidth>900; }
export function isMobile(){ return !isDesktop(); }

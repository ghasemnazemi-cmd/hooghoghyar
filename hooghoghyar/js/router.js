// router.js — Single definition (was 10 duplicates before)
import { get, set } from './storage.js';

const tabs = ['home','courses','bank','exam','leader','booklet','admin'];

export function switchTab(which){
  if(!tabs.includes(which)) return;
  // hide all
  document.querySelectorAll('.tabs').forEach(el=> el.classList.remove('active'));
  const target = document.getElementById('tab-'+which);
  if(target) target.classList.add('active');
  // nav active
  document.querySelectorAll('.nav-link, .drawer-link, .bottom-nav button').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.tab===which);
  });
  // aria
  document.querySelectorAll('[data-tab]').forEach(btn=>{
    btn.setAttribute('aria-selected', btn.dataset.tab===which ? 'true':'false');
  });
  // remember
  set('lastTab', which);
  // scroll top
  window.scrollTo({top:0, behavior:'smooth'});
  // close drawer on mobile
  if(window.innerWidth<=900 && window.closeDrawer) window.closeDrawer();
}

export function initRouter(){
  // init from storage or hash
  const hash = location.hash.replace('#','');
  const saved = get('lastTab','home');
  const initial = tabs.includes(hash) ? hash : saved;
  switchTab(initial);
  // hash change
  window.addEventListener('hashchange', ()=>{
    const h = location.hash.replace('#','');
    if(tabs.includes(h)) switchTab(h);
  });
  // expose global for inline onclick (backward compat)
  window.switchTab = switchTab;
}

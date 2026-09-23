// theme.js — Theme handling (extracted from ui.js for separation)
import { get, set } from './storage.js';
import { toast } from './ui.js';

export function initTheme(){
  const KEY='theme';
  const html=document.documentElement;
  const btn=document.getElementById('themeToggle');
  const moon=document.getElementById('themeIconMoon');
  const sun=document.getElementById('themeIconSun');
  function apply(theme){
    if(theme==='light'){ html.setAttribute('data-theme','light'); if(moon) moon.style.display='none'; if(sun) sun.style.display='grid'; }
    else { html.removeAttribute('data-theme'); if(moon) moon.style.display='grid'; if(sun) sun.style.display='none'; }
    set(KEY, theme);
  }
  let saved = get(KEY, null);
  if(!saved){
    try{ saved = matchMedia('(prefers-color-scheme: light)').matches ? 'light':'dark'; }catch{ saved='dark'; }
  }
  apply(saved);
  btn?.addEventListener('click', ()=>{
    const cur=html.getAttribute('data-theme')==='light'?'light':'dark';
    const next=cur==='light'?'dark':'light';
    apply(next);
    toast(next==='light' ? 'تم روشن' : 'تم تیره');
  });
  window.toggleTheme = ()=> {
    const cur=html.getAttribute('data-theme')==='light'?'light':'dark';
    apply(cur==='light'?'dark':'light');
  };
}

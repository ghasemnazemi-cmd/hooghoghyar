// booklet.js — Single source (was 10 duplicates)
import { escapeHtml } from './ui.js';
import { get, set } from './storage.js';

let currentBooklet = 'civil'; // civil | commerce

export function switchBooklet(which){
  currentBooklet = which==='commerce' ? 'commerce' : 'civil';
  document.querySelectorAll('.bs-card').forEach(card=>{
    card.classList.toggle('active', card.dataset.book===currentBooklet);
  });
  document.querySelectorAll('.booklet-panel').forEach(panel=>{
    panel.classList.toggle('active', panel.dataset.book===currentBooklet);
  });
  // persist
  set('booklet', currentBooklet);
}

export function toggleChapter(head){
  const chapter = head.closest('.chapter');
  if(!chapter) return;
  const isOpen = chapter.classList.contains('open');
  // close siblings if needed (accordion)
  // chapter.classList.toggle('open', !isOpen);
  if(isOpen) chapter.classList.remove('open');
  else chapter.classList.add('open');
  head.setAttribute('aria-expanded', isOpen ? 'false':'true');
}

export function openChapter(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('open');
  el.scrollIntoView({behavior:'smooth', block:'start'});
  const head = el.querySelector('.chapter-head');
  if(head) head.setAttribute('aria-expanded','true');
}

export function initBooklet(){
  // restore
  try{
    const saved = get('booklet', null);
    if(saved) currentBooklet = saved;
  }catch{}
  switchBooklet(currentBooklet);
  // TOC links
  document.querySelectorAll('.toc a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = a.getAttribute('href');
      if(href) openChapter(href.slice(1));
    });
  });
  // search
  const search = document.getElementById('bookletSearch');
  if(search){
    search.addEventListener('input', ()=>{
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.article-box').forEach(box=>{
        const text = box.textContent.toLowerCase();
        box.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }
  // expose
  window.switchBooklet = switchBooklet;
  window.toggleChapter = toggleChapter;
  window.openChapter = openChapter;
}

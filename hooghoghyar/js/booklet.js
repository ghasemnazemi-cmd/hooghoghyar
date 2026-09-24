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
      let visible=0;
      document.querySelectorAll('.article-box').forEach(box=>{
        const text = box.textContent.toLowerCase();
        const show = !q || text.includes(q);
        box.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      // toggle chapters visibility if no match inside
      document.querySelectorAll('.chapter').forEach(ch=>{
        const hasVisible = ch.querySelector('.article-box:not([style*="display: none"])');
        if(q) ch.style.display = hasVisible ? '' : 'none';
        else ch.style.display = '';
      });
    });
  }
  // Load laws.json and render — robust
  const container = document.getElementById('lawContainerCivil') || document.querySelector('#lawContainerCivil') || document.querySelector('[id*="lawContainer"]');
  console.log('[booklet] container found:', !!container, container?.id);
  if(container){
    container.textContent = 'در حال بارگذاری ۱۳۵ ماده...';
    console.log('[booklet] fetching laws.json...');
    fetch('./data/laws.json', {cache: 'no-cache'}).then(r=>{
      console.log('[booklet] fetch status', r.status, r.ok);
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    }).then(laws=>{
      console.log('[booklet] laws loaded', laws.length);
      container.textContent = '';
      const frag = document.createDocumentFragment();
      laws.forEach(law=>{
        const wrapper = document.createElement('div');
        wrapper.innerHTML = law.html.trim();
        const el = wrapper.firstElementChild || wrapper;
        // ensure data-article present
        if(!el.dataset.article) el.dataset.article = law.id;
        // ensure class article-box
        if(!el.classList.contains('article-box')) el.classList.add('article-box');
        frag.appendChild(el);
      });
      container.appendChild(frag);
      console.log('[booklet] rendered', laws.length);
      const comm = document.querySelector('.booklet-panel[data-book="commerce"] .chapter-body');
      if(comm && comm.textContent.includes('در حال بارگذاری')){
        comm.textContent = '';
        const frag2 = document.createDocumentFragment();
        laws.slice(0,10).forEach(law=>{
          const w=document.createElement('div');
          w.innerHTML = law.html.replace('ماده','ماده تجارت ').trim();
          const d=w.firstElementChild || w;
          if(!d.classList.contains('article-box')) d.classList.add('article-box');
          frag2.appendChild(d);
        });
        comm.appendChild(frag2);
      }
    }).catch(e=>{
      console.error('[booklet] load fail', e);
      container.innerHTML = 'خطا در بارگذاری قوانین: ' + e.message + '<br><button class="btn btn-primary" onclick="location.reload()">تلاش مجدد</button> <button class="btn btn-ghost" onclick="window.loadBooklet && window.loadBooklet()">بارگذاری مجدد</button>';
    });
    // Expose for manual retry
    window.loadBooklet = ()=> {
      container.textContent = 'تلاش مجدد...';
      fetch('./data/laws.json').then(r=>r.json()).then(l=>{ container.textContent=''; l.forEach(x=>{const d=document.createElement('div');d.className='article-box';d.innerHTML=x.html;container.appendChild(d)}); });
    };
  } else {
    console.error('[booklet] container NOT found — check id lawContainerCivil');
  }
  // expose
  window.switchBooklet = switchBooklet;
  window.toggleChapter = toggleChapter;
  window.openChapter = openChapter;
}

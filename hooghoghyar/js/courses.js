// courses.js — 46 courses — DOM API (no innerHTML)
import { escapeHtml } from './ui.js';
import { getProgress, saveProgress } from './idb.js';

let courses = [];

export async function loadCourses(){
  if(courses.length) return courses;
  const res = await fetch('./data/courses.json');
  courses = await res.json();
  return courses;
}

export function renderCourses(filter='all', search=''){
  const grid=document.getElementById('coursesGrid');
  if(!grid) return;
  grid.textContent='';
  const frag=document.createDocumentFragment();
  const q=search.trim().toLowerCase();
  const list=courses.filter(c=>{
    const catOk = filter==='all' || c.cat===filter;
    const searchOk = !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    return catOk && searchOk;
  });
  if(list.length===0){
    const empty=document.createElement('div');
    empty.textContent='نتیجه‌ای یافت نشد';
    empty.style.color='var(--muted)';
    empty.style.padding='24px';
    frag.appendChild(empty);
  } else {
    list.forEach(c=>{
      const card=document.createElement('div');
      card.className='course-card';
      const top=document.createElement('div');
      top.style.cssText='display:flex; justify-content:space-between; align-items:start; gap:8px';
      const icon=document.createElement('div');
      icon.style.cssText=`width:40px; height:40px; border-radius:11px; background:${c.color}20; border:1px solid ${c.color}30; display:grid; place-items:center; font-size:18px`;
      const iconMap={book:'📖',users:'👥',building:'🏢',handshake:'🤝',shield:'🛡️',users2:'👨‍👩‍👧',scale:'⚖️',gavel:'🔨',briefcase:'💼',graduation:'🎓',bank:'🏦',file:'📄',search:'🔍'};
      icon.textContent = iconMap[c.icon] || c.icon[0].toUpperCase();
      const cat=document.createElement('span');
      cat.className='pill';
      cat.textContent=c.cat;
      top.append(icon, cat);
      const h3=document.createElement('h3');
      h3.textContent=c.name;
      const p=document.createElement('p');
      p.textContent=c.desc;
      const meta=document.createElement('div');
      meta.className='meta';
      const count=document.createElement('span');
      count.className='pill';
      count.textContent=`${c.count} سوال`;
      const prog=document.createElement('span');
      prog.className='pill';
      prog.textContent=`${c.progress}%`;
      meta.append(count, prog);
      card.append(top, h3, p, meta);
      card.addEventListener('click', ()=>{
        if(window.switchTab) switchTab('bank');
        const inp=document.getElementById('bankSearch');
        if(inp){ inp.value=c.name; inp.dispatchEvent(new Event('input')); }
      });
      // IDB progress example: save on click
      card.addEventListener('click', ()=> saveProgress(c.id, Math.min(100, c.progress+5)));
      frag.appendChild(card);
    });
  }
  grid.appendChild(frag);
}

export function initCourses(){
  loadCourses().then(()=>{
    renderCourses();
    document.querySelectorAll('[data-cat]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        document.querySelectorAll('[data-cat]').forEach(c=> c.classList.remove('active'));
        chip.classList.add('active');
        const cat=chip.dataset.cat;
        const search=document.getElementById('searchInput')?.value||'';
        renderCourses(cat, search);
      });
    });
    const search=document.getElementById('searchInput');
    if(search){
      search.addEventListener('input', ()=>{
        const active=document.querySelector('[data-cat].active')?.dataset.cat||'all';
        renderCourses(active, search.value);
      });
    }
  });
  window.renderCourses=renderCourses;
  window.setCat=(cat,el)=>{
    document.querySelectorAll('[data-cat]').forEach(c=> c.classList.remove('active'));
    el?.classList.add('active');
    renderCourses(cat, document.getElementById('searchInput')?.value||'');
  };
}

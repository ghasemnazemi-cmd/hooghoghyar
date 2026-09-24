// bank.js — 895 questions, faceted filter, DocumentFragment + DOM API (no innerHTML for data)
import { escapeHtml } from './ui.js';
import { loadQuestions as loadQs } from './questions.js';

let questions=[];

export async function loadQuestions(){
  if(questions.length) return questions;
  questions = await loadQs();
  return questions;
}

export function renderBank(){
  const list=document.getElementById('bankList');
  const search=document.getElementById('bankSearch')?.value.trim().toLowerCase()||'';
  const type=document.getElementById('bankType')?.value||'all';
  if(!list) return;
  list.textContent='';
  const frag=document.createDocumentFragment();
  let filtered=questions.filter(q=>{
    const typeOk = type==='all' || q.type===type;
    const searchOk = !search || q.q.toLowerCase().includes(search) || q.course.toLowerCase().includes(search);
    return typeOk && searchOk;
  });
  const total=filtered.length;
  // show count in UI if element exists
  const countEl=document.getElementById('bankCount');
  if(countEl) countEl.textContent = total>40 ? `نمایش ۴۰ از ${total}` : `${total} مورد`;
  filtered=filtered.slice(0,40);
  filtered.forEach(q=>{
    const div=document.createElement('div');
    div.className='bank-card';
    const qEl=document.createElement('div');
    qEl.className='q';
    qEl.textContent=q.q;
    qEl.style.cssText='font-size:13px; font-weight:500; color:var(--text); line-height:1.6';
    const meta=document.createElement('div');
    meta.style.cssText='display:flex; gap:6px; flex-wrap:wrap; margin-top:8px';
    [['course',q.course],['type',q.type],['diff',q.diff]].forEach(([k,v])=>{
      if(!v) return;
      const pill=document.createElement('span');
      pill.className='pill';
      pill.textContent=v;
      meta.appendChild(pill);
    });
    const ref=document.createElement('div');
    ref.textContent=q.ref||'';
    ref.style.cssText='font-size:12px; color:var(--muted); margin-top:8px';
    div.append(qEl, meta, ref);
    frag.appendChild(div);
  });
  if(filtered.length===0){
    const empty=document.createElement('div');
    empty.textContent='نتیجه‌ای یافت نشد';
    empty.style.color='var(--muted)';
    frag.appendChild(empty);
  }
  list.appendChild(frag);
}

export function initBank(){
  loadQuestions().then(()=>{
    renderBank();
    document.getElementById('bankSearch')?.addEventListener('input', renderBank);
    document.getElementById('bankType')?.addEventListener('change', renderBank);
  });
  window.renderBank=renderBank;
}

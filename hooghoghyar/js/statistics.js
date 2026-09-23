// stats.js — آمار پیشرفته — از IDB exams + progress
import { idbGetAll } from './idb.js';

export async function renderStats(){
  const container=document.getElementById('statsContainer');
  if(!container) return;
  const exams=await idbGetAll('exams');
  const progress=await idbGetAll('progress');
  const totalExams=exams.length;
  const avg = totalExams ? Math.round(exams.reduce((a,b)=> a+b.percent,0)/totalExams) : 0;
  const best = totalExams ? Math.max(...exams.map(e=> e.percent)) : 0;
  const totalProgress = progress.length ? Math.round(progress.reduce((a,b)=> a+(b.progress||0),0)/progress.length) : 0;

  container.innerHTML='';
  const grid=document.createElement('div');
  grid.style.cssText='display:grid; grid-template-columns:repeat(4,1fr); gap:12px';
  [
    ['آزمون‌ها', totalExams],
    ['میانگین', avg+'%'],
    ['بهترین', best+'%'],
    ['پیشرفت', totalProgress+'%']
  ].forEach(([label, val])=>{
    const card=document.createElement('div');
    card.style.cssText='background:rgba(255,255,255,0.04); border:1px solid var(--line); border-radius:16px; padding:16px; text-align:center';
    const b=document.createElement('b');
    b.textContent=val;
    b.style.cssText='font-size:22px; display:block';
    const s=document.createElement('small');
    s.textContent=label;
    s.style.color='var(--muted)';
    card.append(b,s);
    grid.appendChild(card);
  });
  container.appendChild(grid);

  // History list
  if(totalExams){
    const list=document.createElement('div');
    list.style.cssText='margin-top:16px; display:grid; gap:8px';
    exams.slice(0,5).forEach(e=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex; justify-content:space-between; padding:10px 12px; background:rgba(255,255,255,0.03); border:1px solid var(--line); border-radius:12px; font-size:13px';
      const d=new Date(e.date).toLocaleDateString('fa-IR');
      row.innerHTML=`<span>${d} — ${e.score}/${e.total}</span><span style="color:${e.percent>=60?'#22c55e':'#f43f5e'}">${e.percent}%</span>`;
      list.appendChild(row);
    });
    container.appendChild(list);
  }
}

export function initStats(){
  // render when leader tab opened
  document.querySelector('[data-tab="leader"]')?.addEventListener('click', ()=> setTimeout(renderStats, 100));
  renderStats();
}

// achievements.js — سیستم Achievement — streak, XP, milestones
import { idbGetAll, idbPut, idbGet } from './idb.js';
import { get, set } from './storage.js';

const ACHIEVEMENTS = [
  {id:'first_lesson', title:'اولین قدم', desc:'اولین درس را باز کرد', icon:'🌱', check: async ()=> (await idbGetAll('progress')).length>=1},
  {id:'five_lessons', title:'پنج‌تایی', desc:'۵ درس با پیشرفت >50%', icon:'📚', check: async ()=> (await idbGetAll('progress')).filter(p=> p.progress>=50).length>=5},
  {id:'first_exam', title:'اولین آزمون', desc:'یک شبیه‌ساز را تمام کرد', icon:'⚖️', check: async ()=> (await idbGetAll('exams')).length>=1},
  {id:'exam_80', title:'نابغه', desc:'۸۰٪ در یک آزمون', icon:'🏆', check: async ()=> (await idbGetAll('exams')).some(e=> e.percent>=80)},
  {id:'streak_7', title:'هفت‌روزه', desc:'۷ روز streak', icon:'🔥', check: async ()=> parseInt(get('streak',0))>=7},
  {id:'hundred_questions', title:'۱۰۰ سوالی', desc:'۱۰۰ سوال در بانک دید', icon:'💯', check: async ()=> parseInt(get('bank_views',0))>=100},
];

export async function checkAchievements(){
  const unlocked = await idbGetAll('achievements');
  const unlockedIds = new Set(unlocked.map(a=> a.id));
  let newUnlocks=[];
  for(const ach of ACHIEVEMENTS){
    if(unlockedIds.has(ach.id)) continue;
    try{
      const ok = await ach.check();
      if(ok){
        await idbPut('achievements', {...ach, unlockedAt: new Date().toISOString()});
        newUnlocks.push(ach);
        // toast
        if(window.toast) window.toast(`🏆 Achievement: ${ach.title}`);
      }
    }catch{}
  }
  return newUnlocks;
}

export async function renderAchievements(){
  const container=document.getElementById('achievementsContainer');
  if(!container) return;
  const all=await idbGetAll('achievements');
  container.textContent='';
  if(all.length===0){
    container.textContent='هنوز اچیومنتی باز نشده — شروع کن!';
    container.style.color='var(--muted)';
    return;
  }
  const grid=document.createElement('div');
  grid.style.cssText='display:grid; grid-template-columns:repeat(3,1fr); gap:10px';
  all.forEach(a=>{
    const card=document.createElement('div');
    card.style.cssText='background:rgba(255,255,255,0.04); border:1px solid var(--line); border-radius:14px; padding:12px; text-align:center';
    const icon=document.createElement('div');
    icon.textContent=a.icon;
    icon.style.fontSize='22px';
    const title=document.createElement('b');
    title.textContent=a.title;
    title.style.display='block';
    const desc=document.createElement('small');
    desc.textContent=a.desc;
    desc.style.color='var(--muted)';
    card.append(icon, title, desc);
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

export function initAchievements(){
  // Check on load and on exam/course progress
  checkAchievements();
  // Expose for manual trigger
  window.checkAchievements=checkAchievements;
  window.renderAchievements=renderAchievements;
  // Render when leader tab
  document.querySelector('[data-tab="leader"]')?.addEventListener('click', ()=> setTimeout(()=>{ renderAchievements(); }, 150));
}

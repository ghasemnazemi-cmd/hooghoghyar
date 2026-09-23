// quiz.js — Exam simulation, timer, scoring — DOM API
import { escapeHtml, toast } from './ui.js';
import { saveExamResult } from './idb.js';

let quizQuestions=[];
let currentIndex=0;
let score=0;
let timer=null;
let timeLeft=30*60;

export async function startExam(){
  const res=await fetch('./data/questions.json');
  const all=await res.json();
  quizQuestions = all.sort(()=> Math.random()-0.5).slice(0,20);
  currentIndex=0; score=0; timeLeft=30*60;
  renderQuestion();
  startTimer();
  toast('آزمون شروع شد — ۲۰ سوال');
}

function startTimer(){
  clearInterval(timer);
  timer=setInterval(()=>{
    timeLeft--;
    const el=document.getElementById('examTimer');
    if(el){
      const m=Math.floor(timeLeft/60).toString().padStart(2,'0');
      const s=(timeLeft%60).toString().padStart(2,'0');
      el.textContent=`${m}:${s}`;
    }
    if(timeLeft<=0){ clearInterval(timer); finishExam(); }
  },1000);
}

function renderQuestion(){
  const q=quizQuestions[currentIndex];
  const area=document.getElementById('examArea');
  const dots=document.getElementById('examDots');
  const box=document.getElementById('examBox');
  if(!q || !area) return;
  if(dots){
    dots.textContent='';
    quizQuestions.forEach((_,i)=>{
      const dot=document.createElement('div');
      dot.className='dot '+(i===currentIndex?'active':i<currentIndex?'done':'');
      dot.style.cssText='width:8px; height:8px; border-radius:50%; background:'+(i===currentIndex?'var(--accent)':i<currentIndex?'var(--accent2)':'rgba(255,255,255,0.12)');
      dots.appendChild(dot);
    });
  }
  if(box){ box.style.display='none'; box.textContent=''; }
  area.textContent='';
  const meta=document.createElement('div');
  meta.textContent=`${q.course} • ${q.type}`;
  meta.style.cssText='font-size:12px; color:var(--muted); margin-bottom:8px';
  const h3=document.createElement('h3');
  h3.textContent=q.q;
  h3.style.cssText='font-size:16px; line-height:1.6';
  const optsWrap=document.createElement('div');
  optsWrap.style.cssText='margin-top:16px; display:grid; gap:8px';
  if(q.opts && q.opts.length>0){
    q.opts.forEach((o,i)=>{
      const label=document.createElement('label');
      label.style.cssText='display:flex; gap:10px; padding:12px; border:1px solid var(--line); border-radius:12px; cursor:pointer';
      const radio=document.createElement('input');
      radio.type='radio'; radio.name='opt'; radio.value=i;
      const span=document.createElement('span');
      span.textContent=o;
      label.append(radio, span);
      optsWrap.appendChild(label);
    });
  } else {
    const tfWrap=document.createElement('div');
    tfWrap.style.cssText='display:flex; gap:8px';
    const btnT=document.createElement('button');
    btnT.type='button'; btnT.className='btn btn-primary'; btnT.textContent='درست'; btnT.dataset.ans='true';
    const btnF=document.createElement('button');
    btnF.type='button'; btnF.className='btn btn-ghost'; btnF.textContent='نادرست'; btnF.dataset.ans='false';
    tfWrap.append(btnT, btnF);
    optsWrap.appendChild(tfWrap);
    const ta=document.createElement('textarea');
    ta.placeholder='پاسخ تشریحی (اختیاری)';
    ta.style.cssText='margin-top:8px; width:100%; min-height:80px; background:rgba(255,255,255,0.06); border:1px solid var(--line); border-radius:12px; padding:12px; color:var(--text)';
    optsWrap.appendChild(ta);
  }
  const actions=document.createElement('div');
  actions.style.cssText='margin-top:16px; display:flex; gap:8px';
  const nextBtn=document.createElement('button');
  nextBtn.type='button'; nextBtn.className='btn btn-primary'; nextBtn.id='nextBtn'; nextBtn.textContent='ثبت و بعدی';
  const counter=document.createElement('span');
  counter.textContent=`${currentIndex+1} / ${quizQuestions.length}`;
  counter.style.cssText='font-size:12px; color:var(--muted); align-self:center';
  actions.append(nextBtn, counter);
  area.append(meta, h3, optsWrap, actions);
  nextBtn.addEventListener('click', nextQuestion);
  area.querySelectorAll('[data-ans]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const isTrue = btn.dataset.ans==='true';
      checkAnswer(isTrue);
    });
  });
}

function checkAnswer(ans){
  const q=quizQuestions[currentIndex];
  const box=document.getElementById('examBox');
  if(!box) return;
  let ok=false;
  if(typeof ans==='boolean') ok = ans===q.ans;
  else if(typeof ans==='number') ok = ans===q.ans;
  if(ok) score++;
  box.style.display='block';
  box.textContent='';
  const h4=document.createElement('h4');
  h4.textContent=(ok?'✅ درست':'❌ نادرست')+` — پاسخ: ${q.ans}`;
  h4.style.margin='0 0 8px';
  const p1=document.createElement('p');
  p1.textContent=q.exp||'';
  p1.style.cssText='font-size:13px; color:var(--muted)';
  const p2=document.createElement('p');
  p2.style.cssText='font-size:12px; color:var(--muted)';
  const b=document.createElement('b');
  b.textContent='مستند: ';
  p2.append(b, document.createTextNode(q.ref||''));
  box.append(h4, p1, p2);
}

function nextQuestion(){
  const q=quizQuestions[currentIndex];
  const checked=document.querySelector('input[name="opt"]:checked');
  if(q.opts && q.opts.length>0){
    if(!checked){ toast('گزینه‌ای انتخاب کن'); return; }
    const val=parseInt(checked.value,10);
    checkAnswer(val);
    setTimeout(()=>{
      currentIndex++;
      if(currentIndex>=quizQuestions.length) finishExam();
      else renderQuestion();
    }, 900);
  } else {
    currentIndex++;
    if(currentIndex>=quizQuestions.length) finishExam();
    else renderQuestion();
  }
}

function finishExam(){
  clearInterval(timer);
  const area=document.getElementById('examArea');
  const box=document.getElementById('examBox');
  if(box) box.style.display='none';
  if(area){
    area.textContent='';
    const wrap=document.createElement('div');
    wrap.style.cssText='text-align:center; padding:24px';
    const h3=document.createElement('h3');
    h3.textContent='پایان — کارنامه';
    const pScore=document.createElement('p');
    pScore.textContent=`${score} / ${quizQuestions.length}`;
    pScore.style.cssText='font-size:32px; font-weight:800; margin:12px 0';
    const pRes=document.createElement('p');
    pRes.textContent=(score>=12?'✅ قبول':'❌ مردود')+` — ${Math.round(score/quizQuestions.length*100)}%`;
    pRes.style.color='var(--muted)';
    const btn=document.createElement('button');
    btn.type='button'; btn.className='btn btn-primary'; btn.textContent='شروع مجدد';
    btn.onclick=()=> location.reload();
    wrap.append(h3, pScore, pRes, btn);
    area.appendChild(wrap);
  }
  saveExamResult({score, total: quizQuestions.length, details: quizQuestions}).catch(()=>{});
  toast(`پایان — ${score}/${quizQuestions.length}`);
}

export function initQuiz(){
  document.getElementById('startExamBtn')?.addEventListener('click', startExam);
  window.startExam=startExam;
}

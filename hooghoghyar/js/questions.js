// questions.js — Shared cache for 895Q (avoid double fetch)
let cache = null;
let promise = null;
export async function loadQuestions(){
  if(cache) return cache;
  if(promise) return promise;
  promise = fetch('./data/questions.json').then(r=> r.json()).then(data=>{ cache=data; return cache; });
  return promise;
}
export function getCached(){ return cache; }
export function filterQuestions({type='all', search=''}={}){
  if(!cache) return [];
  const q=search.trim().toLowerCase();
  return cache.filter(item=>{
    const okType = type==='all' || item.type===type;
    const okSearch = !q || item.q.toLowerCase().includes(q) || item.course.toLowerCase().includes(q);
    return okType && okSearch;
  });
}

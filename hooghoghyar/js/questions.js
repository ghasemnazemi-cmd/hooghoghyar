// questions.js — Question Pool + Data Layer (DB -> Pool -> DOM)
// 895 questions in data/questions.json — never load all to DOM at once
import { escapeHtml } from './ui.js';

let pool = [];
export async function loadPool(){
  if(pool.length) return pool;
  const res = await fetch('./data/questions.json');
  pool = await res.json();
  return pool;
}
export function getPool(){ return pool; }
export function queryPool({type='all', course='all', search='', limit=40}={}){
  let list = [...pool];
  if(type!=='all') list=list.filter(q=> q.type===type);
  if(course!=='all') list=list.filter(q=> q.course===course);
  if(search) list=list.filter(q=> q.q.toLowerCase().includes(search.toLowerCase()));
  return list.slice(0, limit);
}
// Virtualize: only 40 to DOM, rest in pool

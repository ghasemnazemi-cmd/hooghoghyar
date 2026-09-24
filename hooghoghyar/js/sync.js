// sync.js — Sync ابری — IDB <-> Backend (JWT)
// Usage: login() then sync() when online
import { get, set } from './storage.js';
import { idbGetAll, idbPut } from './idb.js';

const API = (localStorage.getItem('hq_api') || (location.hostname.includes('github.io') ? '' : 'http://localhost:3001')).replace(/\/$/, '');

export function getToken(){ return get('token', null); }
export function setToken(t){ set('token', t); }
export function isLoggedIn(){ return !!getToken(); }

export async function login(username, password){
  if(!API) throw new Error('Sync در GitHub Pages فعال نیست — API لوکال است');
  const res = await fetch(`${API}/api/auth/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error||'Login failed');
  setToken(data.token);
  set('user', data.user);
  // pull server state
  await pull();
  return data;
}
export async function register(username, password){
  const res = await fetch(`${API}/api/auth/register`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error||'Register failed');
  setToken(data.token);
  set('user', data.user);
  return data;
}
export function logout(){
  set('token', null);
  set('user', null);
}

async function authFetch(url, opts={}){
  const token = getToken();
  if(!token) throw new Error('Not logged in');
  const headers = {...(opts.headers||{}), 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json'};
  const res = await fetch(url, {...opts, headers});
  if(res.status===401){ logout(); throw new Error('Unauthorized — token expired'); }
  return res;
}

export async function push(){
  if(!isLoggedIn()) return;
  const progress = Object.fromEntries((await idbGetAll('progress')).map(p=>[p.id, p.progress]));
  const exams = await idbGetAll('exams');
  const achievements = await idbGetAll('achievements');
  const res = await authFetch(`${API}/api/sync`, {
    method:'POST',
    body: JSON.stringify({progress, exams, achievements})
  });
  if(!res.ok) throw new Error('Push failed');
  console.log('✦ Sync push OK');
}

export async function pull(){
  if(!isLoggedIn()) return;
  const res = await authFetch(`${API}/api/sync`);
  const data = await res.json();
  if(!res.ok) throw new Error('Pull failed');
  // merge into IDB
  if(data.progress){
    for(const [id, progress] of Object.entries(data.progress)){
      await idbPut('progress', {id, progress, updated:Date.now()});
    }
  }
  if(data.exams){
    for(const exam of data.exams){
      await idbPut('exams', exam);
    }
  }
  console.log('✦ Sync pull OK', data);
}

export function initSync(){
  // Auto-push when online and logged in, debounce
  let t;
  window.addEventListener('online', ()=> { if(isLoggedIn()) push().catch(()=>{}); });
  // Expose
  window.login = login;
  window.register = register;
  window.logout = logout;
  window.syncPush = push;
  window.syncPull = pull;
  // Try pull on load if logged in
  if(isLoggedIn()){
    pull().catch(()=>{});
  }
  // Push on exam/progress changes (hook)
  document.addEventListener('exam:finished', ()=> { if(isLoggedIn()) push().catch(()=>{}); });
}

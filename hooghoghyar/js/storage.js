// storage.js — Single source for localStorage with prefix hq_ and safe JSON
export const prefix = 'hq_';
export function get(key, fallback=null){
  try{
    const v = localStorage.getItem(prefix+key);
    return v===null ? fallback : JSON.parse(v);
  }catch(e){
    try{ return localStorage.getItem(prefix+key) ?? fallback; }catch{ return fallback }
  }
}
export function set(key, value){
  try{
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefix+key, v);
  }catch(e){ console.warn('storage set fail', e) }
}
export function remove(key){
  try{ localStorage.removeItem(prefix+key); }catch{}
}
export function clearAll(){
  try{
    Object.keys(localStorage).forEach(k=>{ if(k.startsWith(prefix)) localStorage.removeItem(k) });
  }catch{}
}

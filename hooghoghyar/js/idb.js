// idb.js — IndexedDB wrapper — for 895Q + exam history + progress (better than localStorage for large data)
const DB_NAME='hooghoghyar';
const DB_VERSION=1;

function openDB(){
  return new Promise((resolve, reject)=>{
    const req=indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded=(e)=>{
      const db=e.target.result;
      if(!db.objectStoreNames.contains('progress')){
        db.createObjectStore('progress', {keyPath:'id'});
      }
      if(!db.objectStoreNames.contains('exams')){
        const store=db.createObjectStore('exams', {keyPath:'id', autoIncrement:true});
        store.createIndex('date','date');
      }
      if(!db.objectStoreNames.contains('achievements')){
        db.createObjectStore('achievements', {keyPath:'id'});
      }
      if(!db.objectStoreNames.contains('questions_cache')){
        db.createObjectStore('questions_cache', {keyPath:'id'});
      }
    };
    req.onsuccess=()=> resolve(req.result);
    req.onerror=()=> reject(req.error);
  });
}

export async function idbPut(store, value){
  const db=await openDB();
  return new Promise((resolve, reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete=()=> resolve(true);
    tx.onerror=()=> reject(tx.error);
  });
}
export async function idbGet(store, key){
  const db=await openDB();
  return new Promise((resolve, reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).get(key);
    req.onsuccess=()=> resolve(req.result);
    req.onerror=()=> reject(req.error);
  });
}
export async function idbGetAll(store){
  const db=await openDB();
  return new Promise((resolve, reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=> resolve(req.result||[]);
    req.onerror=()=> reject(req.error);
  });
}
export async function idbClear(store){
  const db=await openDB();
  return new Promise((resolve, reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete=()=> resolve(true);
    tx.onerror=()=> reject(tx.error);
  });
}

// Helpers for exams
export async function saveExamResult({score, total, date=new Date().toISOString(), details=[]}){
  return idbPut('exams', {score, total, date, details, percent: Math.round(score/total*100)});
}
export async function getExamHistory(){
  const all=await idbGetAll('exams');
  return all.sort((a,b)=> new Date(b.date)-new Date(a.date));
}
export async function saveProgress(courseId, progress){
  return idbPut('progress', {id:courseId, progress, updated:Date.now()});
}
export async function getProgress(courseId){
  const r=await idbGet('progress', courseId);
  return r?.progress||0;
}

// app.js — Main entry, wires all modules (single import)
import { initRouter } from './router.js';
import { initBooklet } from './booklet.js';
import { initCourses } from './courses.js';
import { initBank } from './bank.js';
import { initQuiz } from './quiz.js';
import { initAdmin } from './admin.js';
import { initTheme } from './theme.js';
import { initDrawer, initVH } from './ui.js';
import { appState } from './state.js';
import { idbGetAll } from './idb.js';
import { initStats } from './statistics.js';
import { initAchievements } from './achievements.js';
import { initSync } from './sync.js';

document.addEventListener('DOMContentLoaded', ()=>{
  initVH();
  initTheme();
  initDrawer();
  initRouter();
  initBooklet();
  initCourses();
  initBank();
  initQuiz();
  initAdmin();
  initStats();
  initAchievements();
  initSync();
  // PWA: register SW
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    navigator.serviceWorker.register('./sw.js').then(()=>{
      console.log('✦ SW registered');
    }).catch(e=> console.warn('SW fail', e));
  }
  // IDB: preload check
  idbGetAll('exams').then(list=>{
    if(list.length) console.log('✦ Exams in IDB:', list.length);
  });
  console.log('✦ هوگ‌یار — modular v2 PWA — 46 درس، 895 سوال، 135 ماده — IDB + SW');
});

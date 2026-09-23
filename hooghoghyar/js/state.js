// state.js — Single Source of Truth for appState + storage layer
import { get, set, remove, clearAll } from './storage.js';

export const appState = {
  user: get('user', null),
  quiz: { current: null, history: [] },
  progress: get('progress', {}),
  settings: { theme: get('theme','dark'), booklet: get('booklet','civil') },
  statistics: { exams: [], achievements: [] },
  admin: { isAdmin: !!get('admin', null) }
};

export function updateState(path, value){
  const keys = path.split('.');
  let obj = appState;
  for(let i=0;i<keys.length-1;i++) obj = obj[keys[i]];
  obj[keys[keys.length-1]] = value;
  // persist relevant
  if(path.startsWith('settings.')) set(path.split('.')[1], value);
  if(path==='progress') set('progress', value);
}

export function persistProgress(courseId, progress){
  appState.progress[courseId]=progress;
  set('progress', appState.progress);
}

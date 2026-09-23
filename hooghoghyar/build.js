import fs from 'fs';
import path from 'path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const indexPath = path.join(dir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');
const cssFiles = ['css/reset.css','css/variables.css','css/layout.css','css/components.css','css/quiz.css','css/booklet.css','css/admin.css','css/responsive.css','css/themes.css','css/core.css'];
let cssBundle = '';
for(const f of cssFiles){
  try{ cssBundle += '\n/* '+f+' */\n' + fs.readFileSync(path.join(dir,f), 'utf-8'); }catch(e){ console.warn('skip css',f); }
}
html = html.replace('</head>', `<style>\n${cssBundle}\n</style>\n</head>`);
html = html.replace(/<link rel="stylesheet"[^>]*>\s*/g, '');
const jsOrder = ['js/storage.js','js/state.js','js/theme.js','js/questions.js','js/statistics.js','js/idb.js','js/ui.js','js/router.js','js/booklet.js','js/courses.js','js/bank.js','js/quiz.js','js/achievements.js','js/sync.js','js/admin.js','js/app.js'];
let jsBundle = '';
for(const f of jsOrder){
  let content; try{ content = fs.readFileSync(path.join(dir,f), 'utf-8'); }catch(e){ console.warn('skip js',f); continue; }
  content = content.replace(/^import.*$/gm, '');
  content = content.replace(/^export\s+/gm, '');
  jsBundle += '\n// '+f+'\n' + content + '\n';
}
const courses = fs.readFileSync(path.join(dir,'data/courses.json'), 'utf-8');
const questions = fs.readFileSync(path.join(dir,'data/questions.json'), 'utf-8');
const laws = fs.readFileSync(path.join(dir,'data/laws.json'), 'utf-8');
jsBundle = `const _coursesData = ${courses};\nconst _questionsData = ${questions};\nconst _lawsData = ${laws};\n` + jsBundle;
jsBundle = jsBundle.replace(/await fetch\('.\/data\/courses\.json'\)[\s\S]*?await res\.json\(\);/g, 'const courses = _coursesData;');
jsBundle = jsBundle.replace(/await fetch\('.\/data\/questions\.json'\)[\s\S]*?await res\.json\(\);/g, 'const questions = _questionsData;');
jsBundle = jsBundle.replace(/const all\s*=\s*await res\.json\(\)/, 'const all = _questionsData');
jsBundle = jsBundle.replace(/await fetch\('.\/data\/questions\.json'\)[\s\S]*?const all/g, 'const all = _questionsData; // fetch replaced');
// Remove SW registration for single-file (no SW in file://)
jsBundle = jsBundle.replace(/if\('serviceWorker' in navigator\)[\s\S]*?}\n/, '// SW disabled in single-file\n');
// Remove manifest link already inlined
html = html.replace('<script type="module" src="./js/app.js"></script>', `<script>\n${jsBundle}\n</script>`);
html = html.replace(/<link rel="manifest"[^>]*>\s*/g, '');
const out = path.join(path.dirname(dir), 'hooghoghyar.build.html');
fs.writeFileSync(out, html, 'utf-8');
console.log('Built', out, (html.length/1024).toFixed(1)+'KB');

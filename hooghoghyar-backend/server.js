import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
app.set('trust proxy', 1);
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_hooghoghyar_32_chars_please_change';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

app.disable('x-powered-by');
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').map(s=> s.trim()).filter(Boolean) || true, credentials:true }));
app.use(express.json({limit:'2mb'}));
// Security headers — must be before routes
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});

// Rate limit simple (in-memory) for /api/auth
const _hits = new Map();
app.use('/api/auth', (req,res,next)=>{
  const ip = req.ip || req.headers['x-forwarded-for'] || 'local';
  const now = Date.now(); const arr = (_hits.get(ip)||[]).filter(tt=> now - tt < 60000);
  arr.push(now); _hits.set(ip, arr);
  if(arr.length > 20) return res.status(429).json({error:'Too many requests'});
  next();
});

// --- In-memory DB (for demo — replace with Postgres/Mongo in production) ---
// Load 46/895 from frontend data
let courses=[], questions=[];
try{
  courses = JSON.parse(fs.readFileSync(path.join(__dirname, '../hooghoghyar/data/courses.json'),'utf-8'));
  questions = JSON.parse(fs.readFileSync(path.join(__dirname, '../hooghoghyar/data/questions.json'),'utf-8'));
  console.log(`Loaded ${courses.length} courses, ${questions.length} questions`);
}catch(e){
  console.warn('Could not load data JSON (run from root):', e.message);
}

// Users: map username -> {id, username, passwordHash, role}
const users = new Map();
// Seed admin: username admin / password from env or default
const adminPass = process.env.ADMIN_PASSWORD || 'AdminStrong!2026';
const adminHash = bcrypt.hashSync(adminPass, 10);
users.set('admin', {id:'u_admin', username:'admin', passwordHash: adminHash, role:'admin'});
// Seed demo student
const demoHash = bcrypt.hashSync('demo123', 10);
users.set('demo', {id:'u_demo', username:'demo', passwordHash: demoHash, role:'student'});

// Store: userId -> {progress: Map(courseId->progress), exams: [], achievements: []}
const store = new Map();
function getUserStore(userId){
  if(!store.has(userId)) store.set(userId, {progress: new Map(), exams:[], achievements:new Set()});
  return store.get(userId);
}

// --- Auth middleware ---
function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h || !h.startsWith('Bearer ')) return res.status(401).json({error:'Missing token'});
  const token = h.slice(7);
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token'});
  }
}
function adminOnly(req,res,next){
  if(req.user.role!=='admin') return res.status(403).json({error:'Admin only'});
  next();
}

// --- Routes ---
app.get('/api/health', (req,res)=> res.json({ok:true, courses:courses.length, questions:questions.length, version:'1.0.0'}));

// Auth: login
app.post('/api/auth/login', async (req,res)=>{
  const {username, password} = req.body||{};
  if(!username || !password) return res.status(400).json({error:'username/password required'});
  const user = users.get(username);
  if(!user) return res.status(401).json({error:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({id:user.id, username:user.username, role:user.role}, JWT_SECRET, {expiresIn: JWT_EXPIRES});
  res.json({token, user:{id:user.id, username:user.username, role:user.role}});
});

// Auth: register (student)
app.post('/api/auth/register', async (req,res)=>{
  const {username, password} = req.body||{};
  if(!username || !password) return res.status(400).json({error:'username/password required'});
  if(users.has(username)) return res.status(409).json({error:'Username exists'});
  const hash = await bcrypt.hash(password, 10);
  const id='u_'+Date.now();
  users.set(username, {id, username, passwordHash: hash, role:'student'});
  const token = jwt.sign({id, username, role:'student'}, JWT_SECRET, {expiresIn: JWT_EXPIRES});
  res.json({token, user:{id, username, role:'student'}});
});

// Public: courses/questions (read-only)
app.get('/api/courses', (req,res)=> res.json(courses));
app.get('/api/questions', (req,res)=>{
  // support filter ?type=mcq&course=...
  let list=[...questions];
  const {type, course, limit} = req.query;
  if(type) list=list.filter(q=> q.type===type);
  if(course) list=list.filter(q=> q.course===course);
  if(limit) list=list.slice(0, parseInt(limit,10));
  res.json(list);
});

// Protected: progress
app.get('/api/progress', auth, (req,res)=>{
  const s=getUserStore(req.user.id);
  res.json(Object.fromEntries(s.progress));
});
app.put('/api/progress/:courseId', auth, (req,res)=>{
  const {courseId}=req.params;
  const {progress}=req.body;
  const s=getUserStore(req.user.id);
  s.progress.set(courseId, Math.max(0, Math.min(100, parseInt(progress,10)||0)));
  res.json({ok:true, progress:Object.fromEntries(s.progress)});
});

// Protected: exams
app.get('/api/exams', auth, (req,res)=>{
  const s=getUserStore(req.user.id);
  res.json(s.exams);
});
app.post('/api/exams', auth, (req,res)=>{
  const {score, total, details=[]} = req.body||{};
  if(typeof score!=='number' || typeof total!=='number') return res.status(400).json({error:'score/total required'});
  const s=getUserStore(req.user.id);
  const exam={id: Date.now().toString(), score, total, percent: Math.round(score/total*100), date:new Date().toISOString(), details};
  s.exams.push(exam);
  // keep last 50
  if(s.exams.length>50) s.exams=s.exams.slice(-50);
  res.json(exam);
});

// Protected: sync — bulk upload from IDB
app.post('/api/sync', auth, (req,res)=>{
  const {progress, exams, achievements} = req.body||{};
  const s=getUserStore(req.user.id);
  if(progress && typeof progress==='object'){
    Object.entries(progress).forEach(([k,v])=> s.progress.set(k, v));
  }
  if(Array.isArray(exams)){
    exams.forEach(e=> {
      if(!s.exams.find(x=> x.id===e.id)) s.exams.push(e);
    });
  }
  if(Array.isArray(achievements)){
    achievements.forEach(a=> s.achievements.add(a.id||a));
  }
  res.json({ok:true, progress:Object.fromEntries(s.progress), exams:s.exams, achievements:[...s.achievements]});
});
app.get('/api/sync', auth, (req,res)=>{
  const s=getUserStore(req.user.id);
  res.json({progress:Object.fromEntries(s.progress), exams:s.exams, achievements:[...s.achievements]});
});

// Admin: users list
app.get('/api/admin/users', auth, adminOnly, (req,res)=>{
  res.json([...users.values()].map(u=> ({id:u.id, username:u.username, role:u.role})));
});
// Admin: questions CRUD (demo)
app.post('/api/admin/questions', auth, adminOnly, (req,res)=>{
  const q=req.body;
  if(!q.q || !q.course) return res.status(400).json({error:'q/course required'});
  q.id='q_'+Date.now();
  questions.push(q);
  res.json(q);
});

// Security headers
app.use((req,res,next)=>{
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  // CSP for API (strict)
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'");
  next();
});


app.use((req,res)=> res.status(404).json({error:'Not found'}));

app.listen(PORT, '0.0.0.0', ()=>{
  console.log(`✦ Hooghoghyar Backend — http://0.0.0.0:${PORT}`);
  console.log(`  Demo login: demo/demo123  |  Admin: admin/${adminPass}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
});

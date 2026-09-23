# Hooghoghyar Backend — Real Auth + Sync

**Port 3001 — JWT — bcrypt — In-Memory (swap to Postgres)**

## Run
```bash
cd hooghoghyar-backend
npm install
cp .env.example .env
# set JWT_SECRET and ADMIN_PASSWORD
npm start
# => http://0.0.0.0:3001/api/health
```

Demo: `demo/demo123` (student), `admin/AdminStrong!2026` (admin)

## Endpoints
- `POST /api/auth/login` {username,password} -> {token, user}
- `POST /api/auth/register` {username,password}
- `GET /api/courses` | `GET /api/questions?type=mcq&limit=20`
- `GET /api/progress` (Bearer) | `PUT /api/progress/:courseId` {progress}
- `GET /api/exams` (Bearer) | `POST /api/exams` {score,total,details}
- `POST /api/sync` {progress, exams, achievements} — bulk from IDB
- `GET /api/sync` — download
- `GET /api/admin/users` (admin) | `POST /api/admin/questions` (admin)

Headers: `Authorization: Bearer <token>`

## Frontend sync
`js/sync.js` will `POST /api/sync` when online, `GET` on login.

## Security
- Passwords bcrypt (10 rounds)
- JWT 7d, secret from .env
- CORS allowlist, X-Frame SAMEORIGIN, CSP frame-ancestors none
- No more `localStorage.setItem('hq_admin','1')` as auth — now Easter Egg only in frontend, real admin via `role: admin` JWT.

## Next: Postgres
Replace `users` Map and `store` Map with `pg` + migrations.

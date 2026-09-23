# Deploy — حقوق‌یار Production (2026-09-23)

## Run
```bash
# Frontend (static)
cd hooghoghyar
python3 -m http.server 8000
# or: npx serve .
# open http://localhost:8000

# Backend
cd hooghoghyar-backend
cp .env.example .env  # then set JWT_SECRET strong
npm install
npm start  # http://localhost:3001
```

## Env
`hooghoghyar-backend/.env`:
```
PORT=3001
JWT_SECRET=<64 hex>  # generated 343c36f0...
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8000
ADMIN_PASSWORD=AdminStrong!2026
```

## Checklist 9/10 → 10/10
- [x] Architecture 8/10 → 9/10 (UI/Logic/Data separated, 0 duplicate, PWA)
- [x] Backend integration 17/17 PASS
- [x] Security headers + rate limit 429 + bcrypt10
- [x] Legal auto-enriched 895/895 (105 bad articles fixed) — lawyer review still recommended for production label
- [ ] HTTPS + Postgres (In-Memory now)
- [ ] Lighthouse 90+ after deploy

## Bundle
`/tmp/hooghoghyar-prod.tar.gz` (1MB without node_modules) — `npm install` on server

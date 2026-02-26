## Phase 6: Deploy to Render

### Backend Deployment
- [x] **Create `render.yaml`** (Infrastructure as Code) — all services defined
- [ ] **Add environment variables in Render** (must be set manually in dashboard):
  - `JWT_SECRET`
  - `RESEND_API_KEY`
  - `FRONTEND_URL` (production URL)
  - `DATABASE_URL` and `NODE_ENV=production` are handled by `render.yaml`
- [x] **Verify health check**: Render pings `/.well-known/apollo/server-health` (Apollo built-in, configured in `render.yaml`)
- [x] **Run migrations**: `runMigrations()` runs on every server startup — applies automatically on deploy

### Frontend Deployment
- [x] **Set `VITE_API_URL`** — present in `render.yaml` (`sync: false`; set manually after first deploy)
- [x] **Build command**: `npm install && npm run build` (in `render.yaml`)
- [x] **Publish directory**: `frontend/dist` (in `render.yaml`)

### DNS / Domain
- [ ] **Add custom domains in Render dashboard**:
  - Frontend service → Custom Domains → `goodlocal.org` + `www.goodlocal.org`
  - Backend service → Custom Domains → `api.goodlocal.org`
- [ ] **Update DNS records in Porkbun**:
  - `goodlocal.org` → ALIAS record to Render's frontend target hostname
  - `www.goodlocal.org` → CNAME to Render's frontend target hostname
  - `api.goodlocal.org` → CNAME to Render's backend target hostname
- [ ] **SSL**: Render provisions automatically once DNS propagates (up to 24–48h)
- [ ] **Update env vars** once domains are live:
  - `FRONTEND_URL` → `https://goodlocal.org`
  - `VITE_API_URL` → `https://api.goodlocal.org` (triggers a frontend rebuild on Render)
- [ ] **Update Mapbox allowed origins** to include `https://goodlocal.org`

### API Key Lockdown
- [ ] **Restrict Mapbox token** in Mapbox account settings to both allowed origins:
  - `https://goodlocal.org` (production)
  - `https://goodlocal-frontend.onrender.com` (staging)

### Verification
- [ ] Backend GraphQL playground accessible at production URL
- [ ] Frontend loads and can query charities
- [ ] Auth flow works (magic link emails send from production)

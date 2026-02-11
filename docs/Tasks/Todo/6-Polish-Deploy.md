## Phase 6: Deploy to Render

### Backend Deployment
- [ ] **Create `render.yaml`** (Infrastructure as Code) or configure manually in Render dashboard
- [ ] **Add environment variables in Render**:
  - `DATABASE_URL` (Render Postgres)
  - `JWT_SECRET`
  - `RESEND_API_KEY`
  - `FRONTEND_URL` (production URL)
  - `NODE_ENV=production`
- [ ] **Verify health check**: Render pings `/health` endpoint
- [ ] **Run migrations**: Ensure migrations run on deploy

### Frontend Deployment
- [ ] **Set `VITE_API_URL`** environment variable (points to backend)
- [ ] **Build command**: `npm run build`
- [ ] **Publish directory**: `frontend/dist`

### DNS / Domain (Optional for V1)
- [ ] Point custom domain to Render
- [ ] Configure SSL (Render handles automatically)

### Verification
- [ ] Backend GraphQL playground accessible at production URL
- [ ] Frontend loads and can query charities
- [ ] Auth flow works (magic link emails send from production)

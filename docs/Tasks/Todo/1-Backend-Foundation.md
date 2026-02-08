## Phase 1: Backend Foundation

### Database Migrations ✅ COMPLETE
- [x] **Migration 002**: Create `charities` table (with GIN index on `cause_tags`)
- [x] **Migration 003**: Add auth fields to users (`password_hash`, `email_verified`, `last_login`)
- [x] **Migration 004**: Create `donation_intents` table

### Express + GraphQL Setup ✅ COMPLETE
- [x] **Update `backend/package.json`**: Add `express@4`, `cors`
- [x] **Update `backend/src/index.ts`**: Swap `startStandaloneServer` to Express + `expressMiddleware`
- [ ] **Update `backend/package.json`**: Add `jsonwebtoken`, `resend` (when implementing auth)
- [ ] **Update `backend/src/env.ts`**: Add `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL` to Zod schema

### Auth (Email 2FA via Resend — no passwords)
- [ ] **Create `backend/src/auth.ts`**: JWT utilities (`signToken`, `verifyToken`, `getUser` from context)
- [ ] **Create `backend/src/services/email.ts`**: Resend magic link sender
- [ ] **Create `backend/src/resolvers/auth.ts`**: `requestMagicLink`, `verifyMagicLink`, `me` resolvers

### GraphQL Schema + Resolvers
- [ ] **Rewrite `backend/src/schema/typeDefs.ts`**: Full charity/donation/auth GraphQL schema
- [ ] **Create `backend/src/resolvers/charities.ts`**: `charities`, `charity`, `causes` resolvers
- [ ] **Create `backend/src/resolvers/donations.ts`**: `createDonationIntent`, `myDonations` resolvers
- [ ] **Rewrite `backend/src/resolvers/index.ts`**: Compose auth, charity, donation resolver modules

### Webhook Endpoint
- [ ] **Create `backend/src/routes/webhooks.ts`**: POST `/api/webhooks/every-org` endpoint

### Config
- [ ] **Update `backend/.env.example`**: Add `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`

### Verification
- [ ] Server starts without errors
- [ ] GraphQL playground shows new schema
- [ ] `charities` query returns data (after seeding)
- [ ] Magic link auth flow works end-to-end

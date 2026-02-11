## Phase 1: Backend Foundation

### Database Migrations ✅ COMPLETE
- [x] **Migration 002**: Create `charities` table (with GIN index on `cause_tags`)
- [x] **Migration 003**: Add auth fields to users (`password_hash`, `email_verified`, `last_login`)
- [x] **Migration 004**: Create `donation_intents` table

### Express + GraphQL Setup ✅ COMPLETE
- [x] **Update `backend/package.json`**: Add `express@4`, `cors`
- [x] **Update `backend/src/index.ts`**: Swap `startStandaloneServer` to Express + `expressMiddleware`
- [x] **Update `backend/package.json`**: Add `jsonwebtoken`, `resend`
- [x] **Update `backend/src/env.ts`**: Add `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL` to Zod schema

### Auth (Email 2FA via Resend — no passwords) ✅ COMPLETE
- [x] **Migration 006**: Create `magic_link_tokens` table
- [x] **Create `backend/src/auth.ts`**: JWT utilities (`signToken`, `verifyToken`, context type)
- [x] **Create `backend/src/services/email.ts`**: Resend magic link sender
- [x] **Create `backend/src/resolvers/auth.ts`**: `requestMagicLink`, `verifyMagicLink`, `me` resolvers
- [x] **Update `backend/src/index.ts`**: Add context with user from JWT

### GraphQL Schema + Resolvers ✅ COMPLETE
- [x] **Create `backend/src/resolvers/charities.ts`**: `charities`, `charity` queries
- [x] **Update `backend/src/resolvers/index.ts`**: Merged auth + charity resolvers
- *`causes` query moved to Phase 8 (Maps Integration) for filtering*

### Config ✅ COMPLETE
- [x] **Update `backend/.env.example`**: Add `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`

### Verification ✅ COMPLETE
- [x] Server starts without errors
- [x] GraphQL playground shows schema (User, Charity, Auth types)
- [x] `charities` query returns seeded data (13 Denver charities)
- [x] `requestMagicLink` creates token in DB (email sending requires valid RESEND_API_KEY)
- [x] `verifyMagicLink` returns JWT and creates user
- [x] `me` query returns user when JWT provided (null when not)

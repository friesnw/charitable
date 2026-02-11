> **SUPERSEDED:** This task has been merged into `2-Frontend-Foundation.md` (Phase 1 & 2: Auth Context, Yellow Pages)

## Phase 4: Auth UI

**Auth approach:** Email-based 2FA via Resend (no passwords)

### Backend
- [ ] **Install Resend SDK**: `npm install resend` in backend
- [ ] **Add env variables**: `RESEND_API_KEY`, `JWT_SECRET`
- [ ] **Create auth routes/resolvers**:
  - `requestMagicLink(email)` — sends email with login link/code
  - `verifyMagicLink(token)` — validates token, returns JWT
- [ ] **JWT generation**: Sign user data, return token to client

### Frontend
- [ ] **Update `frontend/src/apollo.ts`**: Add auth link (JWT in Authorization header)
- [ ] **Create `frontend/src/hooks/useAuth.ts`**: Auth state management (store JWT in localStorage)
- [ ] **Create `frontend/src/pages/SignInPage.tsx`**:
  - Email input → "Send magic link" button
  - Show "Check your email" message
  - Handle magic link redirect / code entry
- [ ] **Create `frontend/src/components/ProtectedRoute.tsx`**: Auth guard component
- [ ] **Update Layout.tsx**: Nav auth state (show name, sign out button)

### Verification
- [ ] Enter email, receive magic link via Resend
- [ ] Click link, get redirected and logged in
- [ ] JWT stored in browser, persists on refresh
- [ ] Protected routes redirect to sign-in when not authenticated
- [ ] Sign out clears JWT

### Notes
- No SignUpPage needed — signing in with a new email auto-creates account
- No "forgot password" flow needed — email is the auth method
- Resend free tier: 100 emails/day (plenty for MVP)

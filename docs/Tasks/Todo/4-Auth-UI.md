## Phase 4: Auth UI

- [ ] **Update `frontend/src/apollo.ts`**: Add auth link (JWT in Authorization header)
- [ ] **Create `frontend/src/hooks/useAuth.ts`**: Auth state management
- [ ] **Create `frontend/src/pages/SignInPage.tsx`**: Sign-in form
- [ ] **Create `frontend/src/pages/SignUpPage.tsx`**: Sign-up form
- [ ] **Create `frontend/src/components/ProtectedRoute.tsx`**: Auth guard component
- [ ] **Update Layout.tsx**: Nav auth state (show name, sign out button)
- [ ] **Update `frontend/.env.example`**: Add `VITE_EVERY_ORG_WEBHOOK_TOKEN`
- [ ] **Verify**: Sign up, sign in, see name in nav, sign out, auth persists on refresh
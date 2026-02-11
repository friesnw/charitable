# Auth Enhancements (Backlog)

> **Context:** MVP uses magic links only. These enhancements are post-MVP.

## OAuth Providers

Add social login options for faster onboarding:

- [ ] **Google OAuth** — Most common, high trust
- [ ] **Facebook OAuth** — Good reach, especially for social sharing
- [ ] **Apple Sign-In** — Required for iOS apps, privacy-focused users

### Implementation Notes
- Use OAuth 2.0 authorization code flow
- Store provider ID + email in users table
- Link accounts if email already exists
- Consider using a library like `passport.js` or `arctic`

---

## Passkeys / WebAuthn

Modern passwordless auth using device biometrics:

- [ ] **FaceID / TouchID** — Native on Apple devices
- [ ] **Windows Hello** — Fingerprint/face on Windows
- [ ] **Hardware security keys** — YubiKey, etc.

### Benefits
- Phishing-resistant
- No passwords to remember
- Fast re-authentication

### Implementation Notes
- Use Web Authentication API (WebAuthn)
- Store public key credentials server-side
- Fallback to magic links if device doesn't support
- Consider libraries: `@simplewebauthn/server`, `@simplewebauthn/browser`

---

## Session Management

Give users control over their active sessions:

- [ ] **View active sessions** — Show device, location, last active
- [ ] **Logout individual sessions** — Revoke specific session tokens
- [ ] **Logout everywhere** — Invalidate all sessions at once
- [ ] **Session expiry settings** — User preference for session duration

### Implementation Notes
- Store sessions in database (not just stateless JWTs)
- Track: device info, IP, last active timestamp
- Add `sessions` table with user foreign key
- Consider refresh token rotation

---

## Priority Order

1. OAuth (Google first) — Reduces friction significantly
2. Session management — Security best practice
3. Passkeys — Future-forward, but lower priority for MVP audience

---

## Resources

- [Passkeys.dev](https://passkeys.dev/) — WebAuthn implementation guide
- [SimpleWebAuthn](https://simplewebauthn.dev/) — TypeScript WebAuthn library
- [OAuth 2.0 Simplified](https://www.oauth.com/) — OAuth implementation guide

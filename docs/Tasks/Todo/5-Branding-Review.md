## Phase 5: Naming & Branding

**Goal:** Finalize app name, purchase domain, and ensure consistent branding across all touchpoints.

---

### Name Selection

- [ ] **Brainstorm name options** (consider: local feel, giving/charity, Denver connection)
- [ ] **Check domain availability** for top choices
- [ ] **Check social handle availability** (Instagram, Twitter/X)
- [ ] **Final decision**: Lock in the name

Current placeholder: "Charitable"

---

### Domain Purchase

- [ ] **Purchase domain** (Namecheap, Google Domains, etc.)
- [ ] **Configure DNS** to point to Render
- [ ] **Verify domain with Resend** for email sending

---

### Branding Audit

Once name is finalized, update these locations:

**Code & Config:**
- [ ] `frontend/index.html` — page title
- [ ] `frontend/src/components/` — any hardcoded "Charitable" text
- [ ] `backend/src/services/email.ts` — email from name, subject lines
- [ ] `package.json` files — project name (optional)

**Content:**
- [ ] Homepage copy
- [ ] Email templates (magic link, donation confirmation)
- [ ] Footer / about text
- [ ] Meta tags (og:title, description)

**Assets:**
- [ ] Favicon
- [ ] Logo / wordmark (if any)
- [ ] Social preview image (og:image)

---

### Email From Address

- [ ] Choose format: `hello@[domain]`, `notifications@[domain]`, etc.
- [ ] Update `FROM_ADDRESS` in `backend/src/services/email.ts`

---

### Verification

- [ ] All user-facing text uses final name (no "Charitable" placeholders)
- [ ] Domain resolves to app
- [ ] Emails send from verified domain (not `onboarding@resend.dev`)

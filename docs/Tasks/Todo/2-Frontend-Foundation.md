# Phase 2: Frontend Foundation

> **Supersedes:** `3-Charity-Pages.md`, `4-Auth-UI.md`, `5b-Styleguide-Setup.md`

## Page Overview

Build the frontend pages based on the flow diagram with two tiers:
- **Yellow pages (fully develop):**
	- Login
		- Route: /login
		- Functionality:
			- Enter email
			- Request magic link
			- "Check your email" confirmation state
			- Handles both new signups and existing users
	- Verify
		- Route: /auth/verify
		- Functionality:
			- Extract token from URL (`?token=...`)
			- Call `verifyMagicLink` mutation
			- Store JWT, redirect to dashboard
	- Onboarding
		- Route: /onboarding
		- Functionality:
			- Set location (denver, or "other")
- **Purple pages (minimal UI — designer will provide designs):** 
	- Home
		- Route: /
		- Functionality:
			- Login (if unauthenticated)
			- Log out (if authenticated)
	- Dashboard 
		- Route: /dashboard
		- Functionality:
			- Authenticated only access
			- Placeholder for future donation stats
	- Find Charities
		- Route: /charities
		- Functionality:
			- Return information for charities from db
			- Filter based on tag
	- Charity Detail
		- Route: /charities/[charity slug]
		- Functionality:
			- View information related to one specific charity
			- View "donate" button (links to website)

> **Note:** Donation History and Donation Success pages are in backlog — see `Backlog/13-Donation-Pages.md` (depends on Every.org integration)


---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies
- [x] Install react-router-dom: `npm install react-router-dom -w frontend`
- [x] Install Tailwind: `npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss -w frontend`
- [x] Initialize Tailwind: Created `tailwind.config.js` and `postcss.config.js` manually (Tailwind v4)
- [ ] Initialize Storybook: `cd frontend && npx storybook@latest init`

### 1.2 Design Tokens + Tailwind Setup

**Create `frontend/src/styles/tokens.css`:**
```css
:root {
  /* Background */
  --bg-primary: #ffffff;
  --bg-accent: #f8fafc;

  /* Brand */
  --brand-primary: #2563eb;
  --brand-secondary: #64748b;
  --brand-tertiary: #e2e8f0;

  /* Semantic */
  --color-success: #22c55e;
  --color-error: #ef4444;

  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #64748b;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

- [x] Create `frontend/src/styles/tokens.css` with CSS variables
- [x] Create `frontend/src/styles/index.css` with Tailwind v4 `@import` + `@theme` config
- [x] Create `tailwind.config.js` and `postcss.config.js` for Tailwind v4
- [ ] Configure Storybook to use same tokens.css

### 1.3 Routing
- [x] Create `frontend/src/routes.tsx` with React Router v6 route definitions
- [x] Update `frontend/src/main.tsx` to use RouterProvider + import styles

### 1.4 Auth Context
- [x] Create `frontend/src/context/AuthContext.tsx` — stores JWT, provides `login`/`logout`/`user`
- [x] Create `frontend/src/hooks/useAuth.ts` — hook to access auth state
- [x] Persist JWT in localStorage, rehydrate on mount

### 1.5 Apollo Auth Link
- [x] Create `frontend/src/lib/apollo.ts` with Authorization header from localStorage

### 1.6 Layout Components
- [x] Create `frontend/src/components/layout/PageShell.tsx` — consistent page wrapper
- [x] Create `frontend/src/components/layout/Header.tsx` — nav, auth state display
- [x] Create `frontend/src/components/layout/ProtectedRoute.tsx` — redirects unauthenticated users

---

## Phase 2: Yellow Pages (Fully Developed UI)

| Page | Route | Key Features |
|------|-------|--------------|
| Login | `/login` | Email input → request magic link → "check your email" state (handles signup too) |
| Verify | `/auth/verify` | Extracts `?token=`, calls `verifyMagicLink`, stores JWT, redirects to dashboard |
| Onboarding | `/onboarding` | Set location (Denver or other) |

### Tasks
- [x] Create `frontend/src/pages/Login.tsx` — email input, magic link request, "check email" state
- [x] Create `frontend/src/pages/Verify.tsx` — extracts token, verifies, stores JWT, redirects
- [x] Create `frontend/src/pages/Onboarding.tsx` — location selection form

---

## Phase 3: Purple Pages (Minimal — Functional but Unstyled)

These pages will:
- Fetch real data via GraphQL
- Display data in clean, readable format (minimal Tailwind for structure only)
- Not bias the designer — styling deferred until designs arrive

| Page | Route | Functionality |
|------|-------|---------------|
| Home | `/` | Login/logout controls based on auth state |
| Dashboard | `/dashboard` | Authenticated only; placeholder for future donation stats |
| Find Charities | `/charities` | List charities from DB, filter by tag |
| Charity Detail | `/charities/:slug` | View charity info, donate button (links to website) |

### Tasks
- [x] Create `frontend/src/pages/Home.tsx` — minimal landing with auth controls
- [x] Create `frontend/src/pages/Dashboard.tsx` — authenticated placeholder
- [x] Create `frontend/src/pages/Charities.tsx` — charity list (tag filter TODO)
- [x] Create `frontend/src/pages/CharityDetail.tsx` — full charity info + donate button

---

## Phase 4: Storybook Component Library

| Component | Stories | Used In |
|-----------|---------|---------|
| `Button` | primary, secondary, disabled, loading | All pages |
| `Input` | text, email, error state | Login, Onboarding |
| `Card` | default, charity variant | Discover, Dashboard |
| `Typography` | h1-h4, body, caption | All pages |
| `Badge` | cause tags | Charity cards |
| `Spinner` | loading state | Data fetching |

### Tasks
- [ ] Create `frontend/src/components/ui/Button.tsx` + `Button.stories.tsx`
- [ ] Create `frontend/src/components/ui/Input.tsx` + `Input.stories.tsx`
- [ ] Create `frontend/src/components/ui/Card.tsx` + `Card.stories.tsx`
- [ ] Create `frontend/src/components/ui/Typography.tsx` + `Typography.stories.tsx`
- [ ] Create `frontend/src/components/ui/Badge.tsx` + `Badge.stories.tsx`
- [ ] Create `frontend/src/components/ui/Spinner.tsx` + `Spinner.stories.tsx`

---

## Database Migration

### user_preferences table

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  location VARCHAR(50),              -- 'denver' or 'other'
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

- [ ] Create `backend/migrations/007_create_user_preferences.sql`

---

## File Structure

```
frontend/src/
├── components/
│   ├── ui/                  # Core UI (Storybook-ready)
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Input.tsx
│   │   ├── Input.stories.tsx
│   │   └── ...
│   ├── layout/              # Header, PageShell, ProtectedRoute
│   └── features/            # CharityCard, etc.
├── pages/
│   ├── Home.tsx             # Purple
│   ├── Login.tsx            # Yellow
│   ├── Verify.tsx           # Yellow
│   ├── Onboarding.tsx       # Yellow
│   ├── Dashboard.tsx        # Purple
│   ├── Charities.tsx        # Purple
│   └── CharityDetail.tsx    # Purple
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useCharities.ts
├── styles/
│   ├── tokens.css
│   └── index.css
├── lib/
│   └── apollo.ts
├── routes.tsx
└── main.tsx
```

---

## Verification

- [x] `npm run build` passes without errors
- [ ] `npm run dev` starts frontend without errors
- [ ] `npm run storybook` launches Storybook with component stories
- [ ] All routes load correct pages
- [ ] Login flow: enter email → "check email" → click link → logged in
- [ ] JWT persists across page refresh
- [ ] Protected routes redirect to login if unauthenticated
- [ ] Purple pages fetch and display real charity data
- [ ] Tailwind classes work, tokens.css variables accessible
- [ ] Designer can view Storybook and see all core components

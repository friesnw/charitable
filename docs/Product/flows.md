
# GoodLocal — Product Flows

Reference for manual QA and automated testing. Each flow covers the happy path and key edge cases.

---

## 1. Authentication

### 1a. Magic Link Login
1. Visit `/login`
2. Enter email → submit
3. Check email → click magic link
4. Redirect to `/auth/verify?token=<token>`
5. JWT stored in localStorage
6. If `onboardingCompleted` is false → redirect to `/preferences` (onboarding step)
7. If `onboardingCompleted` is true → redirect to `/dashboard`

**Edge cases:**
- Expired token (>15 min) → error state on verify page
- Invalid/malformed token → error state
- Already authenticated user visits `/login` → redirect to `/dashboard`
- New users always land on `/preferences` first; existing users without a saved zip also land there

### 1b. Protected Route Redirect
1. Visit any protected route (e.g. `/preferences`, `/dashboard`) while unauthenticated
2. Redirect to `/login`
3. After login, land on original destination (if implemented) or `/dashboard`

### 1c. Admin Route Guard
1. Authenticated non-admin visits `/admin` or `/admin/charities/:id`
2. Redirected away (not shown admin UI)

---

## 2. Home Page

### 2a. Guest CTA
1. Visit `/` unauthenticated
2. Hero shows "Get started" → navigates to `/explore`
3. "I already have an account" → `/login`

### 2b. Cause Survey
1. Click a cause category button in the survey section
2. Charity count for that tag appears
3. "Find charities" link → `/charities?tag=<tag>`

### 2c. Neighborhood Deep Link
1. Click a neighborhood pill at the bottom of the home page
2. Navigates to `/explore?lat=X&lng=Y`
3. Map centers on that neighborhood

---

## 3. Charity Discovery — Explore (`/explore`)

### 3a. Default Load
1. Page loads with map centered on Denver
2. Charity pins render on map
3. Cause filter chips appear above map

### 3b. Filter by Cause
1. Click a cause chip
2. Map pins filter to matching charities
3. Chip shows active state

### 3c. Search by Name
1. Type in search bar
2. Pins and list update to matching results

### 3d. Map/List Toggle
1. Click list icon → switches to grid view
2. Click map icon → returns to map view

### 3e. Charity Drawer
1. Click a map pin
2. `CharityPreviewDrawer` slides up
3. Shows: name, address, description, cause tags, photo
4. "Learn more" → `/charities/:slug`
5. "Donate" → opens Every.org in new tab

### 3f. Geolocation
1. Browser prompts for location permission
2. If granted: map centers on user, distances shown
3. If denied: defaults to Denver center, no distances

---

## 4. Charity Discovery — Browse (`/charities`)

### 4a. Default Load
1. Split panel: charity list (left) + map (right)
2. All charities listed with logo, name, description, tags

### 4b. Filter + Search
1. Filter by cause tag → list and map update
2. Search by name → list and map update
3. Both can be combined

### 4c. List → Map Interaction
1. Click charity card in list → corresponding pin highlights on map

### 4d. View Toggle
1. Toggle to list-only view → map hidden
2. URL param `?view=list` persists the state

---

## 5. Charity Detail (`/charities/:slug`)

### 5a. Page Load
1. Visit `/charities/<valid-slug>`
2. Renders: hero image, name, description, founded year, EIN, cause tags
3. All locations listed with photo, address, description

### 5b. Donate CTA
1. Click "Donate" → opens Every.org page in new tab

### 5c. External Links
1. Website URL → opens in new tab
2. Volunteer URL (if present) → opens in new tab

### 5d. Invalid Slug
1. Visit `/charities/<nonexistent-slug>`
2. Graceful not-found state shown

---

## 6. Nearby Charities (`/nearby`)

### 6a. With Geolocation
1. Page loads, browser prompts for location
2. If granted: charities sorted by distance, "near you" header
3. Distance shown on each card

### 6b. Without Geolocation
1. Permission denied or unavailable
2. Defaults to Denver center, "Charities in Denver" header
3. Distance not shown

### 6c. Card Navigation
1. Click card → `/charities/:slug`

---

## 7. Donation

### 7a. Donate via Drawer
1. Open charity in Explore drawer
2. Click "Donate" → every.org opens in new tab

### 7b. Donate via Detail Page
1. Visit `/charities/:slug`
2. Click "Donate" → every.org opens in new tab

*(GoodLocal does not process payments — Every.org handles the full donation flow)*

---

## 8. User Preferences (`/preferences`) — Auth Required

### 8a. View Profile
1. Visit `/preferences`
2. Name and email displayed (read-only from JWT)

### 8b. Save Preferences
1. Change location setting (Denver / Other)
2. Click save
3. Confirmation or success state shown

---

## 9. Admin — Charity Management (`/admin`) — Admin Auth Required

### 9a. Charities Tab
1. Lists all charities with name, slug, tags, location count, status
2. Search filters list
3. Click row → `/admin/charities/:id`
4. "New charity" form inline → submit creates and navigates to edit page

### 9b. Locations Tab
1. Flat list of all locations across all charities
2. Click row → expands inline edit form
3. Edit: label, address, lat/lng, description
4. Upload photo via Cloudinary picker
5. Save updates location

### 9c. Cause Tags Tab
1. Lists all 19 cause tags with label and charity count
2. Edit label (inline)
3. Delete tag → only succeeds if 0 charities use it

### 9d. Users Tab
1. Read-only list: name, email, role, joined date

---

## 10. Admin — Charity Edit (`/admin/charities/:id`) — Admin Auth Required

### 10a. Edit Charity Details
1. Form pre-populated: name, description, URLs, address, founded year, cause tags, Every.org slug
2. Modify any field → Save button activates (dirty state)
3. Submit → mutation fires, success state shown

### 10b. Logo Upload
1. Click logo upload area
2. Cloudinary picker opens
3. Select/upload image → preview updates
4. Save to persist

### 10c. Location Management
1. Existing locations listed in table
2. Expand row → inline edit form (label, address, lat/lng, description, photo)
3. Upload/replace photo via Cloudinary
4. Delete location → confirmation → removed

### 10d. Add Location
1. Click "Add location"
2. Fill inline form
3. Submit → new location appears in table

---

## Route Index

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Home / landing |
| `/login` | Public | Email entry for magic link |
| `/auth/verify` | Public | Token exchange → JWT |
| `/explore` | Public | Map-first charity discovery |
| `/charities` | Public | Browse + filter charities |
| `/charities/:slug` | Public | Charity detail |
| `/nearby` | Public | Distance-sorted charities |
| `/dashboard` | Auth | User dashboard |
| `/preferences` | Auth | User settings |
| `/admin` | Admin | Charity/tag/user management |
| `/admin/charities/:id` | Admin | Edit individual charity |
# GoodLocal Sitemap

	## Pages
	
	- **Home**
	  - Route: `/`
	  - Access: Public
	  - Description: Landing page — communicates what GoodLocal is, who it's for, and drives users to explore or sign up
	  - Functionality:
	    - Hero with headline, tagline, and primary CTA to /charities
	    - Secondary "Log in" CTA (hidden when authenticated)
	    - Denver callout — makes local focus clear
	  - Links to: /charities, /login
	
	- **Login**
	  - Route: `/login`
	  - Access: Public
	  - Description: Authenticates users via passwordless magic link
	  - Functionality:
	    - Enter email address
	    - Request magic link (calls `requestMagicLink` mutation)
	    - "Check your email" confirmation state
	    - Handles both new signups and returning users
	  - Links to: /auth/verify (via email)
	
	- **Verify**
	  - Route: `/auth/verify`
	  - Access: Public
	  - Description: Completes magic link authentication and establishes a session
	  - Functionality:
	    - Extracts token from URL (`?token=...`)
	    - Calls `verifyMagicLink` mutation
	    - Stores JWT, redirects to /dashboard
	    - New users are created automatically on first verification
	  - Links to: /dashboard
	
	- **Dashboard**
	  - Route: `/dashboard`
	  - Access: Authenticated only
	  - Description: Home base for logged-in users — welcome screen with navigation to key features
	  - Functionality:
	    - Welcome message with user name
	    - Placeholder for future donation stats
	    - CTA to browse charities
	  - Links to: /charities
	
	- **Preferences**
	  - Route: `/preferences`
	  - Access: Authenticated only
	  - Description: View profile info and manage account preferences; serves as both the post-signup onboarding step and an ongoing settings page
	  - Functionality:
	    - Display profile (name and email, read-only)
	    - Set location preference (Denver, CO or Other)
	    - Saves via `savePreferences` mutation (returns `onboardingCompleted`)
	  - Accessible from: Profile menu dropdown in the header
	  - Links to: (stays on page after save)
	
	- **Find Charities**
	  - Route: `/charities`
	  - Access: Public
	  - Description: Discover and browse local nonprofits with a map or list view
	  - Functionality:
	    - Map view by default (Mapbox); toggle to list view via `?view=list`
	    - Search by name
	    - Filter by cause tag (dynamically derived from results)
	    - Map pins link to charity detail; list rows link to charity detail
	  - Links to: /charities/:slug
	
	- **Charity Detail**
	  - Route: `/charities/:slug`
	  - Access: Public
	  - Description: Full profile for a single nonprofit, with actions to donate, volunteer, or visit their website
	  - Functionality:
	    - Display name, EIN, founded year, description, cause tags, primary address
	    - Locations list (label, address, description per location)
	    - Donate button (links to Every.org)
	    - Volunteer button (links to charity volunteer URL)
	    - Visit website link (links to charity website)
	  - Links to: External (Every.org, charity website, volunteer URL), /charities (back link)


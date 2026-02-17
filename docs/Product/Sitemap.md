# GoodLocal Sitemap

- Home
	- Route: /
	- Access: Public
	- Purpose: Landing page — communicate what GoodLocal is, who it's for, and drive users to explore or sign up
	- Functionality:
		- Hero with headline, tagline, and primary CTA to /charities
		- Secondary "Log in" CTA (hidden when authenticated)
		- Denver callout — makes local focus clear
	- Links to: /charities, /login

- Login
	- Route: /login
	- Access: Public
	- Purpose: Authenticate users via passwordless magic link
	- Functionality:
		- Enter email address
		- Request magic link (calls `requestMagicLink` mutation)
		- "Check your email" confirmation state
		- Handles both new signups and existing users
	- Links to: /auth/verify (via email)

- Verify
	- Route: /auth/verify
	- Access: Public
	- Purpose: Complete magic link authentication and establish session
	- Functionality:
		- Extract token from URL (`?token=...`)
		- Call `verifyMagicLink` mutation
		- Store JWT, redirect to /dashboard
		- New users created automatically on first verification
	- Links to: /dashboard

- Onboarding
	- Route: /onboarding
	- Access: Authenticated only
	- Purpose: Capture user preferences after signup
	- Functionality:
		- Set location (Denver, or "other")
		- Calls `savePreferences` mutation
	- Links to: /dashboard

- Dashboard
	- Route: /dashboard
	- Access: Authenticated only
	- Purpose: Home base for logged-in users
	- Functionality:
		- Welcome message with user name
		- Placeholder for future donation stats
		- Link to browse charities
	- Links to: /charities

- Find Charities
	- Route: /charities
	- Access: Public
	- Purpose: Discover and browse local nonprofits
	- Functionality:
		- List charities from database (queries `charities`)
		- Search by name
		- Filter by cause tag
	- Links to: /charities/:slug

- Charity Detail
	- Route: /charities/:slug
	- Access: Public
	- Purpose: View details for a single nonprofit
	- Functionality:
		- Display charity description, locations, cause tags
		- Donate button (links to Every.org)
		- Volunteer link (links to charity website)
	- Links to: External (Every.org, charity website)

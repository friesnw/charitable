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

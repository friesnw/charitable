# Create Dedicated List View

## Problem

The map at `/charities` is great for neighborhood discovery ("what's near me?"), but a poor default for browsing the full directory of Denver organizations. The current sidebar list is subordinate to the map — it's narrow, has no sorting, and on mobile is completely hidden behind a toggle. Users who want to scan all orgs have no clean path to do that. These should be two separate, first-class pages.

## Research: How Comparable Platforms Handle This

**Charity Navigator / GuideStar**: Dedicated browse page with faceted filtering via tabs or a top-bar. Cards show name, mission snippet, location, and cause category.

**Idealist / VolunteerMatch**: List-first with keyword search + location at top. Map is a secondary tool, not the default.

**Every.org**: Cause-first browsing — users pick a cause category upfront, then see matching orgs. Map is buried deeper.

## Recommendation

### 1. Navigation

**Current**: One nav link — "Find Charities" → `/charities` (map-first)

**Updated**: Split into two nav entries:

| Label | Route | Purpose |
|-------|-------|---------|
| **Explore Map** | `/charities` | Neighborhood/location discovery |
| **Browse Nonprofits** | `/organizations` (cause-first) + `/organizations/explore` (standard) | Full directory |

**Desktop header**: Both links visible as peers
**Mobile menu**: Both links visible, stacked

---

### 2. New Browse Page (`/organizations`)

Both options will be built as separate routes so they can be compared side-by-side before deciding which to ship (or whether to combine elements of each).

---

#### Option A: Standard Directory — `/organizations/explore` (Search-first)

- Page header: "Denver Nonprofits" + result count ("42 organizations")
- Inline search bar (reuses existing `charities(search:)` GraphQL query)
- Cause filter chips below search (shared component — see Filter section)
- Sort control (dropdown)
- Card grid below

---

#### Option B: Cause-First Entry — `/organizations` (primary)

Inspired by Every.org's cause landing pattern. The page opens with a spacious, unhurried question before showing the list — good for users who don't already have an org in mind.

**Step 1 — Cause selection screen** (shown when no cause is selected):

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   What causes matter to you?                        │
│   Discover Denver nonprofits doing work you care    │
│   about.                                            │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │  🌱      │  │  🏠      │  │  🍎      │         │
│   │ Environment│ │ Housing │  │  Food    │         │
│   └──────────┘  └──────────┘  └──────────┘         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │  ...     │  │  ...     │  │          │         │
│   └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│   [Browse all →]  (skips to full list)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Cause cards: generous padding, icon large (32–40px), label, optional 1-line description of what the tag covers
- Cards are laid out in a relaxed grid (2–3 col), not tight chips
- "Browse all →" escape hatch to skip straight to the full list

**Step 2 — Filtered list** (after cause selected, or "Browse all"):

- Cause pills reappear as compact filter bar at top (shared component, see below)
- Active cause is highlighted; clicking again deselects → returns to cause selection screen
- Card grid with sort control
- Search bar available

This pattern works well because our org count is small enough that cause-first filtering meaningfully reduces the list. If we grow to 100+ orgs this would become more important, not less.

---

#### Sorting Options

1. **Alphabetical (A–Z)** — default; no algorithmic bias
2. **By Neighborhood** — sorts by the neighborhood of the org's primary location

**Featured badge**: 3–4 orgs should be surfaced with a "Featured" badge when sorted A–Z. Featured orgs float to the top of the list, then the remainder continue alphabetically. Orgs to feature:
- Denver Urban Gardens (DUG)
- Warren Village
- Urban Peak
- Denver Rescue Mission

This requires adding a `featured` boolean column to the `charities` table (new migration). Featured status is set in Admin. The badge itself is a small visual treatment on the card — not a separate section.

Do not add a "relevance" sort — no ratings or engagement signals yet to make it meaningful.

---

#### Cause Filter Component

The cause filter pills (tag chips row) must be a **shared component** extracted from the map page — not duplicated. The map page and the browse page both use the same component. Tag labels, icons, and colors are all defined in `causeColors.ts` and will change; we only want to update one place.

Proposed: `frontend/src/components/ui/CauseFilterBar.tsx`

---

#### Card Design

More substantial than the current sidebar row — this is a primary view.

```
┌──────────────────────────────────────────────────┐
│  [Logo 48px]  Organization Name    [Featured ✦]  │
│               ● Cause tag  ● Cause tag            │
│                                                  │
│  Short description (2 lines, clamp)              │
│                                                  │
│  📍 Capitol Hill                       View →    │
└──────────────────────────────────────────────────┘
```

- Logo: 48px circle, fallback initials
- Featured badge: subtle pill or star badge, top-right or beside the name
- Cause tags: colored pill badges (using `causeColor`/`causeIcon`)
- Description: `line-clamp-2 text-sm text-text-secondary`
- Neighborhood: derived via `nearestNeighborhood()` on primary location
- CTA: "View →" link to `/charities/:slug`

Grid: 1 col mobile → 2 col tablet → 3 col desktop

#### Empty / Loading State
- Skeleton cards (adapt existing `SkeletonCard`)
- Empty state: "No organizations match your filters" + "Clear filters" link

---

### 3. What Stays on the Map Page

The map page (`/charities`) stays as-is. The sidebar list there is useful as a map companion for proximity browsing — it's not a replacement for the directory.

---

### 4. Implementation Notes

- New pages: `frontend/src/pages/Organizations.tsx` (Option A) and `frontend/src/pages/OrganizationsExplore.tsx` (Option B)
- New routes: `/organizations` and `/organizations/explore` in `routes.tsx`
- New shared component: `frontend/src/components/ui/CauseFilterBar.tsx` (extract from map page, reuse here)
- GraphQL: reuse existing `GET_CHARITIES` query; sorting and neighborhood filtering are client-side
- New migration: add `featured boolean NOT NULL DEFAULT false` to `charities` table
- Update Admin edit page to expose the `featured` toggle
- Update `docs/Product/flows.md` with the browse flow

---

### 5. Out of Scope (Future)

- Pagination or infinite scroll (small dataset, full load is fine)
- Saved/favorited orgs list

---

### 6. Next Steps After Completion

- Rename map page mobile toggle from **"List"** to **"Nearby"** to clarify it's location-contextual, not the full directory

---

## Tasks

- [ ] Add `featured` migration to `charities` table
- [ ] Update Admin charity edit to expose `featured` toggle
- [ ] Extract `CauseFilterBar` component from `Charities.tsx` (map page reuses it)
- [ ] Create `Organizations.tsx` (Option A — `/organizations`)
- [ ] Create `OrganizationsExplore.tsx` (Option B — `/organizations/explore`)
- [ ] Add both routes to `routes.tsx`
- [ ] Update nav labels in `Header.tsx` (desktop + mobile)
- [ ] Update `docs/Product/flows.md` with browse flow

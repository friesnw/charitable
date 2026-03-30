# Charity Data Population Guide

## 1. Overview

This guide describes the end-to-end process for adding a fully populated charity record to GoodLocal. It is written for an agent (human or AI) to follow sequentially from research through Admin UI entry.

**Reference charities:** Two records have been fully populated in prod and serve as the canonical quality bar:
- **Warren Village** (`/charities/warren-village`) — EIN 84-0644270
- **Denver Rescue Mission** (`/charities/denver-rescue-mission`) — EIN 84-6038762

**Workflow summary (7 stages):**
1. Research — gather facts and stats from primary sources
2. Verify — confirm impact stats against official publications
3. Draft Content Fields — write description, impact, program_highlights, location_description, usage_credit
4. Photos — skip until photo usage rights are confirmed with the charity
5. Locations — collect address, lat/lng, and per-location descriptions
6. Admin UI Entry — enter all fields at `/admin/charities`
7. Post-Entry Scripts — run street view and logo scripts

---

## 2. Stage 1 — Research

Consult sources in order of trust:

1. **Official website** — About, Programs/Services, Impact pages. Many charity sites are JS-rendered; if `WebFetch` returns empty content, fall back to `WebSearch` to find the text.
2. **ProPublica Nonprofit Explorer** — `https://projects.propublica.org/nonprofits/organizations/[EIN]` — 990 filings with exact headcount and financial stats.
3. **Annual Report / Impact Report** — usually linked from the website; the most authoritative source for program impact numbers.

**Collect during this stage:**

| Field | Where to find it |
|---|---|
| Full legal name | About page / 990 header — use the full name only, no abbreviations (e.g. "Integrated Family Community Services", not "Integrated Family Community Services (IFCS)") |
| EIN | IRS / ProPublica |
| Founded year | 990 filing or About page |
| Primary address | Contact page |
| Website URL | — |
| Donate URL | The charity's own "Give" / "Donate" button — never use every.org unless it's linked from the charity's site |
| Volunteer URL | Get Involved / Volunteer page |
| Mission statement | About page (verbatim quote) |
| Impact statistics | Annual report or Impact page — must be sourced |
| Program names and descriptions | Programs / Services page |
| Photo assets | Skip for now — photos require explicit usage approval from the charity before upload |

---

## 3. Stage 2 — Verify Core Facts

**Can be trusted from primary sources without additional verification:**
- EIN — from ProPublica Nonprofit Explorer or IRS Tax Exempt Organization Search
- Founded year — from 990 filing header or ProPublica
- Primary address — from the charity's own Contact page

**Must be verified before use:**

- **Impact statistics** — must appear in an official published source (annual report, impact page, or 990 filing). Never estimate, interpolate, or paraphrase a number. A missing stat is better than a wrong one.
- **Program descriptions** — read the primary source page directly; do not summarize from secondary sources alone.
- **Photo licensing** — do not upload charity photos until explicit usage approval has been obtained from the charity. Leave all photo fields (`cover_photo_url`, `content_photo_url_1`, `content_photo_url_2`) empty until approved.

**Multi-agent verification approach:**

For high-confidence content, use a two-agent pipeline:
1. Agent A drafts each content field and records its source for every stat or claim (URL + exact quote).
2. Agent B independently looks up each cited source and confirms the stat matches exactly.
3. Any discrepancies go back to Agent A for correction before Admin UI entry.

This is especially important for impact numbers — an incorrect stat displayed on the platform erodes trust and is worse than leaving the field empty.

---

## 4. Stage 3 — Draft Content Fields

### `description` (TEXT)

- 2–3 short paragraphs, written in third person.
- Lead with who they serve and their core mission; follow with their approach or model.
- ~100–200 words total.
- Adapt language from the About page — do not copy-paste verbatim.
- Each paragraph is separated by a newline; the UI renders each as its own `<p>` tag.

**Example — Warren Village (prod):**
```
Warren Village serves unhoused and unstably housed low-income single-parent families in the Denver area. They provide families with the space and resources to achieve economic mobility and navigate and disrupt systems of poverty.

Warren Village utilizes a two-generation approach to empower both parents and their children through life-skills classes, a high-quality Early Learning Center, education and career support, and resource navigation.
```

---

### `impact` (TEXT, newline-delimited)

Each line is one impact stat. The UI strips any leading `- ` and then applies this regex:

```
/^(\$?[\d,]+[%+kKmMbB]?)\s+(.+)$/
```

- The first token (number + optional suffix) becomes the large headline card.
- Everything after the space becomes the card label.
- Lines that don't match the regex render as plain body text.
- Numbers must be exact and sourced from an official report.
- Do not append the reporting year to stat labels — the UI already displays the report year as a section heading, making it redundant.
- 3–5 stats is the ideal range.

**Valid number formats:** `1,202,334` · `93%` · `89%` · `$2.4M` · `627` · `242`

**Example — Denver Rescue Mission (prod):**
```
1,202,334 total meals provided
454,080 Total nights of shelter provided
627 Individuals obtained more stable housing through programs
93% One-year success rate in housing
242 Households served through transitional programs
```

**Example — Warren Village (prod):**
```
- 89% moved into a permanent housing situation after Warren Village
- 59% earned a degree or certificate or were on track to obtain one at time of exit
- 80% average score for all children in Early Learning across six areas of development
```

---

### `program_highlights` (TEXT, newline-delimited)

Each line describes one major program or service area. The UI parses each line with this pattern:

```
(icon-name)**Title**Description text
```

- `(icon-name)` — required; sets the icon. Must be a valid icon name from the list below.
- `**Title**` — optional but recommended; renders as a bold heading above the description.
- `Description text` — follows immediately after `**Title**` with no newline.
- If no `**Title**` is present, the entire remainder of the line renders as description text.
- 3–4 highlights is ideal.

**Valid icon names for program highlights:**

| Icon | Use for |
|---|---|
| `home` | Housing, shelter programs |
| `family` | Family services, parenting support |
| `education` | Education, learning, schools |
| `people` | Community programs, outreach |
| `heart` | Health, wellness, care |
| `shield` | Prevention, safety, protection |
| `plus-circle` | Emergency services, intake |
| `sun` | Recovery, rehabilitation |
| `star` | General / fallback |
| `tree` | Environment, nature |
| `volunteer` | Volunteer programs |

If an icon name in the field is not on this list, the UI silently falls back to `star`.

**Example — Denver Rescue Mission (prod, with titles):**
```
(plus-circle)**Emergency Services**Provide basic needs like food, shelter, water, clean restrooms, showers, and laundry services. Serves as the first step in restoring the lives of those experiencing homelessness.
(sun)**Recovery Program** Helps men create a new sense of hope and identity through a year of counseling, spiritual development, work readiness, life-skills education, financial management training, and housing readiness.
(family)**Transitional Program**Gives men, women, and families a safe place to live while they transition out of homeless circumstances. Their largest facility, The Crossing, gives parents with children a chance to live with support from an encouraging community while they get back on their feet.
(shield)**Prevention Program**In partnership with public schools, helps families at risk of losing their housing with one-time financial and case management support. To aid people facing these kinds of decisions, outreach provides food, clothing, household products, and furniture.
```

**Example — Warren Village (prod, no titles — icon + description only):**
```
(home)Affordable housing, with income-based rent and private, secure apartments
(family)Family supportive services, with economic mobility coaching, education, workshops, and mental health counseling
(education)Early education & child care, with learning centers, after school programs, developmental assessments, and early intervention
```

---

### `location_description` (TEXT)

- 1–2 sentences describing geographic scope: neighborhoods or service areas, and a general sense of scale if relevant.
- **Avoid citing an exact location count** — the number of locations on our site may not match the charity's full footprint. Use approximate language instead (e.g. "dozens of locations", "across several Denver neighborhoods") rather than a specific number.
- Appears as the intro paragraph above the location cards on the detail page.
- **Verify neighborhood names against a map** — do not rely on research output alone. Look up the address in Google Maps or a Denver neighborhood map to confirm the correct neighborhood before writing it.

**Example — Warren Village (prod):**
```
Warren Village serves families at 3 locations throughout Denver. These locations provide housing-embedded supportive services for adults and children focused on their journey of growth and transformation.
```

---

### `usage_credit` (TEXT)

- Leave empty until photo usage has been approved by the charity.
- Once photos are approved and uploaded, set to: `Info and photography courtesy of [Org Name].`
- Add photographer credits if known: append `, [Photographer Name].` before the closing period.
- Rendered as small uppercase caption at the bottom of the detail page.

---

## 5. Stage 4 — Photos

**Skip this stage until photo usage rights have been confirmed with the charity.** Leave `cover_photo_url`, `content_photo_url_1`, `content_photo_url_2`, and `usage_credit` empty.

Once approval is obtained:

### Cover photo (`cover_photo_url`)

Hero image shown at the top of the detail page, rendered at 1800×780px (fill crop). Prefer photos of people or active programs over logos or building exteriors.

### Content photos (`content_photo_url_1`, `content_photo_url_2`)

Two supplementary images shown in the right column alongside the impact stats. Both can be `null` if only one good image is available.

### Upload process

1. Download the image file from the charity's approved materials.
2. Upload to Cloudinary dashboard (account: `dr3gnrygp`).
3. Copy the resulting `https://res.cloudinary.com/dr3gnrygp/image/upload/...` URL.
4. Paste into the Admin UI field.
5. Set `usage_credit` to `Info and photography courtesy of [Org Name].` (add photographer names if known).

### Logo (`logo_url`)

Do not upload manually. Run `upload-logos.ts` after creating the charity record — it auto-fetches and uploads the logo from the charity's website favicon. See Stage 7.

---

## 6. Stage 5 — Locations

Each charity should have at least one location. For each physical site, collect:

| Field | Notes |
|---|---|
| `label` | Short descriptive name, e.g. "Lawrence Street Shelter" or "Warren Village at Gilpin" |
| `address` | Full street address, city, state, zip |
| `latitude` / `longitude` | Geocode via Google Maps or Nominatim; verify the pin lands at the correct building. If coordinates cannot be confirmed, leave blank — a missing pin is better than a wrong one. |
| `description` | 2–4 sentences describing what programs run at this specific location, not the org broadly. Do not include hours, schedules, or contact details — these go stale quickly and belong on the charity's own website. |
| `is_sublocation` | Set `true` if the location is hosted inside another organization's building |
| `photo_url` | Leave blank — auto-populated by `populate-street-view.ts` (see Stage 7) |

**Example location descriptions — Denver Rescue Mission (prod):**

> *Lawrence Street Shelter:* "Lawrence Street Shelter is Denver Rescue Mission's most well-known and most recognizable location. It provides emergency care to the poor and homeless and is an entry point for many long-term, life-changing program participants."

> *The Crossing:* "Offers bible studies, case management, counseling, and meals to help participants save money and develop the life skills and relationships needed to maintain self-sufficiency after graduating. The Crossing also serves as an after-hours donation drop-off site for donations."

---

## 7. Stage 6 — Database Entry

**When Claude is performing this stage, always write directly to the local PostgreSQL database (`app_db`) — never present a manual entry table for the user.**

### Step 1 — Check what already exists

Before drafting or inserting anything, query the DB first:

```sql
SELECT * FROM charities WHERE ein = '<EIN>' OR slug = '<expected-slug>';
SELECT * FROM charity_locations WHERE charity_id = <id>;
```

Use the existing record as the starting point — only research and fill in what's missing.

### Step 2 — Insert or update the charity

If no record exists, INSERT. If one exists, UPDATE only the fields that are empty or stale. Never overwrite fields that already have good data without comparing first.

**Fields to populate:**
- `name`, `slug`, `ein`, `website_url`, `volunteer_url`
- `founded_year`, `primary_address`
- `cause_tags` — valid values: `animals`, `arts`, `education`, `environment`, `families`, `health`, `housing`, `hunger`, `mental-health`, `seniors`, `youth`
- `donate_url` — use the link from the charity's own website. Do not use every.org unless that is the charity's own linked destination. The charity's donate button may link to a third-party platform (Donorbox, Colorado Gives, etc.) — that is fine, use whatever their site links to.
- `every_org_slug` — only populate if the charity's site explicitly links to every.org
- `description`, `impact`, `program_highlights`
- `location_description`, `usage_credit`
- `cover_photo_url`, `content_photo_url_1`, `content_photo_url_2` — leave NULL until photo usage is approved

### Step 3 — Insert or update locations

Check existing locations first (`SELECT * FROM charity_locations WHERE charity_id = <id>`), then INSERT or UPDATE as needed.

### Step 4 — Mark reviewed

Set `is_reviewed = true` once all content is complete and verified.

### Step 5 — Spot-check

Confirm the detail page at `/charities/[slug]` renders correctly — no broken images, no missing sections, impact cards display correctly.

---

## 8. Stage 7 — Post-Entry Scripts

After saving via Admin UI, run these from the `backend/` directory:

```bash
# Auto-populate Street View photos for any locations without photo_url
npx tsx scripts/populate-street-view.ts

# Upload logo from charity website favicon to Cloudinary
npx tsx scripts/upload-logos.ts
```

To run against the dev or prod database:
```bash
DATABASE_URL=<render-url> npx tsx scripts/populate-street-view.ts
DATABASE_URL=<render-url> npx tsx scripts/upload-logos.ts
```

### Syncing to prod

Do not rush to sync. Make all edits locally first, spot-check at `/charities/[slug]`, then sync to prod via `sync-content.ts` when ready. The database is the source of truth — Render provides automated backups of prod, and `sync-content.ts` can repopulate any environment from another at any time.

---

## 9. Quality Checklist

Before marking a charity as reviewed (`is_reviewed = true`), confirm:

- [ ] Impact stats are cited from an official source (annual report, impact page, or 990)
- [ ] Program highlights use valid icon names from the list in Stage 3
- [ ] Photo fields are empty OR photo usage has been explicitly approved by the charity
- [ ] If photos are uploaded, `usage_credit` names the organization and any known photographers
- [ ] At least one location has correct lat/lng — verify the pin appears at the correct building on the map
- [ ] Detail page at `/charities/[slug]` renders without broken images or missing sections
- [ ] `is_reviewed` is set to `true`

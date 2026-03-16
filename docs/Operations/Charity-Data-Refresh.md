# Charity Data Refresh Guide

Per-charity data sources and refresh instructions. After completing initial population for any charity, add its entry here so future refreshes skip the research stage entirely.

---

## How to Refresh

Refreshes follow a **report-first, apply-second** workflow. Never update the DB directly from a source — always generate a summary report first, review it, then decide what to apply.

### Step 1 — Generate a Refresh Report

For each charity being refreshed, produce a markdown report showing what has changed. The report should be created at `docs/Operations/refresh-reports/YYYY-MM-DD-<slug>.md` and contain two sections:

**Locations diff:**
- Query the source (API endpoint or website) listed in the charity's entry below
- Query current DB: `SELECT label, address FROM charity_locations WHERE charity_id = (SELECT id FROM charities WHERE slug = '<slug>') ORDER BY label`
- List: Added (in source, not in DB) | Removed (in DB, not in source) | Unchanged (count only)
- For API-sourced charities (e.g. DUG): include availability status changes for existing locations
- **Do not flag label/name differences as changes.** Location labels in the DB may have been manually improved and are considered authoritative — the source name is shown for reference only, never overwritten

**Impact stats diff:**
- Fetch the source page listed below
- Show: current DB value side-by-side with new source value, one stat per line
- Flag any stat where the number changed, a stat was added, or a stat was removed

### Step 2 — Review

Read the report. Consider:
- Are removed locations genuinely closed, or just missing from the source temporarily?
- Do new impact numbers seem plausible (reasonable year-over-year change)?
- Are new locations worth adding, or low-signal (e.g. a private garden that briefly appeared as Open)?

### Step 3 — Apply Approved Changes

Only after review:
- **Locations**: add via Admin UI or by updating/re-running the charity's script; delete via Admin UI. When adding, use the source name as a starting point but preserve any manually improved labels already in the DB
- **Impact stats**: update via Admin UI
- Re-run `npx tsx scripts/populate-street-view.ts` for any new locations
- Note the refresh date and summary in the charity's entry below

### Cadence
- **Locations**: refresh annually, or when a major expansion/closure is announced
- **Impact stats**: refresh when a new annual report is published (typically spring)

---

## Denver Urban Gardens (DUG)

**Slug:** `denver-urban-gardens` | **EIN:** `74-2374848`

### Locations

**Source:** DUG ArcGIS Feature Service (public, no auth required)

```
https://services8.arcgis.com/p5Sr2dHSNSTYFqlt/arcgis/rest/services/New_Garden_availability/FeatureServer/0/query?where=1%3D1&outFields=Garden__Garden_Name,Full_Address,Garden_Geolocation__Latitude_,Garden_Geolocation__Longitude_,Plot_Availability_for_Map,Neighborhood&returnGeometry=false&f=json&resultRecordCount=200
```

**Status field:** `Plot_Availability_for_Map`
- `Open` = Potential Plot Availability → include
- `Full` = Full for the Season → include
- `Private` → exclude
- `Under Construction` → exclude

**Refresh script:** `backend/scripts/add-dug-locations.ts`
- Contains all 140 public gardens as of March 2026 with pre-computed coordinates
- Uses `ON CONFLICT DO NOTHING` — safe to re-run; won't duplicate existing records
- To refresh with updated data: re-query ArcGIS above, diff against the `GARDENS` array in the script, update as needed, re-run

**Last populated:** March 2026 — 140 locations (59 Open, 81 Full); 130 got Street View photos, 24 skipped (no imagery)

**Note:** ArcGIS data is not reliable for detecting removed gardens — DUG does not promptly remove defunct gardens from their system. Always verify questionable locations via Google Maps before trusting ArcGIS status. When a garden is confirmed gone, delete it from the DB, add it to `EXCLUDED_GARDENS` in the script, and record it below.

### Known Removals

Gardens confirmed no longer in operation. Do not re-add. Also listed in `EXCLUDED_GARDENS` in `backend/scripts/add-dug-locations.ts`.

| Garden | Address | Removed | Reason |
|---|---|---|---|
| El Oasis Community Garden | 1847 West 35th Avenue, Denver, CO 80211 | March 2026 | Location is now duplexes |
| Del Mar Academy Community Garden | 12445 E 2nd Ave, Aurora, CO 80011 | March 2026 | |

### Impact Stats

**Source:** https://dug.org/impact/ and https://dug.org/gardens-food-forests/community-gardens/

**Current stats (as of March 2026):**
```
200+ community gardens and food forests in the DUG network
4,533 garden plots under cultivation
627,926 pounds of food grown annually
40,000+ Denverites with access to fresh, locally grown produce
66 school-based gardens serving Denver youth
```

Stats are updated periodically on the website (not tied to a named annual report). Re-fetch both pages above to check for updated numbers.

---

## Warren Village

**Slug:** `warren-village` | **EIN:** `84-0644270`

### Locations

**Source:** https://warrenvillage.org/ (About or Locations page)

3 locations as of initial population — no API, verify manually:
- Warren Village at Gilpin — 1323 Gilpin Street, Denver, CO 80218
- Warren Village at Alameda — 1394 W. Alameda Avenue, Denver, CO 80223
- Warren Village at First Step — 5280 Federal Boulevard, Denver, CO 80221

### Impact Stats

**Source:** Warren Village Annual Report — linked from https://warrenvillage.org/about/

**Current stats (year of report not confirmed at time of population):**
```
- 89% moved into a permanent housing situation after Warren Village
- 59% earned a degree or certificate or were on track to obtain one at time of exit
- 80% average score for all children in Early Learning across six areas of development
```

---

## Denver Rescue Mission

**Slug:** `denver-rescue-mission` | **EIN:** `84-6038762`

### Locations

**Source:** https://www.denverrescuemission.org/locations/

7 locations as of initial population — no API, verify manually.

### Impact Stats

**Source:** Denver Rescue Mission Annual Report — linked from https://www.denverrescuemission.org/about/

**Current stats (year of report not confirmed at time of population):**
```
1,202,334 total meals provided
454,080 Total nights of shelter provided
627 Individuals obtained more stable housing through programs
93% One-year success rate in housing
242 Households served through transitional programs
```

---

## Food Bank of the Rockies

**Slug:** `food-bank-of-the-rockies` | **EIN:** `84-0772672`

### Locations

**Source:** https://www.foodbankrockies.org/locations/ — large partner network; see also internal PDF at `/Users/nickfries/Documents/GoodLocal/Food Bank of the Rockies/LocationListInfo 03-13-26.pdf`

Locations need reconfirmation — this charity has a large partner/distribution network that changes frequently.

### Impact Stats

**Source:** https://www.foodbankrockies.org/impact/ and annual report linked from site.

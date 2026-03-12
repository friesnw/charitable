# Charity Detail Page Layout Overhaul

## Context
The mockup shows a significantly restructured charity detail page. Key changes from current state:
1. Single full-width cover photo (not the current side-by-side grid with content photos)
2. Title row with "Verified Non-Profit" badge, EIN, and Est. year all inline on the right
3. Tags with more prominent brand-colored styling
	1. Claude: let's make this change across the board for tag styling, on all pages
4. New "Program Highlights" section: icon bullets on the left, content photos on the right
	- Icons use prefix syntax in the text field: `heart|We serve 500 families` (Option A — no migration needed)
	- Supported icon keys: `heart`, `tree`, `star`, `people`, `shield`, `home` (mapped to inline SVGs)
	- Admin tooltip on the field documents the `icon|text` format
	- Icon color: `--flair-green` (#607F75); background circle at 20% opacity (`#607F7533`)
5. Mapbox map replaces location cards — **PART 2 (separate task, skip for now)**
6. usageCredit shown as small text credit at the bottom
7. Button order: Donate (filled) first — unchanged; Volunteer (outlined) second — add volunteer icon; Website link (globe icon, e.g. warrenvillage.org) third
8. Add `--flair-sage: #859E95` token to `tokens.css` — intended for secondary section heading text (used on "About this Organization", "Impact", "Program Highlights" headings across the page)

## Fields Involved
- `programHighlights` (TEXT) — already in DB, schema, and resolver; **NOT YET in `GET_CHARITY` query or `StoryCharity` interface**
- `usageCredit` (TEXT) — same situation
- `contentPhotoUrl1`, `contentPhotoUrl2` — already fetched; move from header to alongside highlights

## Critical Files
- `frontend/src/pages/CharityDetail.tsx` — add `programHighlights` and `usageCredit` to `GET_CHARITY` query
- `frontend/src/components/CharityDetailStory.tsx` — all visual changes
- Run `npm run codegen` after query change (backend must be running)

---

## Checklist

- [x] **1. `CharityDetail.tsx` — Update GET_CHARITY query**
  - Add `programHighlights` and `usageCredit` to the query body

- [x] **2. `CharityDetailStory.tsx` — Interface**
  - Add to `StoryCharity`:
    ```ts
    programHighlights: string | null;
    usageCredit: string | null;
    ```

- [x] **3. Photo Header — Single full-width cover photo**
  - Replace the current three-way photo grid with a single full-width image
  - Content photos are removed from this section (they appear later in highlights)
  - Height: 260px, rounded-xl, object-cover
  - Cloudinary params: `w: 1200, h: 520, fit: 'fill'`

- [x] **4. Title Row — Name left, meta right**
  - Flex row: name + tags on left, verified badge + EIN + est. on right
  - Tags use brand color border (`borderColor: color`) with uppercase tracking
  - "Verified Non-Profit" badge uses `var(--flair-green)` with CheckCircle SVG icon
  - EIN and Est. year shown inline with Calendar SVG icon
  - Use inline SVGs (no icon library)

- [x] **5. Remove standalone EIN/foundedYear block**
  - The old `{charity.foundedYear && <div>Est. ... EIN ...</div>}` section is removed (it's now in the title row)

- [x] **6. Body — About + Impact two-column layout**
  - No changes needed to description or impact sections

- [x] **7. Add `--flair-sage` token to `tokens.css`**
  - Add `--flair-sage: #859E95;` under palette accents
  - Use this color for section subheadings like "About this Organization", "Impact", "Program Highlights" (replacing current gray)

- [x] **8. Program Highlights section (new)**
  - Parse `programHighlights` as newline-separated lines
  - Each line may optionally start with `iconkey|` prefix (e.g. `heart|We serve 500 families`)
  - Supported icon keys: `heart`, `tree`, `star`, `people`, `shield`, `home` — mapped to inline SVGs; fallback to a generic circle if no prefix
  - Two-column grid: bullets with icon on left, content photos on right
  - Icon color: `var(--flair-green)`; background circle: `#607F7533` (20% opacity)
  - Content photos: `contentPhotoUrl1` and `contentPhotoUrl2`, height 200px, rounded-xl
  - Section only renders if any of: programHighlights, contentPhoto1, contentPhoto2

- [x] **9. Admin tooltip for programHighlights field**
  - Add a tooltip or helper text to the `programHighlights` textarea in `AdminCharityEdit.tsx`
  - Explain format: one highlight per line; optionally prefix with `iconkey|` (e.g. `heart|We serve 500 families`)
  - List supported icon keys: `heart`, `tree`, `star`, `people`, `shield`, `home`

- [x] **10. Tag styling — apply brand-colored border style across all pages**
  - Update `CharityPreviewDrawer.tsx` tags (currently `bg-gray-100 text-gray-600`) to match the new brand-color border style
  - Check `Charities.tsx`, `CharityMap.tsx`, `ExploreMap.tsx` for any other tag rendering

- [x] **11. Usage Credit**
  - Add `{charity.usageCredit && <p>...}` before the sticky footer (inside body padding)
  - Styling: `text-xs uppercase tracking-widest text-gray-400 leading-relaxed`

- [x] **12. Button order — Donate first, Volunteer second, Website third**
  - Keep Donate (filled orange) first — no change
  - Add Volunteer (outlined) second with a volunteer/hands SVG icon
  - Add Website link third with a globe SVG icon, showing the bare domain (e.g. `warrenvillage.org`)

- [x] **13. Map section — DEFERRED to Part 2**
  - Will explore multiple layout variations in a follow-up task

- [x] **14. Run codegen**
  - `npm run codegen` (requires backend running locally)

---

## Verification Checklist
- [x] Single full-width cover photo at top
- [x] Title row: name left, verified + EIN + est. right
- [x] Tags use brand color border
- [x] About + Impact two-column section works
- [x] Program Highlights shows bullets with icon and content photos alongside
- [x] usageCredit appears as small caps text
- [x] Donate button is first (filled orange), Volunteer second (outlined w/ icon), Website link third (globe icon)
- [x] Section headings use `--flair-sage` color
- [x] Tag pills use brand-color border style across all pages
- [x] Program Highlights: icon prefix format works; fallback works for plain text lines
- [x] Graceful fallback: charity with no highlights, no content photos, no credit — no broken sections
- [x] Map deferred — location cards still show (or hidden pending Part 2)

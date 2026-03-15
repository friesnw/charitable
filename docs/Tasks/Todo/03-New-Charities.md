## Add new charities — DUG.org, IFCS, Jewish Family Service

PDF source: `/Users/nickfries/Documents/GoodLocal/Food Bank of the Rockies/LocationListInfo 03-13-26.pdf`

**Decision:** These three orgs appear as FBR partner sites but are substantial nonprofits that deserve their own charity pages. Add them separately, not as FBR locations.

- **Denver Urban Gardens (DUG.org)** — community gardens / food access
- **Integrated Family Community Services (IFCS)** — 3370 S Irving St, Englewood, CO 80110 — food pantry, utility assistance, benefit navigator; ifcs@ifcs.org, 303-789-0501
- **Jewish Family Service - Weinberg Food Pantry** — 3201 S Tamarac Dr, Denver, CO 80231 — mobile pantry Tue/Wed/Fri 10am-1pm; 303-597-5000

**Data consideration:** When these are added, their addresses will overlap with FBR partner location pins. That's intentional — two orgs doing good things at the same place. The UI will eventually need to handle stacked pins gracefully (grouped view). Don't model them as FBR locations.

**Prod safety note:** Add locally first, then sync to prod. Sync script does DELETE + reinsert for locations per charity — only affects rows for charities present in the source, so new charities added here won't overwrite unrelated prod data.


Another consideration: DUG isn't just donate or volunteer, the nature of urban gardening is a big one is just to get involved by owning a garden
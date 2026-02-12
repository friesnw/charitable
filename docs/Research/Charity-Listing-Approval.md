# Charity Listing Approval: Permission vs. Public Data

**Question:** Do we need charity approval to list them on the platform? What are the strategic and legal implications of each approach?

---

## The Legal Landscape

### Public data is freely available

All 501(c)(3) data is public record via the IRS. Platforms like Charity Navigator, GuideStar/Candid, ProPublica Nonprofit Explorer, and Every.org all list 1M+ nonprofits using publicly available IRS 990 data — without individual consent. This is legal and established practice for **informational** purposes.

### But solicitation changes the calculus

California's [AB 488](https://oag.ca.gov/charities/pl) (effective Jan 2025) creates specific rules for **charitable fundraising platforms** — sites that "perform, permit, or enable" charitable solicitations:

- Platforms must **register** with the CA Attorney General
- Platforms must get **written consent** from charities before using their name in solicitations
- **Exception**: Consent is NOT required if the platform:
  1. Only references publicly available information
  2. Conspicuously discloses that the charity has not provided consent
  3. Removes the charity upon verifiable request
  4. Does not require consent as a condition for accepting donations

**Key distinction**: If Charitable simply links out to Every.org for donations (rather than processing donations itself), it may function more as a discovery/informational platform than a "charitable fundraising platform" under these regulations. Every.org would be the fundraising platform. But this is a gray area worth monitoring.

---

## The GoFundMe Cautionary Tale (Nov 2025)

GoFundMe created **1.4 million nonprofit donation pages** using public IRS data without consent. The backlash was severe:

- **National Council of Nonprofits** issued a formal statement condemning it
- Nonprofits found pages with **incorrect info, outdated logos, wrong descriptions**
- GoFundMe's SEO optimization meant their pages **outranked the nonprofits' own websites**
- Donations went through GoFundMe's fee structure, **reducing funds** vs. direct giving
- GoFundMe ultimately **apologized and made all pages opt-in only**

**Lesson**: Even when legally permissible, creating donation-adjacent pages without consent damages trust — the exact thing Charitable's brand is built on.

---

## Two Paths

### Path A: List Without Approval (Discovery Only)

**How it works:** Curate a list of Denver nonprofits using public IRS data. Link to their websites and Every.org pages. No custom donation processing.

**Benefits:**
- Launch fast — no approval bottleneck
- Can list any 501(c)(3) immediately
- Standard practice (Charity Navigator model)
- Legally clear if purely informational

**Risks:**
- Can't use charity logos/branding without permission (trademark)
- Limited data quality — public records may be outdated
- No relationship with charities = no unique content, volunteer links, or verified info
- If a charity objects, we should honor removal requests
- Conflicts with "trust over hype" brand if we're publishing info charities haven't verified

---

### Path B: Require Charity Approval (Opt-In)

**How it works:** Reach out to charities, get them to opt in to being listed. They verify their info, provide logos, mission statements, volunteer links.

**Benefits:**
- **Verified, accurate data** — charities confirm their own info
- **Logos and branding** — legal to use with permission
- **Relationship unlocked** — once a charity is in your system:
  - They can update their listing
  - You can offer premium features (analytics, donor insights)
  - You can eventually offer direct payment processing (Stripe) as a value prop
  - Volunteer link, events, specific asks become possible
- **Trust signal** — "Verified by [Charity Name]" badge is a real differentiator
- **Defensible moat** — curated, permission-based listings are harder to replicate than scraping IRS data
- **Revenue path** — "Claim your listing" is a proven SaaS model (Yelp, Google Business, Glassdoor)

**Risks:**
- **Slow to start** — outreach takes time, nonprofits are busy
- **Small initial catalog** — may launch with 5-10 instead of 50+
- **Nonprofit fatigue** — they get pitched constantly
- **Chicken-and-egg** — charities want to see traffic before investing time

---

## Strategic Unlocks from Opt-In Approach

### Payment Layer via Stripe
If charities have an explicit relationship with the platform:
- Charitable could process donations directly (Stripe Connect)
- Revenue via small processing fee or optional donor tip
- Charities get a dashboard: donation history, donor count, recurring stats
- Replaces dependency on Every.org for payment processing
- This is how GoFundMe, Daffy, and ColoradoGives.org monetize

### Premium Charity Features
- Claimed listings get analytics (views, clicks, donation referrals)
- Featured placement in discovery
- Volunteer event management
- Donor communication tools
- Tiered pricing: free listing → paid features

### Content Quality
- Charities write their own mission statements (authentic voice)
- Up-to-date volunteer opportunities, events, needs
- Real photos instead of stock/scraped logos
- Direct trust verification: "This charity has verified their information on Charitable"

---

## Recommendation

**Start with a hybrid approach:**

1. **Seed the catalog with public data** — list ~10-15 Denver charities using IRS/Every.org public info. Mark them as "Community Added" (not verified).
2. **Reach out for opt-in** — contact each charity to claim/verify their listing. When they do, mark as "Verified."
3. **Only use logos and branded content from opted-in charities.** For unclaimed listings, use generic cause-category icons.
4. **Honor any removal requests immediately.**
5. **Track which charities engage** — this tells you who your early partners will be for premium features and eventual Stripe integration.

This gives you launch velocity (public data) while building toward the defensible, relationship-based model (opt-in) that unlocks real revenue.

---

## Open Questions

- [ ] Should unclaimed listings show a donate button (via Every.org), or only a link to the charity's website?
- [ ] What's the outreach template for asking charities to claim their listing?
- [ ] At what point does the platform need to register under CA AB 488?
- [ ] Should the `verified` field on the charities table track "claimed by the charity" vs. "we researched and confirmed accuracy"?

---

## Sources

- [California AB 488 — Charitable Fundraising Platforms](https://oag.ca.gov/charities/pl)
- [AB 488 Explained — Change.io](https://getchange.io/blog/ab-488-explained-what-charitable-fundraising-platforms-must-do-and-how-change-keeps-you-compliant)
- [GoFundMe Creates 1.4M Unauthorized Nonprofit Pages — PANO](https://pano.org/gofundme-pages-created-for-nonprofits-without-permission/)
- [GoFundMe Apologizes — ABC7](https://abc7news.com/post/gofundme-apologizes-creating-donation-pages-nonprofits-consent-vows-make-changes/18082313/)
- [National Council of Nonprofits Statement on GoFundMe](https://www.councilofnonprofits.org/pressreleases/statement-national-council-nonprofits-gofundmes-unauthorized-fundraising-pages)
- [IRS Tax Exempt Organization Search](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search)
- [ProPublica Nonprofit Explorer](https://projects.propublica.org/nonprofits/)

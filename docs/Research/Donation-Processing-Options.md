# Donation Processing Options Research

**Date:** 2026-03-04
**Context:** Denver-focused charitable giving platform (GoodLocal), currently an LLC.

---

## Summary Recommendation (TL;DR)

**Every.org is the right choice for MVP.** It requires no custom payment infrastructure, no KYC onboarding of nonprofits, handles tax receipts automatically, and is the only option that cleanly sidesteps the legal complexity of an LLC being a conduit for charitable funds. The donations flow through Every.org's own 501(c)(3), so GoodLocal never touches the money.

If GoodLocal ever wants to charge a platform fee on top of donations — for example, 1–2% — the current Every.org structure makes that impossible without moving to Stripe Connect or a hybrid model. That tradeoff is fine for MVP but worth revisiting at scale.
- For Claude: GoodLocal never wants to charge a platform fee on top of donations

---

## 1. Every.org

### What It Is

Every.org is a 501(c)(3) public charity (EIN 61-1913297) that operates as a donor-advised fund (DAF) infrastructure layer. When a donor gives via the Every.org widget, the donation legally goes to Every.org first, not the nonprofit. Every.org then issues a grant to the target nonprofit on a weekly basis. This structure means:

- The donor's tax receipt comes from Every.org, not the target nonprofit
- Every.org has "exclusive legal control" over the donation (per their Terms of Service)
- The nonprofit is the beneficiary of a grant, not the direct recipient of a donation

### Fees

- **Platform fee:** Zero. No monthly, setup, or percentage fee
- **Payment processing fees:** Pass-through from third parties only (Stripe, Coinbase, etc.)
  - Credit/debit: ~2.9% + $0.30 (standard Stripe rates — nonprofits do not get the Stripe nonprofit discount here since the Stripe account belongs to Every.org)
  - Donors can optionally add a tip to cover processing fees
- **Disbursement fees:** Zero for direct deposit or PayPal Grants; small fee if disbursed via their third-party partner "For Good" (slower, monthly)

### Charity Vetting

Every.org covers over 1 million IRS-recognized 501(c)(3) organizations. Eligibility for disbursement requires:
- IRS recognition under IRC Section 501(c)(3)
- Public charity status under Section 509(a)(1) or (2) (i.e., not a private foundation)
- A bank account for direct deposit

Nonprofits do not need to actively sign up to receive donations — Every.org will hold the funds until the nonprofit claims them.

### API and Embed Access

- **Charity search API:** Free, publicly available. Returns nonprofit metadata (EIN, name, logo, description, Every.org profile URL) for 1M+ organizations. No API key required for read-only search
- **Donate button embed:** Open-source, free to embed. Embeds a modal widget. Any developer can embed it
- **Commercial use:** The charity API is **free for non-commercial use**. For-profit/commercial use requires contacting Every.org to negotiate an enterprise plan
- **Webhooks:** Available for donation events when `?webhookToken=<token>` is appended to donate links

### Restrictions on Who Can Use It

- **Nonprofits receiving funds:** Must be 501(c)(3) with public charity status
- **Developers embedding the widget:** No stated restriction on for-profit companies embedding the donate button itself. The open-source donate button is available to anyone. However, the charity search API explicitly reserves commercial use for enterprise arrangements
- **Platform partners (receiving disbursements via API):** Must contact `partners@every.org` — this feature is not openly available

### What GoodLocal Gets (and Doesn't Get)

Gets:
- Turnkey donation flow with no payment infrastructure
- Tax receipts handled automatically
- No legal exposure as a money conduit
- Free to embed and use for nonprofit discovery
- Crypto, stock, DAF, ACH, PayPal, Venmo, Apple Pay, Google Pay all supported out of the box

Doesn't get:
- Ability to charge a platform fee on the donation flow
- Access to donor data beyond webhook payload
- Control over the checkout experience (it's Every.org's branded modal)
- Stripe nonprofit rates (those belong to Every.org's account)

---

## 2. Direct Stripe — Charities Get Their Own Stripe Accounts

### How It Works

Each nonprofit sets up its own Stripe account and gets donations sent directly to it. GoodLocal would link to each nonprofit's existing Stripe-powered donate page, or build a fundraising form that posts to each nonprofit's Stripe account independently.

### Fees

- **Nonprofit discount:** 2.2% + $0.30 per credit card transaction for eligible nonprofits (80%+ of volume must be tax-deductible donations; verified via EIN or IRS determination letter)
	- For Claude: would i have to be nonprofit, or just the benefiting nonprofit our platform is donating to? could i be an llc?
- **American Express:** 3.5% even with nonprofit discount
- **ACH/bank transfer:** 0.5% capped at $5 for nonprofits (vs. 0.8% capped at $5 standard)
- **Wire payments:** $5 flat fee (reduced from standard)

### What It Takes to Route Through Charity Stripe Accounts

This model does not solve GoodLocal's needs. GoodLocal would have no unified checkout flow — each nonprofit uses its own Stripe account, meaning:
- No consistent UX
- GoodLocal cannot intercept or record donation events without each nonprofit granting access
- No ability to charge a platform fee without becoming a Stripe Connect platform

This approach is only relevant if GoodLocal is simply linking out to each nonprofit's existing donate page, which it already does via Every.org.

---

## 3. Stripe Connect (GoodLocal as the Platform)

### What It Is

Stripe Connect allows GoodLocal to be the payment platform. Nonprofits onboard as "connected accounts" and GoodLocal routes donations to them, optionally taking an application fee on each transaction.

### Charge Models

**Destination charges:** Payment is processed on GoodLocal's Stripe account, then a transfer is made to the nonprofit's connected account. GoodLocal can take an `application_fee_amount`. Stripe fees come out of GoodLocal's account.

**Direct charges:** Payment processes directly on the nonprofit's Stripe account. GoodLocal can take an application fee. Stripe fees come out of the nonprofit's account. Nonprofit gets the Stripe nonprofit discount (if they've applied for it).

### Fees

- **Stripe Connect platform fee:** Additional 0.25% + $0.25 per active connected account per month (for Express/Custom accounts). Standard accounts: no additional fee
- **Application fee (what GoodLocal takes):** Configurable — GoodLocal sets this as a percentage or flat amount
	- For Claude: we do not want to do this
- **Processing fees:** 2.9% + $0.30 standard; nonprofits with direct charges on their own accounts can apply for 2.2% + $0.30

### KYC Requirements

Stripe requires KYC (Know Your Customer) verification for all connected accounts. This means:
- Each nonprofit must go through onboarding: legal entity type, EIN, representative identity (SSO/government ID), beneficial owner info
- Stripe handles onboarding via hosted onboarding flow or embedded onboarding components
- Requirements are updated frequently (FCA/CBI alignment ongoing through April 2026)
- For nonprofits this is manageable but represents real friction — many smaller Denver nonprofits will be unfamiliar with this process
- For Claude: If they have done this before elsewhere, do they need to re-go through onboarding or will it be quicker to connect?

### Tax Receipt Implications

This is the critical problem: **with Stripe Connect, GoodLocal processes the payment, not a 501(c)(3).** The tax receipt must come from the nonprofit, not from GoodLocal. GoodLocal as an LLC cannot issue tax deduction receipts. This requires:
- The nonprofit to send the receipt separately
- Or an integration with a third-party receipt service
- Donors may be confused about what's tax-deductible when GoodLocal takes a platform fee
	- For Claude: we would not do this

### Platform Liability

GoodLocal becomes responsible for:
- Ensuring connected accounts are legitimate nonprofits (not fraud)
- Compliance with Stripe's terms for non-profit use
- Handling refunds and disputes at the platform level
- Potential money transmission licensing depending on how funds are held

### Summary Assessment

Stripe Connect gives GoodLocal maximum control and the ability to charge a transparent platform fee. But it requires:
- Building and maintaining a full onboarding flow for nonprofits
- Taking on KYC/compliance responsibility
- Solving the tax receipt problem
- Legal review of whether an LLC platform routing charitable donations creates issues

Not appropriate for MVP. Viable at scale if GoodLocal raises funding, potentially becomes a nonprofit, or partners with a fiscal sponsor.

---

## 4. Other Donation Infrastructure

### Donorbox

- **Model:** SaaS fundraising platform for nonprofits
- **Platform fee:** 1.75% on Lite plan; 0% on Pro ($139/month) and Premium ($599/month)
- **Processing:** 2.2% + $0.30 (Stripe nonprofit rate, since the charge goes through the nonprofit's connected Stripe account)
- **Fit for GoodLocal:** Donorbox is a tool for individual nonprofits, not for discovery platforms. GoodLocal could not embed Donorbox widgets across 100+ organizations without each one setting up Donorbox individually. Not a viable path.

### Givebutter

- **Model:** "Free" fundraising platform — revenue comes from optional donor tips
- **Platform fee:** 0% if donor leaves a tip (defaults to ~15% tip suggestion); otherwise 1–5%
- **Processing:** 1.9%–2.9% + $0.30
- **DAF support:** Via Chariot integration (2.9% processing fee)
- **Fit for GoodLocal:** Same problem as Donorbox — it's a per-nonprofit tool, not a discovery platform API

### Chariot (DAF-specific)

- **Model:** Widget that enables donors to give from their donor-advised fund (DAF) account in 3 clicks
- **Fee:** 2.9% processing fee (or subscription model to waive processing)
- **Requirement:** Nonprofit must be 501(c)(3)
- **Fit for GoodLocal:** Chariot is a complementary tool (DAF-to-nonprofit), not a full donation processor. If GoodLocal eventually builds its own checkout, adding Chariot for DAF donors makes sense. Every.org already supports DAF giving natively.

### PayPal Giving Fund

- **Model:** PayPal-operated 501(c)(3) that routes donations to nonprofits (similar DAF structure to Every.org)
- **Fees:** Zero fees for donations made through PayPal's own platform; partners may apply their own fees
- **Meta/Facebook integration:** All Facebook/Instagram charitable giving goes through PayPal Giving Fund (1.99% + $0.49 for Meta-originated donations)
- **API/embed:** Available but complex; primarily useful for marketplace/platform integrations at scale
- **Fit for GoodLocal:** Not a good standalone option. PayPal Giving Fund is better suited to social fundraising on Meta properties. Every.org is more flexible and transparent.

### Benevity

- **Model:** Enterprise workplace giving and corporate CSR platform
- **Fees:** Annual licensing (enterprise-priced, no public rates); additional per-charity fees; admin percentage on disbursements
- **Fit for GoodLocal:** Benevity is a B2B corporate giving product, not a consumer discovery platform. Completely wrong fit for MVP. Potentially relevant if GoodLocal pursues a B2B/workplace giving product (see B2B research docs).

### Fundraise Up

- **Model:** AI-optimized donation platform for mid-to-large nonprofits
- **Fee:** 4% platform fee + payment processing
- **Fit for GoodLocal:** Again, a per-nonprofit tool. Not embeddable across a multi-org discovery platform.

### Zeffy

- **Model:** "100% free" — Zeffy covers all fees, revenue comes from optional donor contributions to Zeffy itself
- **Fit for GoodLocal:** Per-nonprofit tool. Not an API/embed platform.

---

## 5. Fiscal Sponsorship / DAF Route

### What Fiscal Sponsorship Is

A fiscal sponsor is an established 501(c)(3) that allows a project or organization to operate under its legal umbrella, accepting tax-deductible donations on its behalf. The fiscal sponsor handles IRS compliance; the project handles operations.

### Fee Structure

- Typical fiscal sponsorship fee: 5–10% of donations (administrative overhead)
- Low-cost options: Fiscal Sponsorship Allies charges <4%; Open Collective Foundation (now closed) charged 5–8%
- "Model L" structure: The 501(c)(3) becomes the sole LLC member — an emerging hybrid structure

### Relevance to GoodLocal

GoodLocal is already structured as an LLC. Options:

**Option A — GoodLocal itself gets a fiscal sponsor:** GoodLocal operates under a Denver-based 501(c)(3) fiscal sponsor. Donors give to the sponsor, which then grants funds to nonprofits discovered on GoodLocal. The sponsor handles tax receipts. This solves the legal problem but adds a middleman taking 5–10% and creates operational complexity.

**Option B — GoodLocal becomes a 501(c)(3):** Pursuing IRS tax-exempt status as a 501(c)(3) charitable organization. This takes 6–18 months (Form 1023). Once approved, GoodLocal could process donations directly, issue tax receipts, and charge reasonable administrative fees without legal risk. This is the right long-term path if GoodLocal wants to own the donation flow.

**Option C — Partner with Every.org (current plan):** Every.org is itself a DAF/fiscal sponsor infrastructure. By embedding Every.org's widget, GoodLocal is effectively using Every.org as its fiscal sponsor for the donation flow. This is the cleanest path for an LLC.

---

## 6. Legal Implications: LLC vs. 501(c)(3) for Donation Processing

### Can an LLC Legally Be a Conduit for Charitable Donations?

**Technically yes, but with significant caveats.**

An LLC can accept money that it then forwards to nonprofits. However:

1. **Donations to an LLC are not tax-deductible.** Under IRS rules, charitable deductions are only available for contributions to qualified organizations (501(c)(3)s). If a donor gives to GoodLocal LLC, which then forwards it to a nonprofit, the donation is not tax-deductible for the donor — even if it ends up at a legitimate charity. This is a fundamental deal-breaker for any model where GoodLocal holds funds in transit.

2. **The LLC receives taxable business income.** Any money flowing into the LLC is treated as business revenue, not charitable receipts. If GoodLocal processes a $100 donation and keeps $2 as a platform fee, that $2 is taxable income. If GoodLocal accidentally holds all $100 temporarily, all $100 is taxable income (offset by the $98 it sends out, but creates accounting complexity).

3. **The "Charitable LLC" scheme is an IRS red flag.** The IRS has specifically warned about structures marketed as "Charitable LLCs" and considers many of them abusive tax shelters. GoodLocal's intent is legitimate, but operating as an LLC in the charitable donation flow invites scrutiny and requires careful legal structuring.

### Commercial Co-Venturer Regulations

If GoodLocal (as an LLC) prominently advertises that purchases or actions benefit nonprofits, it may qualify as a **commercial co-venturer** in many states. In at least 22 states, this requires registration. In Colorado specifically:

- Commercial co-venturer registration is **not required** at the state level in Colorado
- However, disclosure requirements apply when more than 50% of a campaign's proceeds come from within the state
- A company whose only role is processing credit card payments (functioning as a merchant account processor) is **exempt** from Colorado charitable solicitation registration

This means GoodLocal's current model (embedding Every.org's widget, receiving webhooks, storing donation intents) likely falls into the exemption category — it is not holding or redirecting funds.

### Does Every.org Require the Platform to Be a Nonprofit?

**No.** Every.org's donate button and charity search API are available to for-profit companies and developers. The restriction is:
- The **receiving nonprofit** must be 501(c)(3)
- Commercial use of the charity API requires contacting Every.org for an enterprise arrangement
- The **embed widget itself** has no stated requirement that the embedder be a nonprofit

GoodLocal can legally embed Every.org's widget as an LLC.

### Legal Risks of an LLC "Owning" the Donation Flow

The critical distinction is **whether GoodLocal touches the money:**

| Model | GoodLocal Touches Money | Risk Level |
|-------|------------------------|------------|
| Every.org embed (current) | No — money goes to Every.org directly | Low |
| Stripe Connect (destination charges) | Yes — funds pass through GoodLocal's account | High — tax receipts, money transmission |
| Stripe Connect (direct charges) | No — funds go to nonprofit's Stripe account | Medium — platform liability, KYC |
| Fiscal sponsor | No — funds go to sponsor | Low (but adds cost/complexity) |

**The Every.org model specifically eliminates GoodLocal's legal exposure** because Every.org's 501(c)(3) status covers the entire transaction. GoodLocal is acting as a discovery/referral layer, not a financial intermediary.

---

## 7. Platform Fee Structures: Industry Norms

### What Platforms Typically Charge

| Platform | Platform Fee | Processing Fee | Total |
|----------|-------------|----------------|-------|
| Fundraise Up | 4% | 2.9% + $0.30 | ~7% |
| Donorbox (Standard) | 2.95% | 2.2% + $0.30 | ~5.15% |
| Donorbox (Pro) | 0% ($139/mo) | 2.2% + $0.30 | ~2.5% |
| Givebutter | 0% (tip model) | 1.9%–2.9% + $0.30 | ~2.5%+ |
| Every.org | 0% | 2.9% + $0.30 (pass-through) | ~2.9% |
| Zeffy | 0% (tip model) | 0% (Zeffy absorbs) | 0% |
| Chariot (DAF) | 0% | 2.9% | ~2.9% |

### Is 1–5% a Standard Platform Fee?

Yes. Platform fees of 1–5% are industry standard for donation platforms. Fundraise Up at 4% is on the high end; 1–2% would be considered reasonable and competitive. The key legal consideration for an LLC taking a platform fee on charitable donations:

- The platform fee **reduces the tax-deductible amount** for the donor. If a donor gives $100 and GoodLocal takes $2, only $98 reaches the nonprofit, and the tax receipt should reflect the actual amount received by the 501(c)(3)
- This is not illegal, but it must be **clearly disclosed** to donors
- If GoodLocal were to charge a platform fee via Stripe Connect (direct charges to nonprofit accounts), the nonprofit would issue a receipt for the full $100, but GoodLocal would take $2 as an application fee. Tax treatment of that $2 depends on whether the donor is told about it

### Why GoodLocal Cannot Currently Charge a Platform Fee

With Every.org's embedded widget:
- The transaction goes directly to Every.org
- GoodLocal has no mechanism to intercept or attach a fee
- Every.org issues the receipt for the full amount

To charge a platform fee, GoodLocal would need to:
1. Move to Stripe Connect, taking on all associated complexity, or
2. Negotiate a revenue-sharing arrangement with Every.org (they have a partners program)

---

## Decision Matrix for GoodLocal

| Criterion | Every.org | Stripe Connect | Direct Stripe | Fiscal Sponsor |
|-----------|-----------|----------------|---------------|----------------|
| Works today with LLC | Yes | Risky | No | Yes (but slow) |
| Zero infrastructure build | Yes | No | No | Partial |
| Tax receipts handled | Yes | No (need solution) | Yes (nonprofit) | Yes (sponsor) |
| Can charge platform fee | No | Yes | No | No |
| Nonprofit KYC/onboarding | None | High friction | Not needed | None |
| Donor experience | Good (Every.org modal) | Full control | Fragmented | Good |
| Legal risk for LLC | Low | High | Low | Low |
| Viable at MVP scale | Yes | No | No | Possible |
| Viable at growth scale | Partially | Yes | No | Partially |

---

## Conclusion

**For MVP:** Continue with Every.org. It is legally clean for an LLC, has zero infrastructure overhead, and covers tax receipts automatically.

**Medium-term consideration:** If GoodLocal wants to monetize via platform fees or own the donor experience more deeply, the cleanest path is to pursue 501(c)(3) status for GoodLocal itself, then move to Stripe Connect. This is an 18–24 month path.

**Alternative for platform fees sooner:** Negotiate a revenue-sharing arrangement with Every.org directly through their partners program. Contact `partners@every.org` to explore this.

**Do not attempt:** Routing money through GoodLocal LLC as a financial intermediary without legal counsel. The tax and compliance exposure is not worth it at early stage.

---

## Sources

- [Every.org Pricing](https://www.every.org/pricing)
- [Every.org Disbursements](https://www.every.org/disbursements)
- [Every.org Charity API](https://www.every.org/charity-api)
- [Every.org Fiscal Sponsors](https://www.every.org/fiscal-sponsors)
- [Every.org Terms of Service](https://www.every.org/terms)
- [Every.org Docs: Donate Button](https://docs.every.org/docs/donate-button)
- [Stripe Nonprofit Discount](https://support.stripe.com/questions/fee-discount-for-nonprofit-organizations)
- [Stripe Connect Destination Charges](https://docs.stripe.com/connect/destination-charges)
- [Stripe Connect KYC Requirements](https://support.stripe.com/questions/know-your-customer-(kyc)-requirements-for-connected-accounts)
- [Stripe for Nonprofits](https://stripe.com/industries/nonprofits)
- [Donorbox Pricing](https://donorbox.org/pricing)
- [Givebutter DAF via Chariot](https://help.givebutter.com/en/articles/6764835-how-to-use-givebutter-s-daf-donation-method-via-chariot)
- [Chariot DAF Widget](https://www.givechariot.com/)
- [PayPal Giving Fund Fees](https://www.paypal.com/us/cshelp/article/are-there-any-fees-charged-for-using-paypal-giving-fund--help207)
- [Benevity API](https://benevity.com/products/api)
- [ACH Donation Processing Fees](https://4agoodcause.com/ach-payment-processing-for-nonprofits-lower-fees-higher-impact/)
- [Fundraising Platform Fees Guide](https://www.zeffy.com/blog/fundraising-platform-with-no-fees)
- [Commercial Co-Venture Laws](https://natlawreview.com/article/your-commercial-co-venture-compliance-all-50-states)
- [Colorado Charitable Solicitation Registration](https://www.sos.state.co.us/pubs/charities/charitableHome.html)
- [Colorado Fundraising Compliance](https://labyrinthinc.com/colorado-fundraising-registration-requirements/)
- [IRS Charitable Contribution Deductions](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contribution-deductions)
- [Fiscal Sponsorship Overview](https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/fiscal-sponsorship-nonprofits)
- [Can an LLC Accept Donations](https://www.upcounsel.com/can-an-llc-accept-donations)
- [Charitable LLC Tax Shelter Warning](https://www.currentfederaltaxdevelopments.com/blog/2026/1/30/the-charitable-llc-tax-shelter-and-application-of-the-economic-substance-doctrine)

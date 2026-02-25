# Research: Corporate Workplace Giving Platforms — Payment Mechanics & Infrastructure

**Date:** 2026-02-23
**Purpose:** Understand how incumbent workplace giving platforms operate under the hood — specifically payment flow, legal fund custody, nonprofit vetting, opt-in requirements, and fee structures — to evaluate whether GoodLocal could build a B2B matching product on top of Every.org's infrastructure.

---

## Platform-by-Platform Findings

---

### 1. Benevity

**How payments flow:**
Benevity is a for-profit B Corporation that acts as a software platform but does NOT itself hold charitable funds. Instead, it partners with a purpose-built 501(c)(3) public charity called the **American Online Giving Foundation (AOGF)**, which operates as a Donor-Advised Fund sponsor. When an employee donates through a Benevity-powered portal:
1. The employee "recommends" a grant through the Benevity UI.
2. The donation flows legally to AOGF (not the charity directly and not to Benevity).
3. AOGF holds the funds as the legal owner, issues the tax receipt, and disburses grants to nonprofits — typically monthly.
4. Employer matching funds follow the same path: the employer funds the AOGF DAF on a schedule, and AOGF disburses both employee and match funds together.
5. Disbursement methods: EFT, check, PayPal, wire. Check fee is the greater of $25 or 7% up to $100.

**Registered as charity/DAF sponsor:**
Benevity itself is for-profit. AOGF (EIN: 81-0739440) is the 501(c)(3) DAF sponsor and the legal entity that holds funds and issues tax receipts. AOGF's president is Bryan de Lottinville, Benevity's founder — making this a closely affiliated relationship rather than a fully independent arrangement.

For multinational companies, Benevity operates a "Global DAF" and "Corporate DAF" offering with local foundation partners in other countries. Unlike many vendors, Benevity manages the disbursement journey in-house — no outsourcing to third-party payment rails.

**Nonprofit vetting:**
Benevity draws on IRS Publication 78 data (the IRS list of tax-exempt orgs). All registered 501(c)(3)s in the US and CRA-registered charities in Canada are automatically listed in Benevity's database — nonprofits do NOT need to apply to be searchable. Benevity conducts its own due diligence and compliance checks, supplemented by the underlying IRS/CRA registration data.

**Opt-in requirement for nonprofits:**
No opt-in required to receive funds. Nonprofits can receive a check from Benevity/AOGF without ever having registered on the Causes Portal. However, registering on the Benevity Causes Portal (causes.benevity.org) unlocks: EFT setup (avoiding check fees), donor reports, profile management, and eligibility for corporate grant programs. Applications reviewed in 24–72 hours.

**Fees charged to nonprofits:**
- **Cause Support Fee:** Approximately 2.9% of donation (variable; can differ by client contract). This covers due diligence, processing, disbursement, and donor receipts.
- **Merchant Fee:** Applied on credit card / PayPal transactions (passed through at cost).
- **Check Fee:** Greater of $25 or 7% of check amount, capped at $100.
- Note: The corporate client (employer) may choose to cover some or all nonprofit-side fees. Benevity's platform fee to the employer is separate and contract-based.

---

### 2. Groundswell

**How payments flow — the DAF model (detailed):**
Groundswell is structured around individual employee DAFs rather than a pooled employer fund. The mechanics:
1. **Employer funds the DAF:** The company deposits funds into each employee's Personal Giving Account (a mini-DAF) — either as a lump sum, payroll deduction, or corporate match credit.
2. **Legal transfer at contribution:** When money enters an employee's Groundswell account, it is legally donated to the **Groundswell Charitable Foundation (GCF)** (EIN: 87-1530516), a 501(c)(3) public charity. The employee receives an immediate tax deduction.
3. **Employee directs the grant:** The employee logs into the Groundswell app and recommends a grant to any qualifying 501(c)(3). Because GCF legally owns the assets, it retains final discretion (standard DAF rules) — but in practice follows employee recommendations.
4. **Disbursement via Chariot:** Groundswell partners with **Chariot** (a grant disbursement fintech) for fast, secure payments. Funds are available to nonprofits in their Chariot account instantly upon approval. Chariot transfers funds directly from GCF to the nonprofit's bank account, no sensitive banking info sharing required. No fee for up to two transfers per month.
5. **Match-on-Donation (MoD):** Companies can configure rules so that when an employee makes a grant recommendation, the system automatically recommends a corresponding employer match grant from a separate corporate DAF bucket. Payment time has been reduced to 24 hours.
6. **Match-on-Contribution (MoC):** Employer matches when an employee contributes to their DAF, not when they grant to a charity.

**Registered as charity/DAF sponsor:**
Yes — Groundswell Charitable Foundation (GCF) is the 501(c)(3) public charity and DAF sponsor. Groundswell Giving Inc. is the for-profit technology company. The structure mirrors Benevity/AOGF: a for-profit software company with an affiliated nonprofit DAF entity that holds the actual funds.

**Nonprofit vetting:**
Groundswell integrates with **Candid/GuideStar** for nonprofit verification. Their database covers 1.8M+ vetted nonprofits pre-approved for giving.

**Opt-in requirement:**
Not explicitly stated, but because disbursements go through Chariot, nonprofits likely need to claim a Chariot account to receive funds electronically. Unregistered nonprofits presumably receive checks.

**Fees:**
Groundswell advertises fee-free grant distributions — "send 100% of your grant funds to nonprofits — no platform fees." The SaaS fee is charged to the employer, not taken from donations.

---

### 3. Millie

**How payments flow:**
Millie is a Public Benefit Corporation (for-profit). Payment processing runs through **Stripe** (credit card) or payroll deduction. Millie's model is SaaS-priced to employers, with no percentage cut taken from donations. Credit card fees (Stripe's 2.2% + $0.30) are passed through at cost, the same rate a nonprofit would pay on its own website.

**Registered as charity/DAF sponsor:**
Millie is not itself a DAF sponsor or 501(c)(3). It appears to use third-party infrastructure (likely **For Good / Network for Good**, which is a 501(c)(3) DAF) for fund custody and disbursement, though Millie does not prominently disclose this in public documentation. Millie also offers a DAF account feature for individual donors at $20/month.

**Nonprofit vetting:**
Millie claims access to 7 million nonprofits globally through its vetting process. It conducts its own vetting for international nonprofits.

**Opt-in requirement:**
Not required to receive funds, but nonprofits can create a free profile on the Millie platform to increase discoverability and access corporate funding.

**Fees charged to nonprofits:**
No platform fee charged to nonprofits. Only Stripe processing fees (2.2% + $0.30) on credit card donations, which are the same as what the nonprofit would pay if using Stripe directly.

---

### 4. Deed (joindeed.com)

**How payments flow:**
Deed's payment infrastructure is built on top of **PayPal Giving Fund (PPGF)** and **GlobalGiving** as its primary disbursement channels:
1. Employees donate via Deed's UI (PayPal, Venmo, credit card, payroll, or Deed Donation Credits).
2. For US nonprofits: donations are routed through PayPal Giving Fund (PPGF), which is an independent 501(c)(3).
3. Deed sends PPGF a file of all corporate transactions around the 15th of each month.
4. PPGF processes and disburses funds around the 25th of the following month — meaning a ~6 week cycle from donation to payout.
5. For international nonprofits: disbursed via GlobalGiving.
6. Deed does not hold funds itself — it relies entirely on PPGF and GlobalGiving as the legal fund holders and disbursers.

**Registered as charity/DAF sponsor:**
No. Deed is a for-profit platform. It outsources legal fund custody to PayPal Giving Fund (a separate 501(c)(3) public charity).

**Nonprofit vetting:**
Deed uses a multi-layer approach:
- PayPal Giving Fund vetting (3–5 business days, requires EIN, bank statements, proof of 501(c)(3) status, monthly verification against GuideStar)
- Network for Good (also used as a vetting/disbursement layer)
- GlobalGiving (for international)
- Proprietary anti-money laundering technology with daily screening cycles
- Database of 2M+ nonprofits

**Opt-in requirement:**
US nonprofits MUST enroll with PayPal Giving Fund to receive donations. Without PPGF enrollment, PayPal attempts contact and sends a check — but this takes up to 90 days and requires PayPal to conduct its own due diligence on the unregistered charity first. In practice, nonprofits wanting timely payouts must opt in to PPGF.

**Fees:**
Not publicly disclosed in detail. The corporate client pays a platform SaaS fee. PPGF's disbursement to nonprofits is generally fee-free for electronic payments.

---

### 5. EarthShare

**How payments flow:**
EarthShare is a nonprofit federation founded in 1988, originally focused on environmental organizations. It operates as a workplace giving intermediary:
1. Employees donate via payroll deduction or one-time gifts.
2. EarthShare collects and aggregates these donations.
3. EarthShare disburses to nonprofits **quarterly** — beginning in July for a given campaign year, continuing for ~6 cycles.
4. Campaign administration fees are deducted from the first four quarterly payouts (rather than charged upfront).

EarthShare also operates its own **Donor-Advised Fund** for individual donors (starting at 2% fee, declining to 0.15%) and offers fiscal sponsorship.

**Registered as charity/DAF sponsor:**
Yes — EarthShare is itself a 501(c)(3) public charity and acts as the legal intermediary/aggregator. It also operates as a DAF sponsor for its individual donor product. This is the purest "charity as operator" model among the platforms surveyed — EarthShare is the entire stack (charity + platform + disbursement agent).

**Nonprofit vetting:**
EarthShare has a selective eligibility process. Nonprofits must apply and be vetted by the EarthShare team. Vetting includes environmental mission alignment and JEDI (Justice, Equity, Diversity, Inclusion) criteria. This is more restrictive than pure 501(c)(3) database-based vetting. EarthShare can refuse distributions to nonprofits that no longer qualify.

**Opt-in requirement:**
Yes — nonprofits must apply and be approved as EarthShare Nonprofit Partners. There is no automatic inclusion. This is the most restrictive of all platforms surveyed.

**Fees charged to nonprofits:**
Free to join the platform if eligible. For Combined Federal Campaign (CFC) participation, the distribution fee historically runs 18–27% of gross pledges (set by the campaign rules, not EarthShare alone). For EarthShare's DAF product, fees start at 2% and decline to 0.15%.

---

### 6. YourCause / Blackbaud Giving Fund

**How payments flow:**
YourCause is a workplace giving platform owned by Blackbaud (a major nonprofit software company). The legal fund holder is the **Blackbaud Giving Fund (BBGF)**, a 501(c)(3) public charity:
1. Employee donations and employer matches are legally made to BBGF (a DAF).
2. BBGF issues tax acknowledgments to donors.
3. BBGF makes corresponding grants to nonprofits based on donor direction.
4. Disbursements generally occur within 5–7 days of funding, or per existing agreements — monthly cycle.
5. 100% of the designated donation reaches the charity (BBGF does not take a percentage fee from charity payouts).

**Registered as charity/DAF sponsor:**
Yes — Blackbaud Giving Fund is a registered 501(c)(3) public charity and DAF sponsor (nearing $1 billion in assets under the DAF). YourCause is the for-profit software layer; BBGF is the legal fund holder.

**Nonprofit vetting:**
YourCause / BBGF maintains the **Blackbaud Verified Network** — a portal where nonprofits can claim their profile and set up ACH. Nonprofits are sourced from IRS data and do not need to pre-register to be eligible for donations. The Blackbaud Verified Network is an opt-in layer for better experience (faster ACH payments, donor reporting).

**Opt-in requirement:**
No opt-in required to receive funds. Nonprofits receive checks without signing up. Signing up for the Blackbaud Verified Network enables ACH (3 weeks faster than check) and eliminates the paper check fee (10% per check, max $100).

**Fees charged to nonprofits:**
- 0% fee on donations (BBGF explicitly does not charge a traditional DAF disbursement fee to charities).
- Paper check fee: 10% per check, max $100.
- ACH: free once enrolled in Blackbaud Verified Network.

---

## Every.org — Detailed Infrastructure Analysis

### What it is
Every.org is a **501(c)(3) public charity** (not a for-profit company). Its stated mission is building "accessible giving infrastructure." It is not a workplace giving platform per se, but rather an open giving infrastructure layer that anyone can build on top of.

### How it makes money
Every.org's primary revenue model is **optional donor tips** — after a donor chooses their donation amount, they can add a voluntary contribution to Every.org. Every.org does NOT charge platform fees, take a percentage of donations, or charge monthly/annual fees. Transaction fees (Stripe, Coinbase, PayPal) are passed through at cost — Every.org negotiates nonprofit rates. This is a deliberately "public goods" model, funded by tips and philanthropic grants (it has received backing from the Gates Foundation and Fidelity Charitable Catalyst Fund).

For-profit commercial API use cases require contacting Every.org to explore enterprise pricing (the API is free for non-commercial use).

### Nonprofit database
Every.org auto-populates its database from **IRS Publication 78** data — the official IRS list of all US organizations eligible to receive tax-deductible contributions. This means all 1.5M+ US 501(c)(3)s are automatically listed on Every.org. Nonprofits do not need to apply to be listed.

### Payment methods accepted
Credit/debit cards, bank ACH, PayPal, Venmo, Apple Pay, Google Pay, donor-advised fund (DAF) contributions, stock donations, cryptocurrency.

### Disbursement mechanics to nonprofits
Nonprofits do not need to sign up to receive funds. Every.org will send a check. Three disbursement tiers:

| Method | Timing | Fee |
|---|---|---|
| Stripe (nonprofit connects bank account) | Weekly | 0% |
| PayPal Grants (auto for PayPal-verified nonprofits) | Every 4–5 weeks | 0% |
| For Good / Network for Good (fallback check/ACH) | Every 4–6 weeks | 1.5% |

DAF donations are always 100% free and disburse in 1–3 weeks.

### API and developer tools
- **Nonprofit Search API:** Search 1.5M+ 501(c)(3)s, get metadata (EIN, logo, description, Every.org profile URL). Free for non-commercial use.
- **Donate Button:** Open-source embeddable widget. Accepts all payment types. Triggers donation flow on Every.org.
- **Donate Link:** URL-based, customizable. Parameters include: `suggestedAmounts`, `min_value`, `frequency`, `designation`, `webhook_token`, `theme_color`, `method` (card/bank/paypal/venmo/pay/crypto/stocks/daf/gift).
- **Fundraisers API:** Programmatically create and track fundraisers.
- **Partner Webhook:** Notifies a developer's endpoint on each completed donation. Payload includes: `chargeId`, `partnerDonationId`, `partnerMetadata`, donor name/email, nonprofit slug/EIN/name, `amount`, `netAmount`, `currency`, `frequency`, `donationDate`, `paymentMethod`, `publicTestimony`, `privateNote`, `fromFundraiser`.

### Who uses Every.org
- **GivingMultiplier** (Harvard research project) — uses Every.org as full payment backend
- **GiveBlck**, **Givelist** — consumer giving apps
- **LifeStraw Safe Water Fund** — donate button on their website
- 60+ projects have used the API; ~25 had sustained usage as of 2022 Giving Commons post
- 2024 metrics: $18.4M in donations (+91% YoY), 17,323 active donors, 1,212 active nonprofits

### No native matching gift / workplace giving product
Every.org does NOT have a workplace giving or employer matching product. There is no `match_amount` parameter in their donate link, no employer-side dashboard, and no built-in matching workflow. However:
- The Partner Webhook delivers all donation data (amount, nonprofit, donor) that would allow an external system to trigger a corresponding match donation.
- Building a matching layer on top of Every.org would require the builder to implement the match logic, employer funding, and a separate disbursement for employer match funds — Every.org would only handle the employee-side donation.

---

## Key Comparative Summary

| Platform | Legal Fund Holder | DAF Sponsor? | Nonprofit Opt-In? | Fee to Charity |
|---|---|---|---|---|
| Benevity | AOGF (501c3) | Yes (AOGF) | No (auto-listed) | ~2.9% + check fees |
| Groundswell | Groundswell Charitable Foundation (501c3) | Yes (GCF) | Unclear (Chariot account likely needed) | 0% (SaaS fee to employer) |
| Millie | Likely For Good/NFG (not disclosed) | No (Millie is PBC) | No (but profile available) | 0% (SaaS to employer; Stripe fees at cost) |
| Deed | PayPal Giving Fund (501c3) | No (outsourced to PPGF) | Yes (must enroll in PPGF) | 0% electronic; slow if unregistered |
| EarthShare | EarthShare itself (501c3) | Yes (self-contained) | Yes (must apply & be approved) | 0% platform; CFC campaigns 18–27% |
| YourCause/Blackbaud | Blackbaud Giving Fund (501c3) | Yes (BBGF) | No (auto-listed, opt-in for ACH) | 0% electronic; 10% check (max $100) |
| Every.org | Every.org itself (501c3) | Yes (self-contained) | No (auto-listed from IRS data) | 0% (tips-based model) |

---

## Strategic Assessment: Building a B2B Matching Product on Every.org

### What Every.org can provide
- Donation flow UI (embed widget or redirect link)
- Payment processing (all major methods)
- Nonprofit database (1.5M+ orgs, no signup required)
- Webhook notification on each completed donation
- Fund custody and disbursement to nonprofits
- Zero fee to charity on card/bank donations (only 1.5% via For Good fallback)

### What Every.org cannot provide (you'd need to build)
1. **Employer matching logic:** No native concept of an employer match. You'd need to intercept the webhook, calculate the match per company policy, and issue a second donation.
2. **Employer fund custody:** When an employer pre-funds a matching pool, those funds need to sit somewhere legally — either in a DAF, a bank account, or passed through a DAF sponsor. Every.org has no employer wallet or corporate giving account. This is the critical legal gap.
3. **Payroll deduction integration:** Every.org has no payroll connector.
4. **Company admin dashboard:** No employer-side reporting, budget tracking, or match configuration tools.
5. **Tax documentation for employers:** Corporate matching donations require documentation; Every.org doesn't issue employer tax receipts for match disbursements.
6. **Match disbursement:** Even if you trigger a second donation via Every.org's API for the match amount, there is no documented programmatic "send donation" API endpoint — only the user-facing donate button/link. The Fundraisers API lets you create fundraisers but not push funds.

### The core structural constraint
The reason every incumbent platform maintains an affiliated 501(c)(3) DAF entity (AOGF, GCF, BBGF, etc.) is that **you cannot legally hold employer charitable matching funds in a commercial bank account and call them donations**. The money must flow through a qualifying tax-exempt intermediary for donors to receive deductions. This is the fundamental infrastructure requirement that Every.org's existing public-facing product does not solve for the employer side.

### Realistic path for GoodLocal
**Option A — Build on Every.org for employee-side donations only.** Use the Every.org donate button/link for the employee donation UX. The webhook tells you when a donation is completed. You separately need a legal structure for employer match funds — likely partnering with an existing DAF sponsor (e.g., Groundswell Charitable Foundation, Fidelity Charitable, or a community foundation) to hold and disburse match funds. Every.org handles employee side; your DAF partner handles match disbursement. Medium complexity.

**Option B — Build on Every.org as pure discovery + connect to existing workplace giving infrastructure.** Use Every.org's nonprofit search API for discovery, but route the actual donation + match flow through an existing workplace giving platform's API (e.g., Benevity has a developer API). Lower charity fee, but you'd be a reseller layer on top of an incumbent.

**Option C — Build the full stack.** Become a DAF sponsor (requires IRS 501(c)(3) application for a new entity, or acquire/partner with an existing one), use Stripe/ACH directly for payment rails, build employer and employee dashboards, and handle compliance. Highest complexity; this is what Groundswell did.

**Option D — White-label / partner with Groundswell or Millie.** These are newer, API-first platforms that are open to partnerships. Groundswell in particular is marketed as infrastructure-friendly (partnered with Chariot). A GoodLocal "B2B matching" product could be a referral/white-label arrangement sitting on top of Groundswell's DAF infrastructure rather than building the fund custody layer from scratch.

---

## Sources

- [Benevity Foundation Partners (Disbursing Entities)](https://causeshelp.benevity.org/hc/en-us/articles/360001149426-What-charitable-foundations-does-Benevity-work-with-granting-disbursing-entities)
- [American Online Giving Foundation FAQ](https://www.onlinegivingfoundation.org/faq)
- [Benevity Fees (What can be deducted)](https://causeshelp.benevity.org/hc/en-us/articles/360001142723-What-fees-can-be-deducted-from-donations)
- [Groundswell Corporate DAF Product](https://www.groundswell.io/products/donor-advised-fund)
- [Groundswell + Chariot Partnership](https://www.givechariot.com/resources/insights/getting-to-know-groundswell-a-chariot-disbursements-partner)
- [Groundswell Charitable Foundation on ProPublica](https://projects.propublica.org/nonprofits/organizations/871530516)
- [Deed Donation Disbursement Timelines](https://support.joindeed.com/hc/en-us/articles/8666407556116--Donation-Disbursement-Timelines)
- [Deed Nonprofit Vetting](https://support.joindeed.com/hc/en-us/articles/8666042519444--Nonprofit-vetting-information)
- [Deed Payment Processor Info](https://support.joindeed.com/hc/en-us/articles/8770927536404--Payment-Processor-Info-US-Nonprofits)
- [EarthShare Nonprofit Partnership Terms](https://www.earthshare.org/nonprofit-partnership-terms/)
- [EarthShare Workplace Giving 101](https://www.earthshare.org/resources-workplace-giving-101/)
- [Blackbaud Giving Fund For Nonprofits](https://blackbaudgivingfund.org/for-nonprofits/)
- [YourCause / Blackbaud Giving Fund About](https://blackbaudgivingfund.org/about/)
- [Every.org Disbursements](https://www.every.org/disbursements)
- [Every.org Pricing](https://www.every.org/pricing)
- [Every.org Charity API](https://www.every.org/charity-api)
- [Every.org API Docs](https://docs.every.org/docs/intro)
- [Every.org Partner Webhook](https://docs.every.org/docs/webhooks/partner-webhook)
- [Every.org Giving Commons Blog](https://blog.every.org/giving-commons/)
- [Every.org Fall 2024 Update](https://blog.every.org/fall-2024-update/)
- [Millie Workplace Giving](https://www.milliegiving.com/pages/workplace-giving)
- [Millie vs Benevity](https://www.milliegiving.com/pages/benevity-alternative)

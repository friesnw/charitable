## Phase 9: Email Notifications

**Goal:** Send email confirmations for donations and other key user events using Resend.

*Note: Resend is already planned for auth magic links (Phase 4). This builds on that foundation.*

---

### Email Service Setup

- [ ] **Create `backend/src/services/email.ts`** (if not already created for auth)
  - Initialize Resend client
  - Generic `sendEmail(to, subject, html)` function
  - Error handling and logging

- [ ] **Create email templates directory**: `backend/src/emails/`
  - Consistent branding across all emails
  - Mobile-responsive HTML

---

### Donation Confirmation Email

**Trigger:** When webhook receives successful donation from Every.org

**Status:** Basic version shipped in Phase 5 (webhook + donate-first flow). Needs redesign.

**What's implemented:**
- `sendDonationConfirmation(email, charityName, token?)` in `backend/src/services/email.ts`
- Known verified user → simple receipt with homepage link
- New/unverified user → magic link button ("View my giving history")

**What's missing / needs improvement:**
- [ ] **Distinct templates for each path** — known-user receipt and new-user magic link currently share the same boilerplate layout; they should feel meaningfully different
- [ ] **Donation details in body** — amount, frequency (one-time vs monthly), and date are available on the `donation_intents` row but not yet passed into the email
- [ ] **Charity branding** — logo, short description; requires passing more charity fields through the webhook handler
- [ ] **Personalization** — donor first name is in the Every.org webhook payload (`firstName`); use it in the greeting
- [ ] **Move templates out of inline strings** — inline HTML in `email.ts` gets unwieldy; consider `backend/src/emails/` directory with one file per template
- [ ] **Template management** — see note below

**Example content:**
```
Subject: Thank you for supporting Denver Rescue Mission

Hi [Name],

Your donation of $25 to Denver Rescue Mission was successful.

[Charity Logo]
Denver Rescue Mission
Providing emergency services for people experiencing homelessness since 1892.

Date: February 8, 2026
Amount: $25.00
Frequency: One-time

[View Your Giving History]

Thank you for making an impact in Denver.

— The Charitable Team
```

---

### Monthly Recurring Reminder (Optional)

**Trigger:** When recurring donation is processed

- [ ] **Create `backend/src/emails/recurring-processed.ts`**
  - Notify user their monthly donation went through
  - Show running total for the year
  - Option to adjust or cancel (link to Every.org)

---

### Giving Summary Email (Future)

**Trigger:** Monthly or yearly digest

- [ ] **Create `backend/src/emails/giving-summary.ts`**
  - Total donated this period
  - Charities supported
  - Impact stories (if available)

- [ ] **Create scheduled job** to send summaries
  - Monthly: 1st of each month
  - Yearly: January for tax season

---

### Email Templates

| Email | Trigger | Priority |
|-------|---------|----------|
| Magic link (auth) | Sign-in request | High (Phase 4) |
| Donation confirmation | Webhook received | High |
| Recurring processed | Monthly charge | Medium |
| Monthly summary | Scheduled | Low |
| Year-end summary | Scheduled (January) | Low |

---

### Email Template Management

Right now templates are inline HTML strings inside TypeScript functions. This works but has downsides as the number of emails grows: no preview, hard to iterate on design, no separation between content and code.

**Options to research:**

- **[React Email](https://react.email/)** — write email templates as React components; preview them in a browser at `localhost:3000`; render to HTML string at send time. First-class Resend integration. Probably the right call for this stack.

- **[Resend's template editor](https://resend.com/emails)** — visual drag-and-drop editor in the Resend dashboard; templates stored in Resend and referenced by ID at send time. Easier for non-engineers to edit, but templates live outside the codebase (no version control).

- **Handlebars / Mjml** — older approach; more portable but more setup; less relevant given we're already in a React/TS stack.

**Recommendation when ready to revisit:** Adopt React Email. Templates become `.tsx` files in `backend/src/emails/`, previewable locally, version-controlled, and rendered server-side before Resend sends them. Resend has a [`@react-email/components`](https://react.email/docs/components/html) package that handles cross-client compatibility.

---

### Technical Notes

**Resend Setup:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDonationConfirmation(
  to: string,
  donation: { charityName: string; amount: number; date: Date }
) {
  await resend.emails.send({
    from: 'Charitable <donations@charitable.app>',
    to,
    subject: `Thank you for supporting ${donation.charityName}`,
    html: renderDonationEmail(donation),
  });
}
```

**From Address:**
- Need to verify domain with Resend
- Use subdomain like `mail.charitable.app` or `notifications@charitable.app`

**Resend Pricing:**
- Free tier: 100 emails/day, 3,000/month
- Paid: $20/month for 50,000 emails

---

### Email Design Standards

**Layout & Responsiveness:**
- [ ] Max-width containers (480-600px)
- [ ] Touch-friendly button sizes (min 44px tap target)
- [ ] Test on mobile (iOS Mail, Gmail app)
- [ ] Web-safe font stack with fallbacks

**Branding Elements:**
- [ ] Email header with logo/wordmark
- [ ] Consistent color palette (buttons, links)
- [ ] Footer with contact info and links
- [ ] Tone of voice guide (warm/local vs professional)

**Legal/Compliance:**
- [ ] Unsubscribe link (required for marketing emails, optional for transactional)
- [ ] Physical address in footer (CAN-SPAM requirement)
- [ ] Privacy policy link

**Resources:**
- [Email Design Best Practices](https://www.smashingmagazine.com/2017/01/introduction-building-sending-html-email-for-web-developers/)
- [Really Good Emails](https://reallygoodemails.com/) — design inspiration

---

### Verification

- [ ] Donation confirmation sends after successful webhook
- [ ] Email renders correctly on mobile
- [ ] Unsubscribe link works (if required)
- [ ] From address shows app name, not random string
- [ ] No PII in email logs

---

### Considerations

**Every.org already sends receipts:**
- Every.org sends tax receipts directly to donors
- Our confirmation is supplemental ("thanks from us")
- Don't duplicate receipt info — focus on relationship/branding

**Anonymous donations:**
- If no user account linked, no email sent
- Consider: prompt to create account after donation?

---

### Dependencies

- Phase 4 (Auth) sets up Resend and email service foundation
- Phase 5 (Donations) webhook triggers confirmation emails

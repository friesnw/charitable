# Beta / Pilot Experience Research

*How to design GoodLocal's early stage to feel home-y, founder-led, and feedback-driven — not like a cold "BETA" disclaimer.*

---

## The Core Framing Shift

Most products treat beta status as a legal disclaimer — a yellow badge that signals "something might break." That's the wrong frame entirely. The better frame:

> **"You're one of the first people in Denver doing this. Your experience shapes what this becomes."**

The language distinction matters enormously. Research on UX framing shows that "I have to do X" vs. "I get to do X" produces entirely different emotional responses. The goal is to make early users feel like co-creators, not test subjects.

---

## 1. What to Call Early Members

Naming the program shapes the relationship.

| Label | Vibe | Verdict |
|-------|------|---------|
| "Beta Program" | Clinical, tech-y | Never for consumer apps |
| "Pilot Program" | Neutral, official | OK but not exciting |
| "Explorer Program" | Adventurous | Better, but generic |
| **"Charter Member"** | Legacy, permanence, pride | **Best for GoodLocal** |
| "Founding Member" | Insider, historical | Strong runner-up |

**"Charter Member" is the right call.** It has particular resonance in the nonprofit/civic world — "charter" implies building something lasting. Crucially, it's *permanent*: joining now grants a status that future users won't have. The asymmetry creates genuine belonging without manufactured scarcity.

---

## 2. Founder Presence In-Product — The Personal Touch

### The Superhuman Playbook (Rahul Vohra)

Vohra personally onboarded the first 200 users himself, many calls lasting two hours. He listened, took notes, asked about their specific workflow. 65% of full product migrations happened live, during those calls. The result: 2x activation rates vs. self-serve.

His key insight: *"Every founder should spend time manually onboarding their earliest customers. Companies with deep understanding — from real conversations — have an advantage that no LLM can replicate."*

### What This Looks Like for GoodLocal

**Welcome email — write it as Nick, not "the GoodLocal team":**
- First name, personal tone, actual email address
- Something like: *"I'm Nick, the founder of GoodLocal. You're one of the first people in Denver using this. I'd genuinely love 15 minutes to hear what's working and what isn't. Reply here."*

**In the onboarding flow:**
- One screen after signup with Nick's photo (not a stock image) and a short, hand-written-feeling message
- Not generic "Welcome to GoodLocal!" — instead: *"Hey — thanks for joining. You're member #47 in Denver. I'm reading every piece of feedback that comes in."*

**Persistent in-product feedback entry point:**
- Subtle footer or sidebar element: `"Built something to say? Nick reads it."` → Crisp chat or a Tally form
- Should NOT be a modal that interrupts flow — a quiet, always-available signal

### The Linear Playbook (for screening early users)

Linear only let in 10 users per week during their first year, handpicked from survey responses. They made a new version of the product *for each cohort of 10 users* — speed of responsiveness made early adopters feel like co-founders.

**The survey-as-screening approach is worth adopting:** A 2-question prompt at signup — *"What brought you here?"* and *"What's your biggest frustration with giving locally?"* — segments users, personalizes follow-up, and signals you care who they are, not just that they signed up.

---

## 3. In-App Feedback Mechanisms

### The Hierarchy (by signal quality)

1. Live phone/video call — 1 hour beats 100 surveys
2. Founder-initiated email follow-up
3. **In-app live chat (Crisp)** — real-time, captures emotion in the moment
4. Contextual microsurveys (2-3 questions, behavior-triggered)
5. Embedded "always-available" feedback widget
6. NPS / CSAT — useful for trends, not early qualitative work

### Recommended Tools

**Crisp Chat (crisp.chat) — strong first choice**
- Free plan is genuinely usable
- Set it to show Nick's name and photo as the agent
- Automatic triggers: e.g., if a user spends 90+ seconds on the donate flow without converting, a chat bubble appears: *"Any questions? I'm Nick, the founder — happy to help."*
- Crisp's own founders grew from 0 to 200 users by engaging personally through live chat
- Conversations started in-app continue over email

**Tally (tally.so) for embedded surveys**
- Free, no-code, embeds cleanly in React
- Forms look custom without Typeform branding
- Use for post-signup "What brought you here?" or post-donation "How was that?"

**Avoid at this stage:** Hotjar (overkill before meaningful traffic), Canny (better for established user bases), Intercom (expensive and feature-heavy)

### The #1 Feedback Conversion Secret: Close the Loop Visibly

The single biggest factor in turning early users into active contributors is showing that their feedback **changed something**. This is the flywheel:

1. User gives feedback
2. You ship something based on it
3. You tell them personally: *"We just shipped X because of what you told us last week"*
4. They tell everyone they know

A lightweight implementation: a **"What we just shipped" card** in the app (dismissible, not intrusive) — *"This week: [X]. This came from feedback from a Charter Member in Denver. Thank you."* 30 minutes to write, demonstrates a culture of responsiveness.

### High-Value Trigger Moments for Feedback

Don't ask randomly — attach feedback prompts to emotionally significant moments:

- **After first donation:** *"You just gave to [Nonprofit Name] in Denver. How did that feel?"* → 1-2 question survey or free-text
- **After browsing without donating:** *"Didn't find what you were looking for? Tell us what's missing in Denver."*
- **After 2-3 sessions:** *"You've been back a few times — would you be open to a 15-min call with Nick?"* → Calendly link

---

## 4. Charter Member Psychology

Four drivers that "founding member" framing activates simultaneously:

1. **Scarcity Effect (Cialdini):** Limited access makes membership feel valuable. Being selected = being chosen.
2. **Need to Belong:** Being part of a named, acknowledged group ("Charter Members of GoodLocal Denver") satisfies belonging in a way generic app usage never does.
3. **Loss Aversion:** Future users will just be "users." Charter Members have a permanent distinction. The asymmetry is compelling.
4. **Reciprocity:** Early access is a gift. People who receive it feel genuine obligation to contribute back — through feedback, word-of-mouth, advocacy.

**GoodLocal has a fifth driver unique to the giving context:**

5. **Identity Affirmation:** People who give to charity want that identity reinforced. Being a Charter Member of a giving platform *is* part of who they are. The label does emotional work that a regular "user" account never could.

### How to Implement

- Members who join during the pilot get a permanent "Charter Member" label on their profile — visible to themselves, potentially visible to nonprofits they support
- A private Slack or Discord for Charter Members only, where Nick is present and sharing what's being built
- Regular founder updates: *"Here's what we learned this week from 12 early members. Here's what we're changing."*
- "Member since [month/year]" tag visible in their profile — no need for gamified points
- A personal message from Nick when someone hits milestones (first donation, 3rd charity viewed)

---

## 5. Design Elements — Visual Language

### Bad Beta Badge
```
⚠️  WARNING: This application is currently in BETA.
    Features may change without notice.
```
Problems: passive, defensive, anxiety-inducing. Says nothing about the user's role.

### Good Approach
Instead of a warning banner, use:
- **Welcome screen (one-time, after signup only):** Full-screen card, Nick's photo, first-person message, single CTA "Let's get started"
- **Persistent nav pill:** Small `Charter Member` badge in a muted secondary color near the user's profile — not the primary action color
- **Footer line on public pages:** `GoodLocal is in early access in Denver · [Join as a Charter Member]`
- **No banner on return visits** — existing members shouldn't be reminded of "beta" every time they log in

### Warm Language Rewrites

| Instead of... | Say... |
|---------------|--------|
| "This feature is in beta" | "This is new — let us know how it works for you" |
| "We're working on improvements" | "You're helping us figure out what to build next" |
| "Limited functionality" | "Denver is our first city — more coming from your feedback" |
| "Please report bugs" | "Notice something? Tell us — we read every note" |
| "Beta users" | "Early members" / "Charter Members" |

The pattern: replace passive/defensive language with **participatory, first-person, community-forward** language.

---

## 6. Specific Product Recommendations for GoodLocal

### Near-term (can implement now)

1. **Welcome flow redesign:** Post-magic-link verification, show a full-screen card with Nick's photo and a personal message before the app loads. One CTA: "Let's get started."

2. **Add Crisp Chat:** Configure with Nick's name/photo as agent. Set auto-trigger for: user on charity page >90 seconds without action; post-donation; return visit after 7+ days away.

3. **Post-donation microsurvey:** After Every.org modal closes, show a one-question overlay before confirmation resolves: *"How did that feel?"* with 3 emoji-style responses. Captures emotional signal at the highest-value moment.

4. **Signup screening question:** One-field prompt before or right after magic link signup: *"What brings you to GoodLocal?"* Routes to Nick's inbox for follow-up with high-signal users.

5. **"Charter Member" label in user profile:** Permanent status indicator. Costs one DB field and a small UI element.

### Medium-term (roadmap additions)

6. **Changelog / shipped card:** Dismissible in-app card when you ship something from feedback. *"This week: [X]. Thanks to a Charter Member in Denver."*

7. **Private Charter Member Slack/Discord:** Nick present and active. Share what's being built, what you're uncertain about. This is the loyalty layer that no feature can replicate.

8. **"Member since" profile badge:** Public-facing on charity profile interactions — nonprofits can see they're engaging with a founding member of the platform.

9. **Periodic giving summary email (from Nick, not "GoodLocal"):** Quarterly: *"Here's what your giving has supported in Denver this quarter."* Written in first person, personally signed.

---

## Sources

- [Superhuman's Onboarding Playbook — First Round Review](https://review.firstround.com/superhuman-onboarding-playbook/)
- [Linear's Path to Product-Market Fit — First Round Review](https://review.firstround.com/linears-path-to-product-market-fit/)
- [Founder-Led Growth Playbook — First Round Review](https://review.firstround.com/founder-led-growth-playbook/)
- [How the latest tech products do early access betas — Sam Dickie](https://www.samdickie.me/writing/how-the-latest-tech-products-do-early-access-betas)
- [How Productboard Designed a Personable Private Beta Signup — Productboard Blog](https://www.productboard.com/blog/how-we-designed-a-unique-memorable-and-personable-private-beta-signup/)
- [Announcing Beta and Preview Features — Cloudscape Design System](https://cloudscape.design/patterns/general/announcing-beta-preview-features/)
- [10 Effective Ways to Gather Feedback from Early Adopters — Innerview](https://innerview.co/blog/10-effective-ways-to-gather-valuable-product-feedback-from-early-adopters)
- [A Founder's Guide to Community — Lenny's Newsletter (David Spinks)](https://www.lennysnewsletter.com/p/building-community)
- [Crisp vs Intercom: 2026 Comparison — Featurebase](https://www.featurebase.app/blog/crisp-vs-intercom)
- [How to Write Super-Clickable Beta Invite Emails — Centercode](https://www.centercode.com/blog/how-to-write-super-clickable-beta-invite-emails-with-samples)

# Analytics Research: Event Tracking & Visualization

## Goal
Track user events within the app and visualize analytics for understanding user behavior.

---

## Option 1: Beacon (Deloitte)

**Source:** [github.com/Deloitte/beacon](https://github.com/Deloitte/beacon)

### What It Is
Open-source JavaScript library for first-party web analytics. Privacy-focused, no third-party tracking.

### Pros
- Lightweight (~50KB)
- Privacy-first design (no cookies, first-party only)
- TypeScript codebase, well-typed
- Minimal dependencies
- Full control over data

### Cons
- **No visualization dashboard** — you get raw events, need to build your own UI
- Less mature ecosystem than alternatives
- You'd need to build a backend to receive/store events
- Limited documentation compared to established tools

### Integration
```html
<script type="text/javascript" id="beaconScript" async
  src="YOUR_URL/beacon.js" data-api-root="YOUR_URL"></script>
```

### Verdict
Good if you want **full control** and are willing to build your own dashboard. More work upfront.

---

## Option 2: Plausible Analytics

**Source:** [plausible.io](https://plausible.io/self-hosted-web-analytics)

### What It Is
Lightweight, privacy-friendly Google Analytics alternative. Open source (AGPL-3.0).

### Pros
- Beautiful, simple dashboard out of the box
- Script is 75x smaller than Google Analytics (~1KB)
- No cookies, GDPR compliant by default
- Self-hostable (Community Edition)
- Custom event tracking supported

### Cons
- Self-hosting requires PostgreSQL + ClickHouse (more infrastructure)
- Less granular than full product analytics tools
- No user-level tracking (by design)

### Pricing
- Cloud: $9/mo for 10K pageviews
- Self-hosted: Free (Community Edition)

### Verdict
Best for **simple, privacy-first analytics** with minimal setup. Great dashboard.

---

## Option 3: Umami

**Source:** [umami.is](https://umami.is)

### What It Is
Simple, fast, privacy-focused analytics. Designed for developers.

### Pros
- Very easy to self-host (just PostgreSQL or MySQL)
- Free cloud tier (100K events/mo)
- Clean, modern UI
- Custom events supported
- Lightweight script

### Cons
- Less feature-rich than PostHog
- No session replay, funnels, or advanced features
- Limited retention/cohort analysis

### Integration
```html
<script async src="https://your-umami.com/script.js"
  data-website-id="your-website-id"></script>
```

### Verdict
**Best balance** of simplicity and features for a small app. Easy self-hosting.

---

## Option 4: PostHog

**Source:** [posthog.com](https://posthog.com)

### What It Is
All-in-one product analytics platform. Open source (MIT).

### Pros
- Full feature set: events, funnels, retention, session replay, feature flags
- Generous free tier (~1M events/mo)
- SQL access for custom queries
- User profiles and paths
- Self-hostable

### Cons
- More complex to self-host (ClickHouse + Kafka + PostgreSQL)
- Heavier weight (overkill for simple needs)
- Steeper learning curve

### Verdict
Best for **serious product analytics**. Overkill for MVP, but great as you scale.

---

## Option 5: Matomo

**Source:** [matomo.org](https://matomo.org)

### What It Is
The original Google Analytics alternative. Very mature.

### Pros
- Most feature-complete open source option
- WordPress plugin, e-commerce tracking
- Strong GDPR compliance tools
- Large community

### Cons
- UI feels dated
- More complex setup
- Can be resource-heavy

### Verdict
Good for **enterprise/compliance needs**. Overkill for your MVP.

---

## Comparison Table

| Tool | Self-Host Difficulty | Dashboard | Custom Events | Free Tier | Best For |
|------|---------------------|-----------|---------------|-----------|----------|
| **Beacon** | Medium (build your own) | None | Yes | Free | Full control, DIY |
| **Plausible** | Medium (PG + ClickHouse) | Excellent | Yes | Self-host only | Simple + beautiful |
| **Umami** | Easy (just PG) | Good | Yes | 100K events/mo | Small apps |
| **PostHog** | Hard (complex stack) | Excellent | Yes | 1M events/mo | Product analytics |
| **Matomo** | Medium | Good | Yes | Self-host only | Enterprise |

---

## Recommendation for Charitable

### For MVP: **Umami**
- Easy to self-host on Render alongside your app
- Free cloud tier to start
- Custom events for tracking donations, searches, etc.
- Can migrate to PostHog later if needed

### If You Want Full Control: **Beacon**
- Build exactly what you need
- Store events in your own PostgreSQL
- Create custom visualizations
- More work, but no external dependencies

### If You Want Best-in-Class (Later): **PostHog**
- When you need funnels, retention, session replay
- Generous free tier
- More infrastructure to manage

---

## Next Steps

1. **Quick start:** Sign up for Umami Cloud (free tier) and add the script
2. **Or self-host:** Deploy Umami on Render with your existing PostgreSQL
3. **Define events:** What do you want to track?
   - Page views
   - Charity card clicks
   - Donation button clicks
   - Search/filter usage
   - Sign-in/sign-up

---

## Questions to Consider

- Do you need user-level tracking or just aggregate stats?
- Is self-hosting important, or is a managed service OK?
- What's your budget for analytics?
- How important is session replay / heatmaps?

---

## Sources

- [Plausible Analytics](https://plausible.io/self-hosted-web-analytics)
- [PostHog: Best Open Source Analytics Tools](https://posthog.com/blog/best-open-source-analytics-tools)
- [Deloitte Beacon](https://github.com/Deloitte/beacon)
- [Umami](https://umami.is)

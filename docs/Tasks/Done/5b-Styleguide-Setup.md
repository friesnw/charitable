> **SUPERSEDED:** This task has been merged into `2-Frontend-Foundation.md` (Phase 1 & 4: Design Tokens, Storybook)

## Phase 5b: Styleguide & Design System

**Goal:** Create a single source of truth for design tokens and components, synced between Figma and code via Storybook.

---

### Design Tokens

Define core tokens in a central file (e.g., `frontend/src/styles/tokens.ts` or CSS variables):

- [ ] **Colors**: Primary, secondary, accent, semantic (success, error, warning)
- [ ] **Typography**: Font families, sizes, weights, line heights
- [ ] **Spacing**: Consistent scale (4px, 8px, 16px, 24px, etc.)
- [ ] **Border radius**: Buttons, cards, inputs
- [ ] **Shadows**: Elevation levels

**Format options:**
- CSS custom properties (`:root { --color-primary: #2563eb; }`)
- TypeScript constants (for type safety)
- JSON (for Figma plugin sync)

---

### Storybook Setup

- [ ] **Install Storybook**: `npx storybook@latest init` in frontend
- [ ] **Create stories for core components**:
  - Button (primary, secondary, disabled states)
  - Input / Form fields
  - Card (charity card)
  - Typography (headings, body, captions)
  - Layout components (container, grid)
- [ ] **Add design token documentation** as a Storybook page
- [ ] **Configure for Vite** (Storybook auto-detects)

---

### Figma Integration

Manual sync (simpler)**
- Designer exports tokens from Figma
- Developer updates `tokens.ts` to match
- Use consistent naming conventions

---

### Component Documentation

For each component in Storybook:
- [ ] **Props table**: Auto-generated from TypeScript
- [ ] **Usage examples**: Common use cases
- [ ] **Do's and Don'ts**: Design guidance
- [ ] **Figma link**: Reference to Figma component (optional)

---

### Workflow

```
┌─────────────┐     Export JSON      ┌─────────────┐
│   Figma     │ ──────────────────▶  │  tokens.json│
│  (Designer) │                      └──────┬──────┘
└─────────────┘                             │
                                            │ Style Dictionary
                                            ▼
                                     ┌─────────────┐
                                     │  tokens.ts  │
                                     │  tokens.css │
                                     └──────┬──────┘
                                            │
                                            ▼
┌─────────────┐     Import tokens    ┌─────────────┐
│  Storybook  │ ◀────────────────── │  Components │
│  (Preview)  │                      └─────────────┘
└─────────────┘
```

---

### Recommended Starting Point

For MVP, start simple:

1. **Create `tokens.css`** with CSS variables
2. **Set up Storybook** with 3-5 core components
3. **Share Storybook URL** with designer for review
4. **Sync manually** until you need automation

---

### Verification

- [ ] Storybook runs locally (`npm run storybook`)
- [ ] Core components have stories with all states
- [ ] Design tokens match Figma specs
- [ ] Designer can view Storybook (deployed or localhost tunnel)

---

### Resources

- [Storybook for React + Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
- [Tokens Studio for Figma](https://tokens.studio/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Figma to Code workflows](https://www.figma.com/best-practices/components-styles-and-shared-libraries/)

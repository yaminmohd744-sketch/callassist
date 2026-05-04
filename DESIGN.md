---
name: Pitch Plus
description: Real-time AI sales coaching for reps who can't afford to look at a screen twice.
colors:
  accent-purple: "#7c3aed"
  accent-magenta: "#c026d3"
  accent-green: "#22c55e"
  accent-red: "#ef4444"
  accent-yellow: "#eab308"
  bg-base: "#05030f"
  bg-surface: "#0a0714"
  bg-elevated: "#100c1e"
  bg-hover: "#18132b"
  text-primary: "#f0ebff"
  text-secondary: "rgba(240,235,255,0.65)"
  text-muted: "rgba(240,235,255,0.32)"
  light-bg-base: "#f3effb"
  light-bg-surface: "#ffffff"
  light-text-primary: "#1e1333"
typography:
  display:
    fontFamily: "'Clash Display', 'Satoshi', system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
  headline:
    fontFamily: "'Satoshi', system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.01em"
  title:
    fontFamily: "'Satoshi', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.01em"
  body:
    fontFamily: "'Satoshi', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "'Satoshi', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
  mono:
    fontFamily: "'Tabular', 'Fragment Mono', 'JetBrains Mono', monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "32px"
  pill: "100px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-purple}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-magenta}"
    textColor: "{colors.text-primary}"
  button-secondary:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  button-danger:
    backgroundColor: "{colors.accent-red}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  nav-tab-active:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Pitch Plus

## 1. Overview

**Creative North Star: "The Quiet Edge"**

Pitch Plus runs during a live sales call. The rep can't pause the conversation to read an interface. Every pixel either earns attention or wastes it. The system is built around one discipline: surface what matters, hide everything else. Not minimal for aesthetics, minimal because the stakes are real.

The visual language takes its cues from Raycast and Superhuman — tools that feel like extensions of the person using them, not software they're operating. Dark, calm, text-forward. The accent color is a weapon, not decoration: it fires once per screen at maximum to point at the single most important thing. Surfaces are flat at rest and lift only under state changes. No glass on every panel, no gradients on every border, no glow on every button.

This system explicitly rejects the generic purple SaaS template: the one that could be a crypto wallet, a fitness app, or a project manager if you swapped the logo. No hero-metric dashboards. No rainbow of accent colors fighting for attention. No glassmorphism as atmosphere. No gradient text. No identical card grids. If the visual treatment could belong to any other product, it belongs to none.

**Key Characteristics:**
- Dark by default, calm not cold — background tints toward the brand hue
- One accent at a time: purple fires, magenta confirms, status colors inform
- Typography carries hierarchy; color confirms it
- Surfaces layer through opacity and value, not through blur
- Motion is state feedback, not choreography
- The interface recedes during the call; it surfaces between calls

---

## 2. Colors: The Focus Palette

A near-black violet ground, one assertive purple accent, one magenta signal for confirmations and active states, and a set of status semantics that communicate data — not decoration.

### Primary
- **Incandescent Violet** (#7c3aed): The single action color. Used on primary buttons, active nav indicators, focus rings, and data points that need the rep's immediate attention. Never used as a surface tint. Its scarcity is its power.

### Secondary
- **Magenta Confirm** (#c026d3): Fires on confirmation states, selected items, and the most critical live-call signal (prospect engagement spike). Not a decoration — a signal.

### Tertiary
- **Signal Green** (#22c55e) / **Signal Red** (#ef4444) / **Signal Yellow** (#eab308): Semantic status only. Green = positive (close signal, buy signal). Red = alert (objection, negative sentiment). Yellow = neutral or caution. Never used for decoration or brand expression.

### Neutral
- **Void** (#05030f): App base background. Deep enough to feel focused, tinted purple enough to feel branded.
- **Lifted Dark** (#0a0714): Primary surface — cards, panels, sidebar. One step above Void.
- **Elevated Dark** (#100c1e): Interactive element resting state. Dropdowns, inputs, raised cards.
- **Hover Dark** (#18132b): Hover fill. Confirms interactivity without an accent.
- **Ghost White** (#f0ebff): Primary text on dark. Purple-tinted white, not pure white.
- **Receded White** (rgba(240,235,255,0.65)): Secondary text — labels, metadata, supporting copy.
- **Whisper** (rgba(240,235,255,0.32)): Muted text — timestamps, placeholders, inactive states.

### Named Rules
**The One Voice Rule.** The primary accent (#7c3aed) appears on at most one prominent element per screen. Its job is to answer the question "where do I act?" — a question that has one answer at a time.

**The Silence Rule.** Background surfaces carry no gradient. The dark backgrounds are flat. Depth comes from layering Void → Lifted Dark → Elevated Dark, not from decorative gradients on panel backgrounds.

---

## 3. Typography: The Working Stack

**Display Font:** Clash Display (with Satoshi, system-ui fallback)
**Body Font:** Satoshi (with system-ui, -apple-system fallback)
**Mono Font:** Tabular (with Fragment Mono, JetBrains Mono fallback)

**Character:** Clash Display's angular geometry carries authority at large sizes — it belongs on section headers and empty-state headlines, not scattered through the UI. Satoshi is the workhorse: neutral enough to disappear into data, distinctive enough to feel crafted. Together they split the job cleanly: Clash declares, Satoshi delivers.

### Hierarchy
- **Display** (700, 44px, 1.05 lh, 0.02em): Section titles on landing/onboarding screens. Rarely used in the app shell — once per page maximum.
- **Headline** (700, 30px, 1.15 lh): Dashboard section headers, modal titles, screen names. Satoshi, not Clash Display, at this level and below.
- **Title** (600, 22px, 1.25 lh): Card headers, panel section labels, tab content headings.
- **Body** (400, 13px, 1.55 lh): All reading content. Transcript entries, suggestion text, analytics copy. Max line length 65ch.
- **Label** (600, 11px, 1.3 lh, 0.08em, uppercase): Navigation tabs, badges, stat labels, timestamps. Uppercase with tracked letterSpacing — only at this size or smaller.

### Named Rules
**The Clash Rule.** Clash Display is reserved for display-scale text (44px+) on onboarding and landing surfaces. Every heading inside the app shell uses Satoshi. Mixing display fonts into the dashboard makes the UI feel like a website.

**The Scale Rule.** Adjacent text levels must differ by at least 2px. Xs (11px) → Sm (12px) is a distinction without a difference; use only one for labels.

---

## 4. Elevation

Elevation is structural, not decorative. Surfaces layer through background value — Void as the floor, Lifted Dark as the ground plane, Elevated Dark as raised elements — not through shadows or blur. Shadows confirm interaction state and lift modals above the document; they are not applied to resting cards.

Glass effects (backdrop-filter blur) are reserved for one use case: floating panels that genuinely overlay content the user needs to see through (the overlay screen, live call status bar, toasts). Not for cards, not for sidebars, not for navigation at rest.

### Shadow Vocabulary
- **Structural sm** (`0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`): Subtle lift for interactive elements (inputs on focus, hovering buttons).
- **Structural md** (`0 4px 20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)`): Dropdowns, popovers, and any surface that opens over the page.
- **Structural lg** (`0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)`): Modals and dialogs.
- **Accent glow** (`0 0 0 1px rgba(124,58,237,0.35), 0 4px 20px rgba(124,58,237,0.25)`): The single glow allowed — on the primary CTA on landing/onboarding only. Not inside the app shell.

### Named Rules
**The Flat-by-Default Rule.** App shell surfaces are flat at rest. Shadows appear only as responses to state (hover lift, opened dropdown, focused input, modal overlay). A resting card with a shadow is a card pretending to be more important than it is.

**The One Blur Rule.** Backdrop-filter is applied to exactly one element per screen: the element that physically floats over content the user cares about. Navigation, sidebars, and content panels are opaque — they don't need to show through.

---

## 5. Components

### Buttons
Clean, tight, text-forward. The primary button is the only element in the shell allowed to carry the accent color as a fill.

- **Shape:** Pill (100px radius) for actions, gently curved (8px) for inline controls.
- **Primary:** Solid #7c3aed fill, white text, no gradient. 600 weight, 0.05em letter-spacing, uppercase for md/lg sizes. `box-shadow: 0 2px 12px rgba(124,58,237,0.3)` at rest. On hover: shadow intensifies, translateY(-1px). No gradient fill on the button itself.
- **Secondary:** Elevated Dark (#100c1e) background, Ghost White text, 1px border at rgba(124,58,237,0.22). On hover: border brightens to rgba(124,58,237,0.45), background steps to Hover Dark (#18132b).
- **Danger:** #ef4444 solid fill. Only used on destructive confirmation actions.
- **Ghost:** Transparent background, Receded White text, no border at rest. On hover: Elevated Dark fill, 1px subtle border appears.
- **Disabled:** 0.35 opacity across all variants. No pointer events.

### Navigation (Top Bar)
The app shell top nav is 58px tall, opaque (no blur), Lifted Dark background. One hairline border at the bottom in the border token color.

- **Logo:** Clash Display, 17px, 700 weight. No gradient text. Solid Ghost White with the accent purple on the "+" mark only.
- **Tabs:** Satoshi, 13px, 500 weight. Muted text at rest. Elevated Dark background + Ghost White text when active. Active indicator: 2px line at bottom, solid #7c3aed, 28px wide, centered. No gradient on the indicator.
- **Actions (right side):** Ghost button for secondary, Primary button for "New Call". Avatar: 34px circle, solid accent gradient fill (avatar is a contained surface, not a text element).

### Cards and Containers
- **Corner Style:** Gently curved (14px radius) for data cards. Large curve (22px) for modal shells and full panels.
- **Background:** Lifted Dark (#0a0714) for resting cards. Elevated Dark (#100c1e) for interactive/selected state.
- **Shadow Strategy:** None at rest. Structural-sm on hover. Structural-md when opened or active.
- **Border:** 1px at rgba(124,58,237,0.22) — the border token. No gradient borders on content cards. Gradient border reserved for one signature moment (the active live-call panel outline only).
- **Internal Padding:** 16px standard (space-4). 24px for important cards (space-6). Never less than 12px.

### Inputs and Fields
- **Style:** Elevated Dark background, 1px border at the subtle border token, 8px radius.
- **Focus:** Border steps to rgba(124,58,237,0.45). No glow shadow on focus — the border shift is sufficient.
- **Error:** Border shifts to rgba(239,68,68,0.55). Error message in Signal Red below.
- **Placeholder:** Whisper color (rgba(240,235,255,0.32)).

### Suggestion Cards (Signature Component)
The live-call AI suggestion — the product's single most important UI element. Rendered in a vertical list during a call.

- **No side-stripe border.** Category is communicated through a small color-dot or category badge at the top, not a left border stripe.
- **Background:** Elevated Dark, 1px border. The category accent (green/red/purple/magenta) tints only the badge, not the card edge.
- **Text:** Title in 13px 600 weight. Body in 13px 400 weight, Receded White. Max 3 lines before truncation.
- **State:** At rest flat. On hover: shadow-sm, border brightens slightly. "Used" state: opacity 0.45.

### Badges / Chips
- **Shape:** Pill (100px radius), 4px 10px padding.
- **Style:** Tinted background (7% opacity of the badge color) + full-opacity text in that color + no border. E.g. green badge: `background: rgba(34,197,94,0.07); color: #22c55e`.
- **Size:** Label scale — 11px, 600 weight, 0.06em letterSpacing, uppercase.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Satoshi for all text inside the app shell. Clash Display is for landing/onboarding display text (44px+) only.
- **Do** keep backgrounds flat. Layer Void → Lifted Dark → Elevated Dark for depth without decoration.
- **Do** treat the accent color as a single pointer per screen. One prominent purple element answers "where do I act?"
- **Do** use status colors (green, red, yellow) exclusively for data semantics. A green element means "positive signal", always.
- **Do** cap body text lines at 65ch. Dense panels need breathing room.
- **Do** use uppercase + wide letter-spacing only at 11px label scale. Tracking at body size reads as shouting.
- **Do** show shadows as state responses — hover lift, open dropdown, modal overlay. Not on resting surfaces.
- **Do** communicate card category through a badge or dot, not a colored side stripe.

### Don't:
- **Don't** use gradient text (`background-clip: text`). This applies to the logo, headings, and any other text element. The logo uses solid Ghost White; the "+" uses solid accent purple. Gradient text is decorative and never meaningful.
- **Don't** apply glassmorphism to static surfaces. Backdrop-filter blur is reserved for elements that physically float over content the user needs to read through (overlay screen, live status bar, toasts). Navigation, sidebars, and cards are opaque.
- **Don't** use gradient fills on card backgrounds, panel borders, or the navigation bar. The accent gradient lives on the avatar and the primary CTA. That is its entire territory.
- **Don't** put glows on buttons, cards, or any element at rest. Glows are reserved for one place: the primary CTA on the landing/onboarding screen.
- **Don't** build a hero-metric dashboard. Big number + small label + gradient accent = SaaS cliché. The dashboard communicates through a scannable table and key trend, not a trophy shelf.
- **Don't** use identical card grids. A grid of four equal cards with icon + heading + text is a template, not a design.
- **Don't** put a colored side stripe (border-left > 1px) on cards, list items, or suggestions. Category belongs in a badge.
- **Don't** fill the screen with color. If the screenshot looks like a gradient sampler, it's wrong. At most 10% of any screen carries the primary accent.
- **Don't** animate layout properties (width, height, padding, top, left). Animate opacity and transform only.
- **Don't** make the app feel like a website. No full-page slide transitions, no hero sections, no scroll-driven reveals inside the app shell.

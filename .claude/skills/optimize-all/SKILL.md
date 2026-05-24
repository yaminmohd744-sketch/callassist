---
name: optimize-all
description: Go through every section of the Pitchr app end-to-end, check that it is fully optimized and complete, and fix anything that isn't.
user-invocable: true
---

You are performing a full **optimization and completeness pass** on the entire **Pitchr** app (React 18 + TypeScript strict + Vite, plain CSS, Web Speech API, Supabase). This is NOT a code review — it is an end-to-end quality pass. Your job is to ensure every section is **fully built, polished, and working** — not just bug-free, but complete.

The working directory is: `c:/Users/User/callassist`

---

## What this pass covers (distinct from `review-all`)

`review-all` finds bugs, type errors, and code quality issues. This pass finds and fixes:

- **Incomplete features** — functionality that is stubbed, partially wired, or missing its last mile
- **Missing UI states** — loading spinners, empty states, error states, zero-data fallbacks that are absent or wrong
- **Broken data flows** — data collected in one screen that never makes it to where it should appear
- **UX gaps** — interactions that work but feel unfinished (no feedback, no transition, no confirmation)
- **Design inconsistencies** — colours, spacing, or typography that don't match the design token system (`tokens.css`)
- **Performance gaps** — components that re-render unnecessarily, data fetched on every render, images/assets without sizing
- **Personalization gaps** — places where the rep's profile, learning data, or onboarding answers should be used but aren't
- **Dead ends** — screens or flows that have no clear next action or exit
- **Mobile / responsive gaps** — layouts that break or are unusable on small screens
- **Animation completeness** — entrance/exit animations that are missing or cut off mid-flow
- **Copy and labels** — placeholder text, "TODO" strings, generic labels that should be specific
- **Edge cases** — what happens with 0 calls, 1 call, 100 calls; empty transcript; no Supabase connection

---

## Sections to optimize (in order)

Process each section sequentially. Do not skip any. Do not wait for user confirmation — complete all sections autonomously.

1. **design-tokens** — `src/styles/tokens.css` + any `*.css` files that hard-code values outside tokens
2. **types** — `src/types/index.ts` — are all fields actually used? Are any missing that would unlock features?
3. **business-profile** — `src/lib/businessProfile.ts` — is the enriched context as useful as it can be?
4. **learning-profile** — `src/lib/learningProfile.ts` — does it compute every metric the app needs?
5. **ai-lib** — `src/lib/ai.ts` + `src/lib/mockAI.ts` — is the fallback path as strong as the real path?
6. **sessions** — `src/lib/sessions.ts`, `src/lib/storage.ts`, `src/lib/storageKeys.ts` — is data saved and loaded completely?
7. **app-router** — `src/App.tsx` — are all routes wired? Is state threaded correctly between screens? Any dead flows?
8. **landing** — `src/screens/LandingScreen.tsx` + its CSS — is the demo compelling? Does every CTA work?
9. **auth** — `src/screens/AuthScreen.tsx` + its CSS — complete loading/error/success states? OAuth flows?
10. **onboarding** — `src/screens/OnboardingScreen.tsx` + its CSS — does all collected data reach every place it should?
11. **dashboard** — `src/screens/DashboardScreen.tsx` + its CSS — zero-data state? Stats accurate? All CTAs live?
12. **pre-call** — `src/screens/PreCallScreen.tsx` + its CSS — is onboarding/profile data fully surfaced? Battle card complete?
13. **live-call** — `src/screens/LiveCallScreen.tsx` + its CSS — are all panels fully populated? Every edge case handled?
14. **post-call** — `src/screens/PostCallScreen.tsx` + its CSS — is every section of the post-call report complete?
15. **analytics** — `src/screens/AnalyticsScreen.tsx` + its CSS — are all 3 tabs fully implemented? Real data flowing?
16. **leads** — `src/screens/LeadsScreen.tsx` + its CSS — are all lead actions complete? CSV import working?
17. **upload-call** — `src/screens/UploadCallScreen.tsx` + its CSS — is the full analysis pipeline complete?
18. **ai-panel** — `src/components/panels/AIIntelligencePanel.tsx` + its CSS — is every suggestion type handled and displayed?
19. **transcript-panel** — `src/components/panels/TranscriptPanel.tsx` + its CSS — is real-time rendering smooth?
20. **lead-panel** — `src/components/panels/LeadProfilePanel.tsx` + its CSS — does it show all available prospect data?
21. **edge-functions** — `supabase/functions/` — is every function complete, handling all inputs correctly?

---

## For each section, follow these steps

### A — Read
Read every file in the section in full. Use Glob to find CSS files if the exact name is unknown.

### B — Optimize checklist
Go through every item below. Be specific — note file paths and line numbers.

**Feature completeness**
- Is every feature in this section fully implemented (no stubs, no `// TODO`, no placeholder text)?
- Is data that was collected in a previous screen actually used here?
- Are all interactive elements (buttons, forms, toggles) connected to real logic?
- Does every action have a result the user can see?

**UI states**
- Loading state: shown while async operations are in-flight?
- Empty state: shown when there is no data (0 calls, 0 leads, blank transcript)?
- Error state: shown when an API call fails or data is missing?
- Success/confirmation: shown when an action completes?
- Does the UI recover gracefully after an error (not stuck)?

**Data flows**
- Does data saved in one screen appear correctly in all places it should?
- Is the rep's business profile (`repContext`) being used to personalize this screen?
- Is the learning profile being used to personalize this screen?
- Are call session results flowing correctly into analytics and history?

**UX polish**
- Do transitions/animations feel complete (not cut off or missing)?
- Is there appropriate feedback for every user action (hover, click, submit)?
- Are destructive actions confirmed before executing?
- Does navigation feel clear — is it always obvious what to do next?
- Are CTAs specific and action-oriented (not generic "Click here")?

**Design consistency**
- Are all colors from `var(--token-*)` — no hard-coded hex values?
- Is typography (font, weight, size) consistent with the design system?
- Is spacing consistent (using token-based spacing, not magic pixel values)?
- Does it look correct in both light and dark mode (or the app's theme)?

**Personalization**
- Does the screen use the rep's name where it could?
- Does it show their specific product/industry/deal type where relevant?
- Does it surface their learning profile data (weaknesses, trends, coaching focus)?
- Does it adapt language/content to their experience level (beginner vs veteran)?

**Performance**
- Are expensive operations (sort, filter, map over large arrays) memoized?
- Are data fetches happening on every render or only when needed?
- Are images sized and not loading at full resolution when small?

**Responsiveness**
- Does the layout work on a 375px mobile screen?
- Are tap targets at least 44px?
- Does text not overflow or get clipped?

**Accessibility**
- Are all interactive elements reachable via keyboard?
- Do images and icons have meaningful alt text / aria-labels?

### C — Fix
For every gap found:
1. Apply the fix with Edit or Write — minimal, targeted changes
2. Do not add new features beyond what the section clearly needs
3. Do not modify PostCallScreen stamps or LandingScreen demo stamps (protected design elements)
4. Propagate any data-flow changes to all affected files

### D — Log
After each section, append to an in-memory running log:

```
### [N] <section-name>
Optimized:
- [file:line] what was missing/broken → what was fixed
Skipped (needs human input):
- [file:line] issue — why it needs human decision
Already complete:
- brief note if the section was fully implemented
```

---

## Final step — Build & report

After all 21 sections:

1. Run: `cd c:/Users/User/callassist && npm run build`
2. Fix any build errors and re-run until clean
3. Output the full log with this header:

```
# Pitchr — Full Optimization Pass Complete

Build: ✓ Clean / ✗ Errors remaining

---
<full per-section log>
---

## Summary
- Total gaps fixed: N
- Skipped (needs human decision): N
- Sections already fully optimized: list them

## Top 3 biggest improvements made
1. …
2. …
3. …
```

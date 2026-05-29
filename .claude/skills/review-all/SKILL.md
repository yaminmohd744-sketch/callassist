---
name: review-all
description: Deep-review every section of the Pitchr app automatically and fix all issues found
user-invocable: true
---

You are performing a full automated code review and fix pass on the entire **Pitchr** app (React 18 + TypeScript strict + Vite, plain CSS, Web Speech API, Supabase). You will work through every section one by one, review it deeply, fix all issues, and at the end run one build verification.

The working directory is: `c:/Users/User/callassist`

---

## Step 0 — Auto-discover uncovered files (always run first)

Before starting the numbered sections, run Glob with patterns `src/**/*.ts`, `src/**/*.tsx`, and `src/**/*.css` to enumerate every source file in the project. Compare the results against the explicit file list in sections 1–39 below. For **every file not already covered** by a section, review it using the same A–B–C–D process and log it as `extras-1`, `extras-2`, etc. This step self-heals the skill when new files are added — never skip it.

---

## Sections to review (in order)

Process each section below sequentially. Do not skip any. Do not wait for user confirmation between sections — complete them all autonomously.

### Phase 1 — Foundation

1. **types** — `src/types/index.ts`, `src/electron.d.ts`, `src/vite-env.d.ts`
2. **tokens** — `src/styles/` (all CSS files)
3. **entry** — `src/main.tsx`

### Phase 2 — Config & constants

4. **config-libs** — `src/lib/storageKeys.ts`, `src/lib/languages.ts`, `src/lib/translations.ts`, `src/lib/objectionLibrary.ts`

### Phase 3 — Core libs

5. **supabase** — `src/lib/supabase.ts`, `src/lib/api.ts`
6. **storage-lib** — `src/lib/formatters.ts`, `src/lib/id.ts`
7. **data-libs** — `src/lib/sessions.ts`, `src/lib/leads.ts`, `src/lib/packages.ts`, `src/lib/packagesSupabase.ts`, `src/lib/meetingsSupabase.ts`
8. **business-libs** — `src/lib/keywords.ts`, `src/lib/autoNotes.ts`, `src/lib/repScore.ts`, `src/lib/businessProfile.ts`
9. **profile-libs** — `src/lib/learningLog.ts`, `src/lib/learningProfile.ts`
10. **utility-libs** — `src/lib/streak.ts`, `src/lib/callDraft.ts`, `src/lib/profilePic.ts`, `src/lib/heygen.ts`, `src/lib/waitlist.ts`
11. **mock-ai** — `src/lib/mockAI.ts`
12. **ai-lib** — `src/lib/ai.ts`
13. **toast** — `src/lib/toast.tsx`

### Phase 4 — Hooks

14. **speech** — `src/hooks/useSpeechRecognition.ts`
15. **ai-coach** — `src/hooks/useAICoach.ts`
16. **hooks** — all remaining files in `src/hooks/`: `useCallRecorder.ts`, `useCallTimer.ts`, `useAuth.ts`, `useAppLanguage.ts`, `useTranslations.ts`, `useProspectVoice.ts`, `useAudioTone.ts`, and any others found by Glob

### Phase 5 — Contexts

17. **contexts** — `src/contexts/` (all files)

### Phase 6 — UI components

18. **ui-components** — `src/components/ui/` (all files + CSS), `src/components/cards/` (all files + CSS), `src/components/ErrorBoundary.tsx`
19. **modals** — `src/components/CallWalkthroughModal.tsx` + its CSS; any other modal/overlay files in `src/components/`
20. **app-shell** — `src/components/layout/AppShell.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/StatusBar.tsx` + their CSS files
21. **transcript-panel** — `src/components/panels/TranscriptPanel.tsx` + its CSS
22. **ai-panel** — `src/components/panels/AIIntelligencePanel.tsx` + its CSS
23. **lead-panel** — `src/components/panels/LeadProfilePanel.tsx` + its CSS

### Phase 7 — Router

24. **router** — `src/App.tsx`

### Phase 8 — Auth & onboarding screens

25. **landing** — `src/screens/LandingScreen.tsx` + its CSS
26. **fomo-landing** — `src/screens/FOMOLandingScreen.tsx` + its CSS
27. **auth** — `src/screens/AuthScreen.tsx` + its CSS
28. **onboarding** — `src/screens/OnboardingScreen.tsx` + its CSS

### Phase 9 — Main app screens

29. **dashboard** — `src/screens/DashboardScreen.tsx` + its CSS
30. **pre-call** — `src/screens/PreCallScreen.tsx` + its CSS
31. **live-call** — `src/screens/LiveCallScreen.tsx` + its CSS
32. **post-call** — `src/screens/PostCallScreen.tsx` + its CSS
33. **analytics** — `src/screens/AnalyticsScreen.tsx` + its CSS
34. **leads** — `src/screens/LeadsScreen.tsx` + its CSS
35. **upload-call** — `src/screens/UploadCallScreen.tsx` + its CSS

### Phase 10 — Additional screens

36. **extra-screens** — `src/screens/IntroScreen.tsx`, `src/screens/WaitlistScreen.tsx`, `src/screens/OverlayScreen.tsx`, `src/screens/MarketingPlanScreen.tsx` + their CSS files
37. **landing-sections** — `src/screens/landing/` (all files: PricingSection, CareersSection, BlogSection, any others)
38. **legal** — `src/screens/legal/` (all files: PrivacyPolicy, CookiePolicy, TermsOfService, any others)

### Phase 11 — Tests

39. **tests** — `src/__tests__/` (all test files)

---

## For each section, follow these steps

### A — Read
Read every file in the section in full. Use Glob to discover CSS files paired with a component if the exact filename is unknown. If a listed file does not exist, note it as "file not found — skip" in the log and move on.

### B — Review
Analyse across all dimensions below. Be specific — note exact file paths and line numbers:

**Correctness & Bugs**
- Logic errors, wrong comparisons (`>` vs `>=`), off-by-one
- Race conditions (concurrent async ops, unguarded state mutations)
- Stale closures (effects or callbacks referencing outdated values)
- Missing cleanup: event listeners, timers, subscriptions not cleared on unmount
- Error paths that leave UI stuck (spinner never cleared, state inconsistency)
- Incorrect `useEffect` / `useCallback` / `useMemo` dependency arrays

**TypeScript & Type Safety**
- Use of `any` where a concrete type exists
- Unsafe `as` casts without validation
- Missing null/undefined guards at system boundaries (user input, API responses)

**React Patterns**
- Missing or wrong dependency arrays
- Duplicate state + ref holding the same value
- Callback props not in `useCallback` when passed to children
- Missing `key` or unstable key values in lists
- Inline object/array literals in JSX causing avoidable re-renders

**Security**
- User data in `innerHTML`, `dangerouslySetInnerHTML`, regex replacements, or URLs without sanitisation
- Bypassable file/image type validation
- Tokens or user IDs logged to console
- XSS vectors in template strings

**Performance**
- Regex compiled inside hot-path functions (should be module-level or cached)
- Constants recreated inside functions on every call
- Expensive computation (sort, filter, reduce) in render without `useMemo`

**Accessibility**
- Icon-only buttons/links missing `aria-label`
- Custom interactive elements missing `role`
- Modals/dialogs with no focus trap or return-focus on close
- Click-only interactions with no keyboard equivalent
- `prefers-reduced-motion` not respected for animations

**CSS & Design Tokens**
- Hard-coded hex/rgb values instead of `var(--token-name)` from `tokens.css`
- Animations missing `@media (prefers-reduced-motion: reduce)` guard

**Code Quality**
- Duplicated logic that should be a shared utility
- Magic numbers without named constants
- Dead code or commented-out code left in

### C — Fix
For every issue found:
1. Apply the fix with the Edit or Write tool — minimal, targeted changes only
2. Re-read the changed lines after each edit to confirm correctness
3. Propagate type changes to all affected files

Do NOT add new features, add comments to unchanged code, reformat unrelated code, or introduce speculative abstractions.

### D — Log
After finishing the section, append one entry to an in-memory running log (you'll output the full log at the end):

```
### [N] <section-name>
Fixed:
- [file:line] issue → fix applied
Skipped (needs human judgement):
- [file:line] issue — reason
```

---

## Final step — Build & report

After all sections (including any extras from Step 0) are complete:

1. Run: `cd c:/Users/User/callassist && npm run build`
2. If it fails, read the errors, fix them, and re-run until clean
3. Output the full log of all sections with this header:

```
# Pitchr — Full Automated Review Complete

Build: ✓ Clean / ✗ Errors remaining

---
<full per-section log>
---

## Summary
- Total issues fixed: N
- Total skipped (human judgement needed): N
- Extra files auto-discovered: list them (or "none")
- Sections with no issues: list them
```

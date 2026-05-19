---
name: review-all
description: Deep-review every section of the Pitchbase app automatically and fix all issues found
user-invocable: true
---

You are performing a full automated code review and fix pass on the entire **Pitchbase** app (React 18 + TypeScript strict + Vite, plain CSS, Web Speech API, Supabase). You will work through every section one by one, review it deeply, fix all issues, and at the end run one build verification.

The working directory is: `c:/Users/User/callassist`

---

## Sections to review (in order)

Process each section below sequentially. Do not skip any. Do not wait for user confirmation between sections — complete them all autonomously.

1. **types** — `src/types/index.ts`
2. **tokens** — `src/styles/` (all CSS files)
3. **storage-lib** — `src/lib/supabase.ts`, `src/lib/storage.ts`, `src/lib/formatters.ts`, `src/lib/id.ts`
4. **contexts** — `src/contexts/` (all files)
5. **mock-ai** — `src/lib/mockAI.ts`
6. **ai-lib** — `src/lib/ai.ts`
7. **speech** — `src/hooks/useSpeechRecognition.ts`
8. **ai-coach** — `src/hooks/useAICoach.ts`
9. **body-language** — `src/hooks/useBodyLanguage.ts`
10. **hooks** — remaining files in `src/hooks/` (useCallRecorder, useCallTimer, useToast, useAuth, useAppLanguage, any others)
11. **ui-components** — `src/components/ui/`, `src/components/cards/`, `src/components/ErrorBoundary.tsx`, `src/components/ThemeToggle.tsx`
12. **modals** — `src/components/CallWalkthroughModal.tsx`, `src/components/LoginTransitionOverlay.tsx`, their CSS files
13. **app-shell** — `src/components/layout/AppShell.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/StatusBar.tsx`, their CSS files
14. **transcript-panel** — `src/components/panels/TranscriptPanel.tsx` + its CSS
15. **ai-panel** — `src/components/panels/AIIntelligencePanel.tsx` + its CSS
16. **lead-panel** — `src/components/panels/LeadProfilePanel.tsx` + its CSS
17. **router** — `src/App.tsx`
18. **landing** — `src/screens/LandingScreen.tsx` + its CSS
19. **auth** — `src/screens/AuthScreen.tsx` + its CSS
20. **onboarding** — `src/screens/OnboardingScreen.tsx` + its CSS
21. **dashboard** — `src/screens/DashboardScreen.tsx` + its CSS
22. **pre-call** — `src/screens/PreCallScreen.tsx` + its CSS
23. **live-call** — `src/screens/LiveCallScreen.tsx` + its CSS
24. **post-call** — `src/screens/PostCallScreen.tsx` + its CSS
25. **analytics** — `src/screens/AnalyticsScreen.tsx` + its CSS
26. **leads** — `src/screens/LeadsScreen.tsx` + its CSS
27. **upload-call** — `src/screens/UploadCallScreen.tsx` + its CSS

---

## For each section, follow these steps

### A — Read
Read every file in the section in full. Use Glob to discover CSS files paired with a component if the exact filename is unknown.

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
- Styles that break under `[data-theme="light"]`
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

After all 27 sections are complete:

1. Run: `cd c:/Users/User/callassist && npm run build`
2. If it fails, read the errors, fix them, and re-run until clean
3. Output the full log of all sections with this header:

```
# Pitchbase — Full Automated Review Complete

Build: ✓ Clean / ✗ Errors remaining

---
<full per-section log>
---

## Summary
- Total issues fixed: N
- Total skipped (human judgement needed): N
- Sections with no issues: list them
```

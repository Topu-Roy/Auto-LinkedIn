# Route Context: /onboarding

## Purpose

4-step sequential onboarding wizard. Users MUST complete all steps before accessing the dashboard.

## Steps

1. **Auth** — Account creation via Better Auth (Email/Google/GitHub)
2. **Topics** — Pick 3-10 topics from curated list or add custom ones
3. **Voice Calibration** — Write tone description, paste example posts, Gemini generates live preview
4. **Cadence** — Set posting cadence and preferred time windows

## Convex Functions Used

- `mutations.userProfiles.createOrUpdate` — Step 1: Create profile
- `mutations.userProfiles.completeOnboarding` — Final step: Mark complete
- `mutations.topics.createMany` — Step 2: Bulk create topics
- `mutations.voice.createOrUpdate` — Step 3: Save voice profile
- `mutations.userProfiles.getCadence` — Step 4: Save cadence/time windows

## Key Components

- `components/onboarding/step-auth.tsx` — Auth step (handled by Better Auth)
- `components/onboarding/step-topics.tsx` — Topic selection with curated list
- `components/onboarding/step-voice.tsx` — Voice calibration with Gemini preview
- `components/onboarding/step-cadence.tsx` — Cadence and time window picker

## Data Flow

```
User completes step 1 → Create userProfiles
User completes step 2 → Create topics (3-10, Low/Med/High weight)
User completes step 3 → Create voiceProfile (toneDescription + examples)
User completes step 4 → Update cadence + timeWindows → Mark onboardingComplete = true
```

## Edge Cases & Constraints

- Steps are strictly sequential — cannot skip
- Must select 3-10 topics minimum
- Time windows must be valid (start < end)
- Voice preview requires Gemini API call on save
- After completion, redirect to /dashboard

## Related Files

- `app/onboarding/page.tsx` — Wizard orchestrator
- `convex/mutations/userProfiles.ts` — Profile mutations
- `convex/mutations/topics.ts` — Topic mutations
- `convex/mutations/voice.ts` — Voice mutations
- `convex/_lib/gemini.ts` — Gemini preview generation

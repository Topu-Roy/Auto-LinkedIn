# Route Context: /dashboard

## Purpose

Command center showing overview metrics, action-required alerts, and LinkedIn connection status.

## Key Features

- **Action Required Alerts** — Failed posts (3+ retries), LinkedIn token expiring/hard_expired. Persistent + snooze.
- **Overview Cards** — Pending drafts count, next scheduled post (countdown), posts published this week, content health indicator
- **LinkedIn Banner** — Connection status with reconnect button (shown if token expiring or disconnected)

## Convex Functions Used

- `queries.generatedDrafts.list` (pending_review) — Draft count
- `queries.postSchedule.getUpcoming` — Next scheduled post
- `queries.linkedinTokens.getByUserId` — Token status
- `queries.userProfiles.getByUserId` — User profile data

## Key Components

- `components/dashboard/action-required.tsx` — Persistent alerts with snooze
- `components/dashboard/overview-cards.tsx` — Metric cards with live data
- `components/dashboard/linkedin-banner.tsx` — LinkedIn connection status banner

## Data Flow

```
Page loads → Fetch user profile, token status, draft count, next scheduled post
Live queries → Real-time updates when new drafts arrive or status changes
Alerts → Shown if: tokenStatus = "expiring_soon" | "hard_expired" OR failed drafts exist
```

## Edge Cases & Constraints

- If onboardingComplete = false, redirect to /onboarding
- If tokenStatus = "hard_expired", pause discovery and show reconnect banner
- Countdown timer updates every second for next scheduled post
- Convex live queries for real-time badge updates

## Related Files

- `app/dashboard/page.tsx` — Dashboard page
- `components/dashboard/*` — Dashboard components
- `convex/queries/generatedDrafts.ts` — Draft data
- `convex/queries/linkedinTokens.ts` — Token data

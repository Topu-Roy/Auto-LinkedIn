# Route Context: /settings

## Purpose

User settings page managing profile, LinkedIn connection, voice & tone, and notifications.

## Key Sections

1. **Profile** — Name, timezone (IANA selector), language
2. **LinkedIn Connection** — OAuth status, reconnect/refresh button
3. **Voice & Tone** — Edit tone description, manage example posts
4. **Notifications** — In-app notification preferences (badge only)

## Convex Functions Used

- `queries.userProfiles.getByUserId` — Profile data
- `queries.voiceProfiles.getByUserId` — Voice profile data
- `queries.linkedinTokens.getByUserId` — Token status
- `mutations.userProfiles.createOrUpdate` — Update profile
- `mutations.voice.createOrUpdate` — Update voice profile
- `mutations.linkedinTokens.createOrUpdate` — Store new tokens

## Key Components

- Profile form (TanStack Form + Zod v4)
- LinkedIn connection status card
- Voice calibration editor
- Notification preferences

## Data Flow

```
Page loads → Fetch profile, voice profile, token status
Update profile → Patch userProfiles record
Update voice → Patch voiceProfiles record
Reconnect LinkedIn → Trigger Better Auth LinkedIn OAuth flow
```

## Edge Cases & Constraints

- Timezone uses IANA format (e.g., "America/New_York")
- LinkedIn reconnect triggers full OAuth re-authentication
- Voice changes affect future draft generation (not existing drafts)
- No email/push notifications — in-app badge only

## Related Files

- `app/settings/page.tsx` — Settings page
- `convex/mutations/userProfiles.ts` — Profile mutations
- `convex/mutations/voice.ts` — Voice mutations
- `convex/queries/linkedinTokens.ts` — Token queries
- `convex/betterAuth/auth.ts` — LinkedIn OAuth config

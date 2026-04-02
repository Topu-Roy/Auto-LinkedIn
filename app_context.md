# Auto-LinkedIn — App Context

> Master reference for the entire application. Updated as the project evolves.

---

## Project Overview

AI-powered LinkedIn auto-posting platform. Discovers relevant content, generates drafts with voice calibration, and publishes to LinkedIn on a user-defined schedule.

**Stack:** Next.js 16 + Convex + Better Auth + Gemini + NewsData.io + LinkedIn API + TanStack Query + Jotai + shadcn/ui

**Deployment:** Vercel (Next.js) + Convex Cloud

---

## Architecture Decisions

| Area | Decision |
| --- | --- |
| Auth | Better Auth with native LinkedIn social provider (r_liteprofile + w_member_social + r_basicprofile) |
| Content Discovery | NewsData.io API + custom RSS feeds per topic, every 6 hours during active windows only |
| AI Models | Gemini 2.0-flash for ALL: relevance scoring, draft generation, image generation |
| Post Format | Text (300-1000 chars) + 1 AI-generated image (1080x1080 square) |
| Image Storage | Convex file storage → public URL → LinkedIn |
| Draft Cap | 5 per user/day, max 50 pending in queue |
| Deduplication | URL + title fuzzy match |
| Scheduling | UTC storage, manual time pick, 15min min-future buffer, overlaps allowed |
| Publish Retry | 3 retries with exponential backoff, then failed |
| Token Health | 14-day warning + auto-refresh, 365-day hard expiry pauses pipeline |
| Onboarding | 4-step sequential (Auth → Topics → Voice → Cadence), cannot skip |
| Topics | 20 curated + custom, Low/Medium/High weight, pause stops all generation |
| Voice Calibration | Text description + pasted examples, live preview on save |
| Draft Actions | Approve As-Is, Edit & Approve (modal), Reject (reason required) |
| Calendar | Custom-built, Month + Week + Day views |
| Notifications | In-app badge only |
| Alerts | Persistent + snooze |
| UI | Fully responsive, dark/light toggle |
| Billing | Not yet |
| Security | Strict userId filtering, Convex secrets + AES encryption, per-user rate limits |
| Data Retention | Keep everything |

---

## Pipeline Flow

```
Every 6 hours (during user's active windows only):
  1. DISCOVERY: NewsData.io + RSS feeds → deduplicate (URL + title fuzzy) → relevance score (1-10) → queue items 4+
  2. GENERATE: 5 concurrent Gemini calls → drafts (pending_review) with AI confidence score (1-10)
  3. REVIEW: User approves/rejects/edits via /drafts
  4. SCHEDULE: User picks UTC time (>= now + 15min), creates postSchedule record
  5. PUBLISH: 5-min cron → LinkedIn API (text + image) → retry logic (3x exponential backoff)

Daily:
  - Token health check → refresh if < 14 days → hard_expire if 365 days → pauses pipeline

Every request:
  - ctx.auth.getUserIdentity() → filter by userId (strict tenant isolation)
```

---

## Environment Variables

```env
# Auth
BETTER_AUTH_SECRET=
SITE_URL=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=

# Social Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# AI & APIs
GEMINI_API_KEY=
NEWSDATA_API_KEY=

# Encryption
ENCRYPTION_KEY=
```

---

## Schema

### userProfiles

| Field              | Type    | Description                                        |
| ------------------ | ------- | -------------------------------------------------- |
| userId             | string  | Primary key, from auth                             |
| name               | string  | Display name                                       |
| timezone           | string  | IANA timezone (e.g., "America/New_York")           |
| language           | string  | Preferred language code                            |
| cadence            | string  | Posting frequency (daily, 3x/week, weekly, custom) |
| timeWindows        | array   | Preferred posting time windows [{start, end}]      |
| onboardingComplete | boolean | Whether 4-step onboarding is done                  |
| createdAt          | number  | Timestamp                                          |

### topics

| Field            | Type    | Description                            |
| ---------------- | ------- | -------------------------------------- | -------- | ------ |
| userId           | string  | Owner                                  |
| name             | string  | Topic name                             |
| weight           | string  | "Low"                                  | "Medium" | "High" |
| isActive         | boolean | Whether topic generates content        |
| isPaused         | boolean | User-paused (stops all generation)     |
| rssFeeds         | array   | Custom RSS feed URLs                   |
| newsDataCategory | string  | Mapped NewsData.io category            |
| generatedCount   | number  | Total drafts generated from this topic |
| createdAt        | number  | Timestamp                              |

### discoveredContent

| Field          | Type   | Description           |
| -------------- | ------ | --------------------- | -------- | --------- | ----------- |
| userId         | string | Owner                 |
| sourceUrl      | string | Original article URL  |
| title          | string | Article title         |
| summary        | string | AI summary            |
| relevanceScore | number | 1-10 relevance rating |
| topicId        | string | Associated topic      |
| status         | string | "queued"              | "pinned" | "skipped" | "generated" |
| discoveredAt   | number | Timestamp             |

### generatedDrafts

| Field           | Type   | Description                    |
| --------------- | ------ | ------------------------------ | ---------- | ---------- | ----------- | ------------ | ----------- | -------- |
| userId          | string | Owner                          |
| content         | string | Post text (300-1000 chars)     |
| imageFileId     | string | Convex file storage ID         |
| sourceArticleId | string | Link to discoveredContent      |
| confidenceScore | number | AI confidence 1-10             |
| status          | string | "pending_review"               | "approved" | "rejected" | "scheduled" | "publishing" | "published" | "failed" |
| scheduledAt     | number | UTC timestamp                  |
| retryCount      | number | Publish retry count            |
| linkedinPostId  | string | LinkedIn post ID after publish |
| voiceProfileId  | string | Associated voice calibration   |
| rejectionReason | string | Required on reject             |
| createdAt       | number | Timestamp                      |

### postSchedule

| Field       | Type   | Description             |
| ----------- | ------ | ----------------------- | ------------ | ----------- | -------- |
| userId      | string | Owner                   |
| draftId     | string | Link to generatedDrafts |
| scheduledAt | number | UTC timestamp           |
| status      | string | "queued"                | "publishing" | "published" | "failed" |

### linkedinTokens

| Field                 | Type   | Description            |
| --------------------- | ------ | ---------------------- | --------------- | ------------ | -------------- |
| userId                | string | Owner                  |
| encryptedAccessToken  | string | AES-256 encrypted      |
| encryptedRefreshToken | string | AES-256 encrypted      |
| expiresAt             | number | Token expiry timestamp |
| tokenStatus           | string | "active"               | "expiring_soon" | "refreshing" | "hard_expired" |
| lastRefreshedAt       | number | Last refresh timestamp |

### voiceProfiles

| Field              | Type   | Description                |
| ------------------ | ------ | -------------------------- |
| userId             | string | Owner                      |
| toneDescription    | string | User's tone description    |
| examplePosts       | array  | Pasted example posts       |
| geminiVoicePreview | string | AI-generated voice preview |

---

## Curated Topics (20)

1. Artificial Intelligence & Machine Learning
2. Software Engineering & Development
3. SaaS & Cloud Computing
4. Digital Marketing & Growth
5. Leadership & Management
6. Productivity & Time Management
7. Entrepreneurship & Startups
8. Product Management
9. Data Science & Analytics
10. Cybersecurity
11. Remote Work & Future of Work
12. Personal Branding
13. Sales & Business Development
14. UX/UI Design
15. Web3 & Blockchain
16. Fintech & Financial Technology
17. E-commerce & Retail Tech
18. HR & Talent Acquisition
19. Customer Success & Support
20. DevOps & Infrastructure

---

## File Structure

```
convex/
├── schema.ts                    # Full domain model
├── auth.ts                      # Auth queries
├── auth.config.ts               # Auth config
├── http.ts                      # HTTP endpoints (LinkedIn OAuth callback)
├── convex.config.ts             # App config
├── betterAuth/                  # Better Auth integration
├── _lib/
│   ├── encryption.ts            # AES token encryption
│   ├── newsdata.ts              # NewsData.io client
│   ├── linkedin.ts              # LinkedIn API client
│   └── gemini.ts                # Gemini API client
├── crons/
│   ├── discovery.ts             # Every 6 hours, active windows
│   ├── publish.ts               # Every 5 minutes
│   └── healthCheck.ts           # Daily token health
├── actions/
│   └── generate.ts              # Gemini: text + image generation
├── mutations/
│   ├── drafts.ts                # approve, reject, edit, schedule
│   ├── topics.ts                # CRUD, pause, weight
│   ├── voice.ts                 # calibration, preview
│   ├── linkedin.ts              # OAuth, token refresh
│   └── userProfiles.ts          # onboarding, settings
├── queries/
│   ├── dashboard.ts             # overview, alerts
│   ├── discover.ts              # discovered content
│   ├── drafts.ts                # draft queue
│   ├── schedule.ts              # calendar data
│   ├── history.ts               # published posts
│   └── topics.ts                # topic management

app/
├── page.tsx                     # Landing (static mockup)
├── layout.tsx                   # Root layout
├── onboarding/
│   ├── page.tsx                 # 4-step wizard
│   └── context.md               # Route context
├── dashboard/
│   ├── page.tsx                 # Command center
│   └── context.md               # Route context
├── discover/
│   ├── page.tsx                 # Content discovery
│   └── context.md               # Route context
├── drafts/
│   ├── page.tsx                 # Draft queue
│   └── context.md               # Route context
├── schedule/
│   ├── page.tsx                 # Custom calendar
│   └── context.md               # Route context
├── history/
│   ├── page.tsx                 # Card-based timeline
│   └── context.md               # Route context
├── topics/
│   ├── page.tsx                 # Topic management
│   └── context.md               # Route context
├── settings/
│   ├── page.tsx                 # Profile, LinkedIn, voice, notifications
│   └── context.md               # Route context
└── admin/                       # Existing admin panel

components/
├── layout/
│   ├── sidebar.tsx
│   └── topbar.tsx
├── onboarding/
│   ├── step-auth.tsx
│   ├── step-topics.tsx
│   ├── step-voice.tsx
│   └── step-cadence.tsx
├── dashboard/
│   ├── action-required.tsx
│   ├── overview-cards.tsx
│   └── linkedin-banner.tsx
├── drafts/
│   ├── draft-card.tsx
│   ├── draft-edit-modal.tsx
│   └── datetime-picker.tsx
├── schedule/
│   ├── calendar.tsx
│   └── calendar-sidebar.tsx
├── discover/
│   ├── content-card.tsx
│   └── relevance-badge.tsx
├── history/
│   └── post-timeline.tsx
├── topics/
│   ├── topic-card.tsx
│   └── weight-selector.tsx
└── shared/
    ├── status-badge.tsx
    ├── confidence-meter.tsx
    └── countdown-timer.tsx
```

---

## Code Conventions (nextjs-react-best-practices)

- **React Compiler active** — NO manual `useMemo`/`useCallback`/`React.memo`
- **Feature-based structure** — co-locate by domain
- **TanStack Query** — reusable hooks, call in child components
- **TanStack Form + Zod v4** — all forms, import from `"zod/v4"`
- **Jotai** — shared state, no prop drilling
- **Skeletons** for content, **spinners** for actions
- **Ternary + null** for conditionals (no `&&`)
- **"use client"** as deep as possible
- **Descriptive naming** — intention-revealing variables
- **JSDoc** on utility functions
- **Accessibility** — semantic HTML, labels, alt text, focus outlines
- **type** for component props (not interface)
- **Stable unique keys** — never index

---

## Implementation Status

| Phase               | Status      | Notes                                                 |
| ------------------- | ----------- | ----------------------------------------------------- |
| 0: Foundation       | In Progress | Schema, auth, encryption                              |
| 1: Pipeline Backend | Pending     | Crons, actions, mutations                             |
| 2: Frontend Core    | Pending     | Layout, landing, onboarding, dashboard                |
| 3: Feature Pages    | Pending     | Discover, drafts, schedule, history, topics, settings |
| 4: Polish           | Pending     | Dark/light, mobile, rate limits, error handling       |

---

## Route Context Files

Each route has its own `context.md` with:

- Purpose and responsibilities
- Convex queries/mutations used
- Key components and props
- Data flow
- Edge cases and constraints
- Related files

See individual route directories for their context files.

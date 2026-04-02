# Route Context: /schedule

## Purpose

Calendar view showing approved posts queued for publication. Drag to reschedule. Sidebar shows list queue.

## Key Features

- Custom-built calendar with Month, Week, and Day views
- Drag-and-drop to reschedule posts
- Sidebar shows upcoming scheduled posts as a list
- All times displayed and stored in UTC

## Convex Functions Used

- `queries.postSchedule.listByUser` — Get scheduled posts
- `mutations.postSchedule.reschedule` — Update scheduled time
- `mutations.generatedDrafts.list` — Get scheduled drafts

## Key Components

- `components/schedule/calendar.tsx` — Custom calendar component
- `components/schedule/calendar-sidebar.tsx` — Upcoming posts sidebar list

## Data Flow

```
Page loads → Fetch postSchedule where status = "queued" or "scheduled"
Calendar renders → Events mapped from scheduled posts
Drag to reschedule → Update scheduledAt → Backend validates >= now + 15min
Sidebar shows → Chronological list of upcoming posts
```

## Edge Cases & Constraints

- All times in UTC (user converts mentally from their timezone)
- Backend validates scheduledAt >= now + 15 minutes
- Overlapping posts are ALLOWED (no double-booking prevention)
- Drag-and-drop must update both postSchedule and generatedDrafts records
- Month/Week/Day view toggle
- Empty state: "No posts scheduled"

## Related Files

- `app/schedule/page.tsx` — Schedule page
- `components/schedule/*` — Schedule components
- `convex/queries/postSchedule.ts` — Schedule queries
- `convex/mutations/drafts.ts` — Draft scheduling mutations

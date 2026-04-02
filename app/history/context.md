# Route Context: /history

## Purpose

Read-only log of published posts with LinkedIn post IDs and live links. Card-based timeline layout.

## Key Features

- Card-based timeline showing published posts chronologically
- Each card shows: post content preview, publish date, LinkedIn post ID, live link
- No editing or deletion — read-only
- Filter by date range

## Convex Functions Used

- `queries.generatedDrafts.listPublished` — Get published drafts
- `queries.postSchedule.listPublished` — Get published schedule records

## Key Components

- `components/history/post-timeline.tsx` — Card-based timeline layout

## Data Flow

```
Page loads → Fetch generatedDrafts where status = "published"
Render timeline → Cards ordered by scheduledAt (desc)
Each card shows → Content preview, date, LinkedIn ID, live link
```

## Edge Cases & Constraints

- Read-only — no mutations allowed
- LinkedIn live link format: `https://www.linkedin.com/feed/update/{linkedinPostId}`
- Empty state: "No published posts yet"
- Filter by date range (optional)
- Engagement metrics NOT included (basic info only)

## Related Files

- `app/history/page.tsx` — History page
- `components/history/post-timeline.tsx` — Timeline component
- `convex/queries/generatedDrafts.ts` — Published draft queries

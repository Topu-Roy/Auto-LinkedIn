# Route Context: /discover

## Purpose

Shows raw discovered content from NewsData.io/RSS by topic. Users can pin, skip, or manually trigger post generation.

## Key Features

- Content cards grouped by topic
- Each card shows: source, headline, AI summary, relevance score (1-10)
- Actions: Pin → Generate, Skip → Hide, Generate Now

## Convex Functions Used

- `queries.discoveredContent.listByUser` — Get discovered content
- `mutations.discoveredContent.pin` — Pin for generation
- `mutations.discoveredContent.skip` — Hide content
- `mutations.discoveredContent.generateNow` — Trigger immediate draft generation

## Key Components

- `components/discover/content-card.tsx` — Individual content card
- `components/discover/relevance-badge.tsx` — Relevance score visual indicator

## Data Flow

```
Page loads → Fetch discoveredContent filtered by userId
User pins → Status changes to "pinned" → Triggers generation
User skips → Status changes to "skipped" → Hidden from view
User generates now → Calls Gemini to create draft → Status = "generated"
```

## Edge Cases & Constraints

- Only show items with status = "queued" or "pinned"
- Respect 5 drafts/day cap when generating manually
- Relevance score displayed as color-coded badge (1-3: red, 4-6: yellow, 7-10: green)
- Empty state shows "No new content discovered"

## Related Files

- `app/discover/page.tsx` — Discover page
- `components/discover/*` — Discover components
- `convex/queries/discoveredContent.ts` — Content queries
- `convex/_lib/newsdata.ts` — NewsData.io client

# Route Context: /topics

## Purpose

Manages interest areas and RSS feeds. Users can pause topics, adjust weights, and track generation volume.

## Key Features

- Topic cards showing name, weight (Low/Med/High), status (active/paused)
- Pause toggle — stops ALL generation for that topic
- Weight selector — Low/Medium/High
- RSS feed management — add/remove custom RSS URLs per topic
- Generation volume tracking — shows total drafts generated per topic

## Convex Functions Used

- `queries.topics.list` — Get all user topics
- `mutations.topics.update` — Update topic (pause, weight, RSS feeds)
- `mutations.topics.remove` — Delete topic
- `mutations.topics.create` — Add new topic

## Key Components

- `components/topics/topic-card.tsx` — Topic card with controls
- `components/topics/weight-selector.tsx` — Low/Med/High weight selector

## Data Flow

```
Page loads → Fetch topics for user
Pause topic → isPaused = true → Discovery cron skips this topic
Adjust weight → Update weight field → Affects generation priority
Add RSS feed → Add URL to rssFeeds array
Delete topic → Remove topic and associated discovered content
```

## Edge Cases & Constraints

- Paused topics are completely skipped in discovery (no content generated)
- Weight affects generation priority but doesn't guarantee order
- RSS feeds are optional — NewsData.io is the primary source
- Topic deletion cascades to associated discoveredContent
- Minimum 3 active topics recommended for content diversity

## Related Files

- `app/topics/page.tsx` — Topics page
- `components/topics/*` — Topic components
- `convex/mutations/topics.ts` — Topic mutations
- `convex/queries/topics.ts` — Topic queries

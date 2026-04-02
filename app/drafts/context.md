# Route Context: /drafts

## Purpose

Queue of AI-generated posts awaiting user decision. Shows draft text, source article, confidence score, and actions.

## Key Features

- Draft cards with content preview, source link, confidence score (1-10)
- Actions: Approve As-Is, Edit & Approve (modal), Reject (reason required)
- Edit modal allows editing both text and regenerating image
- Datetime picker for scheduling (past dates disabled, min 15min in future)

## Convex Functions Used

- `queries.generatedDrafts.list` — Get pending_review drafts
- `mutations.drafts.approve` — Approve with scheduled time
- `mutations.drafts.approveAsIs` — Approve without scheduling
- `mutations.drafts.reject` — Reject with required reason
- `mutations.drafts.edit` — Edit draft content

## Key Components

- `components/drafts/draft-card.tsx` — Draft preview card
- `components/drafts/draft-edit-modal.tsx` — Full edit modal (text + image)
- `components/drafts/datetime-picker.tsx` — Date/time picker with past-date validation

## Data Flow

```
Page loads → Fetch generatedDrafts where status = "pending_review"
Approve As-Is → Status = "approved"
Edit & Approve → Edit content → Status = "approved" → Show datetime picker → Status = "scheduled"
Reject → Status = "rejected" + rejectionReason (required)
```

## Edge Cases & Constraints

- Datetime picker MUST disable past dates/times
- Scheduled time must be >= now + 15 minutes (backend validation)
- Rejection reason is REQUIRED
- Edit modal allows both text editing and image regeneration
- Max 50 pending drafts cap
- Empty state: "No drafts pending review"

## Related Files

- `app/drafts/page.tsx` — Drafts page
- `components/drafts/*` — Draft components
- `convex/mutations/drafts.ts` — Draft mutations
- `convex/queries/generatedDrafts.ts` — Draft queries

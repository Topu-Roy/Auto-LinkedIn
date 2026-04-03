"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { Check, Edit2, X } from "lucide-react"
import { toast } from "sonner"
import { ERRORS, TIME } from "@/lib/config"
import { ConfidenceMeter } from "@/components/shared/confidence-meter"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const MIN_SCHEDULE_OFFSET = TIME.MIN_SCHEDULE_OFFSET_MS

export default function DraftsPage() {
  const drafts = useQuery(api.queries.drafts.list)
  const approve = useMutation(api.mutations.drafts.approve)
  const reject = useMutation(api.mutations.drafts.reject)
  const editDraft = useMutation(api.mutations.drafts.edit)

  const [editingDraft, setEditingDraft] = useState<Id<"generatedDrafts"> | null>(null)
  const [editContent, setEditContent] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectingDraft, setRejectingDraft] = useState<Id<"generatedDrafts"> | null>(null)
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({})
  const [minDate] = useState(() => new Date(Date.now() + MIN_SCHEDULE_OFFSET).toISOString().slice(0, 16))

  const handleApprove = async (id: Id<"generatedDrafts">) => {
    const scheduleDate = scheduleDates[id]
    if (!scheduleDate) {
      toast.error("Please select a scheduled time")
      return
    }

    const scheduledAt = new Date(scheduleDate).getTime()
    const minTime = Date.now() + MIN_SCHEDULE_OFFSET

    if (scheduledAt < minTime) {
      toast.error(ERRORS.SCHEDULE_TOO_SOON)
      return
    }

    try {
      await approve({ id, scheduledAt })
      toast.success("Draft approved and scheduled")
      setScheduleDates(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch {
      toast.error("Failed to approve draft")
    }
  }

  const handleReject = async (id: Id<"generatedDrafts">) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    try {
      await reject({ id, reason: rejectionReason.trim() })
      toast.success("Draft rejected")
      setRejectionReason("")
      setRejectingDraft(null)
    } catch {
      toast.error("Failed to reject draft")
    }
  }

  const handleEditSave = async (id: Id<"generatedDrafts">) => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty")
      return
    }

    try {
      await editDraft({ id, content: editContent.trim() })
      toast.success("Draft updated")
      setEditingDraft(null)
    } catch {
      toast.error("Failed to update draft")
    }
  }

  const openEditModal = (id: Id<"generatedDrafts">, content: string) => {
    setEditingDraft(id)
    setEditContent(content)
  }

  const openRejectModal = (id: Id<"generatedDrafts">) => {
    setRejectingDraft(id)
    setRejectionReason("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
        <p className="text-muted-foreground">AI-generated posts awaiting your review.</p>
      </div>

      {drafts?.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium">No drafts pending review</p>
          <p className="text-sm">New drafts will appear here when generated.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts?.map(draft => (
            <Card key={draft._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">Draft #{draft._id.slice(0, 8)}</CardTitle>
                    <div className="mt-1 flex items-center gap-3">
                      <StatusBadge status={draft.status} />
                      <ConfidenceMeter score={draft.confidenceScore} size="sm" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">{draft.content}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(draft._id, draft.content)}>
                    <Edit2 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(draft._id)}>
                    <Check className="mr-1 h-3 w-3" />
                    Approve & Schedule
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => openRejectModal(draft._id)}>
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Label htmlFor={`schedule-${draft._id}`} className="text-sm">
                    Schedule:
                  </Label>
                  <input
                    id={`schedule-${draft._id}`}
                    type="datetime-local"
                    value={scheduleDates[draft._id] ?? ""}
                    onChange={e => setScheduleDates(prev => ({ ...prev, [draft._id]: e.target.value }))}
                    min={minDate}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editingDraft !== null} onOpenChange={() => setEditingDraft(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Draft</DialogTitle>
            <DialogDescription>
              Make changes to the post content. Saving will mark it as approved.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={10}
            className="text-sm leading-relaxed"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDraft(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingDraft && handleEditSave(editingDraft)}>Save & Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectingDraft !== null} onOpenChange={() => setRejectingDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Draft</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this draft. This helps improve future generation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="e.g., Tone doesn't match, content not relevant, etc."
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingDraft(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectingDraft && handleReject(rejectingDraft)}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

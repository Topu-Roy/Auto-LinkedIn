import { v } from "convex/values"
import { DRAFT_STATUS, ERRORS, SCHEDULE_STATUS, TIME } from "@/lib/config"
import { mutation, query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", DRAFT_STATUS.PENDING_REVIEW))
      .order("desc")
      .collect()
  },
})

export const approve = mutation({
  args: {
    id: v.id("generatedDrafts"),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error(ERRORS.DRAFT_NOT_FOUND)

    if (args.scheduledAt <= Date.now() + TIME.MIN_SCHEDULE_OFFSET_MS) {
      throw new Error(ERRORS.SCHEDULE_TOO_SOON)
    }

    await ctx.db.patch("generatedDrafts", args.id, {
      status: DRAFT_STATUS.SCHEDULED,
      scheduledAt: args.scheduledAt,
    })

    await ctx.db.insert("postSchedule", {
      userId,
      draftId: args.id,
      scheduledAt: args.scheduledAt,
      status: SCHEDULE_STATUS.QUEUED,
    })
  },
})

export const reject = mutation({
  args: {
    id: v.id("generatedDrafts"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error(ERRORS.DRAFT_NOT_FOUND)

    await ctx.db.patch("generatedDrafts", args.id, {
      status: DRAFT_STATUS.REJECTED,
      rejectionReason: args.reason,
    })
  },
})

export const edit = mutation({
  args: {
    id: v.id("generatedDrafts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error(ERRORS.DRAFT_NOT_FOUND)

    await ctx.db.patch("generatedDrafts", args.id, {
      content: args.content,
    })
  },
})

export const approveAsIs = mutation({
  args: {
    id: v.id("generatedDrafts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error(ERRORS.DRAFT_NOT_FOUND)

    await ctx.db.patch("generatedDrafts", args.id, {
      status: DRAFT_STATUS.APPROVED,
    })
  },
})

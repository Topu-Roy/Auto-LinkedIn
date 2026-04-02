import { v } from "convex/values"
import { mutation, query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", "pending_review"))
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
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error("Draft not found")

    if (args.scheduledAt <= Date.now() + 15 * 60 * 1000) {
      throw new Error("Scheduled time must be at least 15 minutes in the future")
    }

    await ctx.db.patch("generatedDrafts", args.id, {
      status: "scheduled",
      scheduledAt: args.scheduledAt,
    })

    await ctx.db.insert("postSchedule", {
      userId,
      draftId: args.id,
      scheduledAt: args.scheduledAt,
      status: "queued",
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
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error("Draft not found")

    await ctx.db.patch("generatedDrafts", args.id, {
      status: "rejected",
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
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error("Draft not found")

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
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    const draft = await ctx.db.get("generatedDrafts", args.id)
    if (draft?.userId !== userId) throw new Error("Draft not found")

    await ctx.db.patch("generatedDrafts", args.id, {
      status: "approved",
    })
  },
})

import { v } from "convex/values"
import { internalMutation, internalQuery } from "../_generated/server"

export const getDueForPublish = internalQuery({
  args: {},
  handler: async ctx => {
    const now = Date.now()

    const allQueued = await ctx.db
      .query("postSchedule")
      .filter(q => q.eq(q.field("status"), "queued"))
      .collect()

    return allQueued.filter(item => item.scheduledAt <= now)
  },
})

export const markPublishing = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: "publishing" })
  },
})

export const markPublished = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: "published" })
  },
})

export const markFailed = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: "failed" })
  },
})

export const scheduleRetry = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: "queued" })
  },
})

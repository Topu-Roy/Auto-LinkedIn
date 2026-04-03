import { v } from "convex/values"
import { SCHEDULE_STATUS } from "@/lib/config"
import { internalMutation, internalQuery } from "../_generated/server"

export const getDueForPublish = internalQuery({
  args: {},
  handler: async ctx => {
    const now = Date.now()

    const allQueued = await ctx.db
      .query("postSchedule")
      .filter(q => q.eq(q.field("status"), SCHEDULE_STATUS.QUEUED))
      .collect()

    return allQueued.filter(item => item.scheduledAt <= now)
  },
})

export const markPublishing = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: SCHEDULE_STATUS.PUBLISHING })
  },
})

export const markPublished = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: SCHEDULE_STATUS.PUBLISHED })
  },
})

export const markFailed = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: SCHEDULE_STATUS.FAILED })
  },
})

export const scheduleRetry = internalMutation({
  args: { id: v.id("postSchedule") },
  handler: async (ctx, args) => {
    await ctx.db.patch("postSchedule", args.id, { status: SCHEDULE_STATUS.QUEUED })
  },
})

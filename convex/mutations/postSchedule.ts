import { v } from "convex/values"
import { SCHEDULE_STATUS } from "@/lib/config"
import { internalMutation } from "../_generated/server"

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

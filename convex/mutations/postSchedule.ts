import { v } from "convex/values"
import { internalMutation } from "../_generated/server"

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

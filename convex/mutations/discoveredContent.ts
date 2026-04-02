import { v } from "convex/values"
import { internalMutation } from "../_generated/server"

export const create = internalMutation({
  args: {
    userId: v.string(),
    sourceUrl: v.string(),
    title: v.string(),
    summary: v.string(),
    relevanceScore: v.number(),
    topicId: v.optional(v.id("topics")),
    status: v.union(v.literal("queued"), v.literal("pinned"), v.literal("skipped"), v.literal("generated")),
    discoveredAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discoveredContent", args)
  },
})

export const markGenerated = internalMutation({
  args: { id: v.id("discoveredContent") },
  handler: async (ctx, args) => {
    await ctx.db.patch("discoveredContent", args.id, { status: "generated" })
  },
})

import { v } from "convex/values"
import { DISCOVERY_STATUS } from "@/lib/config"
import { internalMutation } from "../_generated/server"

export const create = internalMutation({
  args: {
    userId: v.string(),
    sourceUrl: v.string(),
    title: v.string(),
    summary: v.string(),
    relevanceScore: v.number(),
    topicId: v.optional(v.id("topics")),
    status: v.union(
      v.literal(DISCOVERY_STATUS.QUEUED),
      v.literal(DISCOVERY_STATUS.PINNED),
      v.literal(DISCOVERY_STATUS.SKIPPED),
      v.literal(DISCOVERY_STATUS.GENERATED)
    ),
    discoveredAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discoveredContent", args)
  },
})

export const markGenerated = internalMutation({
  args: { id: v.id("discoveredContent") },
  handler: async (ctx, args) => {
    await ctx.db.patch("discoveredContent", args.id, { status: DISCOVERY_STATUS.GENERATED })
  },
})

import { v } from "convex/values"
import { DISCOVERY_STATUS, TIME } from "@/lib/config"
import { internalMutation, internalQuery } from "../_generated/server"

export const getByUrl = internalQuery({
  args: { userId: v.string(), sourceUrl: v.string() },
  handler: async (ctx, args) => {
    const fourteenDaysAgo = Date.now() - TIME.FOURTEEN_DAYS_MS

    return await ctx.db
      .query("discoveredContent")
      .withIndex("userId_sourceUrl", q => q.eq("userId", args.userId).eq("sourceUrl", args.sourceUrl))
      .filter(q => q.gt(q.field("discoveredAt"), fourteenDaysAgo))
      .first()
  },
})

export const getQueuedForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discoveredContent")
      .withIndex("userId_status", q => q.eq("userId", args.userId).eq("status", DISCOVERY_STATUS.QUEUED))
      .collect()
  },
})

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

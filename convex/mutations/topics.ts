import { v } from "convex/values"
import { mutation, query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("topics")
      .withIndex("userId", q => q.eq("userId", userId))
      .collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    weight: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    newsDataCategory: v.optional(v.string()),
    rssFeeds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    return await ctx.db.insert("topics", {
      userId,
      name: args.name,
      weight: args.weight,
      isActive: true,
      isPaused: false,
      newsDataCategory: args.newsDataCategory,
      rssFeeds: args.rssFeeds,
      generatedCount: 0,
      createdAt: Date.now(),
    })
  },
})

export const createMany = mutation({
  args: {
    topics: v.array(
      v.object({
        name: v.string(),
        weight: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
        newsDataCategory: v.optional(v.string()),
        rssFeeds: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject
    const now = Date.now()

    const ids = await Promise.all(
      args.topics.map(topic =>
        ctx.db.insert("topics", {
          userId,
          name: topic.name,
          weight: topic.weight,
          isActive: true,
          isPaused: false,
          newsDataCategory: topic.newsDataCategory,
          rssFeeds: topic.rssFeeds,
          generatedCount: 0,
          createdAt: now,
        })
      )
    )

    return ids
  },
})

export const update = mutation({
  args: {
    id: v.id("topics"),
    name: v.optional(v.string()),
    weight: v.optional(v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"))),
    isActive: v.optional(v.boolean()),
    isPaused: v.optional(v.boolean()),
    rssFeeds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject
    const { id, ...updates } = args

    const topic = await ctx.db.get("topics", id)
    if (topic?.userId !== userId) throw new Error("Topic not found")

    await ctx.db.patch("topics", id, updates)
  },
})

export const remove = mutation({
  args: {
    id: v.id("topics"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const userId = identity.subject

    const topic = await ctx.db.get("topics", args.id)
    if (topic?.userId !== userId) throw new Error("Topic not found")

    await ctx.db.delete("topics", args.id)
  },
})

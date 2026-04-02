import { v } from "convex/values"
import { internalMutation, internalQuery } from "../_generated/server"

export const getTodayCount = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const drafts = await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_createdAt", q => q.eq("userId", args.userId))
      .filter(q => q.gt(q.field("createdAt"), startOfDay.getTime()))
      .collect()

    return drafts.length
  },
})

export const getById = internalQuery({
  args: { id: v.id("generatedDrafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get("generatedDrafts", args.id)
  },
})

export const createFromDiscovery = internalMutation({
  args: {
    userId: v.string(),
    content: v.string(),
    sourceArticleId: v.optional(v.id("discoveredContent")),
    confidenceScore: v.number(),
    voiceProfileId: v.optional(v.id("voiceProfiles")),
    imageFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedDrafts", {
      ...args,
      status: "pending_review",
      retryCount: 0,
      createdAt: Date.now(),
    })
  },
})

export const markPublishing = internalMutation({
  args: { id: v.id("generatedDrafts") },
  handler: async (ctx, args) => {
    await ctx.db.patch("generatedDrafts", args.id, { status: "publishing" })
  },
})

export const markPublished = internalMutation({
  args: { id: v.id("generatedDrafts"), linkedinPostId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch("generatedDrafts", args.id, {
      status: "published",
      linkedinPostId: args.linkedinPostId,
    })
  },
})

export const markFailed = internalMutation({
  args: { id: v.id("generatedDrafts") },
  handler: async (ctx, args) => {
    await ctx.db.patch("generatedDrafts", args.id, { status: "failed" })
  },
})

export const scheduleRetry = internalMutation({
  args: { id: v.id("generatedDrafts"), retryCount: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch("generatedDrafts", args.id, {
      status: "scheduled",
      retryCount: args.retryCount,
    })
  },
})

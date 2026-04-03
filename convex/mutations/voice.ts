import { v } from "convex/values"
import { ERRORS } from "@/lib/config"
import { mutation, query } from "../_generated/server"

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject

    return await ctx.db
      .query("voiceProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()
  },
})

export const createOrUpdate = mutation({
  args: {
    toneDescription: v.string(),
    examplePosts: v.optional(v.array(v.string())),
    geminiVoicePreview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const existing = await ctx.db
      .query("voiceProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()

    if (existing) {
      await ctx.db.patch("voiceProfiles", existing._id, {
        toneDescription: args.toneDescription,
        examplePosts: args.examplePosts,
        geminiVoicePreview: args.geminiVoicePreview,
      })
      return existing._id
    }

    return await ctx.db.insert("voiceProfiles", {
      userId,
      toneDescription: args.toneDescription,
      examplePosts: args.examplePosts,
      geminiVoicePreview: args.geminiVoicePreview,
    })
  },
})

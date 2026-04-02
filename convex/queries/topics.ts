import { v } from "convex/values"
import { internalQuery, query } from "../_generated/server"

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

export const getActiveForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("topics")
      .withIndex("userId_isActive_isPaused", q =>
        q.eq("userId", args.userId).eq("isActive", true).eq("isPaused", false)
      )
      .collect()
  },
})

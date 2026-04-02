import { v } from "convex/values"
import { internalQuery } from "../_generated/server"

export const getAllForDiscovery = internalQuery({
  args: {},
  handler: async ctx => {
    return await ctx.db.query("userProfiles").collect()
  },
})

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("userId", q => q.eq("userId", args.userId))
      .first()
  },
})

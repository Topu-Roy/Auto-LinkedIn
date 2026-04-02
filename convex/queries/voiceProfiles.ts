import { v } from "convex/values"
import { internalQuery } from "../_generated/server"

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceProfiles")
      .withIndex("userId", q => q.eq("userId", args.userId))
      .first()
  },
})

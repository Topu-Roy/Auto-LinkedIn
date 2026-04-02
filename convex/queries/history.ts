import { query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", "published"))
      .order("desc")
      .collect()
  },
})

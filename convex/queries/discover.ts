import { query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("discoveredContent")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", "queued"))
      .order("desc")
      .collect()
  },
})

export const listPinned = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("discoveredContent")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", "pinned"))
      .collect()
  },
})

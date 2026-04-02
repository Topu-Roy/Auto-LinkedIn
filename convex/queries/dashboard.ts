import { query } from "../_generated/server"

export const getFailedPosts = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", "failed"))
      .collect()
  },
})

export const getNextScheduledPost = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject
    const now = Date.now()

    const all = await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_scheduledAt", q => q.eq("userId", userId))
      .order("asc")
      .collect()

    const upcoming = all.filter(
      item => item.scheduledAt !== undefined && item.scheduledAt > now && item.status === "scheduled"
    )
    return upcoming[0] ?? null
  },
})

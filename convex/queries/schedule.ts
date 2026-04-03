import { SCHEDULE_STATUS } from "@/lib/config"
import { query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("postSchedule")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", SCHEDULE_STATUS.QUEUED))
      .order("asc")
      .collect()
  },
})

export const listAll = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("postSchedule")
      .withIndex("userId_scheduledAt", q => q.eq("userId", userId))
      .order("asc")
      .collect()
  },
})

export const getNext = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject
    const now = Date.now()

    const all = await ctx.db
      .query("postSchedule")
      .withIndex("userId_scheduledAt", q => q.eq("userId", userId))
      .order("asc")
      .collect()

    const upcoming = all.filter(item => item.scheduledAt > now && item.status === SCHEDULE_STATUS.QUEUED)
    return upcoming[0] ?? null
  },
})

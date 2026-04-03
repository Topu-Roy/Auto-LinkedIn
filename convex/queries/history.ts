import { DRAFT_STATUS } from "@/lib/config"
import { query } from "../_generated/server"

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const userId = identity.subject

    return await ctx.db
      .query("generatedDrafts")
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", DRAFT_STATUS.PUBLISHED))
      .order("desc")
      .collect()
  },
})

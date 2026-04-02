import { query } from "../_generated/server"

export const getTokenStatus = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject

    const token = await ctx.db
      .query("linkedinTokens")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()

    return token?.tokenStatus ?? null
  },
})

export const getProfile = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject

    return await ctx.db
      .query("userProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()
  },
})

export const getVoiceProfile = query({
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

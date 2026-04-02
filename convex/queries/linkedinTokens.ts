import { v } from "convex/values"
import { internalMutation, internalQuery } from "../_generated/server"

export const getByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("linkedinTokens")
      .withIndex("userId", q => q.eq("userId", args.userId))
      .first()
  },
})

export const getAll = internalQuery({
  args: {},
  handler: async ctx => {
    return await ctx.db.query("linkedinTokens").collect()
  },
})

export const createOrUpdate = internalMutation({
  args: {
    userId: v.string(),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("linkedinTokens")
      .withIndex("userId", q => q.eq("userId", args.userId))
      .first()

    if (existing) {
      await ctx.db.patch("linkedinTokens", existing._id, {
        encryptedAccessToken: args.encryptedAccessToken,
        encryptedRefreshToken: args.encryptedRefreshToken,
        expiresAt: args.expiresAt,
        tokenStatus: "active",
        lastRefreshedAt: Date.now(),
      })
      return existing._id
    }

    return await ctx.db.insert("linkedinTokens", {
      userId: args.userId,
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      expiresAt: args.expiresAt,
      tokenStatus: "active",
      lastRefreshedAt: Date.now(),
    })
  },
})

export const markHardExpired = internalMutation({
  args: { id: v.id("linkedinTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch("linkedinTokens", args.id, { tokenStatus: "hard_expired" })
  },
})

export const markExpiringSoon = internalMutation({
  args: { id: v.id("linkedinTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch("linkedinTokens", args.id, { tokenStatus: "expiring_soon" })
  },
})

export const updateAfterRefresh = internalMutation({
  args: {
    id: v.id("linkedinTokens"),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.optional(v.string()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { encryptedRefreshToken, ...rest } = args

    await ctx.db.patch("linkedinTokens", args.id, {
      ...rest,
      tokenStatus: "active",
      lastRefreshedAt: Date.now(),
      ...(encryptedRefreshToken ? { encryptedRefreshToken } : {}),
    })
  },
})

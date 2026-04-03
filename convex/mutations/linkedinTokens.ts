import { v } from "convex/values"
import { TOKEN_STATUS } from "@/lib/config"
import { internalMutation } from "../_generated/server"

export const markHardExpired = internalMutation({
  args: { id: v.id("linkedinTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch("linkedinTokens", args.id, { tokenStatus: TOKEN_STATUS.HARD_EXPIRED })
  },
})

export const markExpiringSoon = internalMutation({
  args: { id: v.id("linkedinTokens") },
  handler: async (ctx, args) => {
    await ctx.db.patch("linkedinTokens", args.id, { tokenStatus: TOKEN_STATUS.EXPIRING_SOON })
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
      tokenStatus: TOKEN_STATUS.ACTIVE,
      lastRefreshedAt: Date.now(),
      ...(encryptedRefreshToken ? { encryptedRefreshToken } : {}),
    })
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
        tokenStatus: TOKEN_STATUS.ACTIVE,
        lastRefreshedAt: Date.now(),
      })
      return existing._id
    }

    return await ctx.db.insert("linkedinTokens", {
      userId: args.userId,
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      expiresAt: args.expiresAt,
      tokenStatus: TOKEN_STATUS.ACTIVE,
      lastRefreshedAt: Date.now(),
    })
  },
})

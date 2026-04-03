import { v } from "convex/values"
import { DEFAULTS, ERRORS } from "@/lib/config"
import { mutation } from "../_generated/server"

export const createOrUpdate = mutation({
  args: {
    name: v.string(),
    timezone: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()

    if (existing) {
      await ctx.db.patch("userProfiles", existing._id, {
        name: args.name,
        timezone: args.timezone,
        language: args.language,
      })
      return existing._id
    }

    return await ctx.db.insert("userProfiles", {
      userId,
      name: args.name,
      timezone: args.timezone,
      language: args.language,
      onboardingComplete: DEFAULTS.ONBOARDING_COMPLETE,
      createdAt: Date.now(),
    })
  },
})

export const completeOnboarding = mutation({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()

    if (!profile) throw new Error(ERRORS.USER_PROFILE_NOT_FOUND)

    await ctx.db.patch("userProfiles", profile._id, {
      onboardingComplete: true,
    })
  },
})

export const getCadence = mutation({
  args: {
    cadence: v.string(),
    timeWindows: v.array(v.object({ start: v.string(), end: v.string() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error(ERRORS.UNAUTHENTICATED)

    const userId = identity.subject

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", q => q.eq("userId", userId))
      .first()

    if (!profile) throw new Error(ERRORS.USER_PROFILE_NOT_FOUND)

    await ctx.db.patch("userProfiles", profile._id, {
      cadence: args.cadence,
      timeWindows: args.timeWindows,
    })

    return profile._id
  },
})

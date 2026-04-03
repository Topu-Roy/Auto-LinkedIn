import { v } from "convex/values"
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
      .withIndex("userId_status", q => q.eq("userId", userId).eq("status", DRAFT_STATUS.PENDING_REVIEW))
      .order("desc")
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
      .query("generatedDrafts")
      .withIndex("userId_createdAt", q => q.eq("userId", userId))
      .order("desc")
      .collect()
  },
})

export const getById = query({
  args: { id: v.id("generatedDrafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const userId = identity.subject
    const draft = await ctx.db.get("generatedDrafts", args.id)

    if (draft?.userId !== userId) return null
    return draft
  },
})

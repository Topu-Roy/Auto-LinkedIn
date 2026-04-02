import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const tables = {
  userProfiles: defineTable({
    userId: v.string(),
    name: v.string(),
    timezone: v.string(),
    language: v.optional(v.string()),
    cadence: v.optional(v.string()),
    timeWindows: v.optional(v.array(v.object({ start: v.string(), end: v.string() }))),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("onboardingComplete", ["onboardingComplete"]),

  topics: defineTable({
    userId: v.string(),
    name: v.string(),
    weight: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    isActive: v.boolean(),
    isPaused: v.boolean(),
    rssFeeds: v.optional(v.array(v.string())),
    newsDataCategory: v.optional(v.string()),
    generatedCount: v.number(),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("userId_isActive_isPaused", ["userId", "isActive", "isPaused"])
    .index("userId_newsDataCategory", ["userId", "newsDataCategory"]),

  discoveredContent: defineTable({
    userId: v.string(),
    sourceUrl: v.string(),
    title: v.string(),
    summary: v.string(),
    relevanceScore: v.number(),
    topicId: v.optional(v.id("topics")),
    status: v.union(v.literal("queued"), v.literal("pinned"), v.literal("skipped"), v.literal("generated")),
    discoveredAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("userId_sourceUrl", ["userId", "sourceUrl"])
    .index("userId_discoveredAt", ["userId", "discoveredAt"])
    .index("userId_status", ["userId", "status"]),

  generatedDrafts: defineTable({
    userId: v.string(),
    content: v.string(),
    imageFileId: v.optional(v.id("_storage")),
    sourceArticleId: v.optional(v.id("discoveredContent")),
    confidenceScore: v.number(),
    status: v.union(
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    ),
    scheduledAt: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    linkedinPostId: v.optional(v.string()),
    voiceProfileId: v.optional(v.id("voiceProfiles")),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("userId", ["userId"])
    .index("userId_status", ["userId", "status"])
    .index("userId_scheduledAt", ["userId", "scheduledAt"])
    .index("userId_createdAt", ["userId", "createdAt"]),

  postSchedule: defineTable({
    userId: v.string(),
    draftId: v.id("generatedDrafts"),
    scheduledAt: v.number(),
    status: v.union(v.literal("queued"), v.literal("publishing"), v.literal("published"), v.literal("failed")),
  })
    .index("userId", ["userId"])
    .index("userId_scheduledAt", ["userId", "scheduledAt"])
    .index("userId_status", ["userId", "status"]),

  linkedinTokens: defineTable({
    userId: v.string(),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.string(),
    expiresAt: v.number(),
    tokenStatus: v.union(
      v.literal("active"),
      v.literal("expiring_soon"),
      v.literal("refreshing"),
      v.literal("hard_expired")
    ),
    lastRefreshedAt: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("userId_tokenStatus", ["userId", "tokenStatus"])
    .index("userId_expiresAt", ["userId", "expiresAt"]),

  voiceProfiles: defineTable({
    userId: v.string(),
    toneDescription: v.string(),
    examplePosts: v.optional(v.array(v.string())),
    geminiVoicePreview: v.optional(v.string()),
  }).index("userId", ["userId"]),
}

const schema = defineSchema(tables)

export default schema

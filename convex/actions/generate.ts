"use node"

import { v } from "convex/values"
import { internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import { internalAction } from "../_generated/server"
import { generateDraft, generateImage, generateImagePrompt } from "../_lib/gemini"

export const run = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const queuedItems = await ctx.runQuery(internal.queries.discoveredContent.getQueuedForUser, {
      userId: args.userId,
    })

    const generationCount = await ctx.runQuery(internal.queries.generatedDrafts.getTodayCount, {
      userId: args.userId,
    })

    const remainingSlots = Math.max(0, 5 - generationCount)
    const itemsToProcess = queuedItems.slice(0, remainingSlots)

    if (itemsToProcess.length === 0) return

    const voiceProfile = await ctx.runQuery(internal.queries.voiceProfiles.getByUserId, {
      userId: args.userId,
    })

    const voiceDescription = voiceProfile?.toneDescription ?? "Professional and informative"
    const examplePosts = voiceProfile?.examplePosts ?? []

    const results = await Promise.allSettled(
      itemsToProcess.map(async item => {
        try {
          const { content, confidenceScore } = await generateDraft(
            item.title,
            item.summary,
            voiceDescription,
            examplePosts
          )

          const imagePrompt = await generateImagePrompt(content)
          const imageBytes = await generateImage(imagePrompt)

          let imageFileId: Id<"_storage"> | undefined
          if (imageBytes) {
            const blob = new Blob([Buffer.from(imageBytes, "base64")], { type: "image/png" })
            imageFileId = await ctx.storage.store(blob)
          }

          const draftId = await ctx.runMutation(internal.mutations.generatedDrafts.createFromDiscovery, {
            userId: args.userId,
            content,
            imageFileId,
            sourceArticleId: item._id,
            confidenceScore,
            voiceProfileId: voiceProfile?._id,
          })

          await ctx.runMutation(internal.mutations.discoveredContent.markGenerated, {
            id: item._id,
          })

          return { success: true, draftId }
        } catch (error) {
          console.error(`Failed to generate draft for ${item.title}:`, error)
          return { success: false, error }
        }
      })
    )

    const successCount = results.filter(r => r.status === "fulfilled" && r.value.success).length
    console.log(`Generated ${successCount}/${itemsToProcess.length} drafts for user ${args.userId}`)
  },
})

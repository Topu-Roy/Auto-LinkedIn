"use node"

import { DRAFT_STATUS, LIMITS, TOKEN_STATUS } from "@/lib/config"
import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { decrypt } from "../_lib/encryption"
import { createImagePost, getProfileInfo, registerImageUpload, uploadImage } from "../_lib/linkedin"

export const run = internalAction({
  args: {},
  handler: async ctx => {
    const scheduledPosts = await ctx.runQuery(internal.queries.postSchedule.getDueForPublish, {})

    for (const scheduleItem of scheduledPosts) {
      const draft = await ctx.runQuery(internal.queries.generatedDrafts.getById, {
        id: scheduleItem.draftId,
      })

      if (draft?.status !== DRAFT_STATUS.SCHEDULED) continue

      await ctx.runMutation(internal.mutations.generatedDrafts.markPublishing, {
        id: draft._id,
      })

      await ctx.runMutation(internal.mutations.postSchedule.markPublishing, {
        id: scheduleItem._id,
      })

      try {
        const tokenRecord = await ctx.runQuery(internal.queries.linkedinTokens.getByUserId, {
          userId: scheduleItem.userId,
        })

        if (!tokenRecord || tokenRecord.tokenStatus === TOKEN_STATUS.HARD_EXPIRED) {
          await ctx.runMutation(internal.mutations.generatedDrafts.markFailed, {
            id: draft._id,
          })
          continue
        }

        const accessToken = await decrypt(tokenRecord.encryptedAccessToken)
        const { urn: authorUrn } = await getProfileInfo(accessToken)

        let linkedinPostId = ""

        if (draft.imageFileId) {
          const imageBlob = await ctx.storage.get(draft.imageFileId)
          if (imageBlob) {
            const { uploadUrl, asset } = await registerImageUpload(accessToken, authorUrn, imageBlob.size)
            await uploadImage(uploadUrl, imageBlob)
            linkedinPostId = await createImagePost(accessToken, draft.content, authorUrn, asset)
          }
        }

        await ctx.runMutation(internal.mutations.generatedDrafts.markPublished, {
          id: draft._id,
          linkedinPostId,
        })

        await ctx.runMutation(internal.mutations.postSchedule.markPublished, {
          id: scheduleItem._id,
        })
      } catch (error) {
        console.error(`Failed to publish draft ${draft._id}:`, error)

        const retryCount = (draft.retryCount ?? LIMITS.DEFAULT_RETRY_COUNT) + 1

        if (retryCount < LIMITS.MAX_PUBLISH_RETRIES) {
          await ctx.runMutation(internal.mutations.generatedDrafts.scheduleRetry, {
            id: draft._id,
            retryCount,
          })

          await ctx.runMutation(internal.mutations.postSchedule.scheduleRetry, {
            id: scheduleItem._id,
          })
        } else {
          await ctx.runMutation(internal.mutations.generatedDrafts.markFailed, {
            id: draft._id,
          })

          await ctx.runMutation(internal.mutations.postSchedule.markFailed, {
            id: scheduleItem._id,
          })
        }
      }
    }
  },
})

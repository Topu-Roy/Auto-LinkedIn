"use node"

import { API, LINKEDIN, TIME } from "@/lib/config"
import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { decrypt, encrypt } from "../_lib/encryption"

export const run = internalAction({
  args: {},
  handler: async ctx => {
    const tokenRecords = await ctx.runQuery(internal.queries.linkedinTokens.getAll, {})

    const now = Date.now()

    for (const record of tokenRecords) {
      const timeUntilExpiry = record.expiresAt - now

      if (timeUntilExpiry <= 0) {
        await ctx.runMutation(internal.mutations.linkedinTokens.markHardExpired, {
          id: record._id,
        })
        continue
      }

      if (timeUntilExpiry <= TIME.THREE_SIXTY_FIVE_DAYS_MS) {
        await ctx.runMutation(internal.mutations.linkedinTokens.markHardExpired, {
          id: record._id,
        })
        continue
      }

      if (timeUntilExpiry <= TIME.FOURTEEN_DAYS_MS) {
        await ctx.runMutation(internal.mutations.linkedinTokens.markExpiringSoon, {
          id: record._id,
        })

        try {
          const refreshToken = await decrypt(record.encryptedRefreshToken)

          const response = await fetch(API.LINKEDIN_OAUTH_TOKEN, {
            method: "POST",
            headers: { "Content-Type": LINKEDIN.HEADERS.CONTENT_TYPE_FORM },
            body: new URLSearchParams({
              grant_type: LINKEDIN.OAUTH.GRANT_TYPE_REFRESH,
              refresh_token: refreshToken,
              client_id: process.env.LINKEDIN_CLIENT_ID!,
              client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
            }),
          })

          if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status}`)
          }

          const data = (await response.json()) as {
            access_token?: string
            refresh_token?: string
            expires_in?: number
          }

          await ctx.runMutation(internal.mutations.linkedinTokens.updateAfterRefresh, {
            id: record._id,
            encryptedAccessToken: await encrypt(data.access_token ?? ""),
            encryptedRefreshToken: data.refresh_token ? await encrypt(data.refresh_token) : undefined,
            expiresAt: now + (data.expires_in ?? TIME.DEFAULT_TOKEN_EXPIRY_S) * 1000,
          })
        } catch (error) {
          console.error(`Failed to refresh token for user ${record.userId}:`, error)
          await ctx.runMutation(internal.mutations.linkedinTokens.markHardExpired, {
            id: record._id,
          })
        }
      }
    }
  },
})

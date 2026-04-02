"use node"

import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { decrypt, encrypt } from "../_lib/encryption"

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const THREE_SIXTY_FIVE_DAYS_MS = 365 * 24 * 60 * 60 * 1000

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

      if (timeUntilExpiry <= THREE_SIXTY_FIVE_DAYS_MS) {
        await ctx.runMutation(internal.mutations.linkedinTokens.markHardExpired, {
          id: record._id,
        })
        continue
      }

      if (timeUntilExpiry <= FOURTEEN_DAYS_MS) {
        await ctx.runMutation(internal.mutations.linkedinTokens.markExpiringSoon, {
          id: record._id,
        })

        try {
          const refreshToken = await decrypt(record.encryptedRefreshToken)

          const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
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
            expiresAt: now + (data.expires_in ?? 5184000) * 1000,
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

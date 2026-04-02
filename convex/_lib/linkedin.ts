/**
 * LinkedIn API client for creating and managing posts.
 * Uses the LinkedIn REST API v2 with w_member_social scope.
 */

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2"

/**
 * Creates a text post on LinkedIn.
 *
 * @param accessToken - The user's LinkedIn access token
 * @param text - The post text content
 * @param authorUrn - The LinkedIn person URN (e.g., "urn:li:person:abc123")
 * @returns LinkedIn post ID or URN
 */
export async function createTextPost(accessToken: string, text: string, authorUrn: string): Promise<string> {
  const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202411",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn API error (${response.status}): ${error}`)
  }

  const idHeader = response.headers.get("x-restli-id")
  if (idHeader) return idHeader

  const location = response.headers.get("location")
  if (location) {
    const parts = location.split("/")
    return parts[parts.length - 1] ?? ""
  }

  return ""
}

/**
 * Registers an upload URL with LinkedIn for image uploads.
 * Two-step process: register upload, then upload the image.
 *
 * @param accessToken - The user's LinkedIn access token
 * @param authorUrn - The LinkedIn person URN
 * @param fileSize - Size of the image in bytes
 * @returns Upload registration data with upload URL and asset URN
 */
export async function registerImageUpload(
  accessToken: string,
  authorUrn: string,
  _fileSize: number
): Promise<{ uploadUrl: string; asset: string; assetId: string }> {
  const response = await fetch(`${LINKEDIN_API_BASE}/assets?action=registerUpload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn register upload error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as {
    value: {
      uploadMechanism: Record<string, { uploadUrl: string }>
      asset: string
    }
  }

  const uploadMechanism = data.value.uploadMechanism
  const uploadUrl = uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl
  const asset = data.value.asset

  if (!uploadUrl || !asset) {
    throw new Error("Failed to get upload URL or asset from LinkedIn")
  }

  return { uploadUrl, asset, assetId: asset.split(":").pop() ?? "" }
}

/**
 * Uploads image bytes to LinkedIn's upload URL.
 *
 * @param uploadUrl - The upload URL from registerImageUpload
 * @param imageBytes - The image data as a Buffer or Blob
 * @returns True if upload succeeded
 */
export async function uploadImage(uploadUrl: string, imageBytes: ArrayBuffer | Blob): Promise<boolean> {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: "",
      "Content-Type": "application/octet-stream",
    },
    body: imageBytes,
  })

  return response.ok || response.status === 201
}

/**
 * Creates a post with an uploaded image on LinkedIn.
 *
 * @param accessToken - The user's LinkedIn access token
 * @param text - The post text content
 * @param authorUrn - The LinkedIn person URN
 * @param imageAssetUrn - The image asset URN from registerImageUpload
 * @returns LinkedIn post ID or URN
 */
export async function createImagePost(
  accessToken: string,
  text: string,
  authorUrn: string,
  imageAssetUrn: string
): Promise<string> {
  const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202411",
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              description: {
                text,
              },
              media: imageAssetUrn,
              title: {
                text: "Shared via Auto-LinkedIn",
              },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn API error (${response.status}): ${error}`)
  }

  const idHeader = response.headers.get("x-restli-id")
  if (idHeader) return idHeader

  const location = response.headers.get("location")
  if (location) {
    const parts = location.split("/")
    return parts[parts.length - 1] ?? ""
  }

  return ""
}

/**
 * Gets the authenticated user's LinkedIn profile info to extract the person URN.
 *
 * @param accessToken - The user's LinkedIn access token
 * @returns Object containing the person URN and basic profile info
 */
export async function getProfileInfo(accessToken: string): Promise<{ urn: string; name: string }> {
  const response = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn profile error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as { sub?: string; name?: string }
  const urn = data.sub ?? ""

  return {
    urn: `urn:li:person:${urn}`,
    name: data.name ?? "",
  }
}

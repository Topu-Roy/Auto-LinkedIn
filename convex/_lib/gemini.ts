import { GoogleGenAI } from "@google/genai"
import { GEMINI, IMAGE_PROMPT, LIMITS } from "@/lib/config"

let ai: GoogleGenAI | null = null

function getGeminiClient(): GoogleGenAI {
  ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  return ai
}

/**
 * Generates a relevance score (1-10) for a piece of content against a topic.
 * Used in Phase 1 (Discovery) to filter low-relevance items.
 *
 * @param title - Content title
 * @param summary - Content summary
 * @param topic - Target topic name
 * @returns Relevance score 1-10
 */
export async function scoreRelevance(title: string, summary: string, topic: string): Promise<number> {
  const response = await getGeminiClient().models.generateContent({
    model: GEMINI.MODELS.TEXT,
    contents: `Score the relevance of this content to the topic "${topic}" on a scale of ${GEMINI.SCORE.MIN}-${GEMINI.SCORE.MAX}.
Return ONLY the number, nothing else.

Title: ${title}
Summary: ${summary}`,
  })

  const text = response.text?.trim() ?? "0"
  const score = parseInt(text, 10)
  return isNaN(score) ? 0 : Math.min(GEMINI.SCORE.MAX, Math.max(GEMINI.SCORE.MIN, score))
}

/**
 * Generates a LinkedIn post draft from source content, incorporating voice calibration.
 * Used in Phase 2 (Generate). Returns post text (300-1000 chars) and confidence score.
 *
 * @param sourceTitle - Source article title
 * @param sourceSummary - Source article summary
 * @param voiceDescription - User's tone description
 * @param examplePosts - Array of example post texts
 * @returns Object with content (string) and confidenceScore (1-10)
 */
export async function generateDraft(
  sourceTitle: string,
  sourceSummary: string,
  voiceDescription: string,
  examplePosts: string[]
): Promise<{ content: string; confidenceScore: number }> {
  const examplesText =
    examplePosts.length > 0
      ? `\nExample posts the user has liked:\n${examplePosts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
      : ""

  const response = await getGeminiClient().models.generateContent({
    model: GEMINI.MODELS.TEXT,
    contents: `You are a LinkedIn content writer. Write a post based on the following source material.

RULES:
- Post must be ${GEMINI.CONTENT.MIN_CHARS}-${GEMINI.CONTENT.MAX_CHARS} characters
- Write in the following tone: ${voiceDescription}
- Do NOT hallucinate information not present in the source
- Include a hook in the first line
- End with a question or call-to-action to drive engagement
- Use line breaks for readability
- No hashtags unless absolutely relevant${examplesText}

Source Title: ${sourceTitle}
Source Summary: ${sourceSummary}

Return your response as JSON in this exact format:
{
  "content": "the post text here",
  "confidenceScore": 8
}

confidenceScore is how confident you are that this post will perform well on LinkedIn (${GEMINI.SCORE.MIN}-${GEMINI.SCORE.MAX}).`,
  })

  const text = response.text?.trim() ?? "{}"
  const jsonMatch = /\{[\s\S]*\}/.exec(text)
  if (!jsonMatch) {
    return {
      content: `New post about: ${sourceTitle}\n\n${sourceSummary}`,
      confidenceScore: LIMITS.DEFAULT_CONFIDENCE_SCORE,
    }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    const content = typeof parsed.content === "string" ? parsed.content : undefined
    const confidenceScore = typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : undefined
    return {
      content: content ?? `New post about: ${sourceTitle}`,
      confidenceScore: confidenceScore ?? LIMITS.DEFAULT_CONFIDENCE_SCORE,
    }
  } catch {
    return {
      content: `New post about: ${sourceTitle}\n\n${sourceSummary}`,
      confidenceScore: LIMITS.DEFAULT_CONFIDENCE_SCORE,
    }
  }
}

/**
 * Generates an image prompt from a LinkedIn post's content.
 * Used to create a custom prompt for Gemini image generation.
 *
 * @param postContent - The LinkedIn post text
 * @returns An image generation prompt
 */
export async function generateImagePrompt(postContent: string): Promise<string> {
  const response = await getGeminiClient().models.generateContent({
    model: GEMINI.MODELS.TEXT,
    contents: `Create a detailed image generation prompt for a ${GEMINI.IMAGE.DIMENSIONS_LABEL} square image that would complement this LinkedIn post.
The image should be professional, visually engaging, and relevant to the post topic.
Return ONLY the prompt, nothing else.

Post: ${postContent}`,
  })

  return (
    response.text?.trim() ?? IMAGE_PROMPT.FALLBACK(postContent.slice(0, GEMINI.CONTENT.FALLBACK_PROMPT_TRUNCATE))
  )
}

/**
 * Generates an image using Gemini based on a prompt.
 * Returns the image as a base64-encoded string.
 *
 * @param prompt - The image generation prompt
 * @returns Base64-encoded image data
 */
export async function generateImage(prompt: string): Promise<string> {
  const response = await getGeminiClient().models.generateImages({
    model: GEMINI.MODELS.IMAGE,
    prompt,
    config: {
      numberOfImages: GEMINI.IMAGE.NUMBER_OF_IMAGES,
      aspectRatio: GEMINI.IMAGE.ASPECT_RATIO,
    },
  })

  if (!response.generatedImages?.[0]) {
    throw new Error("No image generated")
  }

  return response.generatedImages[0].image?.imageBytes ?? ""
}

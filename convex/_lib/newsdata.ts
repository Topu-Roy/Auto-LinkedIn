/**
 * NewsData.io API client for content discovery.
 * Fetches news articles by topic/category/keyword.
 */

import { API, DEFAULTS, LIMITS, TOPIC_TO_CATEGORY_MAP } from "@/lib/config"

/**
 * Result from a NewsData.io article search.
 */
export interface NewsArticle {
  title: string
  description: string
  link: string
  pubDate: string
  source_id: string
  source_name: string
  category: string[]
  language: string
}

/**
 * Fetches articles from NewsData.io for a given topic and category.
 *
 * @param query - Search keyword (topic name)
 * @param category - NewsData.io category mapping
 * @param language - Language code (default: "en")
 * @returns Array of news articles
 */
export async function fetchNewsArticles(
  query: string,
  category?: string,
  language = DEFAULTS.LANGUAGE
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    apikey: process.env.NEWSDATA_API_KEY!,
    q: query,
    language,
    size: String(LIMITS.NEWSDATA_PAGE_SIZE),
  })

  if (category) {
    params.set("category", category)
  }

  const response = await fetch(`${API.NEWSDATA_BASE}/news?${params.toString()}`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`NewsData.io API error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as {
    status?: string
    message?: string
    results?: NewsArticle[]
  }

  if (data.status !== "success") {
    throw new Error(`NewsData.io returned error: ${data.message ?? "Unknown error"}`)
  }

  return data.results ?? []
}

/**
 * Topic to NewsData.io category mapping.
 * Maps our curated topics to NewsData.io's category system.
 */
export { TOPIC_TO_CATEGORY_MAP }

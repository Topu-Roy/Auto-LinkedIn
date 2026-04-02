/**
 * NewsData.io API client for content discovery.
 * Fetches news articles by topic/category/keyword.
 */

const NEWSDATA_API_BASE = "https://newsdata.io/api/1"

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
  language = "en"
): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    apikey: process.env.NEWSDATA_API_KEY!,
    q: query,
    language,
    size: "20",
  })

  if (category) {
    params.set("category", category)
  }

  const response = await fetch(`${NEWSDATA_API_BASE}/news?${params.toString()}`)

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
export const TOPIC_TO_CATEGORY_MAP: Record<string, string> = {
  "Artificial Intelligence & Machine Learning": "technology",
  "Software Engineering & Development": "technology",
  "SaaS & Cloud Computing": "technology",
  "Digital Marketing & Growth": "business",
  "Leadership & Management": "business",
  "Productivity & Time Management": "business",
  "Entrepreneurship & Startups": "business",
  "Product Management": "technology",
  "Data Science & Analytics": "technology",
  Cybersecurity: "technology",
  "Remote Work & Future of Work": "business",
  "Personal Branding": "business",
  "Sales & Business Development": "business",
  "UX/UI Design": "technology",
  "Web3 & Blockchain": "technology",
  "Fintech & Financial Technology": "business",
  "E-commerce & Retail Tech": "business",
  "HR & Talent Acquisition": "business",
  "Customer Success & Support": "business",
  "DevOps & Infrastructure": "technology",
}

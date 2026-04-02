"use node"

import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { scoreRelevance } from "../_lib/gemini"
import { fetchNewsArticles, TOPIC_TO_CATEGORY_MAP } from "../_lib/newsdata"

export const run = internalAction({
  args: {},
  handler: async ctx => {
    const now = new Date()

    const allProfiles = await ctx.runQuery(internal.queries.userProfiles.getAllForDiscovery, {})

    for (const profile of allProfiles) {
      if (!profile.timezone || !profile.timeWindows) continue
      if (!profile.onboardingComplete) continue

      const userHour = new Date(now.toLocaleString("en-US", { timeZone: profile.timezone })).getHours()

      const isActiveWindow = profile.timeWindows.some(window => {
        const [startHour] = window.start.split(":").map(Number)
        const [endHour] = window.end.split(":").map(Number)
        return userHour >= startHour && userHour <= endHour
      })

      if (!isActiveWindow) continue

      const topics = await ctx.runQuery(internal.queries.topics.getActiveForUser, { userId: profile.userId })

      for (const topic of topics) {
        if (topic.isPaused || !topic.isActive) continue

        const category = topic.newsDataCategory ?? TOPIC_TO_CATEGORY_MAP[topic.name]

        try {
          const articles = await fetchNewsArticles(topic.name, category)

          for (const article of articles) {
            if (!article.title || !article.description) continue

            const existing = await ctx.runQuery(internal.queries.discoveredContent.getByUrl, {
              userId: profile.userId,
              sourceUrl: article.link,
            })

            if (existing) continue

            const relevanceScore = await scoreRelevance(article.title, article.description, topic.name)

            if (relevanceScore >= 4) {
              await ctx.runMutation(internal.mutations.discoveredContent.create, {
                userId: profile.userId,
                sourceUrl: article.link,
                title: article.title,
                summary: article.description,
                relevanceScore,
                topicId: topic._id,
                status: "queued",
                discoveredAt: Date.now(),
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching news for topic ${topic.name}:`, error)
        }
      }

      const queuedItems = await ctx.runQuery(internal.queries.discoveredContent.getQueuedForUser, {
        userId: profile.userId,
      })

      if (queuedItems.length > 0) {
        await ctx.scheduler.runAfter(0, internal.actions.generate.run, {
          userId: profile.userId,
        })
      }
    }
  },
})

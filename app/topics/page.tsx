"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { Pause, Play, Plus, Rss, X } from "lucide-react"
import { toast } from "sonner"
import { STATUS_BADGE_CONFIG, WEIGHT, WEIGHT_ORDER } from "@/lib/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TopicsPage() {
  const topics = useQuery(api.queries.topics.list)
  const updateTopic = useMutation(api.mutations.topics.update)
  const removeTopic = useMutation(api.mutations.topics.remove)
  const createTopic = useMutation(api.mutations.topics.create)

  const [newTopicName, setNewTopicName] = useState("")
  const [newTopicWeight, setNewTopicWeight] = useState<"Low" | "Medium" | "High">(WEIGHT.MEDIUM)
  const [newTopicCategory, setNewTopicCategory] = useState("")
  const [newRssFeed, setNewRssFeed] = useState("")
  const [addingRssTo, setAddingRssTo] = useState<string | null>(null)

  const sortedTopics = [...(topics ?? [])].sort(
    (a, b) => (WEIGHT_ORDER[b.weight] ?? 0) - (WEIGHT_ORDER[a.weight] ?? 0)
  )

  const handlePause = async (id: string, isPaused: boolean) => {
    try {
      await updateTopic({ id: id as Id<"topics">, isPaused: !isPaused })
      toast.success(isPaused ? "Topic resumed" : "Topic paused")
    } catch {
      toast.error("Failed to update topic")
    }
  }

  const handleWeightChange = async (id: string, weight: "Low" | "Medium" | "High") => {
    try {
      await updateTopic({ id: id as Id<"topics">, weight })
      toast.success("Weight updated")
    } catch {
      toast.error("Failed to update weight")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeTopic({ id: id as Id<"topics"> })
      toast.success("Topic deleted")
    } catch {
      toast.error("Failed to delete topic")
    }
  }

  const handleAddRssFeed = async (id: string) => {
    if (!newRssFeed.trim()) return
    const topic = topics?.find(t => t._id === id)
    if (!topic) return

    try {
      await updateTopic({
        id: id as Id<"topics">,
        rssFeeds: [...(topic.rssFeeds ?? []), newRssFeed.trim()],
      })
      setNewRssFeed("")
      setAddingRssTo(null)
      toast.success("RSS feed added")
    } catch {
      toast.error("Failed to add RSS feed")
    }
  }

  const handleRemoveRssFeed = async (id: string, feedUrl: string) => {
    const topic = topics?.find(t => t._id === id)
    if (!topic) return

    try {
      await updateTopic({
        id: id as Id<"topics">,
        rssFeeds: (topic.rssFeeds ?? []).filter((f: string) => f !== feedUrl),
      })
      toast.success("RSS feed removed")
    } catch {
      toast.error("Failed to remove RSS feed")
    }
  }

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return

    try {
      await createTopic({
        name: newTopicName.trim(),
        weight: newTopicWeight,
        newsDataCategory: newTopicCategory || undefined,
      })
      setNewTopicName("")
      setNewTopicWeight(WEIGHT.MEDIUM)
      setNewTopicCategory("")
      toast.success("Topic created")
    } catch {
      toast.error("Failed to create topic")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
        <p className="text-muted-foreground">Manage your interest areas and RSS feeds.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 flex-1">
              <Label htmlFor="topic-name">Topic Name</Label>
              <Input
                id="topic-name"
                placeholder="e.g., Machine Learning"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Weight</Label>
              <Select
                value={newTopicWeight}
                onValueChange={v => setNewTopicWeight(v as "Low" | "Medium" | "High")}
              >
                <SelectTrigger className="mt-1 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="topic-category">NewsData Category</Label>
              <Input
                id="topic-category"
                placeholder="e.g., technology"
                value={newTopicCategory}
                onChange={e => setNewTopicCategory(e.target.value)}
                className="mt-1 w-40"
              />
            </div>
            <Button onClick={handleCreateTopic} disabled={!newTopicName.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTopics.map(topic => (
          <Card key={topic._id} className={topic.isPaused ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base">{topic.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        topic.weight === WEIGHT.HIGH
                          ? "default"
                          : topic.weight === WEIGHT.MEDIUM
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {topic.weight}
                    </Badge>
                    {topic.isPaused && <Badge variant="destructive">{STATUS_BADGE_CONFIG.paused.label}</Badge>}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handlePause(topic._id, topic.isPaused)}
                  title={topic.isPaused ? "Resume" : "Pause"}
                >
                  {topic.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Generated: {topic.generatedCount}</span>
                <Select
                  value={topic.weight}
                  onValueChange={v => handleWeightChange(topic._id, v as "Low" | "Medium" | "High")}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WEIGHT.LOW}>{WEIGHT.LOW}</SelectItem>
                    <SelectItem value={WEIGHT.MEDIUM}>{WEIGHT.MEDIUM}</SelectItem>
                    <SelectItem value={WEIGHT.HIGH}>{WEIGHT.HIGH}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">RSS Feeds</Label>
                  <Button size="sm" variant="ghost" onClick={() => setAddingRssTo(topic._id)}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                {addingRssTo === topic._id && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={newRssFeed}
                      onChange={e => setNewRssFeed(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleAddRssFeed(topic._id)}>
                      <Rss className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="mt-2 space-y-1">
                  {(topic.rssFeeds ?? []).map((feed: string) => (
                    <div key={feed} className="flex items-center gap-2 text-xs">
                      <Rss className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{feed}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRssFeed(topic._id, feed)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(topic.rssFeeds ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">No RSS feeds added</p>
                  )}
                </div>
              </div>

              <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDelete(topic._id)}>
                Delete Topic
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedTopics.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium">No topics configured</p>
          <p className="text-sm">Add topics above to start discovering relevant content.</p>
        </div>
      )}
    </div>
  )
}

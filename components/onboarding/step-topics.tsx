"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { CURATED_TOPICS, DEFAULTS, LIMITS, WEIGHT } from "@/lib/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StepTopics({
  selectedTopics,
  onChange,
}: {
  selectedTopics: { name: string; weight: "Low" | "Medium" | "High"; newsDataCategory?: string }[]
  onChange: (topics: { name: string; weight: "Low" | "Medium" | "High"; newsDataCategory?: string }[]) => void
}) {
  const [customTopic, setCustomTopic] = useState("")

  const toggleTopic = (topicName: string, category?: string) => {
    const exists = selectedTopics.find(t => t.name === topicName)
    if (exists) {
      onChange(selectedTopics.filter(t => t.name !== topicName))
    } else if (selectedTopics.length < LIMITS.MAX_TOPICS) {
      onChange([...selectedTopics, { name: topicName, weight: DEFAULTS.TOPIC_WEIGHT, newsDataCategory: category }])
    }
  }

  const addCustomTopic = () => {
    if (customTopic.trim() && selectedTopics.length < LIMITS.MAX_TOPICS) {
      onChange([...selectedTopics, { name: customTopic.trim(), weight: DEFAULTS.TOPIC_WEIGHT }])
      setCustomTopic("")
    }
  }

  const updateWeight = (topicName: string, weight: "Low" | "Medium" | "High") => {
    onChange(selectedTopics.map(t => (t.name === topicName ? { ...t, weight } : t)))
  }

  const removeTopic = (topicName: string) => {
    onChange(selectedTopics.filter(t => t.name !== topicName))
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">
          Selected Topics ({selectedTopics.length}/{LIMITS.MAX_TOPICS})
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick {LIMITS.MIN_TOPICS}–{LIMITS.MAX_TOPICS} topic areas you want to post about.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedTopics.map(topic => (
            <Badge key={topic.name} variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <span>{topic.name}</span>
              <Select
                value={topic.weight}
                onValueChange={v => updateWeight(topic.name, v as "Low" | "Medium" | "High")}
              >
                <SelectTrigger className="h-6 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WEIGHT.LOW}>{WEIGHT.LOW}</SelectItem>
                  <SelectItem value={WEIGHT.MEDIUM}>{WEIGHT.MEDIUM}</SelectItem>
                  <SelectItem value={WEIGHT.HIGH}>{WEIGHT.HIGH}</SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => removeTopic(topic.name)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base">Curated Topics</Label>
        <div className="mt-3 grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {CURATED_TOPICS.map(topic => {
            const isSelected = selectedTopics.some(t => t.name === topic.name)
            return (
              <label
                key={topic.name}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => toggleTopic(topic.name, topic.category)} />
                <span className="text-sm">{topic.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div>
        <Label className="text-base">Custom Topic</Label>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Add a custom topic..."
            value={customTopic}
            onChange={e => setCustomTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomTopic()}
          />
          <Button
            onClick={addCustomTopic}
            size="icon"
            disabled={!customTopic.trim() || selectedTopics.length >= LIMITS.MAX_TOPICS}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedTopics.length < LIMITS.MIN_TOPICS && (
        <p className="text-sm text-amber-600">Please select at least {LIMITS.MIN_TOPICS} topics to continue.</p>
      )}
    </div>
  )
}

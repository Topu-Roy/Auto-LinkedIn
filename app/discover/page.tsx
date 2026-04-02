"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ExternalLink, Pin, SkipForward, Zap } from "lucide-react"
import { ConfidenceMeter } from "@/components/shared/confidence-meter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiscoverPage() {
  const items = useQuery(api.queries.discover.list)
  const pinnedItems = useQuery(api.queries.discover.listPinned)

  const allItems = [...(pinnedItems ?? []), ...(items ?? [])]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="text-muted-foreground">Trending content in your topic areas.</p>
      </div>

      {allItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Pin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No content discovered yet</p>
          <p className="text-sm">Content will appear here after your first discovery cycle.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allItems.map(item => (
            <Card key={item._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  {item.status === "pinned" && (
                    <Badge variant="default" className="shrink-0">
                      Pinned
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">{item.summary}</p>
                <div className="flex items-center justify-between">
                  <ConfidenceMeter score={item.relevanceScore} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.discoveredAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Source
                    </a>
                  </Button>
                  {item.status === "queued" && (
                    <>
                      <Button size="sm" variant="outline" title="Pin for generation">
                        <Pin className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" title="Skip">
                        <SkipForward className="h-3 w-3" />
                      </Button>
                      <Button size="sm" title="Generate now">
                        <Zap className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

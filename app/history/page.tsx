"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Calendar, ExternalLink } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoryPage() {
  const posts = useQuery(api.queries.history.list)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">Your published LinkedIn posts.</p>
      </div>

      {posts?.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No published posts yet</p>
          <p className="text-sm">Published posts will appear here as a timeline.</p>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:top-0 before:left-4 before:h-full before:w-px before:bg-border">
          {posts?.map(post => (
            <div key={post._id} className="relative pl-10">
              <div className="absolute top-4 left-2 h-4 w-4 rounded-full bg-primary" />
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={post.status} />
                        {post.linkedinPostId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {post.linkedinPostId.slice(0, 12)}...
                          </Badge>
                        )}
                      </div>
                    </div>
                    {post.linkedinPostId && (
                      <a
                        href={`https://www.linkedin.com/feed/update/${post.linkedinPostId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

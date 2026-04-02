"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { CheckCircle2, Clock, FileText, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { CountdownTimer } from "@/components/shared/countdown-timer"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function OverviewCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string | number | React.ReactNode
  icon: typeof CheckCircle2
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const drafts = useQuery(api.queries.drafts.list)
  const scheduledPosts = useQuery(api.queries.schedule.list)
  const publishedPosts = useQuery(api.queries.history.list)
  const tokenStatus = useQuery(api.queries.settings.getTokenStatus)
  const failedPosts = useQuery(api.queries.dashboard.getFailedPosts)
  const upcomingPost = useQuery(api.queries.dashboard.getNextScheduledPost)

  const pendingCount = drafts?.length ?? 0
  const scheduledCount = scheduledPosts?.length ?? 0
  const publishedCount = publishedPosts?.length ?? 0
  const hasTokenIssue = tokenStatus === "expiring_soon" || tokenStatus === "hard_expired"
  const hasFailedPosts = (failedPosts?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your LinkedIn content automation.</p>
      </div>

      {hasTokenIssue && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium">LinkedIn Connection Issue</p>
            <p className="text-sm text-muted-foreground">
              {tokenStatus === "hard_expired"
                ? "Your LinkedIn token has expired. Reconnect to resume publishing."
                : "Your LinkedIn token is expiring soon. Reconnect to avoid interruption."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
            Reconnect
          </Button>
        </div>
      )}

      {hasFailedPosts && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-medium">Failed Posts</p>
            <p className="text-sm text-muted-foreground">
              {failedPosts?.length} post(s) failed to publish after 3 retries. Review and reschedule.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/drafts")}>
            Review
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Pending Drafts"
          value={pendingCount}
          icon={FileText}
          description="Awaiting your review"
        />
        <OverviewCard
          title="Next Scheduled"
          value={upcomingPost ? <CountdownTimer targetTimestamp={upcomingPost.scheduledAt ?? 0} /> : "—"}
          icon={Clock}
          description={upcomingPost ? "Next post coming up" : "No posts scheduled"}
        />
        <OverviewCard
          title="Published This Week"
          value={publishedCount}
          icon={CheckCircle2}
          description="Posts published"
        />
        <OverviewCard
          title="Content Health"
          value={hasTokenIssue || hasFailedPosts ? "Attention" : "Good"}
          icon={CheckCircle2}
          description={hasTokenIssue || hasFailedPosts ? "Issues need attention" : "All systems operational"}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Scheduled Posts</h2>
        {scheduledCount === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No posts scheduled</p>
            <p className="text-sm">Approve drafts to see them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledPosts?.slice(0, 5).map(post => (
              <div key={post._id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={post.status} />
                  <p className="truncate text-sm text-muted-foreground">
                    {new Date(post.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <CountdownTimer targetTimestamp={post.scheduledAt} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Quick Start</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browse Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Explore trending content in your topic areas.</p>
              <Button size="sm" variant="outline" onClick={() => router.push("/discover")}>
                Discover
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} draft(s) waiting for your review.`
                  : "No drafts pending. New ones will appear here."}
              </p>
              <Button size="sm" variant="outline" onClick={() => router.push("/drafts")}>
                View Drafts
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manage Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Adjust your topics, weights, and RSS feeds.</p>
              <Button size="sm" variant="outline" onClick={() => router.push("/topics")}>
                Topics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

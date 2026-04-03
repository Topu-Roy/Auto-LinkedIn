"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const VIEW_MODES = ["month", "week", "day"] as const
type ViewMode = (typeof VIEW_MODES)[number]

export default function SchedulePage() {
  const posts = useQuery(api.queries.schedule.listAll)
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const postsByDay: Record<number, typeof posts> = {}
  for (const post of posts ?? []) {
    const postDate = new Date(post.scheduledAt)
    if (postDate.getMonth() === month && postDate.getFullYear() === year) {
      const day = postDate.getDate()
      postsByDay[day] ??= []
      postsByDay[day].push(post)
    }
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">Calendar view of your scheduled posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            {VIEW_MODES.map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {monthNames[month]} {year}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-px">
            {weekDays.map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div key={index} className="min-h-20 rounded-sm border p-1">
                {day ? (
                  <div>
                    <span className="text-xs font-medium">{day}</span>
                    <div className="mt-1 space-y-1">
                      {postsByDay[day]?.slice(0, 2).map(post => (
                        <div key={post._id} className="rounded bg-primary/10 px-1 py-0.5">
                          <StatusBadge status={post.status} />
                        </div>
                      ))}
                      {(postsByDay[day]?.length ?? 0) > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{(postsByDay[day]?.length ?? 0) - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Upcoming Posts</h2>
        {posts?.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No posts scheduled</p>
            <p className="text-sm">Approve drafts to see them on the calendar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts?.map(post => (
              <div key={post._id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={post.status} />
                  <span className="text-sm">{new Date(post.scheduledAt).toLocaleString()}</span>
                </div>
                <Badge variant="outline">{new Date(post.scheduledAt).toLocaleDateString()}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

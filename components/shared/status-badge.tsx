"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_review: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  rejected: { label: "Rejected", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  scheduled: {
    label: "Scheduled",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  publishing: {
    label: "Publishing",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  queued: { label: "Queued", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  pinned: {
    label: "Pinned",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  skipped: { label: "Skipped", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
  generated: { label: "Generated", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-800" }
  return <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
}

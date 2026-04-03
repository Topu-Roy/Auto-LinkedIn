"use client"

import { STATUS_BADGE_CONFIG } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_BADGE_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-800" }
  return <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
}

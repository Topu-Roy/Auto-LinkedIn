"use client"

import { cn } from "@/lib/utils"

const colorClasses: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-red-500",
  3: "bg-red-400",
  4: "bg-orange-400",
  5: "bg-yellow-400",
  6: "bg-yellow-400",
  7: "bg-lime-400",
  8: "bg-green-400",
  9: "bg-green-500",
  10: "bg-green-500",
}

export function ConfidenceMeter({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const clampedScore = Math.min(10, Math.max(1, Math.round(score)))
  const sizeClasses = {
    sm: "h-1.5 w-16",
    md: "h-2 w-24",
    lg: "h-3 w-32",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn("overflow-hidden rounded-full bg-muted", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all", colorClasses[clampedScore])}
          style={{ width: `${clampedScore * 10}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{clampedScore}/10</span>
    </div>
  )
}

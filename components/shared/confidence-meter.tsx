"use client"

import { CONFIDENCE_COLORS, CONFIDENCE_SIZES } from "@/lib/config"
import { cn } from "@/lib/utils"

export function ConfidenceMeter({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const clampedScore = Math.min(10, Math.max(1, Math.round(score)))

  return (
    <div className="flex items-center gap-2">
      <div className={cn("overflow-hidden rounded-full bg-muted", CONFIDENCE_SIZES[size])}>
        <div
          className={cn("h-full rounded-full transition-all", CONFIDENCE_COLORS[clampedScore])}
          style={{ width: `${clampedScore * 10}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{clampedScore}/10</span>
    </div>
  )
}

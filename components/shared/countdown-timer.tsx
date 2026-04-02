"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

export function CountdownTimer({ targetTimestamp }: { targetTimestamp: number }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const diff = targetTimestamp - now

  if (diff <= 0) {
    return <span className="text-sm text-muted-foreground">Now</span>
  }

  return (
    <span className="text-sm font-medium tabular-nums">
      {formatDistanceToNow(targetTimestamp, { addSuffix: true })}
    </span>
  )
}

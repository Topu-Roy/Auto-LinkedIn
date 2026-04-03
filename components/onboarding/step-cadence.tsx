"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { CADENCE, DEFAULTS, LIMITS, TIMEZONES } from "@/lib/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StepCadence({
  cadenceData,
  onChange,
}: {
  cadenceData: { cadence: string; timeWindows: { start: string; end: string }[] }
  onChange: (data: { cadence: string; timeWindows: { start: string; end: string }[] }) => void
}) {
  const [newWindow, setNewWindow] = useState<{ start: string; end: string }>({
    start: DEFAULTS.TIME_WINDOW_START,
    end: DEFAULTS.TIME_WINDOW_END,
  })

  const addTimeWindow = () => {
    if (cadenceData.timeWindows.length < LIMITS.MAX_TIME_WINDOWS) {
      onChange({
        ...cadenceData,
        timeWindows: [...cadenceData.timeWindows, newWindow],
      })
      setNewWindow({ start: DEFAULTS.TIME_WINDOW_START, end: DEFAULTS.TIME_WINDOW_END })
    }
  }

  const removeTimeWindow = (index: number) => {
    onChange({
      ...cadenceData,
      timeWindows: cadenceData.timeWindows.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="timezone" className="text-base">
          Timezone
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">Select your local timezone.</p>
        <Select
          value={cadenceData.cadence.split("|")[0] ?? ""}
          onValueChange={v => {
            const parts = cadenceData.cadence.split("|")
            onChange({ ...cadenceData, cadence: `${v}|${parts[1] ?? ""}` })
          }}
        >
          <SelectTrigger id="timezone" className="mt-2">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(tz => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cadence" className="text-base">
          Posting Cadence
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">How often do you want to post?</p>
        <Select
          value={cadenceData.cadence.split("|")[1] ?? ""}
          onValueChange={v => {
            const parts = cadenceData.cadence.split("|")
            onChange({ ...cadenceData, cadence: `${parts[0] ?? ""}|${v}` })
          }}
        >
          <SelectTrigger id="cadence" className="mt-2">
            <SelectValue placeholder="Select cadence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CADENCE.DAILY}>Daily</SelectItem>
            <SelectItem value={CADENCE.THREE_TIMES_WEEK}>3 times per week</SelectItem>
            <SelectItem value={CADENCE.WEEKLY}>Weekly</SelectItem>
            <SelectItem value={CADENCE.CUSTOM}>Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">Preferred Time Windows</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          When should your posts be scheduled? Discovery only runs during these windows.
        </p>
        <div className="mt-3 space-y-2">
          {cadenceData.timeWindows.map((window, index) => (
            <div key={index} className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {window.start} – {window.end}
              </Badge>
              <button
                type="button"
                onClick={() => removeTimeWindow(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {cadenceData.timeWindows.length < LIMITS.MAX_TIME_WINDOWS && (
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs">Start</Label>
              <Input
                type="time"
                value={newWindow.start}
                onChange={e => setNewWindow({ ...newWindow, start: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">End</Label>
              <Input
                type="time"
                value={newWindow.end}
                onChange={e => setNewWindow({ ...newWindow, end: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={addTimeWindow} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

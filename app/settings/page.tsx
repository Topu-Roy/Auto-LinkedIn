"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "UTC",
]

export default function SettingsPage() {
  const profile = useQuery(api.queries.settings.getProfile)
  const voiceProfile = useQuery(api.queries.settings.getVoiceProfile)
  const tokenStatus = useQuery(api.queries.settings.getTokenStatus)

  const [name, setName] = useState(profile?.name ?? "")
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC")
  const [language, setLanguage] = useState(profile?.language ?? "en")

  const isTokenActive = tokenStatus === "active" || tokenStatus === "expiring_soon"
  const isTokenExpired = tokenStatus === "hard_expired"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="mt-1">
                  <SelectValue />
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
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                placeholder="en"
                className="mt-1"
              />
            </div>
            <Button>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {isTokenActive ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">{isTokenActive ? "Connected" : "Not Connected"}</p>
                <p className="text-sm text-muted-foreground">
                  {isTokenExpired
                    ? "Your LinkedIn token has expired."
                    : isTokenActive
                      ? "Your LinkedIn account is connected."
                      : "Connect your LinkedIn account to enable publishing."}
                </p>
              </div>
            </div>
            {tokenStatus && (
              <Badge
                variant={
                  tokenStatus === "active"
                    ? "default"
                    : tokenStatus === "expiring_soon"
                      ? "secondary"
                      : "destructive"
                }
              >
                {tokenStatus.replace("_", " ")}
              </Badge>
            )}
            <Button variant={isTokenActive ? "outline" : "default"}>
              {isTokenActive ? "Reconnect" : "Connect LinkedIn"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice & Tone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tone">Tone Description</Label>
              <Textarea
                id="tone"
                defaultValue={voiceProfile?.toneDescription ?? ""}
                placeholder="Describe your preferred tone..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Example Posts</Label>
              <div className="mt-2 space-y-2">
                {(voiceProfile?.examplePosts ?? []).map((post, index) => (
                  <div key={index} className="rounded-lg border p-3 text-sm">
                    {post}
                  </div>
                ))}
                {(voiceProfile?.examplePosts ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No example posts added.</p>
                )}
              </div>
            </div>
            <Button>Save Voice</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Notifications are currently limited to in-app badges. Email and push notifications will be added in a
              future update.
            </p>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">In-App Badges</p>
                <p className="text-sm text-muted-foreground">
                  Show notification badges for pending drafts and alerts.
                </p>
              </div>
              <Badge>Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

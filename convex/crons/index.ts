import { cronJobs } from "convex/server"
import { internal } from "../_generated/api"

const crons = cronJobs()

crons.interval("discovery-every-6-hours", { minutes: 360 }, internal.actions.discovery.run)

crons.interval("publish-every-5-minutes", { minutes: 5 }, internal.actions.publish.run)

crons.interval("health-check-daily", { minutes: 1440 }, internal.actions.healthCheck.run)

export default crons

import { cronJobs } from "convex/server"
import { CRONS } from "@/lib/config"
import { internal } from "../_generated/api"

const crons = cronJobs()

crons.interval("discovery-every-6-hours", { minutes: CRONS.DISCOVERY_MINUTES }, internal.actions.discovery.run)

crons.interval("publish-every-5-minutes", { minutes: CRONS.PUBLISH_MINUTES }, internal.actions.publish.run)

crons.interval("health-check-daily", { minutes: CRONS.HEALTH_CHECK_MINUTES }, internal.actions.healthCheck.run)

export default crons

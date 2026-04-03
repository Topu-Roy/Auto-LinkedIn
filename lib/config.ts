/**
 * Centralized application configuration.
 * This is the single source of truth for all constants, limits, and configuration values.
 * No hardcoded values should exist elsewhere in the codebase.
 */

// ─── Time Durations ────────────────────────────────────────────────

export const TIME = {
  /** 15 minutes in milliseconds — minimum schedule offset */
  MIN_SCHEDULE_OFFSET_MS: 15 * 60 * 1000,
  /** 14 days in milliseconds — content dedup window, token warning threshold */
  FOURTEEN_DAYS_MS: 14 * 24 * 60 * 60 * 1000,
  /** 365 days in milliseconds — LinkedIn token hard expiry limit */
  THREE_SIXTY_FIVE_DAYS_MS: 365 * 24 * 60 * 60 * 1000,
  /** 60 days in seconds — default LinkedIn token expiry fallback */
  DEFAULT_TOKEN_EXPIRY_S: 5184000,
  /** Countdown timer refresh interval in milliseconds */
  COUNTDOWN_REFRESH_MS: 1000,
} as const

// ─── Cron Intervals ────────────────────────────────────────────────

export const CRONS = {
  /** Discovery cron interval in minutes (6 hours) */
  DISCOVERY_MINUTES: 360,
  /** Publish cron interval in minutes */
  PUBLISH_MINUTES: 5,
  /** Health check cron interval in minutes (24 hours) */
  HEALTH_CHECK_MINUTES: 1440,
} as const

// ─── Numeric Limits ────────────────────────────────────────────────

export const LIMITS = {
  /** Max drafts generated per user per day */
  MAX_DRAFTS_PER_DAY: 5,
  /** Max retry attempts before marking a post as failed */
  MAX_PUBLISH_RETRIES: 3,
  /** Max topics a user can select during onboarding */
  MAX_TOPICS: 10,
  /** Min topics required during onboarding */
  MIN_TOPICS: 3,
  /** Max example posts for voice calibration */
  MAX_EXAMPLE_POSTS: 3,
  /** Max time windows for scheduling */
  MAX_TIME_WINDOWS: 5,
  /** Min relevance score to queue content for generation */
  MIN_RELEVANCE_SCORE: 4,
  /** Default confidence score fallback when Gemini doesn't return one */
  DEFAULT_CONFIDENCE_SCORE: 5,
  /** Default retry count on draft creation */
  DEFAULT_RETRY_COUNT: 0,
  /** Max scheduled posts shown on dashboard */
  DASHBOARD_SCHEDULED_LIMIT: 5,
  /** NewsData.io API result page size */
  NEWSDATA_PAGE_SIZE: 20,
  /** PBKDF2 key derivation iterations */
  PBKDF2_ITERATIONS: 100000,
} as const

// ─── Status Strings ────────────────────────────────────────────────

/** Discovered content statuses */
export const DISCOVERY_STATUS = {
  QUEUED: "queued",
  PINNED: "pinned",
  SKIPPED: "skipped",
  GENERATED: "generated",
} as const

/** Generated draft statuses */
export const DRAFT_STATUS = {
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SCHEDULED: "scheduled",
  PUBLISHING: "publishing",
  PUBLISHED: "published",
  FAILED: "failed",
} as const

/** Post schedule statuses */
export const SCHEDULE_STATUS = {
  QUEUED: "queued",
  PUBLISHING: "publishing",
  PUBLISHED: "published",
  FAILED: "failed",
} as const

/** LinkedIn token statuses */
export const TOKEN_STATUS = {
  ACTIVE: "active",
  EXPIRING_SOON: "expiring_soon",
  REFRESHING: "refreshing",
  HARD_EXPIRED: "hard_expired",
} as const

// ─── Weight Values ─────────────────────────────────────────────────

export const WEIGHT = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const

export const WEIGHT_ORDER: Record<string, number> = {
  [WEIGHT.HIGH]: 3,
  [WEIGHT.MEDIUM]: 2,
  [WEIGHT.LOW]: 1,
} as const

// ─── Cadence Values ────────────────────────────────────────────────

export const CADENCE = {
  DAILY: "daily",
  THREE_TIMES_WEEK: "3x_week",
  WEEKLY: "weekly",
  CUSTOM: "custom",
} as const

// ─── API Endpoints ─────────────────────────────────────────────────

export const API = {
  NEWSDATA_BASE: "https://newsdata.io/api/1",
  LINKEDIN_API_BASE: "https://api.linkedin.com/v2",
  LINKEDIN_OAUTH_TOKEN: "https://www.linkedin.com/oauth/v2/accessToken",
  LINKEDIN_POST_URL: (postId: string) => `https://www.linkedin.com/feed/update/${postId}`,
} as const

// ─── LinkedIn API Config ───────────────────────────────────────────

export const LINKEDIN = {
  SCOPES: ["r_liteprofile", "w_member_social", "r_basicprofile"],
  HEADERS: {
    RESTLI_PROTOCOL_VERSION: "2.0.0",
    LINKEDIN_VERSION: "202411",
    CONTENT_TYPE_JSON: "application/json",
    CONTENT_TYPE_OCTET: "application/octet-stream",
    CONTENT_TYPE_FORM: "application/x-www-form-urlencoded",
  },
  BODY: {
    LIFECYCLE_STATE: "PUBLISHED",
    SHARE_MEDIA_TEXT: "NONE",
    SHARE_MEDIA_IMAGE: "IMAGE",
    VISIBILITY: "PUBLIC",
    MEDIA_STATUS: "READY",
    MEDIA_TITLE: "Shared via Auto-LinkedIn",
    IMAGE_RECIPE: "urn:li:digitalmediaRecipe:feedshare-image",
    RELATIONSHIP_TYPE: "OWNER",
    RELATIONSHIP_IDENTIFIER: "urn:li:userGeneratedContent",
    PERSON_URN_PREFIX: "urn:li:person:",
  },
  RESPONSE_HEADERS: {
    RESTLI_ID: "x-restli-id",
    LOCATION: "location",
  },
  OAUTH: {
    GRANT_TYPE_REFRESH: "refresh_token",
  },
} as const

// ─── Gemini Config ─────────────────────────────────────────────────

export const GEMINI = {
  MODELS: {
    TEXT: "gemini-2.0-flash",
    IMAGE: "gemini-2.0-flash-exp",
  },
  IMAGE: {
    ASPECT_RATIO: "1:1",
    NUMBER_OF_IMAGES: 1,
    MIME_TYPE: "image/png",
    DIMENSIONS_LABEL: "1080x1080",
  },
  CONTENT: {
    MIN_CHARS: 300,
    MAX_CHARS: 1000,
    FALLBACK_PROMPT_TRUNCATE: 100,
  },
  SCORE: {
    MIN: 1,
    MAX: 10,
  },
  DEFAULT_VOICE: "Professional and informative",
} as const

// ─── Image Generation Prompt ───────────────────────────────────────

export const IMAGE_PROMPT = {
  FALLBACK: (topic: string) => `Professional illustration about: ${topic}`,
} as const

// ─── Encryption Config ─────────────────────────────────────────────

export const ENCRYPTION = {
  ALGORITHM: "AES-GCM",
  IV_LENGTH: 12,
  SALT_LENGTH: 16,
  PBKDF2_SALT: "linkedin-token-salt",
  PBKDF2_HASH: "SHA-256",
  AES_KEY_LENGTH: 256,
  PBKDF2_ITERATIONS: 100000,
} as const

// ─── Timezones ─────────────────────────────────────────────────────

export const TIMEZONES = [
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
] as const

export const DEFAULTS = {
  TIMEZONE: "UTC",
  LANGUAGE: "en",
  CADENCE: CADENCE.DAILY,
  TOPIC_WEIGHT: WEIGHT.MEDIUM,
  TIME_WINDOW_START: "09:00",
  TIME_WINDOW_END: "17:00",
  ONBOARDING_COMPLETE: false,
} as const

// ─── Curated Topics ────────────────────────────────────────────────

export const CURATED_TOPICS = [
  { name: "Artificial Intelligence & Machine Learning", category: "technology" },
  { name: "Software Engineering & Development", category: "technology" },
  { name: "SaaS & Cloud Computing", category: "technology" },
  { name: "Digital Marketing & Growth", category: "business" },
  { name: "Leadership & Management", category: "business" },
  { name: "Productivity & Time Management", category: "business" },
  { name: "Entrepreneurship & Startups", category: "business" },
  { name: "Product Management", category: "technology" },
  { name: "Data Science & Analytics", category: "technology" },
  { name: "Cybersecurity", category: "technology" },
  { name: "Remote Work & Future of Work", category: "business" },
  { name: "Personal Branding", category: "business" },
  { name: "Sales & Business Development", category: "business" },
  { name: "UX/UI Design", category: "technology" },
  { name: "Web3 & Blockchain", category: "technology" },
  { name: "Fintech & Financial Technology", category: "business" },
  { name: "E-commerce & Retail Tech", category: "business" },
  { name: "HR & Talent Acquisition", category: "business" },
  { name: "Customer Success & Support", category: "business" },
  { name: "DevOps & Infrastructure", category: "technology" },
] as const

// ─── Topic-to-Category Map ─────────────────────────────────────────

export const TOPIC_TO_CATEGORY_MAP: Record<string, string> = {
  "Artificial Intelligence & Machine Learning": "technology",
  "Software Engineering & Development": "technology",
  "SaaS & Cloud Computing": "technology",
  "Digital Marketing & Growth": "business",
  "Leadership & Management": "business",
  "Productivity & Time Management": "business",
  "Entrepreneurship & Startups": "business",
  "Product Management": "technology",
  "Data Science & Analytics": "technology",
  Cybersecurity: "technology",
  "Remote Work & Future of Work": "business",
  "Personal Branding": "business",
  "Sales & Business Development": "business",
  "UX/UI Design": "technology",
  "Web3 & Blockchain": "technology",
  "Fintech & Financial Technology": "business",
  "E-commerce & Retail Tech": "business",
  "HR & Talent Acquisition": "business",
  "Customer Success & Support": "business",
  "DevOps & Infrastructure": "technology",
} as const

// ─── Navigation ────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { href: "/dashboard" as const, label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/discover" as const, label: "Discover", icon: "Compass" },
  { href: "/drafts" as const, label: "Drafts", icon: "FileText" },
  { href: "/schedule" as const, label: "Schedule", icon: "Calendar" },
  { href: "/history" as const, label: "History", icon: "History" },
  { href: "/topics" as const, label: "Topics", icon: "Tag" },
  { href: "/settings" as const, label: "Settings", icon: "Settings" },
] as const

// ─── Onboarding Steps ──────────────────────────────────────────────

export const ONBOARDING_STEPS = [
  { id: 1, title: "Topics", description: "Pick your interest areas" },
  { id: 2, title: "Voice", description: "Calibrate your tone" },
  { id: 3, title: "Cadence", description: "Set your posting schedule" },
] as const

// ─── Status Badge UI Config ────────────────────────────────────────

export const STATUS_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  [DRAFT_STATUS.PENDING_REVIEW]: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  [DRAFT_STATUS.APPROVED]: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [DRAFT_STATUS.REJECTED]: {
    label: "Rejected",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
  [DRAFT_STATUS.SCHEDULED]: {
    label: "Scheduled",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  [DRAFT_STATUS.PUBLISHING]: {
    label: "Publishing",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  [DRAFT_STATUS.PUBLISHED]: {
    label: "Published",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  [DRAFT_STATUS.FAILED]: {
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  [SCHEDULE_STATUS.QUEUED]: {
    label: "Queued",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [DISCOVERY_STATUS.PINNED]: {
    label: "Pinned",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  [DISCOVERY_STATUS.SKIPPED]: {
    label: "Skipped",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
  [DISCOVERY_STATUS.GENERATED]: {
    label: "Generated",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  },
} as const

// ─── Confidence Meter Config ───────────────────────────────────────

export const CONFIDENCE_COLORS: Record<number, string> = {
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
} as const

export const CONFIDENCE_SIZES: Record<string, string> = {
  sm: "h-1.5 w-16",
  md: "h-2 w-24",
  lg: "h-3 w-32",
} as const

// ─── Layout Dimensions ─────────────────────────────────────────────

export const LAYOUT = {
  SIDEBAR_WIDTH: "w-64",
  HEADER_HEIGHT: "h-14",
} as const

// ─── Error Messages ────────────────────────────────────────────────

export const ERRORS = {
  UNAUTHENTICATED: "Unauthenticated",
  TOPIC_NOT_FOUND: "Topic not found",
  USER_PROFILE_NOT_FOUND: "User profile not found",
  DRAFT_NOT_FOUND: "Draft not found",
  SCHEDULE_TOO_SOON: "Scheduled time must be at least 15 minutes in the future",
} as const

// ─── Date Formatting ───────────────────────────────────────────────

export const DATE_FORMAT = {
  LOCALE: "en-US",
  LONG_DATE: { year: "numeric" as const, month: "long" as const, day: "numeric" as const },
} as const

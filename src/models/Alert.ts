// Alerts: rules a user sets up to be notified about things (an LFM being posted, and later server
// status, shard exchange listings, friends logging in, ...). Matching happens on the server; the site
// polls the user's inbox for delivered alerts.

type AlertTypeName = "lfm_posted"

interface AlertRule<TCriteria = unknown> {
    id: number
    type: AlertTypeName | string
    criteria: TCriteria
    enabled: boolean
    expires_at: string | null
    created_at: string
    updated_at: string
}

interface AlertRuleInput<TCriteria = unknown> {
    type: AlertTypeName | string
    criteria: TCriteria
    enabled: boolean
    expires_at?: string | null
}

// What every channel delivers; also what the inbox returns.
interface RenderedAlert {
    id: string
    type: string
    rule_id: number
    title: string
    body: string
    url: string // site-relative
    tag: string // collapses duplicate notifications for the same thing
    created_at: string
}

interface AlertInboxResponse {
    data: {
        alerts: RenderedAlert[]
        latest_id: string
    }
}

interface AlertRulesResponse {
    data: AlertRule[]
}

interface AlertRuleResponse {
    data: AlertRule
}

const LFM_DIFFICULTIES = [
    "Casual",
    "Normal",
    "Hard",
    "Elite",
    "Reaper",
    "Epic Casual",
    "Epic Normal",
    "Epic Hard",
    "Epic Elite",
    "Epic Reaper",
] as const

interface LfmPostedCriteria {
    quest_ids: number[]
    server_names: string[] // empty = any server
    min_level: number | null
    max_level: number | null
    difficulties: string[] // empty = any difficulty
}

export type {
    AlertTypeName,
    AlertRule,
    AlertRuleInput,
    RenderedAlert,
    AlertInboxResponse,
    AlertRulesResponse,
    AlertRuleResponse,
    LfmPostedCriteria,
}
export { LFM_DIFFICULTIES }

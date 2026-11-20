// Alerts: rules a user sets up to be notified about things (an LFM being posted, a server going
// offline or online, a friend logging in, a Shard Exchange listing, being outbid). Matching happens
// on the server; the site polls the user's inbox for delivered alerts.

type AlertTypeName =
    | "lfm_posted"
    | "server_status"
    | "friend_login"
    | "shard_exchange_listed"
    | "shard_exchange_outbid"

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

interface ServerStatusCriteria {
    server_names: string[] // empty = any server
    on_offline: boolean
    on_online: boolean
}

interface FriendLoginCriteria {
    all_friends: boolean
    character_ids: number[] // ignored when all_friends is true
}

// One item per rule. Prices are for the whole listing, in shards.
interface ShardExchangeListedCriteria {
    item_slug: string
    item_name: string | null // filled in by the server for display
    server_names: string[] // empty = any server
    max_buyout: number | null
    max_price: number | null // the current bid, or the minimum bid when there is none
    require_buyout: boolean
}

interface ShardExchangeOutbidCriteria {
    character_ids: number[] // empty = all verified characters
}

export type {
    AlertTypeName,
    ServerStatusCriteria,
    FriendLoginCriteria,
    ShardExchangeListedCriteria,
    ShardExchangeOutbidCriteria,
    AlertRule,
    AlertRuleInput,
    RenderedAlert,
    AlertInboxResponse,
    AlertRulesResponse,
    AlertRuleResponse,
    LfmPostedCriteria,
}
export { LFM_DIFFICULTIES }

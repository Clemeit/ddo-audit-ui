// Registry of alert types the UI knows how to create and describe. Mirrors the backend registry
// (ddo-audit-service sanic/business/alerts). To add a type: add a folder next to lfmPosted with its
// form and summary, then register it below (in a group, so it gets a section on /notifications).

import React from "react"
import {
    AlertRule,
    FriendLoginCriteria,
    LfmPostedCriteria,
    ServerStatusCriteria,
    ShardExchangeListedCriteria,
    ShardExchangeOutbidCriteria,
} from "../../../models/Alert"
import { ConfigEndpointResponse } from "../../../models/Config"
import {
    getIsFeatureEnabled,
    SHARD_EXCHANGE_ENABLED_FEATURE_KEY,
} from "../../../utils/configUtils"
import LfmPostedCriteriaForm from "./lfmPosted/LfmPostedCriteriaForm"
import {
    defaultLfmPostedCriteria,
    describeLfmPosted,
    summarizeLfmPosted,
    validateLfmPosted,
} from "./lfmPosted/summarize"
import ServerStatusCriteriaForm from "./serverStatus/ServerStatusCriteriaForm"
import {
    defaultServerStatusCriteria,
    describeServerStatus,
    summarizeServerStatus,
    validateServerStatus,
} from "./serverStatus/summarize"
import FriendLoginCriteriaForm from "./friendLogin/FriendLoginCriteriaForm"
import {
    defaultFriendLoginCriteria,
    describeFriendLogin,
    summarizeFriendLogin,
    validateFriendLogin,
} from "./friendLogin/summarize"
import ShardExchangeListedCriteriaForm from "./shardExchangeListed/ShardExchangeListedCriteriaForm"
import {
    defaultShardExchangeListedCriteria,
    describeShardExchangeListed,
    summarizeShardExchangeListed,
    validateShardExchangeListed,
} from "./shardExchangeListed/summarize"
import ShardExchangeOutbidCriteriaForm from "./shardExchangeOutbid/ShardExchangeOutbidCriteriaForm"
import {
    defaultShardExchangeOutbidCriteria,
    describeShardExchangeOutbid,
    summarizeShardExchangeOutbid,
    validateShardExchangeOutbid,
} from "./shardExchangeOutbid/summarize"

interface CriteriaFormProps<TCriteria> {
    criteria: TCriteria
    onChange: (criteria: TCriteria) => void
}

interface SummaryHelpers {
    questName: (id: number) => string | undefined
    // A friend's or verified character's name, when this browser knows it.
    characterName: (id: number) => string | undefined
}

type AlertGroupName = "groups" | "servers" | "friends" | "shard_exchange"

interface AlertGroup {
    name: AlertGroupName
    title: string
    // Shown when the section has no alerts yet, before the "Add one" link.
    emptyText: string
}

// Sections of the notifications page, in order.
const ALERT_GROUPS: AlertGroup[] = [
    {
        name: "groups",
        title: "Groups",
        emptyText: "No LFM alerts yet.",
    },
    {
        name: "servers",
        title: "Servers",
        emptyText: "No server alerts yet.",
    },
    {
        name: "friends",
        title: "Friends",
        emptyText: "No friend alerts yet.",
    },
    {
        name: "shard_exchange",
        title: "Shard Exchange",
        emptyText: "No Shard Exchange alerts yet.",
    },
]

// The registry holds definitions with different criteria types, hence the `any` default.
interface AlertTypeDefinition<TCriteria = any> {
    type: string
    group: AlertGroupName
    label: string
    // The type picker's "Alert me when…" choice.
    pickerLabel: string
    description: string
    // Only offered while this server feature flag is on (existing rules still show).
    featureKey?: string
    defaultCriteria: () => TCriteria
    CriteriaForm: React.ComponentType<CriteriaFormProps<TCriteria>>
    summarize: (criteria: TCriteria, helpers: SummaryHelpers) => string
    // Card form of a rule: a title plus short filter chips.
    describe: (
        criteria: TCriteria,
        helpers: SummaryHelpers
    ) => { title: string; chips: string[] }
    validate: (criteria: TCriteria) => string | null
    // Criteria fields the server fills in for display only; ignored when spotting duplicates.
    displayOnlyFields?: (keyof TCriteria & string)[]
}

const lfmPosted: AlertTypeDefinition<LfmPostedCriteria> = {
    type: "lfm_posted",
    group: "groups",
    label: "LFM posted",
    pickerLabel: "An LFM is posted for a quest or raid",
    description:
        "Get alerted when someone posts an LFM for one of your quests.",
    defaultCriteria: defaultLfmPostedCriteria,
    CriteriaForm: LfmPostedCriteriaForm,
    summarize: (criteria, { questName }) =>
        summarizeLfmPosted(criteria, questName),
    describe: (criteria, { questName }) =>
        describeLfmPosted(criteria, questName),
    validate: validateLfmPosted,
}

const serverStatus: AlertTypeDefinition<ServerStatusCriteria> = {
    type: "server_status",
    group: "servers",
    label: "Server status",
    pickerLabel: "A server goes offline or comes back online",
    description:
        "Get alerted when a server goes down, or when it's back up and you can log in.",
    defaultCriteria: defaultServerStatusCriteria,
    CriteriaForm: ServerStatusCriteriaForm,
    summarize: (criteria) => summarizeServerStatus(criteria),
    describe: (criteria) => describeServerStatus(criteria),
    validate: validateServerStatus,
}

const friendLogin: AlertTypeDefinition<FriendLoginCriteria> = {
    type: "friend_login",
    group: "friends",
    label: "Friend logged in",
    pickerLabel: "A friend logs in",
    description: "Get alerted when someone on your friends list logs in.",
    defaultCriteria: defaultFriendLoginCriteria,
    CriteriaForm: FriendLoginCriteriaForm,
    summarize: (criteria, { characterName }) =>
        summarizeFriendLogin(criteria, characterName),
    describe: (criteria, { characterName }) =>
        describeFriendLogin(criteria, characterName),
    validate: validateFriendLogin,
}

const shardExchangeListed: AlertTypeDefinition<ShardExchangeListedCriteria> = {
    type: "shard_exchange_listed",
    group: "shard_exchange",
    label: "Item listed",
    pickerLabel: "An item is listed on the Shard Exchange",
    description:
        "Get alerted when an item you want is put up on the Shard Exchange, optionally under a price.",
    featureKey: SHARD_EXCHANGE_ENABLED_FEATURE_KEY,
    defaultCriteria: defaultShardExchangeListedCriteria,
    CriteriaForm: ShardExchangeListedCriteriaForm,
    summarize: (criteria) => summarizeShardExchangeListed(criteria),
    describe: (criteria) => describeShardExchangeListed(criteria),
    validate: validateShardExchangeListed,
    displayOnlyFields: ["item_name"],
}

const shardExchangeOutbid: AlertTypeDefinition<ShardExchangeOutbidCriteria> = {
    type: "shard_exchange_outbid",
    group: "shard_exchange",
    label: "Outbid",
    pickerLabel: "One of my characters is outbid",
    description:
        "Get alerted when someone outbids one of your verified characters on the Shard Exchange.",
    featureKey: SHARD_EXCHANGE_ENABLED_FEATURE_KEY,
    defaultCriteria: defaultShardExchangeOutbidCriteria,
    CriteriaForm: ShardExchangeOutbidCriteriaForm,
    summarize: (criteria, { characterName }) =>
        summarizeShardExchangeOutbid(criteria, characterName),
    describe: (criteria, { characterName }) =>
        describeShardExchangeOutbid(criteria, characterName),
    validate: validateShardExchangeOutbid,
}

const ALERT_TYPES: AlertTypeDefinition[] = [
    lfmPosted,
    serverStatus,
    friendLogin,
    shardExchangeListed,
    shardExchangeOutbid,
]

function getAlertTypeDefinition(type: string): AlertTypeDefinition | undefined {
    return ALERT_TYPES.find((t) => t.type === type)
}

/** The types users can create right now (feature-flagged ones only while their flag is on). */
function getVisibleAlertTypes(
    config: ConfigEndpointResponse | null | undefined
): AlertTypeDefinition[] {
    return ALERT_TYPES.filter(
        (t) => !t.featureKey || getIsFeatureEnabled(config, t.featureKey)
    )
}

function canonical(value: unknown): unknown {
    if (Array.isArray(value)) {
        // Every list in a rule's criteria is a set (servers, quests, characters): order doesn't count.
        return value
            .map(canonical)
            .sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1))
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map((k) => [
                    k,
                    canonical((value as Record<string, unknown>)[k]),
                ])
        )
    }
    return value
}

/** Same idea as the server's AlertType.criteria_key: equal keys alert on exactly the same things. */
function criteriaKey(
    definition: AlertTypeDefinition,
    criteria: unknown
): string {
    const ignored = new Set<string>(definition.displayOnlyFields ?? [])
    const trimmed = Object.fromEntries(
        Object.entries((criteria ?? {}) as Record<string, unknown>).filter(
            ([k]) => !ignored.has(k)
        )
    )
    return JSON.stringify(canonical(trimmed))
}

/** Another of the user's rules with this type and criteria, if there is one. */
function findDuplicateRule(
    rules: AlertRule[],
    definition: AlertTypeDefinition,
    criteria: unknown,
    excludeRuleId?: number
): AlertRule | undefined {
    const key = criteriaKey(definition, criteria)
    return rules.find(
        (r) =>
            r.id !== excludeRuleId &&
            r.type === definition.type &&
            criteriaKey(definition, r.criteria) === key
    )
}

export {
    ALERT_TYPES,
    ALERT_GROUPS,
    findDuplicateRule,
    getAlertTypeDefinition,
    getVisibleAlertTypes,
}
export type {
    AlertGroup,
    AlertGroupName,
    AlertTypeDefinition,
    CriteriaFormProps,
    SummaryHelpers,
}

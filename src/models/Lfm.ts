import { SERVER_NAMES_LOWER } from "../constants/servers"
import { ActivityEvent } from "./Activity"
import { Character } from "./Character"

interface QuestLevel {
    heroic_normal: number
    heroic_hard: number
    heroic_elite: number
    epic_normal: number
    epic_hard: number
    epic_elite: number
}

interface QuestXP {
    heroic_normal: number
    heroic_hard: number
    heroic_elite: number
    epic_normal: number
    epic_hard: number
    epic_elite: number
}

interface Quest {
    id: number
    alt_id: string
    area_id: number
    name: string
    heroic_normal_cr: number
    epic_normal_cr: number
    xp: QuestXP
    is_free_to_play: boolean
    is_free_to_vip: boolean
    required_adventure_pack: string
    adventure_area: string
    quest_journal_group: string
    group_size: string
    patron: string
    average_time: number
    tip: string
}

interface QuestApiResponse {
    data: Quest[]
    source: string
    timestamp: number
}

interface LfmActivityEvent {
    tag: string
    data: string
}

interface LfmActivity {
    timestamp: string
    events: LfmActivityEvent[]
}

interface FlatActivityEvent {
    tag: LfmActivityType
    data: string | null
    timestamp: string
}

interface Lfm {
    id: number
    comment: string
    quest: Quest | null
    quest_id: number | null
    is_quest_guess: boolean
    difficulty: string
    accepted_classes: string[]
    accepted_classes_count: number
    minimum_level: number
    maximum_level: number
    adventure_active_time: number
    leader: Character
    members: Character[]
    activity: LfmActivity[]
    last_updated: string
    server_name: string
    metadata?: {
        isEligible?: boolean
        eligibleCharacters?: Character[]
        lastRenderTime?: number
        raidActivity?: ActivityEvent[]
        isPostedByFriend?: boolean
        includesFriend?: boolean
    }
}

enum LfmActivityType {
    POSTED = "posted",
    COMMENT = "comment",
    QUEST = "quest",
    MEMBER_JOINED = "member_joined",
    MEMBER_LEFT = "member_left",
    SPACER = "spacer",
}

interface LfmApiServerModel {
    lfms: { [key: number]: Lfm }
}

type ServerName = (typeof SERVER_NAMES_LOWER)[number]

type LfmApiDataModel = {
    [K in ServerName]?: { number: Lfm }
}

interface LfmApiModel {
    data?: LfmApiDataModel
}

interface LfmSpecificApiModel {
    data?: { number: Lfm }
}

interface LfmSortType {
    type: string
    ascending: boolean
}

export type {
    QuestLevel,
    QuestXP,
    Quest,
    LfmActivityEvent,
    LfmActivity,
    Lfm,
    LfmApiServerModel,
    LfmApiDataModel,
    LfmSortType,
    FlatActivityEvent,
    QuestApiResponse,
    LfmApiModel,
    LfmSpecificApiModel,
}

export { LfmActivityType }

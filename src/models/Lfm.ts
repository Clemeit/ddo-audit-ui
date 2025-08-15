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
    metadata?: {
        isUnknown?: boolean
    }
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

enum LfmSortType {
    LEADER_NAME = "leader_name",
    QUEST_NAME = "quest_name",
    ACCEPTED_CLASSES = "accepted_classes",
    LEVEL = "level",
}

interface LfmSortSetting {
    type: LfmSortType
    ascending: boolean
}

const constructUnknownQuest = (questId: number): Quest => {
    return {
        id: questId,
        alt_id: undefined,
        area_id: undefined,
        name: "Unknown Quest",
        heroic_normal_cr: undefined,
        epic_normal_cr: undefined,
        xp: {
            heroic_normal: undefined,
            heroic_hard: undefined,
            heroic_elite: undefined,
            epic_normal: undefined,
            epic_hard: undefined,
            epic_elite: undefined,
        },
        is_free_to_play: undefined,
        is_free_to_vip: undefined,
        required_adventure_pack: undefined,
        adventure_area: undefined,
        quest_journal_group: undefined,
        group_size: undefined,
        patron: undefined,
        average_time: undefined,
        tip: undefined,
        metadata: {
            isUnknown: true,
        },
    }
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
    LfmSortSetting,
    FlatActivityEvent,
    QuestApiResponse,
    LfmApiModel,
    LfmSpecificApiModel,
}

export { LfmActivityType, constructUnknownQuest, LfmSortType }

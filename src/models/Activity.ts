import { Character, CharacterClass } from "./Character"

interface ActivityEvent {
    timestamp: string
    character_id?: number
    character?: Character
    data: any
}

interface CharacterActivity {
    id: string
    activity_type: CharacterActivityType
    data: any
}

enum CharacterActivityType {
    total_level = "total_level",
    location = "location",
    guild_name = "guild_name",
    server_name = "server_name",
    status = "status",
}

interface RaidActivityEvent {
    timestamp: string
    character_id: number
    data: {
        quest_ids: number[]
    }
}

interface RaidActivityEndpointResponse {
    data: RaidActivityEvent[]
}

interface CharacterActivityData {
    timestamp: string
    character_id: number
    data: {
        location_id?: number
        status?: boolean
        guild_name?: string
        total_level?: number
        classes?: CharacterClass[]
    }
}

interface CharacterActivityEndpointResponse {
    data: CharacterActivityData[]
}

export type {
    ActivityEvent,
    CharacterActivity,
    RaidActivityEvent,
    RaidActivityEndpointResponse,
    CharacterActivityEndpointResponse,
    CharacterActivityData,
}
export { CharacterActivityType }

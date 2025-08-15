import { Character } from "./Character"

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

export type {
    ActivityEvent,
    CharacterActivity,
    RaidActivityEvent,
    RaidActivityEndpointResponse,
}
export { CharacterActivityType }

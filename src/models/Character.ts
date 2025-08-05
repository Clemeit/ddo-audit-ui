import { Area } from "./Area"

interface CharacterClass {
    name: string
    level: number
}

interface Character {
    id: number
    name?: string
    gender?: string
    race?: string
    total_level?: number
    classes?: CharacterClass[]
    location?: Area
    location_id?: number
    guild_name?: string
    server_name?: string
    home_server_name?: string
    group_id?: number
    is_online?: boolean
    is_in_party?: boolean
    is_anonymous?: boolean
    is_recruiting?: boolean
    public_comment?: string
    last_updated?: string
    last_saved?: string
    metadata?: {
        isFriend?: boolean
        isRegistered?: boolean
        isIgnored?: boolean
    }
}

interface CharacterApiServerModel {
    characters: { [key: number]: Character }
    last_update: string
}

interface CharacterApiDataModel {
    [serverName: string]: CharacterApiServerModel | undefined
}

interface CharacterSpecificApiDataModel {
    data?: { [characterId: number]: Character }
}

interface CharacterSummaryModel {
    character_count: number
}

interface CharacterSummaryApiDataModel {
    [serverName: string]: CharacterSummaryModel | undefined
}

interface OnlineCharacterIdsModel {
    [serverName: string]: number[]
}

interface OnlineCharacterIdsApiModel {
    data?: OnlineCharacterIdsModel
}

interface SingleCharacterResponseModel {
    data?: Character
    source?: string
    message?: string
}

interface MultipleCharacterResponseModel {
    data?: { [characterId: string]: Character }
    message?: string
}

enum CharacterSortType {
    Name = "name",
    Level = "level",
    Guild = "guild",
    Class = "class",
    Group = "group",
    Lfm = "lfm",
}

interface CharacterSortBy {
    type: CharacterSortType
    ascending: boolean
}

export type {
    Character,
    CharacterClass,
    CharacterApiServerModel,
    CharacterApiDataModel,
    CharacterSummaryApiDataModel,
    CharacterSummaryModel,
    CharacterSortBy,
    OnlineCharacterIdsModel,
    OnlineCharacterIdsApiModel,
    CharacterSpecificApiDataModel,
    SingleCharacterResponseModel,
    MultipleCharacterResponseModel,
}
export { CharacterSortType }

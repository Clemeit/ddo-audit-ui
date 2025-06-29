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
}

interface CharacterApiServerModel {
    characters: { [key: number]: Character }
    last_update: string
}

interface CharacterApiDataModel {
    argonnessen?: CharacterApiServerModel
    cannith?: CharacterApiServerModel
    ghallanda?: CharacterApiServerModel
    khyber?: CharacterApiServerModel
    orien?: CharacterApiServerModel
    sarlona?: CharacterApiServerModel
    thelanis?: CharacterApiServerModel
    wayfinder?: CharacterApiServerModel
    hardcore?: CharacterApiServerModel
    cormyr?: CharacterApiServerModel
}

interface CharacterSpecificApiDataModel {
    data?: { [characterId: number]: Character }
}

interface CharacterSummaryModel {
    character_count: number
}

interface CharacterSummaryApiDataModel {
    argonnessen?: CharacterSummaryModel
    cannith?: CharacterSummaryModel
    ghallanda?: CharacterSummaryModel
    khyber?: CharacterSummaryModel
    orien?: CharacterSummaryModel
    sarlona?: CharacterSummaryModel
    thelanis?: CharacterSummaryModel
    wayfinder?: CharacterSummaryModel
    hardcore?: CharacterSummaryModel
    cormyr?: CharacterSummaryModel
}

interface OnlineCharacterIdsModel {
    [serverName: string]: number[]
}

interface OnlineCharacterIdsApiModel {
    data?: OnlineCharacterIdsModel
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
}
export { CharacterSortType }

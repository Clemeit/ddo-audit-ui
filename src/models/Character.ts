interface CharacterClass {
    name: string
    level: number
}

interface CharacterLocation {
    id: number
    name?: string
    region?: string
    is_public_space?: boolean
}

interface Character {
    id: string
    name?: string
    gender?: string
    race?: string
    total_level?: number
    classes?: CharacterClass[]
    location?: CharacterLocation
    guild_name?: string
    server_name?: string
    home_server_name?: string
    group_id?: string
    is_online?: boolean
    is_in_party?: boolean
    is_anonymous?: boolean
    is_recruiting?: boolean
    public_comment?: string
    last_updated?: string
    last_saved?: string
}

export { Character, CharacterClass, CharacterLocation }

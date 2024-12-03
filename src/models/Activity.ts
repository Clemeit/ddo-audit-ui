interface ActivityEvent {
    timestamp: string
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

export { ActivityEvent, CharacterActivity, CharacterActivityType }

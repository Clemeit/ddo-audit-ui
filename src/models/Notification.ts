interface NotificationPreferences {
    lfmUpdates: boolean
    raidAlerts: boolean
    guildEvents: boolean
    serverStatus: boolean
    questOfTheDay: boolean
    favoriteQuestAlerts: boolean
    instantNotifications: boolean
    digestNotifications: boolean
    scheduleStartHour: number
    scheduleEndHour: number
}

export type { NotificationPreferences }

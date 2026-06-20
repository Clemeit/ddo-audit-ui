import { RaidTimerCharacterSortEnum } from "./Common"

interface CustomRaidTimer {
    id: string
    characterId: number
    questIds: number[]
    questName: string
    completedAt: string
    createdAt: string
}

interface RaidTimerStorage {
    sortType: RaidTimerCharacterSortEnum
    sortOrder: string
    hiddenTimers?: {
        characterId: number
        timestamp: string
        id?: string
    }[]
}

export type { CustomRaidTimer, RaidTimerStorage }

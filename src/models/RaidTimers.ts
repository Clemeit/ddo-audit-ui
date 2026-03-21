import { RaidTimerCharacterSortEnum } from "./Common"

interface RaidTimerStorage {
    sortType: RaidTimerCharacterSortEnum
    sortOrder: string
    hiddenTimers?: {
        characterId: number
        timestamp: string
    }[]
}

export type { RaidTimerStorage }

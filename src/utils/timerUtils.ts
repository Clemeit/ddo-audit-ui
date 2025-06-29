import { RAID_TIMER_MILLIS } from "../constants/game"
import { ActivityEvent } from "../models/Activity"
import { Character } from "../models/Character"

function getActiveTimer(
    character: Character,
    questId: number,
    activities: ActivityEvent[]
): ActivityEvent {
    return activities
        .sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        )
        .find((activity) => {
            if (activity.character_id !== character.id) return false
            if (activity.data !== questId) return false
            const elapsedTime =
                Date.now() - new Date(activity.timestamp).getTime()
            const remainingTime = RAID_TIMER_MILLIS - elapsedTime
            return remainingTime > 0
        })
}

export { getActiveTimer }

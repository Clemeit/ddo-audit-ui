import { ActivityEvent } from "../models/Activity"
import { RANSACK_HOURS, RANSACK_THRESHOLD } from "../constants/game.ts"

function getLocationActivityStats(
    locationActivity?: ActivityEvent[] | null,
    filter?: string
) {
    if (!locationActivity || !filter) {
        return {
            totalTime: null,
            totalRuns: null,
            totalRunsWithinRansackHours: null,
            averageTime: null,
            ransackTimerStart: null,
        }
    }

    // average time, number of runs in the last RANSACK_HOURS hours, etc.
    let totalTime = 0
    let totalRuns = 0
    let totalRunsWithinRansackHours = 0
    let averageTime = 0
    let ransackTimerStart = new Date()

    locationActivity.forEach((activity: ActivityEvent, i: number) => {
        const nextTimestamp = new Date(locationActivity[i - 1]?.timestamp)
        const timestamp = new Date(activity.timestamp)

        const timeDifferenceMilliseconds =
            nextTimestamp.getTime() - timestamp.getTime()

        if (!activity.data.name?.toLowerCase().includes(filter.toLowerCase()))
            return
        if (timeDifferenceMilliseconds) totalTime += timeDifferenceMilliseconds
        totalRuns++
        if (
            Date.now() - new Date(activity.timestamp).getTime() <
            RANSACK_HOURS * 60 * 60 * 1000
        ) {
            totalRunsWithinRansackHours++
            if (totalRunsWithinRansackHours >= RANSACK_THRESHOLD) {
                ransackTimerStart = new Date(activity.timestamp)
            }
        }
    })

    if (totalRuns > 0) {
        averageTime = totalTime / totalRuns
    }

    return {
        totalTime,
        totalRuns,
        totalRunsWithinRansackHours,
        averageTime,
        ransackTimerStart,
    }
}

export { getLocationActivityStats }

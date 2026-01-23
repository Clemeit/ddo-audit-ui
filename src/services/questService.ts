import { QuestAnalyticsApiResponse, QuestApiResponse } from "../models/Lfm.ts"
import { getRequest } from "./apiHelper.ts"

export const QUEST_ENDPOINT = "quests"
const QUEST_API_VERSION = "v2"

function getQuests(options?: { force?: boolean; signal?: AbortSignal }) {
    return getRequest<QuestApiResponse>(
        QUEST_ENDPOINT,
        {
            params: { force: options?.force },
            signal: options?.signal,
        },
        QUEST_API_VERSION
    )
}

function getQuestAnalytics(
    questId: number,
    options?: { signal?: AbortSignal }
) {
    return getRequest<QuestAnalyticsApiResponse>(
        `quests/${questId}/analytics`,
        { signal: options?.signal },
        QUEST_API_VERSION
    )
}

export { getQuests, getQuestAnalytics }

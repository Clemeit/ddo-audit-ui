import { useState, useEffect } from "react"
import { LoadingState, ApiState } from "../models/Api.ts"
import { CharacterActivityType, ActivityEvent } from "../models/Activity.ts"
import {
    getCharacterLocationActivityById,
    getCharacterStatusActivityById,
    getCharacterLevelActivityById,
} from "../services/activityService.ts"
import { format } from "date-fns"

const useGetCharacterActivity = ({
    characterId,
    accessToken,
    activityType,
    areaName,
}: {
    characterId?: string
    accessToken?: string
    activityType?: CharacterActivityType
    areaName?: string
}) => {
    const [activity, setActivity] = useState<ApiState<ActivityEvent[]>>({
        data: null,
        loadingState: LoadingState.Initial,
        error: null,
    })

    function reload() {
        if (!characterId || !accessToken || !activityType) {
            return
        }

        setActivity({
            data: null,
            loadingState: LoadingState.Loading,
            error: null,
        })

        // start date should be 14 days ago

        const startDate = format(
            new Date().setDate(new Date().getDate() - 14),
            "yyyy-MM-dd"
        )

        let promise
        if (activityType === CharacterActivityType.location) {
            promise = getCharacterLocationActivityById(
                characterId,
                accessToken,
                startDate,
                "",
                500,
                areaName
            )
        } else if (activityType === CharacterActivityType.status) {
            promise = getCharacterStatusActivityById(characterId, accessToken)
        } else if (activityType === CharacterActivityType.total_level) {
            promise = getCharacterLevelActivityById(characterId, accessToken)
        }

        promise
            .then((response: { data: { data: ActivityEvent[] } }) => {
                setActivity({
                    data: response.data.data,
                    loadingState: LoadingState.Loaded,
                    error: null,
                })
            })
            .catch((error: { message: string }) => {
                setActivity({
                    data: null,
                    loadingState: LoadingState.Error,
                    error: error.message,
                })
            })
    }

    useEffect(() => {
        reload()
    }, [characterId, accessToken, activityType, areaName])

    return {
        data: activity.data,
        loadingState: activity.loadingState,
        error: activity.error,
        reload,
    }
}

export default useGetCharacterActivity

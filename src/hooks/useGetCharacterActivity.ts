import { useState, useEffect } from "react"
import {
    CharacterActivityType,
    CharacterActivityData,
} from "../models/Activity.ts"
import { getCharacterActivityById } from "../services/activityService.ts"
import { format } from "date-fns"

const useGetCharacterActivity = ({
    characterId,
    accessToken,
    activityType,
    areaName,
}: {
    characterId?: number
    accessToken?: string
    activityType?: CharacterActivityType
    areaName?: string
}) => {
    const [activityData, setActivityData] = useState<CharacterActivityData[]>(
        []
    )
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const reload = async () => {
        if (!characterId || !accessToken || !activityType) {
            return
        }

        setIsLoading(true)

        try {
            const startDate = format(
                new Date().setDate(new Date().getDate() - 14),
                "yyyy-MM-dd"
            )

            const activityResponse = await getCharacterActivityById(
                characterId,
                activityType,
                accessToken,
                startDate,
                "",
                500
            )
            if (activityResponse && activityResponse.data) {
                setActivityData(activityResponse.data)
                setIsError(false)
            }
        } catch (error) {
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        reload()
    }, [characterId, accessToken, activityType, areaName])

    return {
        activityData,
        isLoading,
        isError,
        reload,
    }
}

export default useGetCharacterActivity

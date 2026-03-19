import { useEffect, useState } from "react"
import {
    getDismissedFeatureCallouts,
    addDismissedFeatureCallout,
} from "../utils/localStorage"
import { useUserContext } from "../contexts/UserContext"

const useFeatureCallouts = () => {
    const [dismissedCallouts, setDismissedCallouts] = useState<string[]>(
        getDismissedFeatureCallouts() || []
    )
    const { persistentSettingsRevision } = useUserContext()

    useEffect(() => {
        const dismissedCallouts = getDismissedFeatureCallouts() || []
        setDismissedCallouts(dismissedCallouts)
    }, [persistentSettingsRevision])

    const dismissCallout = (callout: string) => {
        if (dismissedCallouts.includes(callout)) return
        setDismissedCallouts([...dismissedCallouts, callout])
        addDismissedFeatureCallout(callout)
    }

    const isCalloutActive = (callout: string) =>
        !dismissedCallouts.includes(callout)

    return {
        isCalloutActive,
        dismissCallout,
        dismissedCallouts,
    }
}

export default useFeatureCallouts

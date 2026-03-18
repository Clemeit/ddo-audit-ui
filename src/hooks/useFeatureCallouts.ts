import { useEffect, useState } from "react"
import {
    getDismissedFeatureCallouts,
    addDismissedFeatureCallout,
} from "../utils/localStorage"

const useFeatureCallouts = () => {
    const [dismissedCallouts, setDismissedCallouts] = useState<string[]>(
        getDismissedFeatureCallouts() || []
    )

    useEffect(() => {
        const dismissedCallouts = getDismissedFeatureCallouts() || []
        setDismissedCallouts(dismissedCallouts)
    }, [])

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

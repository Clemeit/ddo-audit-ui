import { useEffect, useMemo, useState } from "react"
import { addItem, getData } from "../utils/localStorage"

const useFeatureCallouts = () => {
    const callouts = [
        "grouping-settings-button",
        "show-lfm-activity",
        "show-lfm-posted-time",
        "faster-who-updating",
        "show-eligible-characters",
    ]
    const calloutsKey = "feature-callouts"

    const [dismissedCallouts, setDismissedCallouts] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const dismissedCallouts = getData<string[]>(calloutsKey) || []
        console.log("dismissedCallouts", dismissedCallouts)
        setDismissedCallouts(dismissedCallouts)
        setIsLoaded(true)
    }, [])

    const dismissCallout = (callout: string) => {
        if (dismissedCallouts.includes(callout)) return
        setDismissedCallouts([...dismissedCallouts, callout])
        addItem<string>(calloutsKey, callout, (a, b) => a === b)
    }

    const filteredCallouts = useMemo(
        () =>
            isLoaded
                ? callouts.filter(
                      (callout) => !dismissedCallouts.includes(callout)
                  )
                : [],
        [callouts, dismissedCallouts, isLoaded]
    )

    const isCalloutActive = (callout: string) =>
        filteredCallouts.includes(callout)

    return {
        callouts: filteredCallouts,
        isCalloutActive,
        dismissCallout,
    }
}

export default useFeatureCallouts

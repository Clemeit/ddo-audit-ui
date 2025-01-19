import { useEffect, useMemo, useState } from "react"

const useFeatureCallouts = () => {
    const callouts = [
        "grouping-settings-button",
        "show-lfm-activity",
        "show-lfm-posted-time",
    ]

    const [dismissedCallouts, setDismissedCallouts] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const dismissedCallouts = JSON.parse(
            localStorage.getItem("dismissed-callouts") || "[]"
        )
        setDismissedCallouts(dismissedCallouts)
        setIsLoaded(true)
    }, [])

    const dismissCallout = (callout: string) => {
        if (dismissedCallouts.includes(callout)) return
        setDismissedCallouts([...dismissedCallouts, callout])
        localStorage.setItem(
            "dismissed-callouts",
            JSON.stringify([...dismissedCallouts, callout])
        )
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

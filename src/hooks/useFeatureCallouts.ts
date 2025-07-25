import { useEffect, useMemo, useState } from "react"
import { addItem, getData } from "../utils/localStorage"

const useFeatureCallouts = () => {
    const calloutsKey = "dismissed-feature-callouts"

    const [dismissedCallouts, setDismissedCallouts] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const dismissedCallouts = getData<string[]>(calloutsKey) || []
        setDismissedCallouts(dismissedCallouts)
        setIsLoaded(true)
    }, [])

    const dismissCallout = (callout: string) => {
        if (dismissedCallouts.includes(callout)) return
        setDismissedCallouts([...dismissedCallouts, callout])
        addItem<string>(calloutsKey, callout, (a, b) => a === b)
    }

    const isCalloutActive = (callout: string) =>
        !dismissedCallouts.includes(callout)

    return {
        isCalloutActive,
        dismissCallout,
    }
}

export default useFeatureCallouts

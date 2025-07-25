import React from "react"
import Stack from "./Stack"
import useFeatureCallouts from "../../hooks/useFeatureCallouts"
import Badge from "./Badge"
import "./FeaturedItem.css"

interface Props {
    children?: React.ReactNode
    calloutId: string
    badge?: React.ReactNode
}

const defaultBadge = <Badge type="new" text="New" />

const FeaturedItem = ({ children, calloutId, badge = defaultBadge }: Props) => {
    const { isCalloutActive, dismissCallout } = useFeatureCallouts()

    return (
        <div onClick={() => (calloutId ? dismissCallout(calloutId) : {})}>
            <Stack direction="row" gap="10px">
                {children}
                {calloutId && isCalloutActive(calloutId) && (
                    <div className="badge-wrapper">{badge}</div>
                )}
            </Stack>
        </div>
    )
}

export default FeaturedItem

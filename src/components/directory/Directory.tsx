import React from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { BETTER_STACK_URL } from "../../constants/client.ts"
import Badge from "../global/Badge.tsx"
import { AlphaReleasePageMessage } from "../global/CommonMessages.tsx"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"

const Directory = () => {
    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    return (
        <Page
            title="DDO Audit | Character Tracking and LFM Viewer"
            description="A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!"
        >
            {" "}
            {!hideAlphaRelease && (
                <div className="alpha-release-message">
                    <AlphaReleasePageMessage
                        onDismiss={() => {
                            setHideAlphaRelease(true)
                        }}
                    />
                </div>
            )}
            <ContentClusterGroup>
                <ContentCluster title="Population and Activity">
                    <NavCardCluster>
                        <p>minor test</p>
                        <NavigationCard type="live" />
                        <NavigationCard
                            type="servers"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard
                            type="quests"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard
                            type="trends"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Social Tools">
                    <NavCardCluster>
                        <NavigationCard type="grouping" />
                        <NavigationCard type="who" />
                        <NavigationCard type="friends" />
                        <NavigationCard type="ignores" />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Character Tools">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                        <NavigationCard
                            type="timers"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard
                            type="activity"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Additional Resources">
                    <NavCardCluster>
                        <NavigationCard type="about" />
                        <NavigationCard
                            type="api"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard type="feedback" />
                        <NavigationCard
                            type="health"
                            externalLink={BETTER_STACK_URL}
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Directory

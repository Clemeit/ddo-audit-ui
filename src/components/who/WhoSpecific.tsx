import React from "react"
import Page from "../global/Page.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import PageMessage from "../global/PageMessage.tsx"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import Button from "../global/Button.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import MultiPanelContainer, {
    PrimaryType,
} from "../social/MultiPanelContainer.tsx"

const WhoSpecific = () => {
    const {
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
    } = useGetCurrentServer()
    const { panelWidth } = useWhoContext()
    const { isFullScreen } = useThemeContext()
    const { isCalloutActive, dismissCallout } = useFeatureCallouts()

    return (
        <Page
            title={`DDO Live Character Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} Who List! Are your friends online? Is your guild forming up for raid night? Now you know!`}
            centered
            noPadding
            contentMaxWidth
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            {isCalloutActive("faster-who-updating") && (
                <PageMessage
                    title="Faster Updating!"
                    message={
                        <>
                            <span>
                                The Who List now refreshes much more frequently.
                                If you filter the panel down to fewer
                                characters, it will update even faster.
                            </span>
                            <Button
                                onClick={() =>
                                    dismissCallout("faster-who-updating")
                                }
                                type="secondary"
                            >
                                Dismiss
                            </Button>
                        </>
                    }
                    width="100%"
                    maxWidth={`${panelWidth}px`}
                />
            )}
            <MultiPanelContainer
                serverName={serverNameLowercase}
                primaryType={PrimaryType.Who}
            />
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default WhoSpecific

import React, { useEffect } from "react"
import Page from "../global/Page.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import MultiPanelContainer, {
    PrimaryType,
} from "../social/MultiPanelContainer.tsx"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const {
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
    } = useGetCurrentServer()
    const { isFullScreen } = useThemeContext()

    return (
        <Page
            title={`DDO Live LFM Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding
            contentMaxWidth
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            <MultiPanelContainer
                serverName={serverNameLowercase}
                primaryType={PrimaryType.Grouping}
            />
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default GroupingSpecific

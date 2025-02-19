import React from "react"
import LfmContainer from "./LfmCanvasContainer.tsx"
import Page from "../global/Page.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"

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
            <LfmContainer
                serverName={serverNameLowercase ? serverNameLowercase : ""}
            />
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default GroupingSpecific

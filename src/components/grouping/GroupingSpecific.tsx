import Page from "../global/Page.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import MultiPanelContainer, {
    PanelType,
} from "../social/MultiPanelContainer.tsx"
import ServerValidationMessage from "../global/ServerValidationMessage.tsx"
import Link from "../global/Link.tsx"

const GroupingSpecific = () => {
    const {
        serverName,
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
        isValidServer,
        closestMatch,
    } = useGetCurrentServer()
    const { isFullScreen } = useThemeContext()

    return (
        <Page
            title={`DDO Live LFM Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding={isValidServer}
            contentMaxWidth={isValidServer}
            logo="/icons/grouping-192px.png"
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            {!isValidServer && (
                <ServerValidationMessage
                    serverName={serverName}
                    closestMatch={closestMatch}
                    backLink={<Link to="/grouping">the Grouping page</Link>}
                />
            )}
            {isValidServer && (
                <MultiPanelContainer
                    serverName={serverNameLowercase}
                    primaryType={PanelType.Grouping}
                />
            )}
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default GroupingSpecific

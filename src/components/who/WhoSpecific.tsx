import Page from "../global/Page.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import MultiPanelContainer, {
    PanelType,
} from "../social/MultiPanelContainer.tsx"
import ServerValidationMessage from "../global/ServerValidationMessage.tsx"
import Link from "../global/Link.tsx"

const WhoSpecific = () => {
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
            title={`DDO Live Character Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} Who List! Are your friends online? Is your guild forming up for raid night? Now you know!`}
            centered
            noPadding={isValidServer}
            contentMaxWidth={isValidServer}
            logo="/icons/who-192px.png"
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            {!isValidServer && (
                <ServerValidationMessage
                    serverName={serverName}
                    closestMatch={closestMatch}
                    backLink={<Link to="/who">the Who page</Link>}
                />
            )}
            {isValidServer && (
                <MultiPanelContainer
                    serverName={serverNameLowercase}
                    primaryType={PanelType.Who}
                />
            )}
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default WhoSpecific

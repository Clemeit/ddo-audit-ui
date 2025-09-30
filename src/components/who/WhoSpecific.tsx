import Page from "../global/Page.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"
import Spacer from "../global/Spacer.tsx"
import MultiPanelContainer, {
    PanelType,
} from "../social/MultiPanelContainer.tsx"
import ServerValidationMessage from "../global/ServerValidationMessage.tsx"
import Link from "../global/Link.tsx"
import useSearchParamState from "../../hooks/useSearchParamState.ts"

const WhoSpecific = () => {
    const {
        serverName,
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
        isValidServer,
        closestMatch,
    } = useGetCurrentServer()
    const { isFullScreen } = useAppContext()

    return (
        <Page
            title={
                isValidServer
                    ? `DDO Live Character Viewer for ${serverNameSentenceCase}`
                    : "Server Not Found"
            }
            description={`Browse ${serverNamePossessiveCase} Who List! Are your friends online? Is your guild forming up for raid night? Now you know!`}
            centered
            noPadding={isValidServer}
            contentMaxWidth={isValidServer}
            logo="/icons/who-192px.png"
            is404Page={!isValidServer}
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            {!isValidServer && (
                <ServerValidationMessage
                    serverName={serverName}
                    closestMatch={closestMatch}
                    pageType="who"
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

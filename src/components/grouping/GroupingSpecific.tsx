import Page from "../global/Page.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import MultiPanelContainer, {
    PanelType,
} from "../social/MultiPanelContainer.tsx"
import ServerValidationMessage from "../global/ServerValidationMessage.tsx"
import Link from "../global/Link.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"
import WebLink from "../global/WebLink.tsx"

const GroupingSpecific = () => {
    const {
        serverName,
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
        isValidServer,
        closestMatch,
        is32BitServer,
    } = useGetCurrentServer()
    const { isFullScreen } = useAppContext()

    const shouldShowPanel = isValidServer && !is32BitServer
    const is404Page = !isValidServer || is32BitServer

    const mainContent = () => {
        if (is32BitServer) {
            return (
                <ContentCluster title={`32-bit Servers - "Ghost Worlds"`}>
                    <p>
                        DDO Audit no longer offers the LFM Viewer or Who List
                        for the 32-bit servers. These servers are currently
                        available as "Ghost Worlds" to allow players to transfer
                        their characters to the 64-bit servers. For more
                        information, please see{" "}
                        <WebLink href="https://www.ddo.com/news/ddo-ghost-worlds-arrive">
                            Ghost Worlds and Transfers Guide
                        </WebLink>
                        .
                    </p>
                    <p>
                        For server status, see the{" "}
                        <Link to="/live">Live page</Link>.
                    </p>
                </ContentCluster>
            )
        }
        if (!isValidServer) {
            return null
        }
        return (
            <>
                {!isFullScreen && (
                    <Spacer className="hide-on-mobile" size="20px" />
                )}
                <MultiPanelContainer
                    serverName={serverNameLowercase}
                    primaryType={PanelType.Grouping}
                />
            </>
        )
    }

    return (
        <Page
            title={
                isValidServer
                    ? `DDO Live LFM Viewer for ${serverNameSentenceCase}`
                    : "Server Not Found"
            }
            description={`Browse ${serverNamePossessiveCase} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding={shouldShowPanel}
            contentMaxWidth={shouldShowPanel}
            logo="/icons/grouping-192px.png"
            is404Page={is404Page}
        >
            {!isValidServer && (
                <ServerValidationMessage
                    serverName={serverName}
                    closestMatch={closestMatch}
                    pageType="grouping"
                    backLink={<Link to="/grouping">the Grouping page</Link>}
                />
            )}
            {mainContent()}
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default GroupingSpecific

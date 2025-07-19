import Page from "../global/Page.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import MultiPanelContainer, {
    PrimaryType,
} from "../social/MultiPanelContainer.tsx"

const WhoSpecific = () => {
    const {
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
    } = useGetCurrentServer()
    const { isFullScreen } = useThemeContext()

    return (
        <Page
            title={`DDO Live Character Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} Who List! Are your friends online? Is your guild forming up for raid night? Now you know!`}
            centered
            noPadding
            contentMaxWidth
            logo="/icons/who-512px.png"
        >
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            <MultiPanelContainer
                serverName={serverNameLowercase}
                primaryType={PrimaryType.Who}
            />
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default WhoSpecific

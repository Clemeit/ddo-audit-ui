import React from "react"
import LfmContainer from "./LfmCanvasContainer.tsx"
import Page from "../global/Page.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import WhoContainer from "../who/WhoCanvasContainer.tsx"
import Modal from "../modal/Modal.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import { SERVER_NAMES, SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const {
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
    } = useGetCurrentServer()
    const { isFullScreen } = useThemeContext()

    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [secondaryPanel, setSecondaryPanel] = React.useState()
    const [secondaryType, setSecondaryType] = React.useState("")
    const [secondaryServerName, setSecondaryServerName] = React.useState("")

    const secondaryPanelTypeModalContent = () => (
        <div style={{ padding: "20px" }}>
            <ContentCluster title="Choose Secondary Panel">
                <NavCardCluster>
                    <NavigationCard
                        noLink
                        type="grouping"
                        onClick={() => setSecondaryType("grouping")}
                    />
                    <NavigationCard
                        noLink
                        type="who"
                        onClick={() => setSecondaryType("who")}
                    />
                </NavCardCluster>
            </ContentCluster>
        </div>
    )

    const secondaryPanelServerModalContent = () => (
        <div style={{ padding: "20px" }}>
            <ContentCluster title="Choose a Server">
                <NavCardCluster>
                    {SERVER_NAMES_LOWER.map((serverName) => (
                        <ServerNavigationCard
                            noLink
                            key={serverName}
                            destination={`/grouping/${serverName}`}
                            title={toSentenceCase(serverName)}
                            onClick={() => {
                                setSecondaryServerName(serverName)
                                setIsModalOpen(false)
                                if (secondaryType === "grouping") {
                                    setSecondaryPanel(
                                        <LfmContainer
                                            serverNameLowercase={serverName}
                                        />
                                    )
                                } else if (secondaryType === "who") {
                                    setSecondaryPanel(
                                        <WhoContainer serverName={serverName} />
                                    )
                                }
                            }}
                        />
                    ))}
                </NavCardCluster>
            </ContentCluster>
        </div>
    )

    return (
        <Page
            title={`DDO Live LFM Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding
            contentMaxWidth
        >
            <button
                onClick={() => {
                    setSecondaryType("")
                    setSecondaryServerName("")
                    setIsModalOpen(true)
                }}
            >
                Change Secondary Panel
            </button>
            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    {!secondaryType && secondaryPanelTypeModalContent()}
                    {secondaryType && secondaryPanelServerModalContent()}
                </Modal>
            )}
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    maxWidth: "100vw",
                    justifyContent: "center",
                    gap: "20px",
                }}
            >
                <div style={{ maxWidth: secondaryPanel ? "50%" : "unset" }}>
                    <LfmContainer
                        serverName={
                            serverNameLowercase ? serverNameLowercase : ""
                        }
                    />
                </div>
                {secondaryPanel && (
                    <div style={{ maxWidth: "50%" }}>{secondaryPanel}</div>
                )}
            </div>
            <Spacer className="hide-on-mobile" size="20px" />
        </Page>
    )
}

export default GroupingSpecific

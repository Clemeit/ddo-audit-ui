import React from "react"
import { ContentCluster } from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import Badge from "../global/Badge.tsx"
import Modal from "../modal/Modal.tsx"
import LfmContainer from "../grouping/LfmCanvasContainer.tsx"
import WhoContainer from "../who/WhoCanvasContainer.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { ReactComponent as AddSVG } from "../../assets/svg/add.svg"
import "./MultiPanelContainer.css"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"

export enum PrimaryType {
    Grouping = "grouping",
    Who = "who",
}

interface Props {
    serverName: string
    primaryType: PrimaryType
}

const MultiPanelContainer = ({ serverName, primaryType }: Props) => {
    const [secondaryPanel, setSecondaryPanel] =
        React.useState<React.ReactNode>()
    const [secondaryType, setSecondaryType] = React.useState("")

    const {
        isModalOpen,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation({
        modalKey: "multi-panel-container",
    })

    const secondaryPanelTypeModalContent = () => (
        <ContentCluster title="Choose Secondary Panel">
            <div style={{ maxWidth: "400px" }}>
                <NavCardCluster>
                    <NavigationCard
                        noLink
                        fullWidth
                        type="grouping"
                        onClick={() => setSecondaryType("grouping")}
                    />
                    <NavigationCard
                        noLink
                        fullWidth
                        type="who"
                        onClick={() => setSecondaryType("who")}
                        disabled={primaryType === PrimaryType.Who}
                    />
                </NavCardCluster>
            </div>
        </ContentCluster>
    )

    const secondaryPanelServerModalContent = () => (
        <div style={{ padding: "20px" }}>
            <ContentCluster title="Choose a Server">
                <div style={{ maxWidth: "400px" }}>
                    <NavCardCluster>
                        {SERVER_NAMES_LOWER.map((_serverName) => (
                            <ServerNavigationCard
                                noLink
                                miniature
                                fullWidth
                                key={_serverName}
                                destination={`/grouping/${_serverName}`}
                                title={toSentenceCase(_serverName)}
                                onClick={() => {
                                    handleCloseModal()
                                    if (secondaryType === "grouping") {
                                        setSecondaryPanel(
                                            <LfmContainer
                                                serverName={_serverName}
                                                isSecondaryPanel={true}
                                                handleClosePanel={() => {
                                                    setSecondaryPanel(undefined)
                                                }}
                                            />
                                        )
                                    } else if (secondaryType === "who") {
                                        setSecondaryPanel(
                                            <WhoContainer
                                                serverName={_serverName}
                                                isSecondaryPanel={true}
                                                handleClosePanel={() => {
                                                    setSecondaryPanel(undefined)
                                                }}
                                            />
                                        )
                                    }
                                }}
                                badge={
                                    _serverName === serverName && (
                                        <Badge text="Current" size="small" />
                                    )
                                }
                            />
                        ))}
                    </NavCardCluster>
                </div>
            </ContentCluster>
        </div>
    )

    return (
        <>
            {isModalOpen && (
                <Modal onClose={handleCloseModal} fullScreenOnMobile>
                    {!secondaryType && secondaryPanelTypeModalContent()}
                    {secondaryType && secondaryPanelServerModalContent()}
                </Modal>
            )}
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "center",
                    gap: "10px",
                }}
            >
                {!secondaryPanel && (
                    <button
                        className="add-panel-button hide-on-mobile"
                        onClick={() => {
                            setSecondaryPanel(undefined)
                            setSecondaryType("")
                            handleOpenModal()
                        }}
                    >
                        <div>
                            <AddSVG className="icon" />
                        </div>
                        <span>Add panel</span>
                    </button>
                )}
                <div
                    style={
                        secondaryPanel
                            ? { flex: 1, minWidth: 0, maxWidth: "min-content" }
                            : { maxWidth: "100%" }
                    }
                >
                    {primaryType === PrimaryType.Grouping ? (
                        <LfmContainer serverName={serverName} />
                    ) : (
                        <WhoContainer serverName={serverName} />
                    )}
                </div>
                {secondaryPanel && (
                    <div
                        className="hide-on-mobile"
                        style={{
                            flex: 1,
                            minWidth: 0,
                            maxWidth: "min-content",
                        }}
                    >
                        {secondaryPanel}
                    </div>
                )}
            </div>
        </>
    )
}

export default MultiPanelContainer

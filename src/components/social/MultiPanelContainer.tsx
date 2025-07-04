import React, { useEffect } from "react"
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
import { useLocation, useSearchParams } from "react-router-dom"

export enum PrimaryType {
    Grouping = "grouping",
    Who = "who",
}

interface Props {
    serverName: string
    primaryType: PrimaryType
}

const MultiPanelContainer = ({ serverName, primaryType }: Props) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [secondaryPanel, setSecondaryPanel] =
        React.useState<React.ReactNode>()
    // const [secondaryType, setSecondaryType] = React.useState("")
    // const [secondaryServer, setSecondaryServer] = React.useState("")

    // Fire useEffect when URL params change:
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    useEffect(() => {
        const secondaryPanelType = searchParams.get("secondary-type")
        const secondaryServerName = searchParams.get("secondary-server")
        // console.log(secondaryPanelType, secondaryType)
        // console.log(secondaryServerName, secondaryServer)
        if (
            (secondaryPanelType === "grouping" ||
                secondaryPanelType === "who") &&
            secondaryServerName !== null
        ) {
            if (!SERVER_NAMES_LOWER.includes(secondaryServerName.toLowerCase()))
                return
            // if (
            //     secondaryType.toLocaleLowerCase() ===
            //     secondaryPanelType.toLocaleLowerCase()
            // )
            //     return
            // if (
            //     secondaryServer.toLocaleLowerCase() ===
            //     secondaryServerName.toLocaleLowerCase()
            // )
            //     return
            console.log("ALERT")
            // Valid input
            // setSecondaryType(secondaryPanelType.toLowerCase())
            // setSecondaryServer(secondaryServerName.toLowerCase())
            if (secondaryPanelType === "grouping") {
                setSecondaryPanel(
                    <LfmContainer
                        serverName={secondaryServerName}
                        isSecondaryPanel={true}
                        handleClosePanel={() => {
                            setUrlParams(null, null)
                            setSecondaryPanel(null)
                        }}
                    />
                )
            } else if (secondaryPanelType === "who") {
                setSecondaryPanel(
                    <WhoContainer
                        serverName={secondaryServerName}
                        isSecondaryPanel={true}
                        handleClosePanel={() => {
                            setUrlParams(null, null)
                            setSecondaryPanel(null)
                        }}
                    />
                )
            }
        }
    }, [searchParams])

    const setUrlParams = (type: string, serverName: string) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev)
            if (type === null) {
                newParams.delete("secondary-type")
            } else if (type !== undefined) {
                newParams.set("secondary-type", type)
            }
            if (serverName === null) {
                newParams.delete("secondary-server")
            } else if (serverName !== undefined) {
                newParams.set("secondary-server", serverName)
            }
            newParams.delete("string-filter")
            return newParams
        })
    }

    const secondaryPanelTypeModalContent = (
        <div style={{ padding: "20px" }}>
            <ContentCluster title="Choose Secondary Panel">
                <div style={{ maxWidth: "400px" }}>
                    <NavCardCluster>
                        <NavigationCard
                            noLink
                            fullWidth
                            type="grouping"
                            onClick={() => setUrlParams("grouping", null)}
                        />
                        <NavigationCard
                            noLink
                            fullWidth
                            type="who"
                            onClick={() => setUrlParams("who", null)}
                        />
                    </NavCardCluster>
                </div>
            </ContentCluster>
        </div>
    )

    const secondaryPanelServerModalContent = (
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
                                    setIsModalOpen(false)
                                    setUrlParams(undefined, _serverName)
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
                <Modal onClose={() => setIsModalOpen(false)}>
                    {!searchParams.get("secondary-type") &&
                        secondaryPanelTypeModalContent}
                    {searchParams.get("secondary-type") &&
                        secondaryPanelServerModalContent}
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
                            setSecondaryPanel(null)
                            setIsModalOpen(true)
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

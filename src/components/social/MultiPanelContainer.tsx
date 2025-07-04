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
import useSearchParamsState, {
    SearchParamType,
} from "../../hooks/useSearchParamsState.ts"

export enum PanelType {
    Grouping = "grouping",
    Who = "who",
}

interface Props {
    serverName: string
    primaryType: PanelType
}

const VALID_PANEL_TYPES = Object.values(PanelType)

const isValidPanelType = (type: string): type is PanelType => {
    return VALID_PANEL_TYPES.includes(type as PanelType)
}

const MultiPanelContainer = ({ serverName, primaryType }: Props) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [secondaryPanel, setSecondaryPanel] =
        React.useState<React.ReactNode>()

    const { getSearchParam, setSearchParam, setSearchParams } =
        useSearchParamsState()
    const secondaryPanelType = getSearchParam(
        SearchParamType.SECONDARY_PANEL_TYPE
    )
    const secondaryPanelServer = getSearchParam(
        SearchParamType.SECONDARY_PANEL_SERVER
    )

    const clearSecondarySearchParams = () => {
        setSearchParams([
            {
                searchParamType: SearchParamType.SECONDARY_PANEL_TYPE,
                value: null,
            },
            {
                searchParamType: SearchParamType.SECONDARY_PANEL_SERVER,
                value: null,
            },
        ])
    }

    // Fire useEffect when URL params change:
    useEffect(() => {
        if (
            secondaryPanelType == null ||
            secondaryPanelServer == null ||
            !SERVER_NAMES_LOWER.includes(
                secondaryPanelServer.toLocaleLowerCase()
            ) ||
            !isValidPanelType(secondaryPanelType.toLocaleLowerCase())
        ) {
            setSecondaryPanel(null)
            return
        }

        const normalizedType = secondaryPanelType.toLowerCase() as PanelType
        const normalizedServer = secondaryPanelServer.toLowerCase()

        if (normalizedType === PanelType.Grouping) {
            setSecondaryPanel(
                <LfmContainer
                    serverName={secondaryPanelServer.toLocaleLowerCase()}
                    isSecondaryPanel={true}
                    handleClosePanel={clearSecondarySearchParams}
                />
            )
        } else if (normalizedType === PanelType.Who) {
            setSecondaryPanel(
                <WhoContainer
                    serverName={secondaryPanelServer.toLocaleLowerCase()}
                    isSecondaryPanel={true}
                    handleClosePanel={clearSecondarySearchParams}
                />
            )
        }
    }, [secondaryPanelType, secondaryPanelServer])

    const secondaryPanelTypeModalContent = (
        <div style={{ padding: "20px" }}>
            <ContentCluster title="Choose Secondary Panel">
                <div style={{ maxWidth: "400px" }}>
                    <NavCardCluster>
                        <NavigationCard
                            noLink
                            fullWidth
                            type="grouping"
                            onClick={() =>
                                setSearchParam(
                                    SearchParamType.SECONDARY_PANEL_TYPE,
                                    "grouping"
                                )
                            }
                        />
                        <NavigationCard
                            noLink
                            fullWidth
                            type="who"
                            onClick={() =>
                                setSearchParam(
                                    SearchParamType.SECONDARY_PANEL_TYPE,
                                    "who"
                                )
                            }
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
                                    setSearchParam(
                                        SearchParamType.SECONDARY_PANEL_SERVER,
                                        _serverName
                                    )
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
                    {!getSearchParam(SearchParamType.SECONDARY_PANEL_TYPE) &&
                        secondaryPanelTypeModalContent}
                    {getSearchParam(SearchParamType.SECONDARY_PANEL_TYPE) &&
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
                    {primaryType === PanelType.Grouping ? (
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

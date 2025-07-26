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
import {
    SERVER_NAMES_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import { ReactComponent as AddSVG } from "../../assets/svg/add.svg"
import "./MultiPanelContainer.css"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import useSearchParamsState, {
    SearchParamType,
} from "../../hooks/useSearchParamsState.ts"

export enum PanelType {
    Grouping = "grouping",
    Who = "who",
}

export enum PrimaryType {
    Grouping = "grouping",
    Who = "who",
}

interface Props {
    serverName: string
    primaryType: PrimaryType
}

const VALID_PANEL_TYPES = Object.values(PanelType)

const isValidPanelType = (type: string): type is PanelType => {
    return VALID_PANEL_TYPES.includes(type as PanelType)
}

const MultiPanelContainer = ({ serverName, primaryType }: Props) => {
    const [secondaryPanel, setSecondaryPanel] =
        React.useState<React.ReactNode>()
    const [secondaryPanelType, setSecondaryPanelType] =
        React.useState<PanelType | null>(null)

    const {
        isModalOpen,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation({
        modalKey: "multi-panel-container",
    })

    const { getSearchParam, setSearchParams } = useSearchParamsState()
    const secondaryPanelTypeParam = getSearchParam(
        SearchParamType.SECONDARY_PANEL_TYPE
    )
    const secondaryPanelServerParam = getSearchParam(
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

    useEffect(() => {
        if (
            secondaryPanelTypeParam == null ||
            secondaryPanelServerParam == null ||
            !SERVER_NAMES_LOWER.includes(
                secondaryPanelServerParam.toLocaleLowerCase()
            ) ||
            !isValidPanelType(secondaryPanelTypeParam.toLocaleLowerCase())
        ) {
            setSecondaryPanel(null)
            return
        }

        const normalizedType =
            secondaryPanelTypeParam.toLowerCase() as PanelType
        const normalizedServer = secondaryPanelServerParam.toLowerCase()

        if (normalizedType === PanelType.Grouping) {
            setSecondaryPanel(
                <LfmContainer
                    serverName={normalizedServer.toLocaleLowerCase()}
                    isSecondaryPanel={true}
                    handleClosePanel={clearSecondarySearchParams}
                />
            )
        } else if (normalizedType === PanelType.Who) {
            setSecondaryPanel(
                <WhoContainer
                    serverName={normalizedServer.toLocaleLowerCase()}
                    isSecondaryPanel={true}
                    handleClosePanel={clearSecondarySearchParams}
                />
            )
        }
    }, [
        secondaryPanelTypeParam,
        secondaryPanelServerParam,
        setSecondaryPanel,
        setSecondaryPanelType,
        serverName,
    ])

    const secondaryPanelTypeModalContent = () => (
        <ContentCluster title="Choose Secondary Panel">
            <div style={{ maxWidth: "400px" }}>
                <NavCardCluster>
                    <NavigationCard
                        noLink
                        fullWidth
                        type="grouping"
                        onClick={() =>
                            setSecondaryPanelType(PanelType.Grouping)
                        }
                    />
                    <NavigationCard
                        noLink
                        fullWidth
                        type="who"
                        onClick={() => setSecondaryPanelType(PanelType.Who)}
                        disabled={primaryType === PrimaryType.Who}
                    />
                </NavCardCluster>
            </div>
        </ContentCluster>
    )

    const getServerNavigationCard = (_serverName: string) => {
        const isCurrentServer = _serverName === serverName.toLowerCase()
        const is64BitServer = SERVERS_64_BITS_LOWER.includes(_serverName)

        const onClickHandler = async () => {
            if (secondaryPanelType === PanelType.Grouping) {
                setSecondaryPanel(
                    <LfmContainer
                        serverName={_serverName}
                        isSecondaryPanel={true}
                        handleClosePanel={() => {
                            clearSecondarySearchParams()
                        }}
                    />
                )
            } else if (secondaryPanelType === PanelType.Who) {
                setSecondaryPanel(
                    <WhoContainer
                        serverName={_serverName}
                        isSecondaryPanel={true}
                        handleClosePanel={() => {
                            clearSecondarySearchParams()
                        }}
                    />
                )
            }
            await handleCloseModal()
            setSearchParams([
                {
                    searchParamType: SearchParamType.SECONDARY_PANEL_TYPE,
                    value: secondaryPanelType,
                },
                {
                    searchParamType: SearchParamType.SECONDARY_PANEL_SERVER,
                    value: _serverName,
                },
            ])
            setSecondaryPanelType(undefined)
        }

        const badge = isCurrentServer ? (
            <Badge
                text="Current"
                size="small"
                backgroundColor="var(--orange1)"
            />
        ) : is64BitServer ? (
            <Badge
                text="64-bit"
                size="small"
                backgroundColor="var(--magenta3)"
            />
        ) : null

        return (
            <ServerNavigationCard
                noLink
                miniature
                fullWidth
                key={_serverName}
                destination={`/grouping/${_serverName}`}
                title={toSentenceCase(_serverName)}
                onClick={onClickHandler}
                badge={badge}
            />
        )
    }

    const secondaryPanelServerModalContent = () => {
        const sortedServerNames = [...SERVER_NAMES_LOWER]
            .sort((a, b) => {
                // Servers in SERVERS_64_BITS_LOWER should be at the start
                if (
                    SERVERS_64_BITS_LOWER.includes(a) &&
                    !SERVERS_64_BITS_LOWER.includes(b)
                ) {
                    return -1
                }
                if (
                    !SERVERS_64_BITS_LOWER.includes(a) &&
                    SERVERS_64_BITS_LOWER.includes(b)
                ) {
                    return 1
                }
                return a.localeCompare(b)
            })
            .sort((a, b) => {
                // Sort by current server first
                if (a === serverName.toLowerCase()) return -1
                if (b === serverName.toLowerCase()) return 1
                return 0
            })

        return (
            <ContentCluster title="Choose a Server">
                <div style={{ maxWidth: "400px" }}>
                    <NavCardCluster>
                        {sortedServerNames.map((_serverName) =>
                            getServerNavigationCard(_serverName)
                        )}
                    </NavCardCluster>
                </div>
            </ContentCluster>
        )
    }

    return (
        <>
            {isModalOpen && (
                <Modal onClose={handleCloseModal} fullScreenOnMobile>
                    {!secondaryPanelType && secondaryPanelTypeModalContent()}
                    {secondaryPanelType && secondaryPanelServerModalContent()}
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
                            setSecondaryPanelType(null)
                            setSecondaryPanel(null)
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

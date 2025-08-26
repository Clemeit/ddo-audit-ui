import { useEffect, useState } from "react"
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
import useSearchParamState, {
    SearchParamType,
} from "../../hooks/useSearchParamState.ts"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import { useMultiPanelContext } from "../../contexts/MultiPanelContext.tsx"

export enum PanelType {
    Grouping = "grouping",
    Who = "who",
}

const VALID_PANEL_TYPES = Object.values(PanelType)

interface Props {
    serverName: string
    primaryType: PanelType
}

const MultiPanelContainer = ({ serverName, primaryType }: Props) => {
    const { secondaryPanel, setSecondaryPanel } = useMultiPanelContext()
    const [secondaryType, setSecondaryType] = useState<PanelType | undefined>(
        undefined
    )
    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeSecondaryPanel = () => {
        setSecondaryPanel(undefined)
        setSecondaryType(undefined)
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

    // Don't keep state in the params, but load them once on mount
    const { getSearchParam, setSearchParams } = useSearchParamState()
    useEffect(() => {
        const _secondaryPanelType = (
            getSearchParam(SearchParamType.SECONDARY_PANEL_TYPE) ?? ""
        ).toLowerCase() as PanelType
        const _secondaryPanelServer = (
            getSearchParam(SearchParamType.SECONDARY_PANEL_SERVER) ?? ""
        ).toLowerCase()
        if (
            !SERVER_NAMES_LOWER.includes(_secondaryPanelServer) ||
            !VALID_PANEL_TYPES.includes(_secondaryPanelType as PanelType)
        ) {
            return
        }

        setSecondaryType(_secondaryPanelType)
        if (_secondaryPanelType === PanelType.Grouping) {
            setSecondaryPanel(
                <LfmContainer
                    serverName={_secondaryPanelServer}
                    isSecondaryPanel={true}
                    handleClosePanel={closeSecondaryPanel}
                />
            )
        } else if (_secondaryPanelType === PanelType.Who) {
            setSecondaryPanel(
                <WhoContainer
                    serverName={_secondaryPanelServer}
                    isSecondaryPanel={true}
                    handleClosePanel={closeSecondaryPanel}
                />
            )
        }
    }, [])

    const secondaryPanelTypeModalContent = () => (
        <ContentCluster title="Choose Secondary Panel">
            <div style={{ maxWidth: "400px" }}>
                <NavCardCluster>
                    <NavigationCard
                        noLink
                        fullWidth
                        type="grouping"
                        onClick={() => setSecondaryType(PanelType.Grouping)}
                    />
                    <NavigationCard
                        noLink
                        fullWidth
                        type="who"
                        onClick={() => setSecondaryType(PanelType.Who)}
                        disabled={primaryType === PanelType.Who}
                    />
                </NavCardCluster>
            </div>
        </ContentCluster>
    )

    const getServerNavigationCard = (_serverName: string) => {
        const isCurrentServer = _serverName === serverName.toLowerCase()
        const is64BitServer = SERVERS_64_BITS_LOWER.includes(_serverName)

        const onClickHandler = () => {
            setSearchParams([
                {
                    searchParamType: SearchParamType.SECONDARY_PANEL_TYPE,
                    value: secondaryType as string,
                },
                {
                    searchParamType: SearchParamType.SECONDARY_PANEL_SERVER,
                    value: _serverName,
                },
            ])
            setIsModalOpen(false)
            if (secondaryType === PanelType.Grouping) {
                setSecondaryPanel(
                    <LfmContainer
                        serverName={_serverName}
                        isSecondaryPanel={true}
                        handleClosePanel={closeSecondaryPanel}
                    />
                )
            } else if (secondaryType === PanelType.Who) {
                setSecondaryPanel(
                    <WhoContainer
                        serverName={_serverName}
                        isSecondaryPanel={true}
                        handleClosePanel={closeSecondaryPanel}
                    />
                )
            }
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
        <div style={{ position: "relative" }}>
            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)} fullScreenOnMobile>
                    {!secondaryType && secondaryPanelTypeModalContent()}
                    {secondaryType && secondaryPanelServerModalContent()}
                </Modal>
            )}
            {!secondaryPanel && (
                <Button
                    className="add-panel-button hide-on-mobile"
                    onClick={() => {
                        setSecondaryPanel(undefined)
                        setSecondaryType(undefined)
                        setIsModalOpen(true)
                    }}
                >
                    <AddSVG className="icon" />
                </Button>
            )}
            <Stack direction="row" gap="10px" width="100%" justify="center">
                {primaryType === PanelType.Grouping ? (
                    <LfmContainer serverName={serverName} />
                ) : (
                    <WhoContainer serverName={serverName} />
                )}
                {secondaryPanel && (
                    <div className="hide-on-mobile">{secondaryPanel}</div>
                )}
            </Stack>
        </div>
    )
}

export default MultiPanelContainer

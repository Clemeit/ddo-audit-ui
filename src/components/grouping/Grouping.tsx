import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { pluralize, toSentenceCase } from "../../utils/stringUtils.ts"
import usePollApi from "../../hooks/usePollApi.ts"
import { Lfm, LfmApiModel, Quest } from "../../models/Lfm.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Link from "../global/Link.tsx"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { ReactComponent as TrendUpSVG } from "../../assets/svg/new/trend_up.svg"
import { LoadingState } from "../../models/Api.ts"
import GroupingCanvas from "./LfmCanvas.tsx"
import Stack from "../global/Stack.tsx"
import Badge from "../global/Badge.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
} from "../global/CommonMessages.tsx"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import {
    SERVER_NAMES_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import ColoredText from "../global/ColoredText.tsx"
import "./Grouping.css"
import Skeleton from "../global/Skeleton.tsx"
import ComponentErrorBoundary from "../global/ComponentErrorBoundary.tsx"
import GroupingErrorFallback from "./GroupingErrorFallback.tsx"
import Button from "../global/Button.tsx"

const Grouping = () => {
    return (
        <ComponentErrorBoundary
            componentName="Grouping"
            fallback={GroupingErrorFallback}
        >
            <GroupingContent />
        </ComponentErrorBoundary>
    )
}

const GroupingContent = () => {
    const { data: lfmData, state: lfmState } = usePollApi<LfmApiModel>({
        endpoint: "lfms",
        interval: 10000,
        lifespan: 1000 * 60 * 60 * 12, // 12 hours
    })
    const { data: serverInfoData, state: serverInfoState } =
        usePollApi<ServerInfoApiDataModel>({
            endpoint: "game/server-info",
            interval: 10000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const [hasAllDataLoadedOnce, setHasAllDataLoadedOnce] =
        useState<boolean>(false)

    useEffect(() => {
        if (
            lfmState === LoadingState.Loaded &&
            serverInfoState === LoadingState.Loaded
        ) {
            setHasAllDataLoadedOnce(true)
        }
    }, [lfmState, serverInfoState])

    const { quests } = useQuestContext()
    const getQuestById = (id: number): Quest => {
        if (id == undefined) return null
        return quests[id]
    }

    const isInitialLoading = () => {
        return (
            !hasAllDataLoadedOnce &&
            (serverInfoState === LoadingState.Initial ||
                serverInfoState === LoadingState.Loading ||
                lfmState === LoadingState.Initial ||
                lfmState === LoadingState.Loading)
        )
    }

    const loadingFailed = () => {
        return (
            serverInfoState === LoadingState.Error ||
            lfmState === LoadingState.Error ||
            serverInfoState === LoadingState.Haulted ||
            lfmState === LoadingState.Haulted
        )
    }

    const fauxData: Record<string, {}> = useMemo(
        () =>
            SERVER_NAMES_LOWER.reduce((acc, serverName) => {
                acc[serverName] = undefined
                return acc
            }, {}),
        []
    )

    const cardDescription = (
        serverName: string,
        serverData?: { [key: number]: Lfm }
    ) => {
        if (serverData === undefined) {
            return (
                <Skeleton width={`${120 + (serverName.length % 3) * 20}px`} />
            )
        }

        const serverLfms = Object.values(serverData || {})
        const lfmCount = Object.keys(serverLfms).length
        const raidCount = Object.values(serverLfms).filter(
            (lfm) =>
                lfm.quest_id !== 0 &&
                getQuestById(lfm.quest_id)?.group_size === "Raid"
        ).length

        return (
            <span>
                <span style={{ color: "var(--orange-text)" }}>
                    {lfmCount} {pluralize("group", lfmCount)}
                </span>
                {raidCount > 0 ? (
                    <span>
                        {" | "}
                        {raidCount} {pluralize("raid", raidCount)}
                    </span>
                ) : null}
            </span>
        )
    }

    const cardIcon = (serverName: string) => {
        const isOnline = serverInfoData?.[serverName]?.is_online
        if (isOnline === true) {
            return <Checkmark className="shrinkable-icon" />
        } else if (isOnline === false) {
            return <X className="shrinkable-icon" />
        } else {
            return <Pending className="shrinkable-icon" />
        }
    }

    const cardBadge = (serverName: string) => {
        if (!serverName) {
            return null
        }
        if (serverInfoData?.[serverName]?.is_vip_only) {
            return (
                <Badge
                    text="VIP"
                    size="small"
                    backgroundColor="var(--orange4)"
                />
            )
        }
        return null
    }

    const getCurrentRaids = useCallback(() => {
        if (!quests || !lfmData) {
            return {}
        }
        const currentRaids: Record<string, Lfm[]> = {}
        Object.entries(lfmData?.data || {}).forEach(
            ([serverName, serverData]) => {
                Object.values(serverData || {})
                    ?.filter((lfm: Lfm) => lfm.quest_id !== 0)
                    ?.forEach((lfm: Lfm) => {
                        const quest = getQuestById(lfm.quest_id)
                        if (quest && quest?.group_size === "Raid") {
                            const eligibleLfm: Lfm = {
                                ...lfm,
                                quest: quest,
                                metadata: { ...lfm.metadata, isEligible: true },
                            }
                            if (!currentRaids[serverName]) {
                                currentRaids[serverName] = [eligibleLfm]
                            } else {
                                currentRaids[serverName].push(eligibleLfm)
                            }
                        }
                    })
            }
        )
        return currentRaids
    }, [lfmData, quests])

    const getServerSelectContent = (type: "32bit" | "64bit") => {
        const allServerNames = [...SERVER_NAMES_LOWER].sort((a, b) =>
            a.localeCompare(b)
        )
        const filteredServerNames = allServerNames.filter((serverName) => {
            if (type === "32bit") {
                return SERVERS_64_BITS_LOWER.includes(serverName) === false
            } else if (type === "64bit") {
                return SERVERS_64_BITS_LOWER.includes(serverName) === true
            }
            return true
        })

        // Always render all filtered servers, using a skeleton if data is missing
        return filteredServerNames.map((serverName) => {
            const hasLoaded =
                lfmData?.data && lfmData.data[serverName] !== undefined
            const serverData = hasLoaded ? lfmData.data[serverName] : undefined
            return (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content={
                        hasLoaded ? (
                            cardDescription(serverName, serverData)
                        ) : (
                            <Skeleton
                                width={`${120 + (serverName.length % 3) * 20}px`}
                            />
                        )
                    }
                    icon={
                        serverInfoData ? (
                            cardIcon(serverName)
                        ) : (
                            <Pending className="shrinkable-icon" />
                        )
                    }
                    badge={cardBadge(serverName)}
                />
            )
        })
    }

    const getCurrentRaidsContent = useCallback(() => {
        if (isInitialLoading()) {
            return <ColoredText color="secondary">Loading raids...</ColoredText>
        }

        if (Object.entries(getCurrentRaids() || {}).length === 0) {
            return (
                <ColoredText color="secondary">
                    There aren't any raids posted at the moment.
                </ColoredText>
            )
        }

        return (
            <Stack direction="column" gap="20px">
                {Object.entries(getCurrentRaids() || {}).map(
                    ([serverName, lfms]: [string, Lfm[]]) => (
                        <Stack
                            direction="column"
                            className="raid-card"
                            key={serverName}
                        >
                            <Link to={`/grouping/${serverName}`} noDecoration>
                                <h3
                                    style={{
                                        marginTop: "0px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    {toSentenceCase(serverName)}
                                </h3>
                                <GroupingCanvas
                                    serverName={serverName}
                                    lfms={lfms}
                                    raidView
                                    isLoading={false}
                                />
                            </Link>
                        </Stack>
                    )
                )}
            </Stack>
        )
    }, [serverInfoState, lfmData, getCurrentRaids, hasAllDataLoadedOnce])

    const summaryCardStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "20px",
        boxSizing: "border-box",
        boxShadow: "var(--card-shadow)",
        flex: "1 1 280px",
        minWidth: "240px",
    }

    return (
        <div style={{ display: "grid", gridAutoRows: "auto 20px auto" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    maxWidth: "650px",
                    flexWrap: "wrap",
                }}
            >
                <div style={summaryCardStyle}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >
                        <span className="text-muted">Total Posted LFMs</span>
                        <span style={{ fontSize: "2rem", fontWeight: "600" }}>
                            83
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "3px",
                            alignItems: "center",
                        }}
                    >
                        <TrendUpSVG
                            style={{
                                color: "var(--green-text)",
                                width: "20px",
                                height: "20px",
                            }}
                        />
                        <span className="green-text">+12% from last hour</span>
                    </div>
                </div>
                <div style={summaryCardStyle}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >
                        <span className="text-muted">Total Posted Raids</span>
                        <span style={{ fontSize: "2rem", fontWeight: "600" }}>
                            4
                        </span>
                    </div>
                    <span className="text-muted">Across 2 servers</span>
                </div>
            </div>
            <div />
            <div style={{ display: "grid", gridAutoColumns: "auto auto" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        boxSizing: "border-box",
                        boxShadow: "var(--card-shadow)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            borderBottom: "1px solid var(--color-border)",
                            padding: "20px",
                        }}
                    >
                        <div style={{ fontWeight: "600" }}>Select a Server</div>
                        <div style={{ marginLeft: "auto" }}>
                            Sort: Most Active
                        </div>
                    </div>
                    <div className="server-row">
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "15px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "green",
                                    borderRadius: "6px",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px",
                                }}
                            >
                                <span style={{ fontWeight: "600" }}>
                                    Cormyr
                                </span>
                                <span className="text-muted">
                                    Status: Online
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                12
                            </span>
                            <span className="text-muted">GROUPS</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                0
                            </span>
                            <span className="text-muted">RAIDS</span>
                        </div>
                        <div>
                            <Button type="secondary" onClick={() => {}}>
                                View
                            </Button>
                        </div>
                    </div>
                    <div className="server-row">
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "15px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "green",
                                    borderRadius: "6px",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px",
                                }}
                            >
                                <span style={{ fontWeight: "600" }}>
                                    Moonsea
                                </span>
                                <span className="text-muted">
                                    Status: Online
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                32
                            </span>
                            <span className="text-muted">GROUPS</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                2
                            </span>
                            <span className="text-muted">RAIDS</span>
                        </div>
                        <div>
                            <Button type="secondary" onClick={() => {}}>
                                View
                            </Button>
                        </div>
                    </div>
                    <div className="server-row">
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "15px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "green",
                                    borderRadius: "6px",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px",
                                }}
                            >
                                <span style={{ fontWeight: "600" }}>
                                    Shadowdale
                                </span>
                                <span className="text-muted">
                                    Status: Online
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                21
                            </span>
                            <span className="text-muted">GROUPS</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                0
                            </span>
                            <span className="text-muted">RAIDS</span>
                        </div>
                        <div>
                            <Button type="secondary" onClick={() => {}}>
                                View
                            </Button>
                        </div>
                    </div>
                    <div className="server-row">
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "15px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "green",
                                    borderRadius: "6px",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px",
                                }}
                            >
                                <span style={{ fontWeight: "600" }}>
                                    Thrane
                                </span>
                                <span className="text-muted">
                                    Status: Online
                                </span>
                            </div>
                        </div>
                        <div
                            style={{
                                marginLeft: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                18
                            </span>
                            <span className="text-muted">GROUPS</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "1.4rem",
                                }}
                            >
                                2
                            </span>
                            <span className="text-muted">RAIDS</span>
                        </div>
                        <div>
                            <Button type="secondary" onClick={() => {}}>
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // <Page
        //     title="DDO Live LFM Viewer"
        //     description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
        //     logo="/icons/grouping-192px.png"
        //     pageMessages={() => {
        //         const messages = []
        //         if (loadingFailed())
        //             messages.push(<DataLoadingErrorPageMessage />)
        //         if (lfmState === LoadingState.Haulted)
        //             messages.push(<LiveDataHaultedPageMessage />)
        //         return messages
        //     }}
        // >
        // <ContentClusterGroup>
        //     <ContentCluster title="Select a Server">
        //         <NavCardCluster>
        //             {getServerSelectContent("64bit")}
        //         </NavCardCluster>
        //     </ContentCluster>
        //     <ContentCluster title="Current Raids">
        //         {getCurrentRaidsContent()}
        //     </ContentCluster>
        //     <ContentCluster title="Notifications">
        //         <Stack direction="row" gap="10px" align="center">
        //             <p
        //                 style={{
        //                     textDecoration: "line-through",
        //                     margin: 0,
        //                 }}
        //             >
        //                 You currently have 0 notification rules set up.
        //                 Configure rules on the{" "}
        //                 <Link to="/notifications" disabled>
        //                     notification settings
        //                 </Link>{" "}
        //                 page.
        //             </p>
        //             <Badge text="Soon" type="soon" />
        //         </Stack>
        //     </ContentCluster>
        //     <ContentCluster title="See Also...">
        //         <NavCardCluster>
        //             <NavigationCard type="registration" />
        //             <NavigationCard type="owned-content" />
        //             <NavigationCard type="timers" />
        //         </NavCardCluster>
        //     </ContentCluster>
        // </ContentClusterGroup>
        // </Page>
    )
}

export default Grouping

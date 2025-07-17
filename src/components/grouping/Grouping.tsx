import React, { useCallback } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import usePollApi from "../../hooks/usePollApi.ts"
import { Lfm, LfmApiModel } from "../../models/Lfm.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Link from "../global/Link.tsx"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { LoadingState } from "../../models/Api.ts"
import GroupingCanvas from "./LfmCanvas.tsx"
import Stack from "../global/Stack.tsx"
import Badge from "../global/Badge.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { LiveDataHaultedPageMessage } from "../global/CommonMessages.tsx"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import {
    SERVER_NAMES_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import ColoredText from "../global/ColoredText.tsx"
import "./Grouping.css"

const Grouping = () => {
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
    const questContext = useQuestContext()

    const cardDescription = (serverData?: { number: Lfm }) => {
        const serverLfms = Object.values(serverData || {})
        const lfmCount = Object.keys(serverLfms).length
        const raidCount = Object.values(serverLfms).filter(
            (lfm) => lfm.quest?.group_size === "Raid"
        ).length
        return (
            <>
                <span style={{ color: "var(--orange-text)" }}>
                    {lfmCount} group{lfmCount === 1 ? "" : "s"}
                </span>
                {raidCount > 0 &&
                    ` | ${raidCount} raid${raidCount === 1 ? "" : "s"}`}
            </>
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
        if (serverInfoData?.[serverName]?.is_vip_only) {
            return (
                <Badge
                    text="VIP"
                    size="small"
                    backgroundColor="var(--orange4)"
                />
            )
        }
        if (SERVERS_64_BITS_LOWER.includes(serverName)) {
            return (
                <Badge
                    text="64-bit"
                    size="small"
                    backgroundColor="var(--magenta3)"
                />
            )
        }
    }

    const getCurrentRaids = useCallback(() => {
        const currentRaids: Record<string, Lfm[]> = {}
        Object.entries(lfmData?.data || {}).forEach(
            ([serverName, serverData]) => {
                Object.values(serverData || {})?.forEach((lfm: Lfm) => {
                    const quest =
                        lfm.quest_id && lfm.quest_id !== 0
                            ? questContext.quests[lfm.quest_id || 0]
                            : null
                    if (quest?.group_size === "Raid") {
                        const eligibleLfm: Lfm = {
                            ...lfm,
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
    }, [lfmData])

    const getServerSelectContent = (type: "32bit" | "64bit") => {
        if (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.filter((serverName) => {
                if (type === "32bit") {
                    return SERVERS_64_BITS_LOWER.includes(serverName) === false
                } else if (type === "64bit") {
                    return SERVERS_64_BITS_LOWER.includes(serverName) === true
                }
                return true
            })
                .sort(([serverNameA], [serverNameB]) =>
                    serverNameA.localeCompare(serverNameB)
                )
                .map((serverName) => (
                    <ServerNavigationCard
                        key={serverName}
                        destination={`/grouping/${serverName}`}
                        title={toSentenceCase(serverName)}
                        content="Loading data..."
                        icon={<Pending className="shrinkable-icon" />}
                        badge={cardBadge(serverName)}
                    />
                ))
        }

        if (
            lfmState === LoadingState.Initial ||
            lfmState === LoadingState.Loading
        ) {
            return Object.keys(serverInfoData || {})
                .filter((serverName) => {
                    if (type === "32bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === false
                        )
                    } else if (type === "64bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === true
                        )
                    }
                    return true
                })
                .sort(([serverNameA], [serverNameB]) =>
                    serverNameA.localeCompare(serverNameB)
                )
                .map((serverName) => (
                    <ServerNavigationCard
                        key={serverName}
                        destination={`/grouping/${serverName}`}
                        title={toSentenceCase(serverName)}
                        content="Loading data..."
                        icon={cardIcon(serverName)}
                        badge={cardBadge(serverName)}
                    />
                ))
        }

        return Object.entries(lfmData?.data || {})
            .filter(([serverName]) => SERVER_NAMES_LOWER.includes(serverName))
            .filter(([serverName]) => {
                if (type === "32bit") {
                    return SERVERS_64_BITS_LOWER.includes(serverName) === false
                } else if (type === "64bit") {
                    return SERVERS_64_BITS_LOWER.includes(serverName) === true
                }
                return true
            })
            .sort(([server_name_a], [server_name_b]) =>
                server_name_a.localeCompare(server_name_b)
            )
            .map(([serverName, serverData]) => (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content={cardDescription(serverData)}
                    icon={cardIcon(serverName)}
                    badge={cardBadge(serverName)}
                />
            ))
    }

    const getCurrentRaidsContent = useCallback(() => {
        if (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading ||
            lfmState === LoadingState.Initial ||
            lfmState === LoadingState.Loading
        ) {
            return (
                <ColoredText color="secondary">Loading content...</ColoredText>
            )
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
                    ([serverName, lfms]: [string, { [key: number]: Lfm }]) => (
                        <div className="raid-card" key={serverName}>
                            <Link
                                key={serverName}
                                to={`/grouping/${serverName}`}
                                noDecoration
                            >
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
                                    lfms={Object.values(lfms)}
                                    raidView
                                />
                            </Link>
                        </div>
                    )
                )}
            </Stack>
        )
    }, [serverInfoState, lfmData, getCurrentRaids])

    return (
        <Page
            title="DDO Live LFM Viewer"
            description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
        >
            {lfmState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            <ContentClusterGroup>
                <ContentCluster title="Select a Server">
                    <NavCardCluster>
                        {getServerSelectContent("64bit")}
                    </NavCardCluster>
                    <hr />
                    <NavCardCluster>
                        {getServerSelectContent("32bit")}
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Current Raids">
                    {getCurrentRaidsContent()}
                </ContentCluster>
                <ContentCluster title="Notifications">
                    <p>
                        You currently have 0 notification rules set up.
                        Configure rules on the{" "}
                        <Link to="/notifications">notification settings</Link>{" "}
                        page.
                    </p>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                        <NavigationCard type="timers" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Grouping

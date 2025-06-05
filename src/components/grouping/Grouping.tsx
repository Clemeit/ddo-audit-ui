import React, { useCallback } from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import usePollApi from "../../hooks/usePollApi.ts"
import { Lfm, LfmApiDataModel, LfmApiServerModel } from "../../models/Lfm.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import { Link } from "react-router-dom"
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

const Grouping = () => {
    const { data: lfmData, state: lfmState } = usePollApi<LfmApiDataModel>({
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

    const cardDescription = (serverData: LfmApiServerModel) => {
        const serverLfms = serverData.lfms
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
        return (
            serverInfoData?.[serverName]?.is_vip_only && (
                <Badge
                    text="VIP"
                    size="small"
                    backgroundColor="var(--orange4)"
                />
            )
        )
    }

    const getCurrentRaids = useCallback(() => {
        const currentRaids: Record<string, Lfm[]> = {}
        Object.entries(lfmData || {}).forEach(
            ([serverName, serverData]: [string, LfmApiServerModel]) => {
                Object.values(serverData.lfms)?.forEach((lfm: Lfm) => {
                    const quest =
                        lfm.quest_id && lfm.quest_id !== 0
                            ? questContext.quests[lfm.quest_id || 0]
                            : null
                    // TODO: revert next line
                    if (quest?.group_size !== "Raid") {
                        const eligibleLfm: Lfm = {
                            ...lfm,
                            is_eligible: true,
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

    const getServerSelectContent = () => {
        if (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
                serverNameA.localeCompare(serverNameB)
            ).map((serverName) => (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content="Loading data..."
                    icon={<Pending className="shrinkable-icon" />}
                />
            ))
        }

        if (
            lfmState === LoadingState.Initial ||
            lfmState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
                serverNameA.localeCompare(serverNameB)
            ).map((serverName) => (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content="Loading data..."
                    icon={cardIcon(serverName)}
                />
            ))
        }

        return Object.entries(lfmData || {})
            .filter(([serverName]) => SERVER_NAMES_LOWER.includes(serverName))
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
            return <p className="secondary-text">Loading content...</p>
        }

        if (Object.entries(getCurrentRaids() || {}).length === 0) {
            return (
                <p className="secondary-text">
                    There aren't any raids posted at the moment.
                </p>
            )
        }

        return (
            <Stack direction="column" gap="20px">
                {Object.entries(getCurrentRaids() || {}).map(
                    ([serverName, lfms]: [string, { [key: number]: Lfm }]) => (
                        <Link key={serverName} to={`/grouping/${serverName}`}>
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
            <ContentCluster title="Select a Server">
                <NavCardCluster>{getServerSelectContent()}</NavCardCluster>
            </ContentCluster>
            <ContentCluster title="Current Raids">
                {getCurrentRaidsContent()}
            </ContentCluster>
            <ContentCluster title="Notifications">
                <p>
                    You currently have 0 notification rules set up. Configure
                    rules on the{" "}
                    <Link className="link" to="/notifications">
                        notification settings
                    </Link>{" "}
                    page.
                </p>
            </ContentCluster>
            <ContentCluster title="See Also...">
                <NavCardCluster>
                    <NavigationCard type="registration" />
                    <NavigationCard type="timers" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Grouping

import React, { useCallback, useEffect } from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import usePollLfms from "../../hooks/usePollLfms.ts"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import { Lfm, LfmApiServerModel } from "../../models/Lfm.ts"
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
import { useLfmContext } from "../../contexts/LfmContext.tsx"

const Grouping = () => {
    const { lfmData } = usePollLfms({ serverName: "", refreshInterval: 10000 })
    const { serverInfo } = useGetLiveData()
    const { setLfmDataCache } = useLfmContext()

    useEffect(() => {
        setLfmDataCache(lfmData.data?.data || {})
    }, [lfmData])

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
        const isOnline = serverInfo.data?.[serverName]?.is_online
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
            serverInfo.data?.[serverName]?.is_vip_only && (
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
        Object.entries(lfmData.data?.data || {}).forEach(
            ([serverName, serverData]: [string, LfmApiServerModel]) => {
                Object.values(serverData.lfms)?.forEach((lfm: Lfm) => {
                    if (lfm.quest?.group_size === "Raid") {
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
            serverInfo.loadingState === LoadingState.Initial ||
            serverInfo.loadingState === LoadingState.Loading
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
            lfmData.loadingState === LoadingState.Initial ||
            lfmData.loadingState === LoadingState.Loading
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

        return Object.entries(lfmData.data?.data || {})
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
            serverInfo.loadingState === LoadingState.Initial ||
            serverInfo.loadingState === LoadingState.Loading ||
            lfmData.loadingState === LoadingState.Initial ||
            lfmData.loadingState === LoadingState.Loading
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
    }, [serverInfo.loadingState, lfmData, getCurrentRaids])

    return (
        <Page
            title="DDO Live LFM Viewer"
            description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
        >
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

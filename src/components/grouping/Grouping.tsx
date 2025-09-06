import { useCallback, useEffect, useMemo, useState } from "react"
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
import { AlphaReleasePageMessage } from "../global/CommonMessages.tsx"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import FauxLink from "../global/FauxLink.tsx"
import Spacer from "../global/Spacer.tsx"

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

    const [hide32BitServers, setHide32BitServers] = useBooleanFlag(
        BOOLEAN_FLAGS.hide32BitServers,
        true
    )

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
        if (SERVERS_64_BITS_LOWER.includes(serverName)) {
            return (
                <Badge
                    text="64-bit"
                    size="small"
                    backgroundColor="var(--magenta3)"
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
                        <div className="raid-card" key={serverName}>
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
                        </div>
                    )
                )}
            </Stack>
        )
    }, [serverInfoState, lfmData, getCurrentRaids, hasAllDataLoadedOnce])

    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    return (
        <Page
            title="DDO Live LFM Viewer"
            description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
            logo="/icons/grouping-192px.png"
        >
            {!hideAlphaRelease && (
                <div className="alpha-release-message">
                    <AlphaReleasePageMessage
                        onDismiss={() => {
                            setHideAlphaRelease(true)
                        }}
                    />
                </div>
            )}
            {loadingFailed() && <DataLoadingErrorPageMessage />}
            {lfmState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            <ContentClusterGroup>
                <ContentCluster title="Select a Server">
                    <NavCardCluster>
                        {getServerSelectContent("64bit")}
                    </NavCardCluster>
                    {hide32BitServers ? (
                        <>
                            <Spacer size="20px" />
                            <FauxLink
                                onClick={() => setHide32BitServers(false)}
                                style={{
                                    color: "var(--secondary-text)",
                                }}
                            >
                                Show 32-bit servers
                            </FauxLink>
                        </>
                    ) : (
                        <>
                            <hr />
                            <NavCardCluster>
                                {getServerSelectContent("32bit")}
                            </NavCardCluster>
                            <Spacer size="20px" />
                            <FauxLink
                                onClick={() => setHide32BitServers(true)}
                                style={{
                                    color: "var(--secondary-text)",
                                }}
                            >
                                Hide 32-bit servers
                            </FauxLink>
                        </>
                    )}
                </ContentCluster>
                <ContentCluster title="Current Raids">
                    {getCurrentRaidsContent()}
                </ContentCluster>
                <ContentCluster title="Notifications">
                    <Stack direction="row" gap="10px" align="center">
                        <p
                            style={{
                                textDecoration: "line-through",
                                margin: 0,
                            }}
                        >
                            You currently have 0 notification rules set up.
                            Configure rules on the{" "}
                            <Link to="/notifications" disabled>
                                notification settings
                            </Link>{" "}
                            page.
                        </p>
                        <Badge text="Soon" type="soon" />
                    </Stack>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                        <NavigationCard
                            type="timers"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Grouping

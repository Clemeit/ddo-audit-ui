import React, { useMemo } from "react"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import ServerStatus from "./ServerStatus.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import QuickInfo from "./QuickInfo.tsx"
import usePollApi from "../../hooks/usePollApi.ts"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { LoadingState } from "../../models/Api.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
} from "../global/CommonMessages.tsx"
import NewsCluster from "./NewsCluster.tsx"
import { MakeASuggestionButton } from "../buttons/Buttons.tsx"
import FAQSection from "./FAQSection.tsx"
import { getDefaultServerName } from "../../utils/serverUtils.ts"
import { useLiveData } from "./useLiveData.tsx"
import { findMostPopulatedServer } from "../../utils/gameUtils.ts"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"
import logMessage from "../../utils/logUtils.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import Badge from "../global/Badge.tsx"
import LivePopulationContent from "./LivePopulationContent.tsx"
import FauxLink from "../global/FauxLink.tsx"
import Spacer from "../global/Spacer.tsx"

const Live = () => {
    const errorNotificationShownRef = React.useRef<string | null>(null)

    const {
        data: serverInfoData,
        state: serverInfoState,
        error: serverInfoError,
    } = usePollApi<ServerInfoApiDataModel>({
        endpoint: "game/server-info",
        interval: 10000,
        lifespan: 1000 * 60 * 60 * 12, // 24 hours
    })

    const {
        populationTotalsData1Week,
        populationTotalsData1Month,
        news,
        uniqueDataThisQuarter,
        loading: dataLoading,
        error: dataError,
    } = useLiveData()

    const { createNotification } = useNotificationContext()

    const hasCriticalError =
        serverInfoState === LoadingState.Error ||
        (!!serverInfoError &&
            !serverInfoError.message?.includes("CanceledError"))

    const errorMessage = useMemo(
        () => serverInfoError?.message,
        [serverInfoError?.message]
    )
    const dataErrorMessage = useMemo(() => dataError, [dataError])

    // Handle error notifications
    React.useEffect(() => {
        if (hasCriticalError) {
            const errorKey = `${errorMessage || "unknown"}-${dataErrorMessage || "unknown"}`

            // Only show notification if we haven't shown one for this exact error
            if (errorNotificationShownRef.current !== errorKey) {
                try {
                    logMessage("Error fetching data", "error", {
                        metadata: { error: dataErrorMessage },
                    })
                    createNotification({
                        title: "Error fetching data",
                        message:
                            "There was an error fetching the data for this page. Please try again later.",
                        subMessage: dataErrorMessage,
                        type: "error",
                        ttl: 10000,
                    })
                    errorNotificationShownRef.current = errorKey
                } catch {}
            }
        } else {
            errorNotificationShownRef.current = null
        }
    }, [hasCriticalError, createNotification, errorMessage, dataErrorMessage])

    const mostPopulatedServerThisWeek = useMemo(
        () => findMostPopulatedServer(populationTotalsData1Week),
        [populationTotalsData1Week]
    )

    const mostPopulatedServerThisMonth = useMemo(
        () => findMostPopulatedServer(populationTotalsData1Month),
        [populationTotalsData1Month]
    )

    const defaultServerName = useMemo(
        () => getDefaultServerName(serverInfoData),
        [serverInfoData]
    )

    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    const [hide32BitServers, setHide32BitServers] = useBooleanFlag(
        BOOLEAN_FLAGS.hide32BitServers,
        true
    )

    return (
        <Page
            title="DDO Server Status"
            description="DDO server status, most populated server, current default server, and recent population trends."
            pageMessages={() => {
                const messages = []
                if (serverInfoState === LoadingState.Haulted) {
                    messages.push(
                        <LiveDataHaultedPageMessage key="live-haulted" />
                    )
                }
                if (hasCriticalError) {
                    messages.push(
                        <DataLoadingErrorPageMessage key="data-error" />
                    )
                }
                return messages
            }}
        >
            <ContentClusterGroup>
                <ContentCluster title="Server Status">
                    <ServerStatus
                        serverInfoData={serverInfoData}
                        serverInfoState={serverInfoState}
                        hide32BitServers={hide32BitServers}
                    />
                    <Spacer size="10px" />
                    {hide32BitServers ? (
                        <>
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
                <ContentCluster title="Quick Info">
                    <QuickInfo
                        defaultServerName={defaultServerName}
                        mostPopulatedServerThisWeek={
                            mostPopulatedServerThisWeek
                        }
                        mostPopulatedServerThisMonth={
                            mostPopulatedServerThisMonth
                        }
                        uniqueCharactersThisQuarter={
                            uniqueDataThisQuarter?.data?.unique_character_count
                        }
                        uniqueGuildsThisQuarter={
                            uniqueDataThisQuarter?.data?.unique_guild_count
                        }
                    />
                </ContentCluster>
                <ContentCluster title="Live Population">
                    <LivePopulationContent serverInfoData={serverInfoData} />
                </ContentCluster>
                <ContentCluster title="DDO Audit News">
                    <NewsCluster news={news} />
                    <br />
                    <MakeASuggestionButton type="secondary" />
                </ContentCluster>
                <ContentCluster title="Frequently Asked Questions">
                    <FAQSection
                        defaultServerName={defaultServerName}
                        mostPopulatedServerThisWeek={
                            mostPopulatedServerThisWeek
                        }
                        mostPopulatedServerThisMonth={
                            mostPopulatedServerThisMonth
                        }
                        uniqueCharactersThisQuarter={
                            uniqueDataThisQuarter?.data?.unique_character_count
                        }
                    />
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard
                            type="servers"
                            badge={<Badge text="New" type="new" />}
                        />
                        <NavigationCard
                            type="trends"
                            disabled
                            badge={<Badge text="Soon" type="soon" />}
                        />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Live

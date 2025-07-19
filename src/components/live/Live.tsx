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
import { convertToNivoFormat } from "../../utils/nivoUtils.ts"
import GenericLine from "../charts/GenericLine.tsx"
import NewsCluster from "./NewsCluster.tsx"
import { MakeASuggestionButton } from "../buttons/Buttons.tsx"
import FAQSection from "./FAQSection.tsx"
import { getDefaultServerName } from "../../utils/serverUtils.ts"
import { useLiveData } from "./useLiveData.tsx"
import { findMostPopulatedServer } from "../../utils/gameUtils.ts"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"
import logMessage from "../../utils/logUtils.ts"

import { AlphaReleasePageMessage } from "../global/CommonMessages.tsx"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
const Live = () => {
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
        populationData24Hours,
        populationTotalsData1Week,
        populationTotalsData1Month,
        news,
        uniqueDataThisQuarter,
        loading: dataLoading,
        error: dataError,
    } = useLiveData()

    const { createNotification } = useNotificationContext()

    // Handle error notifications
    React.useEffect(() => {
        if (dataError) {
            try {
                logMessage("Error fetching data", "error", {
                    metadata: { error: dataError },
                })
                createNotification({
                    title: "Error fetching data",
                    message:
                        "There was an error fetching the data for this page. Please try again later.",
                    subMessage: dataError,
                    type: "error",
                })
            } catch {}
        }
    }, [dataError, createNotification])

    const nivoData = useMemo(
        () => convertToNivoFormat(populationData24Hours),
        [populationData24Hours]
    )

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

    const livePopulationTitle = useMemo(() => {
        if (!serverInfoData) return "Loading..."

        let totalPopulation = 0
        let totalLfmCount = 0

        for (const server of Object.values(serverInfoData)) {
            totalPopulation += server.character_count || 0
            totalLfmCount += server.lfm_count || 0
        }

        const snarkyComment =
            totalPopulation === 0
                ? "Maybe they're all anonymous."
                : "Are you one of them?"
        return (
            <>
                There are currently{" "}
                <span className="blue-text">
                    {totalPopulation.toLocaleString()}
                </span>{" "}
                characters online and{" "}
                <span className="orange-text">
                    {totalLfmCount.toLocaleString()}
                </span>{" "}
                LFMs posted. {snarkyComment}
            </>
        )
    }, [serverInfoData])

    const hasAnyError = serverInfoState === LoadingState.Error || !!dataError

    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    return (
        <Page
            title="DDO Server Status"
            description="DDO server status, most populated server, current default server, and recent population trends."
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
            {serverInfoState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {hasAnyError && <DataLoadingErrorPageMessage />}
            <ContentClusterGroup>
                <ContentCluster title="Server Status">
                    <ServerStatus
                        serverInfoData={serverInfoData}
                        serverInfoState={serverInfoState}
                    />
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
                <ContentCluster title="Live Population">
                    <p>{livePopulationTitle}</p>
                    <GenericLine nivoData={nivoData} showLegend />
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="servers" />
                        <NavigationCard type="trends" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Live

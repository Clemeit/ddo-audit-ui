import React, { useEffect, useMemo, useState } from "react"
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
import {
    PopulationDataPoint,
    PopulationPointInTime,
    ServerInfoApiDataModel,
} from "../../models/Game.ts"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
} from "../global/CommonMessages.tsx"
import {
    getPopulationData1Day,
    getTotalPopulation1Month,
    getTotalPopulation1Week,
} from "../../services/gameService.ts"
import { convertToNivoFormat } from "../../utils/nivoUtils.ts"
import GenericLine from "../charts/GenericLine.tsx"
import { NewsResponse } from "../../models/Service.ts"
import { getNews } from "../../services/newsService.ts"
import NewsCluster from "./NewsCluster.tsx"
import { MakeASuggestionButton } from "../buttons/Buttons.tsx"

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

    const [populationData24Hours, setPopulationData24Hours] = React.useState<
        PopulationPointInTime[]
    >([])
    const [populationTotalsData1Week, setPopulationTotalsData1Week] =
        React.useState<Record<string, PopulationDataPoint>>({})
    const [populationTotalsData1Month, setPopulationTotalsData1Month] =
        React.useState<Record<string, PopulationDataPoint>>({})
    const [news, setNews] = useState<NewsResponse>(null)

    useEffect(() => {
        getPopulationData1Day().then((response) => {
            setPopulationData24Hours(response.data.data)
        })
        getTotalPopulation1Week().then((response) => {
            setPopulationTotalsData1Week(response.data.data)
        })
        getTotalPopulation1Month().then((response) => {
            setPopulationTotalsData1Month(response.data.data)
        })
        getNews().then((response) => {
            setNews(response.data)
        })
    }, [])

    const nivoData = useMemo(
        () => convertToNivoFormat(populationData24Hours),
        [populationData24Hours]
    )

    const mostPopulatedServerThisWeek = useMemo(() => {
        let maxTotalPopulation = 0
        let mostPopulatedServerName = ""

        Object.entries(populationTotalsData1Week || {}).forEach(
            ([serverName, serverData]) => {
                if (serverData.character_count > maxTotalPopulation) {
                    maxTotalPopulation = serverData.character_count
                    mostPopulatedServerName = serverName
                }
            }
        )
        return mostPopulatedServerName
    }, [populationTotalsData1Week])

    const mostPopulatedServerThisMonth = useMemo(() => {
        let maxTotalPopulation = 0
        let mostPopulatedServerName = ""

        Object.entries(populationTotalsData1Month || {}).forEach(
            ([serverName, serverData]) => {
                if (serverData.character_count > maxTotalPopulation) {
                    maxTotalPopulation = serverData.character_count
                    mostPopulatedServerName = serverName
                }
            }
        )
        return mostPopulatedServerName
    }, [populationTotalsData1Month])

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

    return (
        <Page
            title="DDO Server Status"
            description="DDO server status, most populated server, current default server, and recent population trends."
        >
            {serverInfoState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {serverInfoState === LoadingState.Error && (
                <DataLoadingErrorPageMessage />
            )}
            <ContentClusterGroup>
                <ContentCluster title="Server Status">
                    <ServerStatus
                        serverInfoData={serverInfoData}
                        serverInfoState={serverInfoState}
                    />
                </ContentCluster>
                <ContentCluster title="Quick Info">
                    <QuickInfo
                        serverInfoData={serverInfoData}
                        mostPopulatedServerThisWeek={
                            mostPopulatedServerThisWeek
                        }
                        mostPopulatedServerThisMonth={
                            mostPopulatedServerThisMonth
                        }
                    />
                </ContentCluster>
                <ContentCluster title="Of Special Note">
                    <NewsCluster news={news} />
                    <br />
                    <MakeASuggestionButton type="secondary" />
                </ContentCluster>
                <ContentCluster title="Frequently Asked Questions"></ContentCluster>
                <ContentCluster title="Live Population">
                    <p>{livePopulationTitle}</p>
                    <GenericLine nivoData={nivoData} showLegend />
                </ContentCluster>
                <ContentCluster title="Historical Population">
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

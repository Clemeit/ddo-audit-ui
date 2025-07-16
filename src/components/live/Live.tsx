import React, { useEffect, useMemo } from "react"
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
    PopulationPointInTime,
    ServerInfoApiDataModel,
} from "../../models/Game.ts"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
} from "../global/CommonMessages.tsx"
import { getPopulationData1Day } from "../../services/gameService.ts"
import { ResponsiveLine } from "@nivo/line"
import { convertToNivoFormat } from "../../utils/nivoUtils.ts"
import { ResponsiveContainer } from "recharts"

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

    useEffect(() => {
        getPopulationData1Day().then((response) => {
            console.log(response.data.data)
            setPopulationData24Hours(response.data.data)
        })
    }, [])

    const nivoData = useMemo(
        () => convertToNivoFormat(populationData24Hours),
        [populationData24Hours]
    )
    console.log("Nivo Data:", nivoData)

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
                    <QuickInfo />
                </ContentCluster>
                <ContentCluster title="Of Special Note"></ContentCluster>
                <ContentCluster title="Frequently Asked Questions"></ContentCluster>
                <ContentCluster title="Live Population">
                    <ResponsiveContainer width="100%" height={400}>
                        <ResponsiveLine
                            data={nivoData}
                            margin={{
                                bottom: 60,
                                left: 60,
                                right: 60,
                                top: 60,
                            }}
                            xScale={{
                                type: "time",
                                format: "%Y-%m-%dT%H:%M:%SZ",
                                useUTC: true,
                                precision: "minute",
                            }}
                            xFormat="time:%Y-%m-%d %H:%M"
                            theme={{
                                axis: {
                                    ticks: {
                                        text: {
                                            fill: "var(--text)",
                                            fontSize: 14,
                                        },
                                    },
                                    legend: {
                                        text: {
                                            fill: "var(--text)",
                                            fontSize: 14,
                                        },
                                    },
                                },
                            }}
                            enableGridX={false}
                            enablePoints={false}
                            lineWidth={3}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -45,
                                legend: "Time",
                                legendOffset: 50,
                                format: "%H:%M",
                                tickValues: "every 1 hour",
                            }}
                        />
                    </ResponsiveContainer>
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

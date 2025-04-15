import React from "react"
import ContentCluster from "../global/ContentCluster.tsx"
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
            <ContentCluster title="Live Population"></ContentCluster>
            <ContentCluster title="Historical Population">
                <NavCardCluster>
                    <NavigationCard type="servers" />
                    <NavigationCard type="trends" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Live

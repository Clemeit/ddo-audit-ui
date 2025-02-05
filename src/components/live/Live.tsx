import React from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import ServerStatus from "./ServerStatus.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import QuickInfo from "./QuickInfo.tsx"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import PageMessage from "../global/PageMessage.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { LoadingState } from "../../models/Api.ts"

const Live = () => {
    const { serverInfo, mustReload } = useGetLiveData()

    return (
        <Page
            title="DDO Server Status"
            description="DDO server status, most populated server, current default server, and recent population trends."
        >
            {mustReload && (
                <PageMessage
                    type="error"
                    title="Are you still there?"
                    message="You must refresh the page to continue viewing live data."
                />
            )}
            {serverInfo && serverInfo.loadingState === LoadingState.Error && (
                <PageMessage
                    type="error"
                    title="Server Status Error"
                    message={
                        <>
                            <span>
                                There was an error loading the server status
                                data. Please try again later.
                            </span>
                            {serverInfo.error && (
                                <span className="secondary-text">
                                    {serverInfo.error}
                                </span>
                            )}
                        </>
                    }
                />
            )}
            <ContentCluster title="Server Status">
                <ServerStatus serverInfo={serverInfo} />
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

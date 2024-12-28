import React, { useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import ServerStatus from "./ServerStatus.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import QuickInfo from "./QuickInfo.tsx"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import PageMessage from "../global/PageMessage.tsx"

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
                <div className="nav-card-cluster">
                    <NavigationCard type="servers" />
                    <NavigationCard type="trends" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Live

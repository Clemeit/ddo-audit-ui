import React from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import ServerStatus from "./ServerStatus.tsx"

const Live = () => {
    return (
        <Page
            title="DDO Server Status"
            description="DDO server status, most populated server, current default server, and recent population trends."
        >
            <ContentCluster title="Server Status">
                <ServerStatus />
            </ContentCluster>
        </Page>
    )
}

export default Live

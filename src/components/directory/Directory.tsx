import React from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"

const Directory = () => {
    return (
        <Page
            title="DDO Audit | Character Tracking and LFM Viewer"
            description="A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!"
        >
            <ContentCluster title="Population and Activity">
                <NavCardCluster>
                    <NavigationCard type="live" />
                    <NavigationCard type="servers" />
                    <NavigationCard type="quests" />
                    <NavigationCard type="trends" />
                </NavCardCluster>
            </ContentCluster>
            <ContentCluster title="Social Tools">
                <NavCardCluster>
                    <NavigationCard type="grouping" />
                    <NavigationCard type="who" />
                    <NavigationCard type="friends" />
                    <NavigationCard type="registration" />
                    <NavigationCard type="timers" />
                    <NavigationCard type="activity" />
                </NavCardCluster>
            </ContentCluster>
            <ContentCluster title="Additional Resources">
                <NavCardCluster>
                    <NavigationCard type="about" />
                    <NavigationCard type="api" />
                    <NavigationCard type="suggestions" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Directory

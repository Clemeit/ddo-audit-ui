import React from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"

const Directory = () => {
    return (
        <Page
            title="DDO Audit | Character Tracking and LFM Viewer"
            description="A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!"
        >
            <ContentCluster title="Population and Activity">
                <div className="nav-card-cluster">
                    <NavigationCard type="live" />
                    <NavigationCard type="servers" />
                    <NavigationCard type="quests" />
                    <NavigationCard type="trends" />
                </div>
            </ContentCluster>
            <ContentCluster title="Social Tools">
                <div className="nav-card-cluster">
                    <NavigationCard type="grouping" />
                    <NavigationCard type="who" />
                    <NavigationCard type="friends" />
                    <NavigationCard type="registration" />
                    <NavigationCard type="timers" />
                    <NavigationCard type="activity" />
                </div>
            </ContentCluster>
            <ContentCluster title="Additional Resources">
                <div className="nav-card-cluster">
                    <NavigationCard type="about" />
                    <NavigationCard type="api" />
                    <NavigationCard type="suggestions" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Directory

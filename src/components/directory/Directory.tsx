import React from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import { Helmet } from "react-helmet-async"
import Badge from "../global/Badge.tsx"

const Directory = () => {
    return (
        <div className="page directory">
            <Helmet>
                <title>DDO Audit | Population Tracking and LFM Viewer</title>
                <meta
                    name="description"
                    content="A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!"
                />
                <meta
                    property="og:image"
                    content="/icons/logo-512px.png"
                    data-react-helmet="true"
                />
                <meta
                    property="twitter:image"
                    content="/icons/logo-512px.png"
                    data-react-helmet="true"
                />
            </Helmet>
            <ContentCluster title="Population and Activity">
                <div className="nav-card-cluster">
                    <NavigationCard type="live" />
                    <NavigationCard type="servers" />
                    <NavigationCard type="quests" />
                    <NavigationCard type="trends" />
                    <NavigationCard type="transfers" />
                </div>
            </ContentCluster>
            <ContentCluster title="Social Tools">
                <div className="nav-card-cluster">
                    <NavigationCard type="grouping" />
                    <NavigationCard type="who" />
                    <NavigationCard type="friends" />
                    <NavigationCard type="registration" />
                    <NavigationCard type="verification" />
                    <NavigationCard type="timers" />
                </div>
            </ContentCluster>
            <ContentCluster title="Additional Resources">
                <div className="nav-card-cluster">
                    <NavigationCard type="about" />
                    <NavigationCard type="api" />
                    <NavigationCard type="suggestions" />
                </div>
            </ContentCluster>
        </div>
    )
}

export default Directory

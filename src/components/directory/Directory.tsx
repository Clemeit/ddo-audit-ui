import React from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
// import "./Directory.css";

const Directory = () => {
    return (
        <div className="page directory">
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

import React from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import usePollLfms from "../../hooks/usePollLfms.ts"
import { LfmApiServerModel } from "../../models/Lfm.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import { Link } from "react-router-dom"

const Grouping = () => {
    const { mustReload, lfmData } = usePollLfms()
    console.log(lfmData)

    const cardDescription = (serverData: LfmApiServerModel) => {
        const serverLfms = serverData.lfms
        const lfmCount = Object.keys(serverLfms).length
        const raidCount = Object.values(serverLfms).filter(
            (lfm) => lfm.quest?.group_size === "Raid"
        ).length
        return (
            <>
                <span style={{ color: "var(--orange-text)" }}>
                    {lfmCount} group{lfmCount === 1 ? "" : "s"}
                </span>
                {raidCount > 0 &&
                    ` | ${raidCount} raid${raidCount === 1 ? "" : "s"}`}
            </>
        )
    }

    return (
        <Page
            title="DDO Live LFM Viewer"
            description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
        >
            <ContentCluster title="Select a Server">
                <div className="nav-card-cluster">
                    {Object.entries(lfmData.data || {})
                        .filter(([serverName]) =>
                            SERVER_NAMES_LOWER.includes(serverName)
                        )
                        .sort(([server_name_a], [server_name_b]) =>
                            server_name_a.localeCompare(server_name_b)
                        )
                        .map(([serverName, serverData]) => (
                            <ServerNavigationCard
                                destination={`/grouping/${serverName}`}
                                title={toSentenceCase(serverName)}
                                content={cardDescription(serverData)}
                            />
                        ))}
                </div>
            </ContentCluster>
            <ContentCluster title="Current Raids"></ContentCluster>
            <ContentCluster title="Notifications">
                <p>
                    You currently have 0 notification rules set up. Configure
                    rules on the{" "}
                    <Link className="link" to="/notifications">
                        notification settings
                    </Link>{" "}
                    page.
                </p>
            </ContentCluster>
            <ContentCluster title="See Also...">
                <div className="nav-card-cluster">
                    <NavigationCard type="registration" />
                    <NavigationCard type="timers" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Grouping

import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { BETTER_STACK_URL } from "../../constants/client.ts"
import Badge from "../global/Badge.tsx"

const Directory = () => {
    return (
        <Page
            title="DDO Audit | Character Tracking and LFM Viewer"
            description="A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!"
        >
            <ContentClusterGroup>
                <ContentCluster title="Population and Activity">
                    <NavCardCluster>
                        <NavigationCard type="live" />
                        <NavigationCard
                            type="servers"
                            badge={<Badge text="New" type="new" />}
                        />
                        <NavigationCard
                            type="quests"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard
                            type="trends"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Social Tools">
                    <NavCardCluster>
                        <NavigationCard type="grouping" />
                        <NavigationCard type="who" />
                        <NavigationCard
                            type="guilds"
                            badge={<Badge text="New" type="new" />}
                        />
                        <NavigationCard
                            type="notifications"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard type="friends" />
                        <NavigationCard type="ignores" />
                        <NavigationCard
                            type="owned-content"
                            badge={<Badge text="New" type="new" />}
                        />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Character Tools">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                        <NavigationCard
                            type="activity"
                            badge={<Badge text="New" type="new" />}
                        />
                        <NavigationCard
                            type="timers"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Additional Resources">
                    <NavCardCluster>
                        <NavigationCard type="about" />
                        <NavigationCard
                            type="api"
                            badge={<Badge text="Soon" type="soon" />}
                            disabled
                        />
                        <NavigationCard type="feedback" />
                        <NavigationCard
                            type="health"
                            externalLink={BETTER_STACK_URL}
                        />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Directory

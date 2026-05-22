import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { BETTER_STACK_URL, API_DOC_URL } from "../../constants/client.ts"
import Badge from "../global/Badge.tsx"

const Directory = () => {
    return (
        <ContentClusterGroup>
            <ContentCluster title="Population and Activity">
                <NavCardCluster>
                    <NavigationCard type="live" />
                    <NavigationCard type="servers" />
                    <NavigationCard
                        type="quests"
                        badge={<Badge text="New" type="new" />}
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
                    <NavigationCard type="guilds" />
                    <NavigationCard
                        type="notifications"
                        badge={<Badge text="Soon" type="soon" />}
                        disabled
                    />
                    <NavigationCard type="friends" />
                    <NavigationCard type="ignores" />
                    <NavigationCard type="owned-content" />
                </NavCardCluster>
            </ContentCluster>
            <ContentCluster title="Character Tools">
                <NavCardCluster>
                    <NavigationCard type="registration" />
                    <NavigationCard type="activity" />
                    <NavigationCard type="timers" />
                </NavCardCluster>
            </ContentCluster>
            <ContentCluster title="Additional Resources">
                <NavCardCluster>
                    <NavigationCard
                        type="account"
                        badge={<Badge text="Beta" type="beta" />}
                    />
                    <NavigationCard type="about" />
                    <NavigationCard
                        type="api"
                        badge={<Badge text="New" type="new" />}
                        externalLink={API_DOC_URL}
                    />
                    <NavigationCard type="feedback" />
                    <NavigationCard
                        type="health"
                        externalLink={BETTER_STACK_URL}
                    />
                </NavCardCluster>
            </ContentCluster>
        </ContentClusterGroup>
    )
}

export default Directory

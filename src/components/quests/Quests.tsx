import Page from "../global/Page.tsx"
import { ContentClusterGroup } from "../global/ContentCluster.tsx"
import { WIPPageMessage } from "../global/CommonMessages.tsx"

const Quests = () => {
    return (
        <Page
            title="Quest Activity and Trends"
            description="Explore quest activity and trends across DDO servers, including completion time distribution and popularity."
            pageMessages={[<WIPPageMessage />]}
        >
            <ContentClusterGroup></ContentClusterGroup>
        </Page>
    )
}

export default Quests

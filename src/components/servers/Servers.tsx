import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import useServersData from "./useServersData.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Badge from "../global/Badge.tsx"
import ServerSelectContent from "./ServerSelectContent.tsx"
import ColoredText from "../global/ColoredText.tsx"
import Spacer from "../global/Spacer.tsx"
import DailyPopulationDistribution from "./DailyPopulationDistribution.tsx"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import PageMessage from "../global/PageMessage.tsx"
import ServerPopulationDistribution from "./ServerPopulationDistribution.tsx"
import HourlyPopulationDistribution from "./HourlyPopulationDistribution.tsx"
import PeakTimesPopulationDistribution from "./PeakTimesPopulationDistribution.tsx"
import LevelPopulationDistribution from "./LevelPopulationDistribution.tsx"
import RacePopulationDistribution from "./RacePopulationDistribution.tsx"
import GenderPopulationDistribution from "./GenderPopulationDistribution.tsx"
import PrimaryClassPopulationDistribution from "./PrimaryClassPopulationDistribution.tsx"
import ClassCountPopulationDistribution from "./ClassCountPopulationDistribution.tsx"
import GuildAffiliatedPopulationDistribution from "./GuildAffiliatedPopulationDistribution.tsx"
import Link from "../global/Link.tsx"

const Servers = () => {
    const { isLoading, isError, serverInfo, uniqueData } = useServersData()

    const [showBankToonDisclaimer, setShowBankToonDisclaimer] = useBooleanFlag(
        BOOLEAN_FLAGS.bankToonsDisclaimer,
        true
    )

    return (
        <Page
            title="Servers"
            description="DDO's server populations, character demographics, content popularity, and long-term trends. Check time zone activity and choose which server is best for you!"
            logo="/icons/servers-192px.png"
            pageMessages={[
                showBankToonDisclaimer && (
                    <PageMessage
                        title="Bank Characters / Mules"
                        message={`These reports all include characters that are solely used for item storage - commonly referred to as "Bank toons" or "Mules." They will be filtered out in a future release, but for now, please be aware that they may significantly skew the data.`}
                        onDismiss={() => setShowBankToonDisclaimer(false)}
                    />
                ),
                <PageMessage
                    title="Mobile Browsing"
                    message="This page is not currently optimized for mobile devices. For the best experience, please view on a desktop or laptop."
                    type="warning"
                    className="show-on-mobile"
                />,
            ]}
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="Select a Server"
                    badge={<Badge text="Soon" type="soon" />}
                >
                    <ServerSelectContent
                        isLoading={isLoading}
                        isError={isError}
                        serverInfo={serverInfo}
                        uniqueData={uniqueData}
                    />
                    <Spacer size="20px" />
                    <ColoredText color="secondary">
                        Unique character and guild numbers are based on the last
                        quarter.
                    </ColoredText>
                </ContentCluster>
                <ContentCluster
                    title="Server Population Distribution"
                    subtitle="Average population distribution per server."
                >
                    <ServerPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Hourly Population Distribution"
                    subtitle="Average population distribution per server by time of day."
                >
                    <HourlyPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Daily Population Distribution"
                    subtitle="Average population and LFM count data by day of week."
                >
                    <DailyPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Peak Times"
                    subtitle="Peak times for each server, defined as when the population of LFM count is above some threshold of the server's observed maximum population or LFM count."
                >
                    <PeakTimesPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Level Distribution"
                    subtitle="Distribution of characters' total level per server."
                >
                    <LevelPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Race Distribution"
                    subtitle="Distribution of character races. All servers combined."
                >
                    <RacePopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Gender Distribution"
                    subtitle="Distribution of character genders. All servers combined."
                >
                    <GenderPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Primary Class Distribution"
                    subtitle="Distribution of character primary class, defined as the class a character has the most levels in. All servers combined."
                >
                    <PrimaryClassPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Number of Classes"
                    subtitle="Distribution of the number of classes characters have. All servers combined."
                >
                    <ClassCountPopulationDistribution />
                </ContentCluster>
                <ContentCluster
                    title="Guild Affiliated"
                    subtitle="The number of characters that are guild members. All servers combined."
                >
                    <GuildAffiliatedPopulationDistribution />
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="live" />
                        <NavigationCard
                            type="guilds"
                            badge={<Badge text="New" type="new" />}
                        />
                        <NavigationCard
                            type="trends"
                            disabled
                            badge={<Badge text="Soon" type="soon" />}
                        />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Servers

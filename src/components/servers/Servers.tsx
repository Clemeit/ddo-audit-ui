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
import FauxLink from "../global/FauxLink.tsx"
import Stack from "../global/Stack.tsx"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import Modal from "../modal/Modal.tsx"
import Link from "../global/Link.tsx"
import WebLink from "../global/WebLink.tsx"

const Servers = () => {
    const { isLoading, isError, serverInfo, uniqueData } = useServersData()

    const [showBankToonDisclaimer, setShowBankToonDisclaimer] = useBooleanFlag(
        BOOLEAN_FLAGS.bankToonsDisclaimer,
        true
    )

    const {
        isModalOpen,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation()

    const activeCalculationModal = (
        <Modal onClose={handleCloseModal} fullScreenOnMobile>
            <ContentCluster
                title='How is "Active" Calculated?'
                showHeaderLink={false}
            >
                <p>
                    Determining if a character is "active" is entirely
                    subjective and should not be viewed as a perfect measure of
                    activity. This is my own interpretation of what an active
                    character is, based on my experience playing DDO and
                    observing player behavior over the years.
                </p>
                <p>
                    A few factors are considered when determining if a character
                    is active or inactive. Some factors are weighted differently
                    than others.
                </p>
                <ul>
                    <li>A character's level</li>
                    <li>A character's location</li>
                    <li>A character's online activity</li>
                </ul>
                <h3>Level</h3>
                <p>
                    Inactive characters tend to follow a common trend: little to
                    no level-up activity, and what activity they do have was
                    performed within a relatively short period of time. For
                    example, an inactive character might remain at level 1
                    indefinitely, or they might increase to level 4, 7, or 15
                    over the course of a few minutes, then never level up again.
                </p>
                <p>
                    Active characters tend to level up on a semi-regular basis.
                    They tend to have more level activity, and that activity is
                    spread out over a longer period of time. For example, an
                    active character might level up to 10 over the course of a
                    week, then reach level 15 the following week, then level 20
                    a few days later, and so on.
                </p>
                <h3>Location</h3>
                <p>
                    Inactive characters tend to remain in a single location for
                    long periods of time. They tend to spend most or all of
                    their time in areas where banks are easily accessible, such
                    as The Harbor, The Lordsmarch Bank, the Crafting Hall, etc.
                    For example, an inactive character might have some location
                    activity when they are first created, but then they spend
                    most or all of their time in The Harbor.
                </p>
                <p>
                    Active characters tend to move around more frequently. They
                    spend time in a variety of locations, including inside
                    quests and wilderness areas. For example, an active
                    character might spend some time in The Harbor, but they also
                    spend time in quests, wilderness areas, and other public
                    locations.
                </p>
                <h3>Online Activity</h3>
                <p>
                    Inactive characters tend to spend significantly less time
                    online. They may log in frequently, but they typically spend
                    a short amount of time online. For example, an inactive
                    character might log in many times per week, but those
                    sessions are short.
                </p>
                <p>
                    Active characters tend to spend more time online. They don't
                    necessarily log in more frequently, but they spend a
                    considerably longer amount of time online when they do log
                    in. For example, an active character might log in once or
                    twice per day and stay logged in at least long enough to run
                    a few quests.
                </p>
                <hr />
                <p>
                    For more information, check out{" "}
                    <WebLink href="https://github.com/Clemeit/ddo-audit-service/blob/master/sanic/utils/activity.py">
                        the source code
                    </WebLink>
                    . If you have ideas on how this algorithm could be improved,
                    please <Link to="/feedback">leave a suggestion.</Link>
                </p>
            </ContentCluster>
        </Modal>
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
            {isModalOpen && activeCalculationModal}
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
                    <Stack direction="column" gap="8px">
                        <ColoredText color="secondary">
                            Unique character and guild numbers are based on the
                            last quarter.
                        </ColoredText>
                        <FauxLink onClick={handleOpenModal}>
                            How is "active" calculated?
                        </FauxLink>
                    </Stack>
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
                    subtitle="Peak times for each server, defined as when the population or LFM count is above some threshold of the server's observed maximum population or LFM count."
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

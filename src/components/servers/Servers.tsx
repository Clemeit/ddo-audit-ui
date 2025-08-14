import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { WIPPageMessage } from "../global/CommonMessages.tsx"
import useServersData from "./useServersData.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Badge from "../global/Badge.tsx"
import ServerSelectContent from "./ServerSelectContent.tsx"
import ServerPopulationDistribution from "./ServerPopulationDistribution.tsx"
import { useState } from "react"
import { RangeEnum, ServerFilterEnum } from "../../models/Population.ts"
import Button from "../global/Button.tsx"
import ColoredText from "../global/ColoredText.tsx"
import Spacer from "../global/Spacer.tsx"
import Stack from "../global/Stack.tsx"
import HourlyPopulationDistribution from "./HourlyPopulationDistribution.tsx"

const Servers = () => {
    // const [
    //     hourlyPopulationDistributionRange,
    //     setHourlyPopulationDistributionRange,
    // ] = useState<RangeEnum>(RangeEnum.QUARTER)
    // const [
    //     dailyPopulationDistributionRange,
    //     setDailyPopulationDistributionRange,
    // ] = useState<RangeEnum>(RangeEnum.QUARTER)
    // const [
    //     levelPopulationDistributionRange,
    //     setLevelPopulationDistributionRange,
    // ] = useState<RangeEnum>(RangeEnum.QUARTER)
    // const [
    //     racePopulationDistributionRange,
    //     setRacePopulationDistributionRange,
    // ] = useState<RangeEnum>(RangeEnum.QUARTER)
    // const [
    //     primaryClassPopulationDistributionRange,
    //     setPrimaryClassPopulationDistributionRange,
    // ] = useState<RangeEnum>(RangeEnum.QUARTER)
    const { isLoading, isError, serverInfo, uniqueData } = useServersData()

    return (
        <Page
            title="Servers"
            description="DDO's server populations, character demographics, content popularity, and long-term trends. Check time zone activity and choose which server is best for you!"
            logo="/icons/servers-192px.png"
        >
            {/* <WIPPageMessage /> */}
            <ContentClusterGroup>
                <ContentCluster title="Select a Server">
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
                <ContentCluster title="Server Population Distribution">
                    <ServerPopulationDistribution />
                </ContentCluster>
                <ContentCluster title="Hourly Population Distribution">
                    <HourlyPopulationDistribution />
                </ContentCluster>
                <ContentCluster title="Daily Population Distribution"></ContentCluster>
                <ContentCluster title="Level Distribution"></ContentCluster>
                <ContentCluster title="Race Distribution"></ContentCluster>
                <ContentCluster title="Primary Class Distribution"></ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="live" />
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

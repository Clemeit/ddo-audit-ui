import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import useTrendsData from "./useTrendsData.tsx"
import GenericLine from "../charts/GenericLine.tsx"
import { convertToNivoFormat } from "../../utils/nivoUtils.ts"
import { useMemo } from "react"
import {
    LINE_CHART_AXIS_BOTTOM,
    LINE_CHART_MARGIN,
} from "../charts/lineChartConfig.ts"
import { dateToLongString } from "../../utils/dateUtils.ts"
import {
    DataLoadingErrorPageMessage,
    WIPPageMessage,
} from "../global/CommonMessages.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"

const weekConfig = {
    axisBottom: {
        ...LINE_CHART_AXIS_BOTTOM,
        tickValues: "every 8 hour",
        format: "%d %b %H:%M",
        legendOffset: 85,
    },
    margin: {
        ...LINE_CHART_MARGIN,
        bottom: 100,
    },
    yFormatter: (value: number) => Math.round(value).toString(),
}

const monthConfig = {
    axisBottom: {
        ...LINE_CHART_AXIS_BOTTOM,
        tickValues: "every 1 day",
        format: "%d %b",
        legendOffset: 85,
    },
    margin: {
        ...LINE_CHART_MARGIN,
        bottom: 100,
    },
    dateFormatter: (date: Date) => dateToLongString(date),
    yFormatter: (value: number) => Math.round(value).toString(),
}

const Trends = () => {
    const { populationData1Week, populationData1Month, loading, error } =
        useTrendsData()
    const { timezoneOverride } = useAppContext()

    const nivoData1Week = useMemo(() => {
        return convertToNivoFormat(
            populationData1Week,
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        )
    }, [populationData1Week])

    const nivoData1Month = useMemo(() => {
        return convertToNivoFormat(
            populationData1Month,
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        )
    }, [populationData1Month])

    return (
        <Page
            title="Population Trends"
            description="Explore the population trends of DDO servers over time, including weekly, monthly, and yearly statistics."
            pageMessages={[
                <WIPPageMessage />,
                error && <DataLoadingErrorPageMessage />,
            ]}
        >
            <ContentClusterGroup>
                <ContentCluster title="The Last Week">
                    <GenericLine
                        nivoData={nivoData1Week}
                        showLegend
                        {...weekConfig}
                    />
                </ContentCluster>
                <ContentCluster title="The Last Month">
                    <GenericLine
                        nivoData={nivoData1Month}
                        showLegend
                        {...monthConfig}
                    />
                </ContentCluster>
                <ContentCluster title="The Last Year"></ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Trends

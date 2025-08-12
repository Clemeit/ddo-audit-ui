import React, { useCallback, useMemo } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
// import useGetLiveData from "../../hooks/useGetLiveData.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { LoadingState } from "../../models/Api.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { WIPPageMessage } from "../global/CommonMessages.tsx"
import useServersData from "./useServersData.tsx"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import Skeleton from "../global/Skeleton.tsx"
import ColoredText from "../global/ColoredText.tsx"
import Stack from "../global/Stack.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Badge from "../global/Badge.tsx"

const Servers = () => {
    const { isLoading, isError, serverInfo, uniqueData } = useServersData()

    const getIconForCard = (
        serverName: string,
        serverInfo: ServerInfoApiDataModel
    ) => {
        if (serverInfo === undefined || serverInfo[serverName] === undefined)
            return <Pending />

        switch (serverInfo[serverName].is_online) {
            case true:
                return <Checkmark />
            case false:
                return <X />
        }
    }

    const getContentForCard = (serverName: string, uniqueData: any) => {
        if (uniqueData === undefined || serverInfo[serverName] === undefined)
            return (
                <Skeleton width={`${120 + (serverName.length % 3) * 20}px`} />
            )

        return (
            <Stack direction="column" gap="4px">
                <ColoredText color="blue">1234 characaters</ColoredText>
                <ColoredText color="orange">123 guilds</ColoredText>
            </Stack>
        )
    }

    const serverSelectContent = useMemo(() => {
        const serverNamesSorted = [...SERVER_NAMES_LOWER].sort(
            (serverNameA, serverNameB) => serverNameA.localeCompare(serverNameB)
        )

        return serverNamesSorted.map((serverName) => (
            <ServerNavigationCard
                title={toSentenceCase(serverName)}
                destination={`/servers/${serverName}`}
                icon={getIconForCard(serverName, serverInfo)}
                content={getContentForCard(serverName, uniqueData)}
            />
        ))
    }, [isLoading, isError, serverInfo])

    return (
        <Page
            title="Servers"
            description="DDO's server populations, character demographics, content popularity, and long-term trends. Check time zone activity and choose which server is best for you!"
            logo="/icons/servers-192px.png"
        >
            <WIPPageMessage />
            <ContentClusterGroup>
                <ContentCluster title="Select a Server">
                    <NavCardCluster>{serverSelectContent}</NavCardCluster>
                </ContentCluster>
                <ContentCluster title="Server Population Distribution"></ContentCluster>
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

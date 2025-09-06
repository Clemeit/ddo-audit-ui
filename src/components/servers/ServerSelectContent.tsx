import { useCallback, useMemo } from "react"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import {
    SERVER_NAMES_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { UniquePopulationData } from "../../models/Population"
import Skeleton from "../global/Skeleton.tsx"
import ColoredText from "../global/ColoredText.tsx"
import Stack from "../global/Stack.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import Spacer from "../global/Spacer.tsx"
import FauxLink from "../global/FauxLink.tsx"

interface Props {
    isLoading?: boolean
    isError?: boolean
    serverInfo?: ServerInfoApiDataModel
    uniqueData?: UniquePopulationData
}

const ServerSelectContent = ({
    isLoading,
    isError,
    serverInfo,
    uniqueData,
}: Props) => {
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

    const [hide32BitServers, setHide32BitServers] = useBooleanFlag(
        BOOLEAN_FLAGS.hide32BitServers,
        true
    )

    const getContentForCard = (
        serverName: string,
        uniqueData: UniquePopulationData
    ) => {
        if (uniqueData === undefined)
            return (
                <Skeleton width={`${120 + (serverName.length % 3) * 20}px`} />
            )
        const serverData = uniqueData.server_breakdown[serverName]
        if (!serverData) {
            return <ColoredText color="secondary">Info not found</ColoredText>
        }

        const character_count = serverData.unique_character_count
        const guild_count = serverData.unique_guild_count

        return (
            <Stack direction="column">
                <ColoredText color="blue">
                    {character_count.toLocaleString()} characaters
                </ColoredText>
                <ColoredText color="orange">
                    {guild_count.toLocaleString()} guilds
                </ColoredText>
            </Stack>
        )
    }

    const serverSelectContent = useCallback(
        (type: "32bit" | "64bit") => {
            const serverNamesSorted = [...SERVER_NAMES_LOWER].sort(
                (serverNameA, serverNameB) =>
                    serverNameA.localeCompare(serverNameB)
            )
            const filteredServerNames = serverNamesSorted.filter(
                (serverName) => {
                    if (type === "32bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === false
                        )
                    } else if (type === "64bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === true
                        )
                    }
                    return true
                }
            )

            return filteredServerNames.map((serverName) => (
                <ServerNavigationCard
                    key={serverName}
                    title={toSentenceCase(serverName)}
                    destination={`/servers/${serverName}`}
                    icon={getIconForCard(serverName, serverInfo)}
                    content={getContentForCard(serverName, uniqueData)}
                />
            ))
        },
        [isLoading, isError, serverInfo]
    )

    return (
        <>
            <NavCardCluster>{serverSelectContent("64bit")}</NavCardCluster>
            {hide32BitServers ? (
                <>
                    <Spacer size="20px" />
                    <FauxLink
                        onClick={() => setHide32BitServers(false)}
                        style={{
                            color: "var(--secondary-text)",
                        }}
                    >
                        Show 32-bit servers
                    </FauxLink>
                </>
            ) : (
                <>
                    <hr />
                    <NavCardCluster>
                        {serverSelectContent("32bit")}
                    </NavCardCluster>
                    <Spacer size="20px" />
                    <FauxLink
                        onClick={() => setHide32BitServers(true)}
                        style={{
                            color: "var(--secondary-text)",
                        }}
                    >
                        Hide 32-bit servers
                    </FauxLink>
                </>
            )}
        </>
    )
}

export default ServerSelectContent

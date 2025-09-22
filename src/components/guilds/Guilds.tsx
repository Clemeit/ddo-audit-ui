import React, { useEffect, useRef } from "react"
import Page from "../global/Page.tsx"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import { WIPPageMessage } from "../global/CommonMessages.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import Stack from "../global/Stack.tsx"
import {
    getGuilds as getGuildsApiCall,
    getGuildByName,
} from "../../services/guildService.ts"
import useDebounce from "../../hooks/useDebounce.ts"
import {
    GetGuildByServerAndNameData,
    GuildByNameData,
    GuildDataApiResponse,
} from "../../models/Guilds.ts"
import GuildSearchTable from "./GuildSearchTable.tsx"
import Badge from "../global/Badge.tsx"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable.tsx"
import ColoredText from "../global/ColoredText.tsx"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import {
    getCharactersByIds,
    getOnlineCharactersByGuildName,
} from "../../services/characterService.ts"
import Link from "../global/Link.tsx"
import PaginationSelector from "../global/PaginationSelector.tsx"
import { SERVER_NAMES } from "../../constants/servers.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import GuildExpandedContent from "./GuildExpandedContent.tsx"

const Guilds = () => {
    const isMobile = useIsMobile()
    const [guildName, setGuildName] = React.useState("")
    const [serverName, setServerName] = React.useState("")
    const [guildData, setGuildData] = React.useState<GuildDataApiResponse>()
    const [currentPage, setCurrentPage] = React.useState(1)
    const isLoading = useRef<boolean>(false)

    const lastFetchedGuildName = useRef<string>("")
    const lastFetchedServerName = useRef<string>("")

    const { verifiedCharacters, accessTokens } = useGetRegisteredCharacters()

    const {
        debouncedValue: debouncedGuildName,
        refreshDebounce: refreshGuildName,
    } = useDebounce(guildName, 1000)
    const {
        debouncedValue: debouncedServerName,
        refreshDebounce: refreshServerName,
    } = useDebounce(serverName, 1000)

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller

        // If filters changed and we're not already on page 1, reset to page 1 and skip fetching this render
        if (
            (debouncedGuildName !== lastFetchedGuildName.current ||
                debouncedServerName !== lastFetchedServerName.current) &&
            currentPage !== 1
        ) {
            setCurrentPage(1)
            return () => {
                controller.abort()
            }
        }

        const fetchGuilds = async () => {
            try {
                isLoading.current = true
                const response = await getGuildsApiCall(
                    debouncedGuildName,
                    debouncedServerName,
                    currentPage,
                    signal
                )
                setGuildData(response)
                lastFetchedGuildName.current = debouncedGuildName
                lastFetchedServerName.current = debouncedServerName
            } catch (error) {
                if (!signal.aborted) {
                    console.error("Error fetching guilds:", error)
                }
            } finally {
                isLoading.current = false
            }
        }

        fetchGuilds()
        return () => {
            controller.abort()
        }
    }, [debouncedGuildName, debouncedServerName, currentPage])

    const handleRenderExpandedContent = async (guildData: GuildByNameData) => {
        return <GuildExpandedContent guildData={guildData} />
    }

    return (
        <Page
            title="DDO Guilds"
            description="A page where you can search for DDO guilds, view their stats, and see members of your guild if you have a registered character."
            pageMessages={[<WIPPageMessage />]}
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="Guild Search"
                    subtitle="Search for guilds by name to view member count and recent activity."
                >
                    <Stack direction="column" gap="20px">
                        <Stack direction="row" gap="10px">
                            <Stack direction="column" gap="2px">
                                <label
                                    htmlFor="guild-name"
                                    className="label"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Guild Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="input"
                                    id="guild-name"
                                    value={guildName}
                                    onChange={(e) => {
                                        isLoading.current = true
                                        setGuildName(e.target.value)
                                    }}
                                    onBlur={refreshGuildName}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            refreshGuildName()
                                        }
                                    }}
                                />
                            </Stack>
                            <Stack direction="column" gap="2px">
                                <label
                                    htmlFor="server-name"
                                    className="label"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Server Name
                                </label>
                                <select
                                    className="input"
                                    id="server-name"
                                    value={serverName}
                                    onChange={(e) => {
                                        isLoading.current = true
                                        setServerName(e.target.value)
                                    }}
                                    onBlur={refreshServerName}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            refreshServerName()
                                        }
                                    }}
                                >
                                    <option value="">All Servers</option>
                                    {[...SERVER_NAMES]
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((server) => (
                                            <option key={server} value={server}>
                                                {server}
                                            </option>
                                        ))}
                                </select>
                            </Stack>
                        </Stack>
                        <GuildSearchTable
                            guilds={guildData?.data || []}
                            searchQuery={guildName}
                            isLoading={isLoading.current}
                            maxBodyHeight={"70vh"}
                            renderExpandedContent={handleRenderExpandedContent}
                        />
                        <PaginationSelector
                            totalPages={
                                guildData
                                    ? Math.ceil(
                                          guildData.total /
                                              guildData.page_length
                                      )
                                    : 1
                            }
                            currentPage={currentPage}
                            onChange={(page) => setCurrentPage(page)}
                            disabled={
                                isLoading.current ||
                                !guildData ||
                                guildData.total <= guildData.page_length
                            }
                        />
                        <div>
                            <InfoSVG
                                className="page-message-icon"
                                style={{ fill: `var(--info)` }}
                            />
                            <ColoredText color="secondary">
                                Numbers are estimates and may in some cases
                                include inactive characters that were kicked
                                from guilds. Anonymous players are always
                                hidden.
                            </ColoredText>
                        </div>
                    </Stack>
                </ContentCluster>
                <div
                    style={{
                        opacity: 0.5,
                        pointerEvents: "none",
                    }}
                >
                    <ContentCluster
                        title="Detailed Guild Information"
                        subtitle="Select one of your characters' guilds to view detailed information."
                        badge={<Badge type="soon" text="Soon" />}
                    >
                        <Stack direction="column" gap="20px" width="100%">
                            <Stack direction="column" gap="2px">
                                <label
                                    htmlFor="guild-select"
                                    className="label"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Your Guilds
                                </label>
                                <select
                                    id="guild-select"
                                    className="input"
                                    disabled
                                >
                                    <option value="">Select a guild...</option>
                                </select>
                            </Stack>
                            <div style={{ width: "100%" }}>
                                <CharacterTable
                                    characterRows={[]}
                                    isLoaded={true}
                                    noCharactersMessage="No guild selected"
                                />
                            </div>
                        </Stack>
                    </ContentCluster>
                </div>
            </ContentClusterGroup>
        </Page>
    )
}

export default Guilds

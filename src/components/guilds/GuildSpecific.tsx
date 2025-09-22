import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters"
import { getGuildByName } from "../../services/guildService"
import {
    CHARACTER_ENDPOINT,
    getCharactersByIds,
} from "../../services/characterService"
import Page from "../global/Page"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Stack from "../global/Stack"
import useIsMobile from "../../hooks/useIsMobile"
import usePollApi from "../../hooks/usePollApi"
import {
    Character,
    MultipleCharacterResponseModel,
} from "../../models/Character"
import { MsFromHours } from "../../utils/timeUtils"
import FauxLink from "../global/FauxLink"
import { GetGuildByServerAndNameData } from "../../models/Guilds"
import Link from "../global/Link.tsx"
import PageMessage from "../global/PageMessage.tsx"
import { SearchParamType } from "../../hooks/useSearchParamState.ts"
import { ReactComponent as OpenInNewTabIcon } from "../../assets/svg/open-in-new.svg"
import { ReactComponent as ChevronRight } from "../../assets/svg/chevron-right.svg"

const GuildSpecific = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const serverName = (location.pathname.split("/")[2] || "")?.toLowerCase()
    const guildName = decodeURIComponent(
        location.pathname.split("/")[3] || ""
    )?.toLowerCase()

    const [guildLookupError, setGuildLookupError] = useState<any>()
    const [guildInfo, setGuildInfo] = useState<GetGuildByServerAndNameData>()
    const [onlineRows, setOnlineRows] = useState<CharacterTableRow[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [offlineRows, setOfflineRows] = useState<CharacterTableRow[]>([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
    const [hasMoreOffline, setHasMoreOffline] = useState<boolean>(true)
    const abortRef = useRef<AbortController | null>(null)
    const isMobile = useIsMobile()
    const [canRefresh, setCanRefresh] = useState<boolean>(false)
    // Used to force a refetch of offline data without changing page
    const [offlineRefreshKey, setOfflineRefreshKey] = useState<number>(0)
    const firstLoad = useRef<boolean>(true)

    const {
        state,
        data: onlineCharacterData,
        error,
        reload,
    } = usePollApi<MultipleCharacterResponseModel>({
        endpoint: `${CHARACTER_ENDPOINT}/by-server-and-guild-name/${serverName}/${guildName}`,
        interval: 5000,
        lifespan: MsFromHours(1),
        stopOnError: false,
    })

    useEffect(() => {
        const previousOnlineCharacterIds = new Set(
            onlineRows.map((r) => r.character.id)
        )
        const currentOnlineCharacterIds = new Set(
            Object.values(onlineCharacterData?.data || {}).map(
                (char) => char.id
            )
        )
        setOnlineRows(
            Object.values(onlineCharacterData?.data || {})
                ?.filter(
                    (char) =>
                        guildInfo?.is_member === true ||
                        char.is_anonymous === false
                )
                .map((char) => ({
                    character: char,
                    actions: <ChevronRight />,
                }))
        )
        if (
            previousOnlineCharacterIds.size !==
                currentOnlineCharacterIds.size ||
            [...previousOnlineCharacterIds].some(
                (id) => !currentOnlineCharacterIds.has(id)
            )
        ) {
            if (!firstLoad.current) {
                setCanRefresh(true)
            }
        }
        if (!!guildInfo && onlineCharacterData && firstLoad.current) {
            firstLoad.current = false
        }
    }, [guildInfo, onlineCharacterData])

    useEffect(() => {
        setOfflineRows([])
        setOnlineRows([])
        setCurrentPage(1)
        setHasMoreOffline(true)
    }, [serverName, guildName])

    const {
        verifiedCharacters,
        accessTokens,
        isLoaded: areRegisteredCharactersLoaded,
    } = useGetRegisteredCharacters()

    const queryGuild = async (controller: AbortController) => {
        if (!areRegisteredCharactersLoaded) return
        setIsLoaded(false)
        try {
            // Determine access token for a verified character in this guild (if any)
            const characterId = verifiedCharacters.find(
                (character) =>
                    character?.guild_name?.toLowerCase() === guildName &&
                    character?.server_name?.toLowerCase() === serverName
            )?.id

            const accessToken = accessTokens.find(
                (token) => token.character_id === characterId
            )?.access_token

            const headers = accessToken ? { Authorization: accessToken } : {}

            if (!guildName) {
                // setOnlineRows([])
                setOfflineRows([])
                setIsLoaded(true)
                return
            }

            const response = await getGuildByName(serverName, guildName, {
                headers,
                params: { page: currentPage, page_size: 20 },
                signal: controller.signal,
            })
            const guildInfo = response.data
            setGuildInfo(guildInfo)

            const offlineCharacters =
                guildInfo?.member_ids && guildInfo?.member_ids.length > 0
                    ? await getCharactersByIds(guildInfo.member_ids, {
                          signal: controller.signal as any,
                      })
                    : (null as MultipleCharacterResponseModel)

            const offlineRows: CharacterTableRow[] = Object.values(
                offlineCharacters?.data || {}
            )
                .sort((a: Character, b: Character) => {
                    const dateA = a.last_save
                        ? new Date(a.last_save)
                        : new Date(0)
                    const dateB = b.last_save
                        ? new Date(b.last_save)
                        : new Date(0)
                    return dateB.getTime() - dateA.getTime()
                })
                .map((char: Character) => ({
                    character: char,
                    actions: null,
                }))

            setOfflineRows((prevRows) => {
                const existingIds = new Set(prevRows.map((r) => r.character.id))
                const merged = [...prevRows]
                for (const row of offlineRows) {
                    if (
                        !existingIds.has(row.character.id) &&
                        !row.character.is_online
                    ) {
                        merged.push(row)
                    }
                }
                return merged
            })
            if (offlineRows.length < 20) {
                setHasMoreOffline(false)
            }
        } catch (err: any) {
            if (!controller.signal.aborted) {
                console.error("Error fetching guild expanded content:", err)
                if (err) setGuildLookupError(err)
            }
        } finally {
            if (!controller.signal.aborted) setIsLoaded(true)
            setIsLoadingMore(false)
        }
    }

    useEffect(() => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        queryGuild(controller)

        return () => controller.abort()
    }, [
        guildName,
        serverName,
        verifiedCharacters,
        accessTokens,
        areRegisteredCharactersLoaded,
        currentPage,
        offlineRefreshKey,
    ])

    const offlineCount = Math.max(
        (guildInfo?.character_count || 0) - onlineRows.length,
        0
    )

    const onlineCharacterTableColumns: ColumnType[] = [
        ColumnType.STATUS,
        ColumnType.NAME,
        ColumnType.LEVEL,
        ColumnType.CLASSES,
        ColumnType.LOCATION,
    ].concat(isMobile ? [] : [ColumnType.ACTIONS])

    const offlineCharacterTableColumns: ColumnType[] = [
        ColumnType.STATUS,
        ColumnType.NAME,
        ColumnType.LEVEL,
        ColumnType.CLASSES,
        ColumnType.LAST_SEEN,
        ColumnType.LOCATION,
    ]

    const noOfflineCharacterMessage =
        offlineCount > 0 ? (
            <>
                Are you a member of this guild?{" "}
                <Link to="/registration">Register and verify</Link> your
                character to see offline members.
            </>
        ) : (
            <>No offline members</>
        )

    const handleOnReachBottom = () => {
        // Only paginate if we have more to load and not already loading
        const totalExpected = offlineCount
        const have = offlineRows.length
        // If we don't know total (offlineCount computed) or there are more rows, try next page
        if (!isLoadingMore && hasMoreOffline && have < totalExpected) {
            setIsLoadingMore(true)
            setCurrentPage((p) => p + 1)
        }
    }

    const offlineCharacterTableSortFunction = (
        a: CharacterTableRow,
        b: CharacterTableRow
    ) => {
        const dateA = a.character.last_save
            ? new Date(a.character.last_save)
            : new Date(0)
        const dateB = b.character.last_save
            ? new Date(b.character.last_save)
            : new Date(0)
        return dateB.getTime() - dateA.getTime()
    }

    // Reset offline member list and pagination, then refetch page 1
    const handleManualRefresh = () => {
        // Prevent race conditions with any in-flight request
        abortRef.current?.abort()

        // Reset offline data state
        setOfflineRows([])
        // If we're not on page 1, move to page 1 (effect will refetch)
        // If we are already on page 1, bump refresh key to trigger refetch
        setIsLoaded(false)
        if (currentPage !== 1) {
            setCurrentPage(1)
        } else {
            setOfflineRefreshKey((k) => k + 1)
        }
        setHasMoreOffline(true)
        // Block auto-pagination until first page finishes loading
        setIsLoadingMore(true)
        setCanRefresh(false)
    }

    return (
        <Page
            title="Guild Lookup"
            description="Look up DDO guild rosters and see who's online!"
            pageMessages={() => {
                const messages = []
                if (!!guildLookupError) {
                    messages.push(
                        <PageMessage
                            type="warning"
                            title="Guild not found"
                            message={`We couldn't find a guild named "${guildName}" on "${serverName}". Please check the guild name and server name and try again.`}
                        />
                    )
                }
                return messages
            }}
        >
            <ContentClusterGroup>
                <ContentCluster title="Members">
                    <Stack direction="column" gap="20px">
                        <Stack
                            direction="column"
                            gap="10px"
                            style={{ width: "100%" }}
                        >
                            <Stack gap="10px" align="center">
                                <strong>
                                    Online Members: {onlineRows.length}
                                </strong>
                                {onlineRows.length > 0 && (
                                    <Link
                                        to={`/who/${serverName}?${SearchParamType.INITIAL_SEARCH_QUERY}=${encodeURIComponent(guildName)}`}
                                        newTab
                                    >
                                        <Stack
                                            gap="2px"
                                            style={{
                                                color: "var(--link-blue)",
                                            }}
                                            align="center"
                                        >
                                            View in Who List{" "}
                                            <OpenInNewTabIcon
                                                style={{
                                                    fill: "var(--link-blue)",
                                                }}
                                            />
                                        </Stack>
                                    </Link>
                                )}
                            </Stack>
                            <CharacterTable
                                characterRows={onlineRows}
                                isLoaded={isLoaded}
                                noCharactersMessage="No online members"
                                visibleColumns={onlineCharacterTableColumns}
                                maxBodyHeight={"400px"}
                                showAnonymous={guildInfo?.is_member}
                                onRowClick={(character) =>
                                    navigate(
                                        `/who/${serverName}?${SearchParamType.INITIAL_SEARCH_QUERY}=${character.name}`
                                    )
                                }
                            />
                        </Stack>
                        <Stack
                            direction="column"
                            gap="10px"
                            style={{ width: "100%" }}
                        >
                            <Stack gap="10px">
                                <strong>Offline Members: {offlineCount}</strong>
                                {canRefresh && guildInfo?.is_member && (
                                    <FauxLink onClick={handleManualRefresh}>
                                        Refresh
                                    </FauxLink>
                                )}
                            </Stack>
                            <CharacterTable
                                characterRows={offlineRows}
                                isLoaded={isLoaded}
                                noCharactersMessage={noOfflineCharacterMessage}
                                visibleColumns={offlineCharacterTableColumns}
                                maxBodyHeight={"400px"}
                                onReachBottom={handleOnReachBottom}
                                bottomThreshold={120}
                                tableSortFunction={
                                    offlineCharacterTableSortFunction
                                }
                                showAnonymous={true}
                                defaultSortType={ColumnType.LAST_SEEN}
                                defaultSortAscending={false}
                            />
                        </Stack>
                    </Stack>
                </ContentCluster>
                {/* <ContentCluster
                    title="Recent Guild Runs"
                    subtitle="Recent content that this guild has run together."
                >
                    <span>
                        Are you a member of this guild?{" "}
                        <Link to="/registration">Register and verify</Link> your
                        character to see offline members.
                    </span>
                </ContentCluster>
                <ContentCluster
                    title="Activity Trends"
                    subtitle="What days and times this guild is the most active."
                >
                    <span>
                        Are you a member of this guild?{" "}
                        <Link to="/registration">Register and verify</Link> your
                        character to see offline members.
                    </span>
                </ContentCluster> */}
            </ContentClusterGroup>
        </Page>
    )
}

export default GuildSpecific

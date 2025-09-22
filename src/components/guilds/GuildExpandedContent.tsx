import React, { useEffect, useRef, useState } from "react"
import Stack from "../global/Stack.tsx"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable.tsx"
import Link from "../global/Link.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import { getGuildByName } from "../../services/guildService.ts"
import { getCharactersByIds } from "../../services/characterService.ts"
import { GuildByNameData } from "../../models/Guilds.ts"
import useIsMobile from "../../hooks/useIsMobile.ts"

type Props = {
    guildData: GuildByNameData
    verifiedCharacters?: any[]
    accessTokens?: any[]
    areRegisteredCharactersLoaded?: boolean
}

const GuildExpandedContent: React.FC<Props> = ({
    guildData,
    verifiedCharacters,
    accessTokens,
    areRegisteredCharactersLoaded,
}) => {
    const [onlineRows, setOnlineRows] = useState<CharacterTableRow[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [offlineRows, setOfflineRows] = useState<CharacterTableRow[]>([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
    const [hasMoreOffline, setHasMoreOffline] = useState<boolean>(true)
    const abortRef = useRef<AbortController | null>(null)
    const isMobile = useIsMobile()

    // Reset pagination and rows when guild identity changes
    useEffect(() => {
        setOfflineRows([])
        setOnlineRows([])
        setCurrentPage(1)
        setHasMoreOffline(true)
    }, [guildData.guild_name, guildData.server_name])

    // Fetch data when dependencies change or page increments
    useEffect(() => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const run = async () => {
            if (!areRegisteredCharactersLoaded) return
            setIsLoaded(false)
            try {
                // Determine access token for a verified character in this guild (if any)
                const characterId = verifiedCharacters.find(
                    (character) =>
                        character.guild_name === guildData.guild_name &&
                        character.server_name === guildData.server_name
                )?.id

                const accessToken = accessTokens.find(
                    (token) => token.character_id === characterId
                )?.access_token

                const headers = accessToken
                    ? { Authorization: accessToken }
                    : {}

                if (!guildData.guild_name) {
                    setOnlineRows([])
                    setOfflineRows([])
                    setIsLoaded(true)
                    return
                }

                const response = await getGuildByName(
                    guildData.server_name,
                    guildData.guild_name,
                    {
                        headers,
                        params: { page: currentPage },
                        signal: controller.signal,
                    }
                )
                const guildInfo = response.data

                // Online members
                const online: CharacterTableRow[] = Object.values(
                    guildInfo?.online_characters || {}
                )
                    .filter(
                        (char) => char.server_name === guildData.server_name
                    )
                    .map((char) => ({ character: char, actions: null }))

                // Only set online rows on first page to prevent overwriting during pagination
                if (currentPage === 1) setOnlineRows(online)

                // Offline members (only non-anonymous and offline)
                const offlineCharacters =
                    guildInfo?.member_ids && guildInfo?.member_ids.length > 0
                        ? await getCharactersByIds(guildInfo.member_ids, {
                              signal: controller.signal as AbortSignal,
                          })
                        : (null as any)

                const offline: CharacterTableRow[] = Object.values(
                    offlineCharacters?.data || {}
                )
                    .sort((a: any, b: any) => {
                        const dateA = a.last_save
                            ? new Date(a.last_save)
                            : new Date(0)
                        const dateB = b.last_save
                            ? new Date(b.last_save)
                            : new Date(0)
                        return dateB.getTime() - dateA.getTime()
                    })
                    .map((char: any) => ({ character: char, actions: null }))

                // Track whether any new rows were added this page
                let newRowsAdded = 0
                setOfflineRows((prevRows) => {
                    const existingIds = new Set(
                        prevRows.map((r) => r.character.id)
                    )
                    const merged = [...prevRows]
                    for (const row of offline) {
                        if (
                            !existingIds.has(row.character.id) &&
                            !row.character.is_online &&
                            !row.character.is_anonymous
                        ) {
                            merged.push(row)
                            newRowsAdded++
                        }
                    }
                    return merged
                })
                if (offline.length < 20) {
                    setHasMoreOffline(false)
                }
            } catch (err: any) {
                if (!controller.signal.aborted) {
                    console.error("Error fetching guild expanded content:", err)
                }
            } finally {
                if (!controller.signal.aborted) setIsLoaded(true)
                setIsLoadingMore(false)
            }
        }

        run()
        return () => controller.abort()
    }, [
        guildData.guild_name,
        guildData.server_name,
        verifiedCharacters,
        accessTokens,
        areRegisteredCharactersLoaded,
        currentPage,
    ])

    const offlineCount = Math.max(
        (guildData.character_count || 0) - onlineRows.length,
        0
    )

    return (
        <Stack direction="column" gap="20px" style={{ width: "100%" }}>
            <Stack direction="column" gap="10px" style={{ width: "100%" }}>
                <span>
                    <strong>Online Members: {onlineRows.length}</strong>
                </span>
                <CharacterTable
                    characterRows={onlineRows}
                    isLoaded={isLoaded}
                    noCharactersMessage="No online members"
                    visibleColumns={[
                        ColumnType.STATUS,
                        ColumnType.NAME,
                        ColumnType.LEVEL,
                        ColumnType.CLASSES,
                    ].concat(isMobile ? [] : [ColumnType.LOCATION])}
                    maxBodyHeight={"400px"}
                />
            </Stack>
            <Stack direction="column" gap="10px" style={{ width: "100%" }}>
                <span>
                    <strong>Offline Members: {offlineCount}</strong>
                </span>
                <CharacterTable
                    characterRows={offlineRows}
                    isLoaded={isLoaded}
                    noCharactersMessage={
                        offlineCount > 0 ? (
                            <>
                                Are you a member of this guild?{" "}
                                <Link to="/registration">
                                    Register and verify
                                </Link>{" "}
                                your character to see offline members.
                            </>
                        ) : (
                            <>No offline members</>
                        )
                    }
                    visibleColumns={[
                        ColumnType.STATUS,
                        ColumnType.NAME,
                        ColumnType.LEVEL,
                        ColumnType.CLASSES,
                        ColumnType.LAST_SEEN,
                    ].concat(isMobile ? [] : [ColumnType.LOCATION])}
                    maxBodyHeight={"400px"}
                    onReachBottom={() => {
                        // Only paginate if we have more to load and not already loading
                        const totalExpected = offlineCount
                        const have = offlineRows.length
                        // If we don't know total (offlineCount computed) or there are more rows, try next page
                        if (
                            !isLoadingMore &&
                            hasMoreOffline &&
                            have < totalExpected
                        ) {
                            setIsLoadingMore(true)
                            setCurrentPage((p) => p + 1)
                        }
                    }}
                    bottomThreshold={120}
                    tableSortFunction={(a, b) => {
                        const dateA = a.character.last_save
                            ? new Date(a.character.last_save)
                            : new Date(0)
                        const dateB = b.character.last_save
                            ? new Date(b.character.last_save)
                            : new Date(0)
                        return dateB.getTime() - dateA.getTime()
                    }}
                />
            </Stack>
        </Stack>
    )
}

export default GuildExpandedContent

import { useEffect, useMemo, useState } from "react"
import usePollApi from "../../hooks/usePollApi.ts"
import {
    Character,
    CharacterSpecificApiDataModel,
    CharacterSortType,
} from "../../models/Character.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import WhoCanvas from "./WhoCanvas.tsx"
import { LoadingState } from "../../models/Api.ts"
import {
    LiveDataHaultedPageMessage,
    ServerOfflineMessage,
    StaleDataPageMessage,
} from "../global/CommonMessages.tsx"
import WhoToolbar from "./WhoToolbar.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import useGetFriends from "../../hooks/useGetFriends.ts"
import useGetIgnores from "../../hooks/useGetIgnores.ts"
import logMessage from "../../utils/logUtils.ts"
import Stack from "../global/Stack.tsx"

// TODO: group_id should be null and never "0"

interface Props {
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
    initialSearchQuery?: string
}

const WhoContainer = ({
    serverName,
    isSecondaryPanel,
    handleClosePanel,
    initialSearchQuery,
}: Props) => {
    const {
        stringFilter,
        setStringFilter,
        sortBy,
        minLevel,
        maxLevel,
        classNameFilter,
        isGroupView,
        isExactMatch,
        hideIgnoredCharacters,
        pinGuildies,
        pinRegisteredCharacters,
        pinFriends,
        alwaysShowFriends,
        alwaysShowRegisteredCharacters,
        // refreshInterval, TODO: make this work
    } = useWhoContext()
    const { registeredCharacters, myGuildsList } = useGetRegisteredCharacters()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)
    const { friends } = useGetFriends()
    const { ignores } = useGetIgnores()
    const {
        data: characterData,
        state: characterState,
        reload: reloadCharacters,
    } = usePollApi<CharacterSpecificApiDataModel>({
        endpoint: `characters/${serverName}`,
        interval: 3000,
        lifespan: 1000 * 60 * 60 * 12, // 12 hours
    })
    const areaContext = useAreaContext()
    const { areas } = areaContext
    const { data: serverInfoData, state: serverInfoState } =
        usePollApi<ServerInfoApiDataModel>({
            endpoint: "game/server-info",
            interval: 10000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const [hadFirstLoad, setHadFirstLoad] = useState<boolean>(false)
    useEffect(() => {
        if (characterState === LoadingState.Loaded && !hadFirstLoad) {
            setHadFirstLoad(true)
        }
    }, [characterState])

    useEffect(() => {
        if (initialSearchQuery && initialSearchQuery.trim() !== "") {
            setStringFilter(initialSearchQuery)
        }
    }, [initialSearchQuery])

    const isServerOffline = useMemo<boolean>(
        () =>
            serverInfoState === LoadingState.Loaded &&
            !serverInfoData?.[serverName]?.is_online,
        [serverInfoData, serverName]
    )

    const isDataStale = useMemo<boolean>(
        () =>
            !!serverInfoData?.[serverName] &&
            !isServerOffline &&
            serverInfoState === LoadingState.Loaded &&
            serverInfoData?.[serverName]?.last_data_fetch &&
            Date.now() -
                new Date(serverInfoData[serverName].last_data_fetch).getTime() >
                5 * 60 * 1000,
        [serverInfoData, serverInfoState, isServerOffline]
    )

    const handleScreenshot = () => {
        const canvas = document.getElementById(
            "who-canvas"
        ) as HTMLCanvasElement
        if (!canvas) {
            console.error("Canvas with id 'who-canvas' not found.")
            return
        }
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Failed to create blob from canvas.")
                return
            }
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${serverName}-who-screenshot.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, "image/png")
    }

    // TODO: move this to a utility function
    function compareString(
        a: string | undefined,
        b: string | undefined,
        exactMatch: boolean
    ) {
        if (exactMatch) {
            return a === b
        } else {
            return (
                a
                    ?.toLowerCase()
                    .trim()
                    .includes(b?.toLowerCase().trim() ?? "") ?? false
            )
        }
    }

    // Filter and sort
    const curatedCharacters = useMemo<{
        characters: Character[]
    }>(() => {
        const characters = Object.values(characterData?.data ?? {})

        const hydratedCharacters: Character[] = characters.map((character) => {
            const isFriend = friends.some(
                (friend) => friend.id === character.id
            )
            const isIgnored = ignores.some(
                (ignore) => ignore.id === character.id
            )
            const isRegistered = registeredCharacters.some(
                (registered) => registered.id === character.id
            )
            const isGuildie = character.guild_name
                ? myGuildsList.some((guild) => guild === character.guild_name)
                : false
            return {
                ...character,
                metadata: {
                    isFriend,
                    isRegistered,
                    isIgnored,
                    isGuildie,
                },
            }
        })

        let filteredCharacters = hydratedCharacters.filter((character) => {
            if (hideIgnoredCharacters && character.metadata?.isIgnored) {
                return false
            }
            if (alwaysShowFriends && character.metadata?.isFriend) {
                return true
            }
            if (
                alwaysShowRegisteredCharacters &&
                character.metadata?.isRegistered
            ) {
                return true
            }

            let stringFilterMatch = false
            // only match on characters that are not anonymous
            if (!character.is_anonymous) {
                const stringFilters = stringFilter.split(",")
                stringFilters.forEach((localFilter) => {
                    const nameMatch = compareString(
                        character.name,
                        localFilter,
                        isExactMatch
                    )
                    const guildNameMatch = compareString(
                        character.guild_name,
                        localFilter,
                        isExactMatch
                    )
                    const locationMatch = compareString(
                        areas[character.location_id || 0]?.name,
                        localFilter,
                        isExactMatch
                    )
                    const unknownLocationMatch =
                        localFilter === "aether" &&
                        areas[character.location_id || 0] === undefined

                    const localMatch =
                        nameMatch ||
                        guildNameMatch ||
                        locationMatch ||
                        unknownLocationMatch
                    stringFilterMatch = stringFilterMatch || localMatch
                })
            }

            const levelRangeMatch =
                character.total_level! >= minLevel &&
                character.total_level! <= maxLevel

            const classMatch = character.classes?.some((classData) =>
                classNameFilter.includes(classData.name.toLowerCase())
            )

            const isAnonymous = character.is_anonymous

            const groupMatch = isGroupView
                ? character.is_in_party &&
                  character.group_id !== 0 &&
                  character.group_id !== undefined
                : true

            return (
                stringFilterMatch &&
                levelRangeMatch &&
                classMatch &&
                groupMatch &&
                (!isAnonymous || isGroupView)
            )
        })

        // If group view, add all characters that are in a party with any
        // character from filteredCharacters
        if (isGroupView) {
            const groupIds = new Set<number>(
                filteredCharacters
                    .filter((c) => c.is_in_party)
                    .map((c) => c.group_id ?? 0)
            )
            const groupedCharacters = [
                ...Object.values(characterData?.data ?? {})
                    .filter((c) => groupIds.has(c.group_id ?? 0))
                    .filter((c) => {
                        // only characters where there are two or more characters with the same group_id and at least one is not anonymous
                        const groupCount = Object.values(
                            characterData?.data ?? {}
                        ).filter(
                            (c2) =>
                                c2.group_id === c.group_id && !c2.is_anonymous
                        ).length
                        // only characters where at least one character in the group is not anonymous
                        return groupCount > 1
                    }),
            ]

            filteredCharacters = [...groupedCharacters]
        }

        let sortedCharacters: Character[] = []

        if (isGroupView) {
            sortedCharacters = filteredCharacters
                .sort((a, b) => a.id - b.id)
                .sort(
                    (a, b) =>
                        (a.is_anonymous ? 1 : 0) - (b.is_anonymous ? 1 : 0)
                )
                .sort((a, b) => (a.group_id || 0) - (b.group_id || 0))
        } else {
            sortedCharacters = filteredCharacters
                .sort((a, b) => a.id - b.id)
                .sort((a, b) => {
                    if (pinRegisteredCharacters) {
                        if (a.metadata?.isRegistered) {
                            return -1
                        } else if (b.metadata?.isRegistered) {
                            return 1
                        }
                    }
                    if (pinGuildies) {
                        if (a.metadata?.isGuildie) {
                            return -1
                        } else if (b.metadata?.isGuildie) {
                            return 1
                        }
                    }
                    if (pinFriends) {
                        if (a.metadata?.isFriend) {
                            return -1
                        } else if (b.metadata?.isFriend) {
                            return 1
                        }
                    }
                    switch (sortBy.type) {
                        case CharacterSortType.Lfm:
                            return (
                                ((b.is_in_party ? 1 : 0) -
                                    (a.is_in_party ? 1 : 0)) *
                                (sortBy.ascending ? 1 : -1)
                            )
                        case CharacterSortType.Name:
                            return (
                                (a.name ?? "").localeCompare(b.name ?? "") *
                                (sortBy.ascending ? 1 : -1)
                            )
                        case CharacterSortType.Level:
                            return (
                                ((a.total_level ?? 0) - (b.total_level ?? 0)) *
                                (sortBy.ascending ? 1 : -1)
                            )
                        case CharacterSortType.Guild:
                            return (
                                (a.guild_name ?? "").localeCompare(
                                    b.guild_name ?? ""
                                ) * (sortBy.ascending ? 1 : -1)
                            )
                        case CharacterSortType.Class:
                            const aClassString = a.classes
                                .map((classData) => classData.name)
                                .join("")
                            const bClassString = b.classes
                                .map((classData) => classData.name)
                                .join("")
                            return (
                                aClassString.localeCompare(bClassString) *
                                (sortBy.ascending ? 1 : -1)
                            )
                        default:
                            return 0
                    }
                })
        }

        return {
            characters: sortedCharacters,
        }
    }, [
        stringFilter,
        characterData,
        minLevel,
        maxLevel,
        sortBy,
        isGroupView,
        classNameFilter,
        isExactMatch,
        hideIgnoredCharacters,
        pinGuildies,
        pinRegisteredCharacters,
        pinFriends,
        alwaysShowFriends,
        alwaysShowRegisteredCharacters,
        areas,
        myGuildsList,
        registeredCharacters,
        friends,
        ignores,
    ])

    return (
        <Stack direction="column">
            {characterState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {isDataStale && <StaleDataPageMessage />}
            {!isServerOffline || ignoreServerDown ? (
                <Stack direction="column">
                    <WhoToolbar
                        serverName={serverName}
                        reloadCharacters={reloadCharacters}
                        isSecondaryPanel={isSecondaryPanel}
                        handleClosePanel={handleClosePanel}
                        handleScreenshot={handleScreenshot}
                    />
                    <WhoCanvas
                        allCharacters={Object.values(characterData?.data ?? {})}
                        curatedCharacters={curatedCharacters.characters}
                        isLoading={
                            characterState !== LoadingState.Loaded &&
                            !hadFirstLoad
                        }
                    />
                </Stack>
            ) : (
                <ServerOfflineMessage
                    handleDismiss={() => {
                        setIgnoreServerDown(true)
                    }}
                    handleReportBug={() => {
                        logMessage(
                            "User reported server offline bug",
                            "error",
                            {
                                metadata: {
                                    serverInfoData,
                                },
                            }
                        )
                    }}
                />
            )}
        </Stack>
    )
}

export default WhoContainer

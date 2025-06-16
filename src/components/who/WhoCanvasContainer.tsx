import React, { useMemo, useState } from "react"
import usePollApi from "../../hooks/usePollApi.ts"
import {
    Character,
    CharacterApiServerModel,
    CharacterSortType,
} from "../../models/Character.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import WhoCanvas from "./WhoCanvas.tsx"
import { LoadingState } from "../../models/Api.ts"
import {
    LiveDataHaultedPageMessage,
    ServerOfflineMessage,
} from "../global/CommonMessages.tsx"
import WhoToolbar from "./WhoToolbar.tsx"
import { MAXIMUM_CHARACTER_COUNT } from "../../constants/whoPanel.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

// TODO: group_id should be null and never "0"

interface Props {
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
}

const WhoContainer = ({
    serverName,
    isSecondaryPanel,
    handleClosePanel,
}: Props) => {
    const {
        stringFilter,
        sortBy,
        minLevel,
        maxLevel,
        classNameFilter,
        isGroupView,
        isExactMatch,
        // refreshInterval, TODO: make this work
    } = useWhoContext()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)

    const {
        data: characterData,
        state: characterState,
        reload: reloadCharacters,
    } = usePollApi<CharacterApiServerModel>({
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

    const isServerOffline = useMemo<boolean>(
        () =>
            serverInfoState === LoadingState.Loaded &&
            !serverInfoData?.[serverName]?.is_online,
        [serverInfoData, serverName]
    )

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
        areResultsTruncated: boolean
    }>(() => {
        let filteredCharacters = Object.values(
            characterData?.characters ?? {}
        ).filter((character) => {
            let stringFilterMatch = false
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

                const localMatch = nameMatch || guildNameMatch || locationMatch
                stringFilterMatch = stringFilterMatch || localMatch
            })

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
                ...Object.values(characterData?.characters ?? {})
                    .filter((c) => groupIds.has(c.group_id ?? 0))
                    .filter((c) => {
                        // only characters where there are two or more characters with the same group_id
                        const groupCount = Object.values(
                            characterData?.characters ?? {}
                        ).filter((c2) => c2.group_id === c.group_id).length
                        return groupCount > 1
                    }),
            ]

            filteredCharacters = [...groupedCharacters]
        }

        let sortedCharacters: Character[] = []

        if (isGroupView) {
            sortedCharacters = filteredCharacters
                .sort((a, b) => (a.id = b.id))
                .sort(
                    (a, b) =>
                        (a.is_anonymous ? 1 : 0) - (b.is_anonymous ? 1 : 0)
                )
                .sort((a, b) =>
                    ((a.group_id || 0) - (b.group_id || 0))
                )
        } else {
            sortedCharacters = filteredCharacters
                .sort((a, b) => (a.id - b.id))
                .sort((a, b) => {
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
                        default:
                            return 0
                    }
                })
        }

        const areResultsTruncated =
            sortedCharacters.length > MAXIMUM_CHARACTER_COUNT

        return {
            characters: sortedCharacters.slice(0, MAXIMUM_CHARACTER_COUNT),
            areResultsTruncated,
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
    ])

    return (
        <>
            {characterState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {!isServerOffline || ignoreServerDown ? (
                <>
                    <WhoToolbar
                        serverName={serverName}
                        reloadCharacters={reloadCharacters}
                        isSecondaryPanel={isSecondaryPanel}
                        handleClosePanel={handleClosePanel}
                    />
                    <WhoCanvas
                        allCharacters={Object.values(
                            characterData?.characters ?? {}
                        )}
                        curatedCharacters={curatedCharacters.characters}
                        areResultsTruncated={
                            curatedCharacters.areResultsTruncated
                        }
                        serverName={serverName}
                    />
                </>
            ) : (
                <ServerOfflineMessage
                    handleDismiss={() => {
                        setIgnoreServerDown(true)
                    }}
                />
            )}
        </>
    )
}

export default WhoContainer

import React, { useEffect, useMemo, useState } from "react"
import usePollApi from "../../hooks/usePollApi.ts"
import { Character, CharacterApiServerModel } from "../../models/Character.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import WhoCanvas from "./WhoCanvas.tsx"
import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import { Link } from "react-router-dom"
import { LoadingState } from "../../models/Api.ts"
import { LiveDataHaultedPageMessage } from "../global/CommonMessages.tsx"

interface Props {
    serverName: string
    refreshInterval?: number
}

const WhoContainer = ({ serverName, refreshInterval = 3000 }: Props) => {
    const {
        stringFilter,
        setStringFilter,
        sortBy,
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
    } = useWhoContext()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)

    const { data: characterData, state: characterState } =
        usePollApi<CharacterApiServerModel>({
            endpoint: `characters/${serverName}`,
            interval: refreshInterval,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const { data: serverInfoData, state: serverInfoState } =
        usePollApi<ServerInfoApiDataModel>({
            endpoint: "game/server-info",
            interval: 10000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })

    const isServerOnline = useMemo<boolean>(
        () =>
            serverInfoState !== LoadingState.Error &&
            serverInfoData?.[serverName]?.is_online,
        [serverInfoData, serverName]
    ) // TODO: this value needs to be debounced

    // Filter and sort
    const curatedCharacters = useMemo<Character[]>(() => {
        const filteredCharacters = Object.values(
            characterData?.characters ?? {}
        ).filter((character) => {
            let globalMatch = false
            const stringFilters = stringFilter.split(",")
            stringFilters.forEach((localFilter) => {
                const nameMatch = (character.name ?? "")
                    .toLowerCase()
                    .trim()
                    .includes(localFilter.toLowerCase().trim())
                const guildNameMatch = (character.guild_name ?? "")
                    .toLowerCase()
                    .trim()
                    .includes(localFilter.toLowerCase().trim())
                const levelRangeMatch =
                    character.total_level! >= minLevel &&
                    character.total_level! <= maxLevel

                const isAnonymous = character.is_anonymous

                const localMatch =
                    (nameMatch || guildNameMatch) &&
                    levelRangeMatch &&
                    !isAnonymous
                globalMatch = globalMatch || localMatch
            })
            return globalMatch
        })

        const sortedCharacters = filteredCharacters
            .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
            .sort((a, b) => {
                switch (sortBy.type) {
                    case "name":
                        return (a.name ?? "").localeCompare(b.name ?? "")
                    case "level":
                        return (a.total_level ?? 0) - (b.total_level ?? 0)
                    case "guild":
                        return (a.guild_name ?? "").localeCompare(
                            b.guild_name ?? ""
                        )
                    default:
                        return 0
                }
            })

        return sortedCharacters
    }, [stringFilter, characterData, minLevel, maxLevel, sortBy])

    return (
        <div>
            {characterState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {isServerOnline || ignoreServerDown ? (
                <WhoCanvas
                    characters={curatedCharacters}
                    serverName={serverName}
                />
            ) : (
                <>
                    <h3 style={{ marginTop: "0px" }}>Server Offline</h3>
                    <p>
                        This server appears to be offline. Check the{" "}
                        <Link className="link" to="/live">
                            Live
                        </Link>{" "}
                        page for status.
                    </p>
                    <p>If you think this is an error,</p>
                    <Stack gap="10px">
                        <Button
                            onClick={() => {
                                setIgnoreServerDown(true)
                            }}
                        >
                            Load data anyway
                        </Button>
                        <Button type="secondary" onClick={() => {}}>
                            Report bug
                        </Button>
                    </Stack>
                </>
            )}
        </div>
    )
}

export default WhoContainer

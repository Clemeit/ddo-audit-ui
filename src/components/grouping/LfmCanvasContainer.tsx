import { useEffect, useMemo, useState } from "react"
import LfmCanvas from "./LfmCanvas.tsx"
import { Lfm, LfmSpecificApiModel } from "../../models/Lfm.ts"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import LfmToolbar from "./LfmToolbar.tsx"
import usePollApi from "../../hooks/usePollApi.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { LoadingState } from "../../models/Api.ts"
import {
    LiveDataHaultedPageMessage,
    ServerOfflineMessage,
    StaleDataPageMessage,
} from "../global/CommonMessages.tsx"
import { getCharacterRaidActivityByIds } from "../../services/activityService.ts"
import { ActivityEvent } from "../../models/Activity.ts"
import useGetFriends from "../../hooks/useGetFriends.ts"
import useGetIgnores from "../../hooks/useGetIgnores.ts"

interface Props {
    serverName: string
    refreshInterval?: number
    raidView?: boolean
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
}

const GroupingContainer = ({
    serverName,
    refreshInterval = 3000,
    raidView = false,
    isSecondaryPanel = false,
    handleClosePanel,
}: Props) => {
    const {
        sortBy,
        minLevel,
        maxLevel,
        showNotEligible,
        filterByMyCharacters,
        registeredCharacters,
        trackedCharacterIds,
        hideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
    } = useLfmContext()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)
    const { friends } = useGetFriends()
    const { ignores } = useGetIgnores()

    const {
        data: lfmData,
        state: lfmState,
        reload: reloadLfms,
    } = usePollApi<LfmSpecificApiModel>({
        endpoint: `lfms/${serverName}`,
        interval: refreshInterval,
        lifespan: 1000 * 60 * 60 * 12, // 12 hours
    })
    const {
        data: serverInfoData,
        state: serverInfoState,
        reload: reloadServerInfo,
    } = usePollApi<ServerInfoApiDataModel>({
        endpoint: "game/server-info",
        interval: 10000,
        lifespan: 1000 * 60 * 60 * 12, // 12 hours
    })
    const [raidActivity, setRaidActivity] = useState<ActivityEvent[]>([])

    useEffect(() => {
        // Only look up characters that are:
        // 1. Being tracked
        // 2. Are on this server
        const trackedCharactersOnThisServer = registeredCharacters.filter(
            (character) =>
                character.server_name.toLowerCase() ===
                    serverName.toLowerCase() &&
                trackedCharacterIds.includes(character.id)
        )
        if (
            trackedCharactersOnThisServer &&
            trackedCharactersOnThisServer.length
        ) {
            getCharacterRaidActivityByIds(
                trackedCharactersOnThisServer.map((character) => character.id)
            )
                .then((activities) => {
                    setRaidActivity(activities.data.data)
                })
                .catch(() => {})
        }
    }, [trackedCharacterIds])

    var handleScreenshot = function () {
        const canvas = document.getElementById(
            "lfm-canvas"
        ) as HTMLCanvasElement
        if (!canvas) {
            console.error("Canvas with id 'lfm-canvas' not found.")
            return
        }
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${serverName}-lfm-screenshot.png`
        document.body.appendChild(link)
        link.click()
    }

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
            Date.now() -
                new Date(
                    serverInfoData?.[serverName].last_data_fetch
                ).getTime() >
                5 * 60 * 1000,
        [serverInfoData, serverInfoState, refreshInterval]
    )

    // filter and sort the lfms
    const filteredLfms = useMemo(() => {
        if (!lfmData?.data)
            return {
                filteredAndSortedLfms: [],
                excludedLfmCount: 0,
            }

        const lfms = Object.values(lfmData?.data || {})

        // handle ignored characters
        const lfmsWithIgnoresFiltered = lfms.filter((lfm) => {
            if (hideGroupsPostedByIgnoredCharacters) {
                const isLeaderIgnored = ignores.some(
                    (ignore) => ignore.id === lfm.leader.id
                )
                if (isLeaderIgnored) return false
            }
            if (hideGroupsContainingIgnoredCharacters) {
                const hasIgnoredMember = lfm.members.some((member) =>
                    ignores.some((ignore) => ignore.id === member.id)
                )
                if (hasIgnoredMember) return false
            }
            return true
        })

        // determine eligibility
        const determinedLfms = lfmsWithIgnoresFiltered.map((lfm) => {
            let isEligible = true

            // level check
            if (!filterByMyCharacters) {
                if (minLevel && minLevel > lfm.maximum_level) {
                    isEligible = false
                }
                if (maxLevel && maxLevel < lfm.minimum_level) {
                    isEligible = false
                }
            } else {
                const eligibleCharacters = registeredCharacters?.filter(
                    (character) => {
                        return (
                            character.server_name?.toLowerCase() ===
                                serverName.toLowerCase() &&
                            (character.total_level ?? 0) >= lfm.minimum_level &&
                            (character.total_level ?? 0) <= lfm.maximum_level &&
                            trackedCharacterIds.includes(character.id) &&
                            (lfm.accepted_classes.length === 0 ||
                                lfm.accepted_classes.some((acceptedClass) =>
                                    character.classes?.some(
                                        (characterClass) =>
                                            characterClass.name ===
                                            acceptedClass
                                    )
                                ))
                        )
                    }
                )
                isEligible = eligibleCharacters.length > 0
                if (eligibleCharacters.length > 0) {
                    lfm.metadata = {
                        ...lfm.metadata,
                        eligibleCharacters: eligibleCharacters,
                    }
                }
            }

            const newLfm: Lfm = {
                ...lfm,
                metadata: { ...lfm.metadata, isEligible: isEligible },
            }
            return newLfm
        })

        // sort
        const filteredAndSortedLfms = determinedLfms
            .filter((lfm) => showNotEligible || lfm.metadata?.isEligible)
            .sort((a, b) => {
                // this sort should take care of the case where the next sort
                // operataion has ties
                return a.id - b.id
            })
            .sort((a, b) => {
                // might use some other method instead of average, but this'll do for now
                const averageLevelA = (a.minimum_level + a.maximum_level) / 2
                const averageLevelB = (b.minimum_level + b.maximum_level) / 2
                if (sortBy.type === "leader") {
                    return sortBy.ascending
                        ? (a.leader.name || "").localeCompare(
                              b.leader.name || ""
                          )
                        : (b.leader.name || "").localeCompare(
                              a.leader.name || ""
                          )
                } else if (sortBy.type === "quest") {
                    return sortBy.ascending
                        ? (a.quest?.name || "").localeCompare(
                              b.quest?.name || ""
                          )
                        : (b.quest?.name || "").localeCompare(
                              a.quest?.name || ""
                          )
                } else if (sortBy.type === "classes") {
                    return sortBy.ascending
                        ? (a.accepted_classes || []).length -
                              (b.accepted_classes || []).length
                        : (b.accepted_classes || []).length -
                              (a.accepted_classes || []).length
                } else {
                    // default to level
                    return sortBy.ascending
                        ? averageLevelA - averageLevelB
                        : averageLevelB - averageLevelA
                }
            })

        const hydratedLfms = filteredAndSortedLfms.map((lfm) => {
            // Hydrate with any activity relevant to this LFM
            const raidActivityForLfm = raidActivity.filter(
                (activity) => activity.data === lfm.quest_id
            )
            const isPostedByFriend = friends.some(
                (friend) => friend.id === lfm.leader.id
            )
            const includesFriend =
                isPostedByFriend ||
                lfm.members.some((member) =>
                    friends.some((friend) => friend.id === member.id)
                )

            lfm.metadata = {
                ...lfm.metadata,
                raidActivity: raidActivityForLfm,
                isPostedByFriend,
                includesFriend,
            }

            return lfm
        })

        return {
            hydratedLfms,
            excludedLfmCount:
                lfmsWithIgnoresFiltered.length - hydratedLfms.length,
        }
    }, [
        lfmData,
        sortBy,
        minLevel,
        showNotEligible,
        maxLevel,
        serverName,
        filterByMyCharacters,
        registeredCharacters,
        trackedCharacterIds,
        raidActivity,
        friends,
        ignores,
    ])

    return (
        <>
            {lfmState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            {isDataStale && <StaleDataPageMessage />}
            {isServerOffline && !ignoreServerDown ? (
                <ServerOfflineMessage
                    handleDismiss={() => {
                        setIgnoreServerDown(true)
                    }}
                />
            ) : (
                <>
                    <LfmToolbar
                        serverName={serverName}
                        reloadLfms={() => {
                            reloadLfms()
                            reloadServerInfo()
                        }}
                        isSecondaryPanel={isSecondaryPanel}
                        handleClosePanel={handleClosePanel}
                        handleScreenshot={handleScreenshot}
                    />
                    <LfmCanvas
                        serverName={serverName}
                        lfms={filteredLfms.hydratedLfms || []}
                        excludedLfmCount={filteredLfms.excludedLfmCount}
                        raidView={raidView}
                    />
                </>
            )}
        </>
    )
}

export default GroupingContainer

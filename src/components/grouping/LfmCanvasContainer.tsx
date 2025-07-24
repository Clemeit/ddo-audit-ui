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
import { RaidActivityEvent } from "../../models/Activity.ts"
import useGetFriends from "../../hooks/useGetFriends.ts"
import useGetIgnores from "../../hooks/useGetIgnores.ts"
import logMessage from "../../utils/logUtils.ts"
import { useQuestContext } from "../../contexts/QuestContext.tsx"

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
    const { quests } = useQuestContext()

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
    const [hadFirstLoad, setHadFirstLoad] = useState<boolean>(false)
    useEffect(() => {
        if (lfmState === LoadingState.Loaded && !hadFirstLoad) {
            setHadFirstLoad(true)
        }
    }, [lfmState])
    const [raidActivity, setRaidActivity] = useState<RaidActivityEvent[]>([])

    useEffect(() => {
        // Only look up characters that are:
        // 1. Being tracked
        // 2. Are on this server
        ;(async () => {
            if (!registeredCharacters || !Array.isArray(registeredCharacters)) {
                return
            }

            const trackedCharactersOnThisServer = registeredCharacters.filter(
                (character) =>
                    character?.server_name?.toLowerCase() ===
                        serverName?.toLowerCase() &&
                    trackedCharacterIds?.includes(character?.id)
            )
            if (
                trackedCharactersOnThisServer &&
                Array.isArray(trackedCharactersOnThisServer) &&
                trackedCharactersOnThisServer.length > 0
            ) {
                try {
                    const raidActivity = await getCharacterRaidActivityByIds(
                        trackedCharactersOnThisServer
                            .map((character) => character?.id)
                            .filter((id) => id != null)
                    )
                    if (
                        raidActivity?.data &&
                        Array.isArray(raidActivity.data)
                    ) {
                        setRaidActivity(raidActivity.data)
                    }
                } catch (error) {
                    logMessage("Error fetching raid activity:", "error", {
                        metadata: {
                            error:
                                error instanceof Error ? error.message : error,
                            trackedCharacterIds,
                            serverName,
                        },
                    })
                }
            }
        })()
    }, [trackedCharacterIds, registeredCharacters, serverName])

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
        [serverInfoData, serverName, serverInfoState]
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
        [serverInfoData, serverInfoState, refreshInterval, isServerOffline]
    )

    // filter and sort the lfms
    const filteredLfms = useMemo(() => {
        if (!lfmData?.data)
            return {
                hydratedLfms: [],
                excludedLfmCount: 0,
            }

        const lfms = Object.values(lfmData.data || {}).filter(
            (lfm) => lfm != null
        )

        // handle ignored characters
        const lfmsWithIgnoresFiltered = lfms.filter((lfm) => {
            if (!lfm) return false

            if (hideGroupsPostedByIgnoredCharacters) {
                const isLeaderIgnored = ignores?.some(
                    (ignore) => ignore?.id === lfm?.leader?.id
                )
                if (isLeaderIgnored) return false
            }
            if (hideGroupsContainingIgnoredCharacters) {
                const hasIgnoredMember = lfm?.members?.some((member) =>
                    ignores?.some((ignore) => ignore?.id === member?.id)
                )
                if (hasIgnoredMember) return false
            }
            return true
        })

        // determine eligibility
        const determinedLfms = lfmsWithIgnoresFiltered
            .map((lfm) => {
                if (!lfm) return null

                let isEligible = true

                // level check
                if (!filterByMyCharacters) {
                    if (minLevel && minLevel > (lfm.maximum_level ?? 0)) {
                        isEligible = false
                    }
                    if (maxLevel && maxLevel < (lfm.minimum_level ?? 0)) {
                        isEligible = false
                    }
                } else {
                    const eligibleCharacters =
                        registeredCharacters?.filter((character) => {
                            if (!character) return false

                            return (
                                character.server_name?.toLowerCase() ===
                                    serverName?.toLowerCase() &&
                                (character.total_level ?? 0) >=
                                    (lfm.minimum_level ?? 0) &&
                                (character.total_level ?? 0) <=
                                    (lfm.maximum_level ?? 999) &&
                                trackedCharacterIds?.includes(character.id) &&
                                (lfm.accepted_classes?.length === 0 ||
                                    lfm.accepted_classes?.some(
                                        (acceptedClass) =>
                                            character.classes?.some(
                                                (characterClass) =>
                                                    characterClass?.name ===
                                                    acceptedClass
                                            )
                                    ))
                            )
                        }) || []
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
            .filter((lfm): lfm is Lfm => lfm !== null)

        // sort
        const filteredAndSortedLfms = determinedLfms
            .filter((lfm) => showNotEligible || lfm?.metadata?.isEligible)
            .sort((a, b) => {
                // this sort should take care of the case where the next sort
                // operataion has ties
                return (a?.id ?? 0) - (b?.id ?? 0)
            })
            .sort((a, b) => {
                // might use some other method instead of average, but this'll do for now
                const averageLevelA =
                    ((a?.minimum_level ?? 0) + (a?.maximum_level ?? 0)) / 2
                const averageLevelB =
                    ((b?.minimum_level ?? 0) + (b?.maximum_level ?? 0)) / 2
                if (sortBy?.type === "leader") {
                    return sortBy?.ascending
                        ? (a?.leader?.name || "").localeCompare(
                              b?.leader?.name || ""
                          )
                        : (b?.leader?.name || "").localeCompare(
                              a?.leader?.name || ""
                          )
                } else if (sortBy?.type === "quest") {
                    const questAName =
                        Object.values(quests || {}).find(
                            (quest) => quest?.id === a?.quest_id
                        )?.name || ""
                    const questBName =
                        Object.values(quests || {}).find(
                            (quest) => quest?.id === b?.quest_id
                        )?.name || ""
                    return sortBy?.ascending
                        ? questAName.localeCompare(questBName)
                        : questBName.localeCompare(questAName)
                } else if (sortBy?.type === "classes") {
                    return sortBy?.ascending
                        ? (a?.accepted_classes?.length ?? 0) -
                              (b?.accepted_classes?.length ?? 0)
                        : (b?.accepted_classes?.length ?? 0) -
                              (a?.accepted_classes?.length ?? 0)
                } else {
                    // default to level
                    return sortBy?.ascending
                        ? averageLevelA - averageLevelB
                        : averageLevelB - averageLevelA
                }
            })

        const hydratedLfms = filteredAndSortedLfms.map((lfm) => {
            if (!lfm) return lfm

            // Hydrate with any activity relevant to this LFM
            const raidActivityForLfm =
                raidActivity?.filter(
                    (activity) =>
                        activity?.data?.quest_ids?.includes(lfm?.quest_id) ||
                        false
                ) || []
            const isPostedByFriend =
                friends?.some((friend) => friend?.id === lfm?.leader?.id) ||
                false
            const includesFriend =
                isPostedByFriend ||
                lfm?.members?.some((member) =>
                    friends?.some((friend) => friend?.id === member?.id)
                ) ||
                false

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
                (lfmsWithIgnoresFiltered?.length ?? 0) -
                (hydratedLfms?.length ?? 0),
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
        quests,
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
                        isLoading={
                            lfmState !== LoadingState.Loaded && !hadFirstLoad
                        }
                    />
                </>
            )}
        </>
    )
}

export default GroupingContainer

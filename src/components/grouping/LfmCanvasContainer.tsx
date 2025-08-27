import { useEffect, useMemo, useState } from "react"
import LfmCanvas from "./LfmCanvas.tsx"
import {
    constructUnknownQuest,
    Lfm,
    LfmSortType,
    LfmSpecificApiModel,
    Quest,
} from "../../models/Lfm.ts"
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
import { ActivityEvent, RaidActivityEvent } from "../../models/Activity.ts"
import useGetFriends from "../../hooks/useGetFriends.ts"
import useGetIgnores from "../../hooks/useGetIgnores.ts"
import logMessage from "../../utils/logUtils.ts"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import Stack from "../global/Stack.tsx"
import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"

interface Props {
    serverName: string
    refreshInterval?: number
    raidView?: boolean
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
}

interface ProcessedLfms {
    lfms: Lfm[]
    excludedLfmCount: number
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
        minLevel: minLevelFilter,
        maxLevel: maxLevelFilter,
        showNotEligible,
        filterByMyCharacters,
        registeredCharacters,
        trackedCharacterIds,
        hideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
        hideAllLevelGroups,
        onlyShowRaids,
    } = useLfmContext()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)
    const { friends: friendCharacters } = useGetFriends()
    const { ignores: ignoredCharacters } = useGetIgnores()
    const { quests } = useQuestContext()

    const getQuestById = (id: number): Quest => {
        if (id == undefined) return null
        return quests[id]
    }

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

    const handleScreenshot = () => {
        const canvas = document.getElementById(
            "lfm-canvas"
        ) as HTMLCanvasElement
        if (!canvas) {
            console.error("Canvas with id 'lfm-canvas' not found.")
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
            link.download = `${serverName}-lfm-screenshot.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, "image/png")
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

    const characterCount = useMemo<number>(() => {
        return serverInfoData?.[serverName]?.character_count || 0
    }, [serverInfoData, serverName])

    // filter, sort, and hydrate the lfms
    const processedLfms: ProcessedLfms = useMemo(() => {
        if (!lfmData?.data)
            return {
                lfms: [],
                excludedLfmCount: 0,
            }

        const lfms = Object.values(lfmData.data || {}).filter(
            (lfm) => lfm != null
        )

        const processedLfms = lfms
            .filter((lfm) => {
                // Filter out ignore groups
                if (hideGroupsPostedByIgnoredCharacters) {
                    const isLeaderIgnored = ignoredCharacters?.some(
                        (ignoredCharacter) =>
                            lfm.leader?.id === ignoredCharacter.id
                    )
                    return !isLeaderIgnored
                }
                if (hideGroupsContainingIgnoredCharacters) {
                    const hasIgnoredMember = lfm.members?.some((lfmMember) =>
                        ignoredCharacters?.some(
                            (ignoredCharacter) =>
                                lfmMember.id === ignoredCharacter.id
                        )
                    )
                    return !hasIgnoredMember
                }
                if (hideAllLevelGroups) {
                    const lfmMinLevel = lfm.minimum_level
                    const lfmMaxLevel = lfm.maximum_level
                    if (
                        lfmMinLevel === MIN_LEVEL &&
                        lfmMaxLevel === MAX_LEVEL
                    ) {
                        return false
                    }
                }
                return true
            })
            .map((lfm) => {
                // Hydrate lfms with eligibility, eligible characters, friends, and timers
                const eligibleCharacters = registeredCharacters?.filter(
                    (character) => {
                        if (!trackedCharacterIds.includes(character.id))
                            return false
                        if (
                            character.server_name?.toLowerCase() !==
                            serverName?.toLowerCase()
                        )
                            return false
                        if ((character.total_level ?? 0) < lfm.minimum_level)
                            return false
                        if ((character.total_level ?? 0) > lfm.maximum_level)
                            return false
                        if (lfm.accepted_classes?.length !== 0) {
                            if (
                                !lfm.accepted_classes.some((acceptedClass) =>
                                    character.classes?.some(
                                        (characterClass) =>
                                            acceptedClass ===
                                            characterClass?.name
                                    )
                                )
                            ) {
                                return false
                            }
                        }
                        return true
                    }
                )
                const levelFilterMatch =
                    (minLevelFilter ?? MIN_LEVEL) <=
                        (lfm.maximum_level ?? MAX_LEVEL) &&
                    (maxLevelFilter ?? MAX_LEVEL) >=
                        (lfm.minimum_level ?? MIN_LEVEL)
                const isEligible =
                    (filterByMyCharacters && eligibleCharacters.length > 0) ||
                    (!filterByMyCharacters && levelFilterMatch)
                const isPostedByFriend = friendCharacters?.some(
                    (friend) => friend.id === lfm.leader?.id
                )
                const includesFriend = friendCharacters?.some((friend) =>
                    lfm.members?.some((member) => friend.id === member.id)
                )
                const raidActivityForLfm = raidActivity?.filter(
                    (activity) =>
                        activity?.data?.quest_ids?.includes(lfm?.quest_id) ||
                        false
                )
                const activity: ActivityEvent[] = raidActivityForLfm.map(
                    (activity) => {
                        const character = registeredCharacters?.find(
                            (character) =>
                                character.id === activity.character_id
                        )
                        return {
                            character: character,
                            character_id: activity.character_id,
                            timestamp: activity.timestamp,
                            data: activity.data,
                        }
                    }
                )

                let selectedQuest: Quest | null = null
                if (lfm.quest_id !== 0) {
                    const quest = getQuestById(lfm.quest_id)
                    if (quest) {
                        selectedQuest = quest
                    } else {
                        selectedQuest = constructUnknownQuest(lfm.quest_id)
                    }
                }

                return {
                    ...lfm,
                    quest: selectedQuest,
                    metadata: {
                        ...lfm.metadata,
                        isEligible,
                        eligibleCharacters,
                        isPostedByFriend,
                        includesFriend,
                        raidActivity: activity,
                    },
                }
            })
            .filter((lfm) => {
                // Filter out ineligible LFMs
                if (!showNotEligible && !lfm.metadata?.isEligible) return false
                if (onlyShowRaids) {
                    if (lfm.quest?.group_size !== "Raid") return false
                }
                return true
            })
            .sort((lfmA, lfmB) => {
                return (lfmA?.id ?? 0) - (lfmB?.id ?? 0)
            })
            .sort((lfmA, lfmB) => {
                const sortDirectionModifier = sortBy?.ascending ? 1 : -1
                switch (sortBy?.type) {
                    case LfmSortType.LEADER_NAME:
                        return (
                            (lfmA.leader.name ?? "").localeCompare(
                                lfmB.leader.name ?? ""
                            ) * sortDirectionModifier
                        )
                    case LfmSortType.QUEST_NAME:
                        const questAName =
                            getQuestById(lfmA.quest_id)?.name ?? ""
                        const questBName =
                            getQuestById(lfmB.quest_id)?.name ?? ""
                        const aHasQuest = lfmA.quest_id !== 0
                        const bHasQuest = lfmB.quest_id !== 0
                        if (!aHasQuest && !bHasQuest) return 0
                        if (!aHasQuest) return sortDirectionModifier
                        if (!bHasQuest) return -sortDirectionModifier
                        return (
                            questAName.localeCompare(questBName) *
                            sortDirectionModifier
                        )
                    case LfmSortType.ACCEPTED_CLASSES:
                        return (
                            ((lfmA.accepted_classes?.length ?? 0) -
                                (lfmB.accepted_classes?.length ?? 0)) *
                            sortDirectionModifier
                        )
                    default:
                        if (lfmA.maximum_level === lfmB.maximum_level)
                            return (
                                (lfmA.minimum_level - lfmB.minimum_level) *
                                sortDirectionModifier
                            )
                        return (
                            (lfmA.maximum_level - lfmB.maximum_level) *
                            sortDirectionModifier
                        )
                }
            })

        return {
            lfms: processedLfms,
            excludedLfmCount: lfms?.length - processedLfms?.length,
        }
    }, [
        lfmData,
        sortBy,
        minLevelFilter,
        showNotEligible,
        maxLevelFilter,
        serverName,
        filterByMyCharacters,
        registeredCharacters,
        trackedCharacterIds,
        raidActivity,
        friendCharacters,
        ignoredCharacters,
        quests,
        hideAllLevelGroups,
        onlyShowRaids,
        hideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
    ])

    return (
        <Stack direction="column">
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
                <Stack direction="column">
                    <LfmToolbar
                        serverName={serverName}
                        reloadLfms={() => {
                            reloadLfms()
                            reloadServerInfo()
                        }}
                        isSecondaryPanel={isSecondaryPanel}
                        handleClosePanel={handleClosePanel}
                        handleScreenshot={handleScreenshot}
                        characterCount={characterCount}
                    />
                    <LfmCanvas
                        serverName={serverName}
                        lfms={processedLfms.lfms || []}
                        excludedLfmCount={processedLfms.excludedLfmCount}
                        raidView={raidView}
                        isLoading={
                            lfmState !== LoadingState.Loaded && !hadFirstLoad
                        }
                    />
                </Stack>
            )}
        </Stack>
    )
}

export default GroupingContainer

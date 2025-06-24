import React, { useMemo, useState } from "react"
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
    } = useLfmContext()
    const [ignoreServerDown, setIgnoreServerDown] = useState<boolean>(false)

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

        // determine eligibility
        const determinedLfms = lfms.map((lfm) => {
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
                const characterLevels =
                    registeredCharacters
                        ?.filter((character) => {
                            return (
                                character.server_name?.toLowerCase() ===
                                    serverName.toLowerCase() &&
                                trackedCharacterIds.includes(character.id)
                            )
                        })
                        ?.map((character) => character.total_level || 99) || []
                let localEligibility = false
                characterLevels.forEach((level) => {
                    if (
                        level >= lfm.minimum_level &&
                        level <= lfm.maximum_level
                    ) {
                        localEligibility = true
                    }
                })
                isEligible = localEligibility
            }

            const newLfm: Lfm = { ...lfm, is_eligible: isEligible }
            return newLfm
        })

        // sort
        const filteredAndSortedLfms = determinedLfms
            .filter((lfm) => showNotEligible || lfm.is_eligible)
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
        return {
            filteredAndSortedLfms,
            excludedLfmCount: lfms.length - filteredAndSortedLfms.length,
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
                    />
                    <LfmCanvas
                        serverName={serverName}
                        lfms={filteredLfms.filteredAndSortedLfms || []}
                        excludedLfmCount={filteredLfms.excludedLfmCount}
                        raidView={raidView}
                    />
                </>
            )}
        </>
    )
}

export default GroupingContainer

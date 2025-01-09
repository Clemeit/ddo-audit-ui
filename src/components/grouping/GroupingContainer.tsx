import React, { useMemo } from "react"
import GroupingCanvas from "./GroupingCanvas.tsx"
import usePollLfms from "../../hooks/usePollLfms.ts"
import { Lfm } from "../../models/Lfm.ts"
import { useGroupingContext } from "../../contexts/GroupingContext.tsx"

interface Props {
    serverName: string
    refreshInterval?: number
}

const GroupingContainer = ({ serverName, refreshInterval = 3000 }: Props) => {
    const { lfmData } = usePollLfms({ serverName, refreshInterval })
    const { sortBy } = useGroupingContext()

    // filter and sort the lfms
    const filteredLfms = useMemo(() => {
        const lfms: Lfm[] = Object.values(
            lfmData.data?.data?.[serverName]?.lfms || {}
        )
        if (!lfms) return []

        // determine eligibility
        const determinedLfms = lfms.map((lfm) => {
            const newLfm: Lfm = { ...lfm, is_eligible: true }
            return newLfm
        })

        // sort
        return determinedLfms
            .sort((a, b) => {
                // this sort should take care of the case where the next sort
                // operataion has ties
                return a.id.localeCompare(b.id)
            })
            .sort((a, b) => {
                // might use some other method instead of average, but this'll do for now
                const averageLevelA = (a.minimum_level + a.maximum_level) / 2
                const averageLevelB = (b.minimum_level + b.maximum_level) / 2
                if (sortBy.type === "leader") {
                    return sortBy.direction === "asc"
                        ? (a.leader.name || "").localeCompare(
                              b.leader.name || ""
                          )
                        : (b.leader.name || "").localeCompare(
                              a.leader.name || ""
                          )
                } else if (sortBy.type === "quest") {
                    return sortBy.direction === "asc"
                        ? (a.quest?.name || "").localeCompare(
                              b.quest?.name || ""
                          )
                        : (b.quest?.name || "").localeCompare(
                              a.quest?.name || ""
                          )
                } else if (sortBy.type === "classes") {
                    return sortBy.direction === "asc"
                        ? (a.accepted_classes || []).length -
                              (b.accepted_classes || []).length
                        : (b.accepted_classes || []).length -
                              (a.accepted_classes || []).length
                } else {
                    // default to level
                    return sortBy.direction === "asc"
                        ? averageLevelA - averageLevelB
                        : averageLevelB - averageLevelA
                }
            })
    }, [lfmData, sortBy, serverName])

    return (
        <GroupingCanvas
            serverName={serverName}
            lfms={filteredLfms || []}
            raidView
        />
    )
}

export default GroupingContainer

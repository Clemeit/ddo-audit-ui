import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { WIPPageMessage } from "../global/CommonMessages.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import Stack from "../global/Stack.tsx"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import QuestSearch from "./QuestSearch.tsx"
import { MIN_LEVEL } from "../../constants/game.ts"
import QuestTable from "./QuestTable.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import ColoredText from "../global/ColoredText.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import ExpandableContainer from "../global/ExpandableContainer.tsx"

const getFromSessionStorage = (key: string, defaultValue: any) => {
    try {
        const value = sessionStorage.getItem(key)
        if (value === null) return defaultValue
        return JSON.parse(value)
    } catch {
        return defaultValue
    }
}

const saveToSessionStorage = (key: string, value: any) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Silently fail if session storage is not available
    }
}

const Quests = () => {
    const isMobile = useIsMobile()
    const { quests, maxQuestLevel } = useQuestContext()
    const { areas } = useAreaContext()

    const storedMaximumLevelRaw = getFromSessionStorage(
        "maximumLevel",
        null
    ) as number | null
    const storedMaximumLevel =
        typeof storedMaximumLevelRaw === "number" && storedMaximumLevelRaw > 1
            ? storedMaximumLevelRaw
            : null

    const [computedTableMaxHeight, setComputedTableMaxHeight] =
        useState<string>("60vh")
    const tableContainerRef = useRef<HTMLDivElement | null>(null)
    const [scrollPosition, setScrollPosition] = useState<number>(
        getFromSessionStorage("tableScrollPosition", 0)
    )
    const [scrollResetKey, setScrollResetKey] = useState<number>(0)
    const filtersInitializedRef = useRef<boolean>(false)

    const [questFilter, setQuestFilter] = useState<string>(
        getFromSessionStorage("questFilter", "")
    )
    const [minimumLevel, setMinimumLevel] = useState<number>(
        getFromSessionStorage("minimumLevel", MIN_LEVEL)
    )
    const [maximumLevel, setMaximumLevel] = useState<number>(() => {
        if (storedMaximumLevel != null) return storedMaximumLevel
        if (maxQuestLevel != null && maxQuestLevel > 1) return maxQuestLevel
        return 100
    })
    const [isLevelRange, setIsLevelRange] = useState<boolean>(
        getFromSessionStorage("isLevelRange", true)
    )
    const [showOnlyQuestsWithMetrics, setShowOnlyQuestsWithMetrics] =
        useState<boolean>(
            getFromSessionStorage("showOnlyQuestsWithMetrics", false)
        )

    const [sortField, setSortField] = useState<string>(
        getFromSessionStorage("sortField", "name")
    )
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
        getFromSessionStorage("sortDirection", "asc")
    )

    const [searchContainerIsOpen, setSearchContainerIsOpen] =
        useState<boolean>(false)

    useEffect(() => {
        saveToSessionStorage("questFilter", questFilter)
    }, [questFilter])

    useEffect(() => {
        saveToSessionStorage("minimumLevel", minimumLevel)
    }, [minimumLevel])

    useEffect(() => {
        if (maximumLevel > 1) {
            saveToSessionStorage("maximumLevel", maximumLevel)
        }
    }, [maximumLevel])

    useEffect(() => {
        saveToSessionStorage("isLevelRange", isLevelRange)
    }, [isLevelRange])

    useEffect(() => {
        saveToSessionStorage(
            "showOnlyQuestsWithMetrics",
            showOnlyQuestsWithMetrics
        )
    }, [showOnlyQuestsWithMetrics])

    useEffect(() => {
        saveToSessionStorage("sortField", sortField)
    }, [sortField])

    useEffect(() => {
        saveToSessionStorage("sortDirection", sortDirection)
    }, [sortDirection])

    // Reset scroll to top when filters change (skip initial load)
    useEffect(() => {
        if (!filtersInitializedRef.current) {
            filtersInitializedRef.current = true
            return
        }
        setScrollPosition(0)
        saveToSessionStorage("tableScrollPosition", 0)
        setScrollResetKey((key) => key + 1)
    }, [
        questFilter,
        minimumLevel,
        maximumLevel,
        isLevelRange,
        sortDirection,
        sortField,
        showOnlyQuestsWithMetrics,
    ])

    useEffect(() => {
        if (storedMaximumLevel !== null) return
        if (maxQuestLevel == undefined || maxQuestLevel <= 1) return
        setMaximumLevel(maxQuestLevel)
        saveToSessionStorage("maximumLevel", maxQuestLevel)
    }, [maxQuestLevel, storedMaximumLevel])

    useLayoutEffect(() => {
        const recompute = () => {
            const el = tableContainerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const buffer = isMobile ? 145 : 90
            const available = Math.max(
                250,
                Math.floor(window.innerHeight - rect.top - buffer)
            )
            setComputedTableMaxHeight(`${available}px`)
        }

        recompute()
        window.addEventListener("resize", recompute)
        return () => window.removeEventListener("resize", recompute)
    }, [isMobile, quests, searchContainerIsOpen])

    const filteredQuests = useMemo(() => {
        return Object.values(quests)
            .filter((quest) => {
                const nameMatchesFilter = quest.name
                    ? quest.name
                          .toLowerCase()
                          .includes(questFilter.toLowerCase())
                    : false
                const packMatchesFilter = quest.required_adventure_pack
                    ? quest.required_adventure_pack
                          .toLowerCase()
                          .includes(questFilter.toLowerCase())
                    : false
                const meetsMinLevel = isLevelRange
                    ? (quest.heroic_normal_cr !== undefined &&
                          quest.heroic_normal_cr >= minimumLevel &&
                          quest.heroic_normal_cr <= maximumLevel) ||
                      (quest.epic_normal_cr !== undefined &&
                          quest.epic_normal_cr >= minimumLevel &&
                          quest.epic_normal_cr <= maximumLevel)
                    : (quest.heroic_normal_cr !== undefined &&
                          quest.heroic_normal_cr == minimumLevel) ||
                      (quest.epic_normal_cr !== undefined &&
                          quest.epic_normal_cr == minimumLevel)
                const meetsMaxLevel = isLevelRange
                    ? true
                    : (quest.heroic_normal_cr !== undefined &&
                          quest.heroic_normal_cr <= maximumLevel) ||
                      (quest.epic_normal_cr !== undefined &&
                          quest.epic_normal_cr <= maximumLevel)

                return (
                    (nameMatchesFilter || packMatchesFilter) &&
                    meetsMinLevel &&
                    meetsMaxLevel
                )
            })
            .filter(
                (quest) => areas && areas[quest.area_id].is_wilderness == false
            )
            .filter((quest) => {
                if (showOnlyQuestsWithMetrics) {
                    return (
                        quest.heroic_xp_per_minute_relative != null ||
                        quest.epic_xp_per_minute_relative != null ||
                        quest.heroic_popularity_relative != null ||
                        quest.epic_popularity_relative != null
                    )
                } else {
                    return true
                }
            })
            .sort((a, b) => {
                let aValue: string | number | null | undefined
                let bValue: string | number | null | undefined
                switch (sortField) {
                    case "name":
                        aValue = a.name
                        bValue = b.name
                        break
                    case "heroic_normal_cr":
                        aValue = a.heroic_normal_cr
                        bValue = b.heroic_normal_cr
                        break
                    case "epic_normal_cr":
                        aValue = a.epic_normal_cr
                        bValue = b.epic_normal_cr
                        break
                    case "required_adventure_pack":
                        aValue = a.required_adventure_pack
                        bValue = b.required_adventure_pack
                        break
                    case "length":
                        aValue = a.length
                        bValue = b.length
                        break
                    case "heroic_xp_per_minute":
                        aValue = a.heroic_xp_per_minute_relative
                        bValue = b.heroic_xp_per_minute_relative
                        break
                    case "epic_xp_per_minute":
                        aValue = a.epic_xp_per_minute_relative
                        bValue = b.epic_xp_per_minute_relative
                        break
                    case "popularity":
                        aValue = a.heroic_popularity_relative
                        bValue = b.heroic_popularity_relative
                        break
                }

                // Handle null/undefined values - always push them to the end
                const aIsEmpty = aValue == null || aValue === ""
                const bIsEmpty = bValue == null || bValue === ""

                if (aIsEmpty && bIsEmpty) {
                    // Both empty - sort by quest id for deterministic ordering
                    return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
                }
                if (aIsEmpty) return 1 // a goes to end
                if (bIsEmpty) return -1 // b goes to end

                // Normal comparison for non-empty values
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

                // Values are equal - sort by quest id for deterministic ordering
                return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
            })
    }, [
        quests,
        questFilter,
        minimumLevel,
        maximumLevel,
        isLevelRange,
        showOnlyQuestsWithMetrics,
        areas,
        sortDirection,
        sortField,
    ])

    const questSearchComponent = () => {
        const component = (
            <QuestSearch
                questFilter={questFilter}
                setQuestFilter={setQuestFilter}
                minimumLevel={minimumLevel}
                setMinimumLevel={setMinimumLevel}
                maximumLevel={maximumLevel}
                setMaximumLevel={setMaximumLevel}
                isLevelRange={isLevelRange}
                setIsLevelRange={setIsLevelRange}
                showOnlyQuestsWithMetrics={showOnlyQuestsWithMetrics}
                setShowOnlyQuestsWithMetrics={setShowOnlyQuestsWithMetrics}
            />
        )

        if (!isMobile) return component

        return (
            <ExpandableContainer
                title="Search"
                stateChangeCallback={setSearchContainerIsOpen}
                style={{ width: "100%" }}
            >
                {component}
            </ExpandableContainer>
        )
    }

    return (
        <Page
            title="Quest Analytics"
            description="Explore quest activity and trends across DDO servers, including popularity, XP/minute comparisons, and completion time data."
            pageMessages={[<WIPPageMessage />]}
        >
            <ContentClusterGroup>
                <ContentCluster title="Quest Search">
                    <Stack direction="column" gap="20px">
                        {questSearchComponent()}
                        <div ref={tableContainerRef} style={{ width: "100%" }}>
                            <QuestTable
                                quests={filteredQuests || []}
                                maxBodyHeight={computedTableMaxHeight}
                                sortField={sortField}
                                setSortField={setSortField}
                                sortDirection={sortDirection}
                                setSortDirection={setSortDirection}
                                onTableScroll={(scrollPos) =>
                                    saveToSessionStorage(
                                        "tableScrollPosition",
                                        scrollPos
                                    )
                                }
                                initialScrollPosition={scrollPosition}
                                scrollResetKey={scrollResetKey}
                            />
                        </div>
                        <div>
                            <InfoSVG
                                className="page-message-icon"
                                style={{ fill: `var(--info)` }}
                            />
                            <ColoredText color="secondary">
                                Not all quests are tracked. Numbers are
                                estimates. XP/Minute and Popularity are relative
                                to quests around the same level.
                            </ColoredText>
                        </div>
                    </Stack>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Quests

import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import Stack from "../global/Stack.tsx"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import QuestSearch from "./QuestSearch.tsx"
import { MIN_LEVEL } from "../../constants/game.ts"
import { sortQuestsByField } from "../../utils/questUtils.ts"
import QuestTable from "./QuestTable.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import ColoredText from "../global/ColoredText.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import ExpandableContainer from "../global/ExpandableContainer.tsx"
import logMessage from "../../utils/logUtils.ts"

const VALID_SORT_FIELDS = [
    "name",
    "heroic_normal_cr",
    "epic_normal_cr",
    "required_adventure_pack",
    "length",
    "heroic_xp_per_minute",
    "epic_xp_per_minute",
    "popularity",
]

const sessionStorageReadFailureKeys = new Set<string>()
const sessionStorageWriteFailureKeys = new Set<string>()

const isValidSortField = (value: string): boolean => {
    return VALID_SORT_FIELDS.includes(value)
}

const getFromSessionStorage = (key: string, defaultValue: any) => {
    try {
        const value = sessionStorage.getItem(key)
        if (value === null) return defaultValue
        return JSON.parse(value)
    } catch (error) {
        if (!sessionStorageReadFailureKeys.has(key)) {
            sessionStorageReadFailureKeys.add(key)
            logMessage("Failed to read quests session storage value", "warn", {
                metadata: {
                    key,
                    error: error instanceof Error ? error.message : error,
                },
            })
        }
        return defaultValue
    }
}

const saveToSessionStorage = (key: string, value: any) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        if (!sessionStorageWriteFailureKeys.has(key)) {
            sessionStorageWriteFailureKeys.add(key)
            logMessage("Failed to write quests session storage value", "warn", {
                metadata: {
                    key,
                    error: error instanceof Error ? error.message : error,
                },
            })
        }
    }
}

const Quests = () => {
    const isMobile = useIsMobile()
    const { quests, maxQuestLevel } = useQuestContext()
    const { areas } = useAreaContext()

    // Read the initial stored max level once at mount; avoid re-reading sessionStorage on every render
    const initialStoredMaxLevelRef = useRef<number | null>(
        (() => {
            const raw = getFromSessionStorage("maximumLevel", null) as
                | number
                | null
            return typeof raw === "number" && raw > 1 ? raw : null
        })()
    )

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
        if (initialStoredMaxLevelRef.current != null)
            return initialStoredMaxLevelRef.current
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

    const [sortField, setSortField] = useState<string>(() => {
        const storedSortField = getFromSessionStorage("sortField", "name")

        if (
            typeof storedSortField === "string" &&
            isValidSortField(storedSortField)
        ) {
            return storedSortField
        }

        if (storedSortField != null) {
            logMessage("Invalid quest sort field in session storage", "warn", {
                metadata: {
                    sortField: storedSortField,
                },
            })
        }

        return "name"
    })
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(() => {
        const storedSortDirection = getFromSessionStorage(
            "sortDirection",
            "asc"
        )

        if (storedSortDirection === "asc" || storedSortDirection === "desc") {
            return storedSortDirection
        }

        if (storedSortDirection != null) {
            logMessage(
                "Invalid quest sort direction in session storage",
                "warn",
                {
                    metadata: {
                        sortDirection: storedSortDirection,
                    },
                }
            )
        }

        return "asc"
    })

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
        if (initialStoredMaxLevelRef.current !== null) return
        if (maxQuestLevel == undefined || maxQuestLevel <= 1) return
        setMaximumLevel(maxQuestLevel)
        saveToSessionStorage("maximumLevel", maxQuestLevel)
    }, [maxQuestLevel])

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
        const filtered = Object.values(quests)
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

                return (nameMatchesFilter || packMatchesFilter) && meetsMinLevel
            })
            .filter((quest) => areas?.[quest.area_id]?.is_wilderness === false)
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
        return sortQuestsByField(filtered, sortField, sortDirection)
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
            // pageMessages={[<WIPPageMessage />]}
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
                                onTableScroll={(scrollPos) => {
                                    setScrollPosition(scrollPos)
                                    saveToSessionStorage(
                                        "tableScrollPosition",
                                        scrollPos
                                    )
                                }}
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

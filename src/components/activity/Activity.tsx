import React, { useState, useEffect, useRef } from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import { AccessToken } from "../../models/Verification.ts"
import {
    Character,
    SingleCharacterResponseModel,
} from "../../models/Character.ts"
import "./Activity.css"
import Stack from "../global/Stack.tsx"
import { useLocation } from "react-router-dom"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import Button from "../global/Button.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCharacterActivity from "../../hooks/useGetCharacterActivity.ts"
import { CharacterActivityType } from "../../models/Activity.ts"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import CharacterActivityTable, {
    ActivityRowKind,
    BaseActivityRow,
    renderLevelClasses,
    renderLevelValue,
    renderLocationName,
    renderQuestName,
    renderStatus,
} from "./CharacterActivityTable.tsx"
import usePollApi from "../../hooks/usePollApi.ts"
import { MsFromHours, MsFromSeconds } from "../../utils/timeUtils.ts"
import { CHARACTER_ENDPOINT } from "../../services/characterService.ts"
import { LoadingState } from "../../models/Api.ts"
import useSearchParamState, {
    SearchParamType,
} from "../../hooks/useSearchParamState.ts"
import PageMessage from "../global/PageMessage.tsx"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import Link from "../global/Link.tsx"

// TODO: Location table updates:
// - Show quest name when a location belongs to a quest.
// - Click on a quest entry to see how your run stacks up
// - Click on a quest entry to see all of your runs, including ransack
// - The Quest Name filter is filtering by location, it should filter by quest

const Activity = () => {
    const location = useLocation()
    const {
        registeredCharacters,
        verifiedCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
    } = useGetRegisteredCharacters()
    const [isReloadDisabled, setIsReloadDisabled] = useState<boolean>(false)
    const [hideActivityDevelopmentNotice, setHideActivityDevelopmentNotice] =
        useBooleanFlag(BOOLEAN_FLAGS.hideActivityDevelopmentNotice, false)

    const [
        selectedCharacterAndAccessToken,
        setSelectedCharacterAndAccessToken,
    ] = useState<{
        character: Character | null
        accessToken: AccessToken | null
    }>({
        character: null,
        accessToken: null,
    })

    const { areas } = useAreaContext()
    const { quests } = useQuestContext()

    const lastCharacterState = useRef<Character | null>(null)
    const [isCharacterOnline, setIsCharacterOnline] = useState<boolean>(false)
    const [isCharacterSelectionInvalid, setIsCharacterSelectionInvalid] =
        useState<boolean>(false)

    const {
        activityData: locationActivity,
        isLoading: locationActivityIsLoading,
        isError: locationActivityIsError,
        reload: reloadLocationActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.location,
    })
    const {
        activityData: onlineActivity,
        isLoading: onlineActivityIsLoading,
        isError: onlineActivityIsError,
        reload: reloadOnlineActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.status,
    })
    const {
        activityData: levelActivity,
        isLoading: levelActivityIsLoading,
        isError: levelActivityIsError,
        reload: reloadLevelActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.total_level,
    })
    const { data: characterData, state: characterDataState } =
        usePollApi<SingleCharacterResponseModel>({
            endpoint: `${CHARACTER_ENDPOINT}/${selectedCharacterAndAccessToken.character?.id}`,
            interval: isCharacterOnline ? MsFromSeconds(1) : MsFromSeconds(5),
            lifespan: MsFromHours(8),
            enabled: !!selectedCharacterAndAccessToken.character?.id,
        })
    const [selectedTimestampRange, setSelectedTimestampRange] = useState<{
        start: number | null
        end: number | null
    }>(null)
    // Track which table initiated the selection and a version counter to force effects
    const [lastSelectionSource, setLastSelectionSource] = useState<
        "location" | "level" | "online" | null
    >(null)
    const [selectionVersion, setSelectionVersion] = useState<number>(0)

    useEffect(() => {
        let didReload = false
        if (
            lastCharacterState.current?.location_id !==
            characterData?.data?.location_id
        ) {
            didReload = true
            reloadLocationActivityData()
        }
        if (
            lastCharacterState.current?.is_online !==
            characterData?.data?.is_online
        ) {
            didReload = true
            reloadOnlineActivityData()
        }

        if (didReload || !lastCharacterState.current) {
            lastCharacterState.current = characterData?.data
        }
    }, [characterData])

    useEffect(() => {
        const next = characterData?.data?.is_online
        if (next !== undefined) setIsCharacterOnline(next)
    }, [characterData?.data?.is_online])

    useEffect(() => {
        // get character name param from url
        const characterName = new URLSearchParams(location.search).get(
            "character"
        )
        if (characterName && verifiedCharacters.length > 0) {
            const character = verifiedCharacters.find(
                (character: Character) =>
                    character.name?.toLowerCase() ===
                    characterName.toLowerCase()
            )
            if (character && accessTokens) {
                const accessToken = accessTokens.find(
                    (token: AccessToken) => token.character_id === character.id
                )
                if (accessToken) {
                    setSelectedCharacterAndAccessToken({
                        character,
                        accessToken,
                    })
                }
            }
        }
    }, [location.search, verifiedCharacters, accessTokens])

    const { getSearchParam, setSearchParam } = useSearchParamState()
    const selectedCharacterName =
        getSearchParam(SearchParamType.CHARACTER) || ""
    const setSelectedCharacterName = (name: string) => {
        setSearchParam(SearchParamType.CHARACTER, name)
    }

    useEffect(() => {
        if (!isLoaded) return
        if (!selectedCharacterName) {
            setSelectedCharacterAndAccessToken({
                character: null,
                accessToken: null,
            })
            setIsCharacterSelectionInvalid(false)
            return
        }
        const character =
            verifiedCharacters.find(
                (character: Character) =>
                    character.id.toString() === selectedCharacterName
            ) || null
        if (character && accessTokens) {
            setIsCharacterSelectionInvalid(false)
            const accessToken = accessTokens.find(
                (token: AccessToken) => token.character_id === character.id
            )
            if (accessToken) {
                setSelectedCharacterAndAccessToken({
                    character,
                    accessToken,
                })
            }
        } else {
            setIsCharacterSelectionInvalid(true)
            setSelectedCharacterAndAccessToken({
                character: null,
                accessToken: null,
            })
        }
    }, [verifiedCharacters, selectedCharacterName])

    const handleReload = () => {
        reloadCharacters()
        reloadLocationActivityData()
        reloadOnlineActivityData()
        reloadLevelActivityData()
        setIsReloadDisabled(true)
        setSelectedTimestampRange(null)
        setTimeout(() => {
            setIsReloadDisabled(false)
        }, 2000)
    }

    const conditionalSelectionContent = () => {
        if (isError)
            return (
                <div>
                    <p>
                        Failed to load character data. Please try again later.
                    </p>
                    <Button
                        type="secondary"
                        onClick={reloadCharacters}
                        disabled={!isLoaded}
                    >
                        Reload
                    </Button>
                    <Spacer size="10px" />
                </div>
            )

        if (verifiedCharacters.length > 0)
            return (
                <div>
                    <Stack
                        className="character-selection-container"
                        direction="column"
                        gap="5px"
                    >
                        <label htmlFor="character-selection">
                            Select a character:
                        </label>
                        <Stack gap="10px" align="center" width="100%">
                            <select
                                className="full-width-on-smallish-mobile"
                                id="character-selection"
                                value={selectedCharacterName}
                                onChange={(e) =>
                                    setSelectedCharacterName(e.target.value)
                                }
                            >
                                <option value="">Select a character...</option>
                                {verifiedCharacters
                                    .sort((a, b) =>
                                        (a.name ?? "").localeCompare(
                                            b.name ?? ""
                                        )
                                    )
                                    .map((character) => (
                                        <option
                                            key={character.id}
                                            value={character.id}
                                        >
                                            {character.name}
                                        </option>
                                    ))}
                            </select>
                            <Button
                                type="secondary"
                                small
                                onClick={() => handleReload()}
                                disabled={!isLoaded || isReloadDisabled}
                            >
                                Reload
                            </Button>
                        </Stack>
                    </Stack>
                    <p className="secondary-text">
                        You can only view the data of your{" "}
                        <Link to="/registration">
                            registered, verified characters
                        </Link>
                        .
                    </p>
                </div>
            )
        if (verifiedCharacters.length === 0 && registeredCharacters.length > 0)
            return <NoVerifiedCharacters />
        if (verifiedCharacters.length === 0)
            return <NoRegisteredAndVerifiedCharacters />
    }

    // ---------------- Consolidated activity transformation & filtering state ----------------
    const [hidePublicAreas, setHidePublicAreas] = useState<boolean>(false)
    const [hideWildernessAreas, setHideWildernessAreas] =
        useState<boolean>(false)
    const [discardLocationLoggedOut, setDiscardLocationLoggedOut] =
        useState<boolean>(true)
    const [discardLevelLoggedOut, setDiscardLevelLoggedOut] =
        useState<boolean>(true)
    const [discardLevelPublicArea, setDiscardLevelPublicArea] =
        useState<boolean>(false)
    const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false)

    // Helpers for building status segments (latest first) used by multiple transformations.
    const buildStatusSegments = (status: typeof onlineActivity) => {
        const now = new Date()
        return (status || []).map((s, i) => ({
            start: new Date(s.timestamp),
            end: i === 0 ? now : new Date(status[i - 1].timestamp),
            online: s.data?.status === true,
            isLatest: i === 0,
        }))
    }

    const buildPublicSegments = (loc: typeof locationActivity) => {
        const now = new Date()
        return (loc || [])
            .map((s, i) => ({
                start: new Date(s.timestamp),
                end: i === 0 ? now : new Date(loc[i - 1].timestamp),
                isPublic: !!areas[s.data?.location_id || 0]?.is_public,
                isWilderness: !!areas[s.data?.location_id || 0]?.is_wilderness,
                location_id: s.data?.location_id,
            }))
            .filter(
                (seg) =>
                    !isNaN(seg.start.getTime()) && !isNaN(seg.end.getTime())
            )
    }

    // Location segments similar to prior component (splitting by online time if requested)
    const locationRows: BaseActivityRow[] = React.useMemo(() => {
        if (!selectedCharacterAndAccessToken?.character) return []
        if (!locationActivity?.length) return []
        const statusSegments = buildStatusSegments(onlineActivity)
        const questsArray = Object.values(quests)
        const now = new Date()
        const rows: BaseActivityRow[] = []

        for (let i = 0; i < locationActivity.length; i++) {
            const loc = locationActivity[i]
            const windowStart = new Date(loc.timestamp)
            const windowEnd =
                i === 0 ? now : new Date(locationActivity[i - 1].timestamp)
            if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime()))
                continue
            if (windowEnd <= windowStart) continue
            const displayStartIso = windowStart.toISOString()

            const area = areas[loc.data?.location_id || 0]
            const quest =
                area && !area.is_public && !area.is_wilderness
                    ? questsArray.find((q) => q.area_id === area.id)
                    : undefined

            const pushSegment = (start: Date, end: Date | undefined) => {
                // Filter decisions applied later for entire row list (public/wilderness hides).
                rows.push({
                    id: `${start.toISOString()}-${loc.data?.location_id}`,
                    kind: "location",
                    displayStart: displayStartIso,
                    start: start.toISOString(),
                    end: end ? end.toISOString() : undefined,
                    data: {
                        location_id: loc.data?.location_id,
                        locationName: area?.name,
                        questName: quest?.name,
                        is_public: area?.is_public,
                        is_wilderness: area?.is_wilderness,
                    },
                })
            }

            if (!discardLocationLoggedOut) {
                pushSegment(windowStart, i === 0 ? undefined : windowEnd)
            } else if (!statusSegments.length) {
                pushSegment(windowStart, i === 0 ? undefined : windowEnd)
            } else {
                for (const ss of statusSegments) {
                    if (!ss.online) continue
                    const overlapStart = Math.max(
                        windowStart.getTime(),
                        ss.start.getTime()
                    )
                    const overlapEnd = Math.min(
                        windowEnd.getTime(),
                        ss.end.getTime()
                    )
                    if (overlapEnd > overlapStart) {
                        const endsAtNow =
                            ss.isLatest && overlapEnd === Date.now()
                        pushSegment(
                            new Date(overlapStart),
                            endsAtNow ? undefined : new Date(overlapEnd)
                        )
                    }
                }
            }
        }

        // Apply filters
        return rows.filter((r) => {
            if (hidePublicAreas && r.data?.is_public) return false
            if (hideWildernessAreas && r.data?.is_wilderness) return false
            return true
        })
    }, [
        selectedCharacterAndAccessToken?.character,
        locationActivity,
        onlineActivity,
        quests,
        areas,
        hidePublicAreas,
        hideWildernessAreas,
        discardLocationLoggedOut,
    ])

    // Level rows replicate prior logic (single aggregated duration per level event)
    const levelRows: BaseActivityRow[] = React.useMemo(() => {
        if (!selectedCharacterAndAccessToken?.character) return []
        if (!levelActivity?.length) return []
        const statusSegments = buildStatusSegments(onlineActivity)
        const publicSegments = buildPublicSegments(locationActivity)
        const now = new Date()
        const nowMs = now.getTime()
        const overlap = (
            aStart: number,
            aEnd: number,
            bStart: number,
            bEnd: number
        ) => {
            const s = Math.max(aStart, bStart)
            const e = Math.min(aEnd, bEnd)
            return e > s ? ([s, e] as [number, number]) : null
        }
        const subtractInterval = (
            fromStart: number,
            fromEnd: number,
            subStart: number,
            subEnd: number
        ): Array<[number, number]> => {
            if (subEnd <= fromStart || subStart >= fromEnd)
                return [[fromStart, fromEnd]]
            if (subStart <= fromStart && subEnd >= fromEnd) return []
            const pieces: Array<[number, number]> = []
            if (subStart > fromStart)
                pieces.push([fromStart, Math.min(subStart, fromEnd)])
            if (subEnd < fromEnd)
                pieces.push([Math.max(subEnd, fromStart), fromEnd])
            return pieces.filter(([s, e]) => e > s)
        }
        const rows: BaseActivityRow[] = []
        for (let i = 0; i < levelActivity.length; i++) {
            const lvl = levelActivity[i]
            const windowStart = new Date(lvl.timestamp)
            const windowEnd =
                i === 0 ? now : new Date(levelActivity[i - 1].timestamp)
            if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime()))
                continue
            if (windowEnd <= windowStart) continue
            const displayStartIso = windowStart.toISOString()
            const wStartMs = windowStart.getTime()
            const wEndMs = windowEnd.getTime()
            type Piece = { startMs: number; endMs: number; endsAtNow: boolean }
            let pieces: Piece[] = []
            if (!discardLevelLoggedOut) {
                pieces = [
                    {
                        startMs: wStartMs,
                        endMs: wEndMs,
                        endsAtNow: i === 0 && wEndMs === nowMs,
                    },
                ]
            } else if (!statusSegments.length) {
                pieces = [
                    {
                        startMs: wStartMs,
                        endMs: wEndMs,
                        endsAtNow: i === 0 && wEndMs === nowMs,
                    },
                ]
            } else {
                for (const ss of statusSegments) {
                    if (!ss.online) continue
                    const ov = overlap(
                        wStartMs,
                        wEndMs,
                        ss.start.getTime(),
                        ss.end.getTime()
                    )
                    if (ov) {
                        const [sMs, eMs] = ov
                        const endsAtNow = ss.isLatest && eMs === nowMs
                        pieces.push({ startMs: sMs, endMs: eMs, endsAtNow })
                    }
                }
            }
            if (discardLevelPublicArea && publicSegments.length) {
                const refined: Piece[] = []
                for (const p of pieces) {
                    let current: Array<[number, number]> = [
                        [p.startMs, p.endMs],
                    ]
                    for (const ps of publicSegments) {
                        if (!ps.isPublic) continue
                        const next: Array<[number, number]> = []
                        for (const [rs, re] of current) {
                            const parts = subtractInterval(
                                rs,
                                re,
                                ps.start.getTime(),
                                ps.end.getTime()
                            )
                            next.push(...parts)
                        }
                        current = next
                        if (!current.length) break
                    }
                    for (const [rs, re] of current) {
                        const endsAtNow = p.endsAtNow && re === nowMs
                        refined.push({ startMs: rs, endMs: re, endsAtNow })
                    }
                }
                pieces = refined
            }
            let totalMs = 0
            let hasLive = false
            for (const p of pieces) {
                totalMs += Math.max(0, p.endMs - p.startMs)
                if (p.endsAtNow) hasLive = true
            }
            rows.push({
                id: `${windowStart.toISOString()}-${lvl.data?.total_level}`,
                kind: "level",
                displayStart: displayStartIso,
                start: displayStartIso,
                end: hasLive ? undefined : new Date(wEndMs).toISOString(),
                durationMs: totalMs,
                data: { ...lvl.data },
            })
        }
        return rows
    }, [
        selectedCharacterAndAccessToken?.character,
        levelActivity,
        onlineActivity,
        locationActivity,
        areas,
        discardLevelLoggedOut,
        discardLevelPublicArea,
    ])

    const onlineRows: BaseActivityRow[] = React.useMemo(() => {
        if (!selectedCharacterAndAccessToken?.character) return []
        if (!onlineActivity?.length) return []
        const rows: BaseActivityRow[] = []
        for (let i = 0; i < onlineActivity.length; i++) {
            const act = onlineActivity[i]
            if (showOnlineOnly && act.data?.status !== true) continue
            const start = new Date(act.timestamp)
            const end =
                i === 0 ? undefined : new Date(onlineActivity[i - 1].timestamp)
            rows.push({
                id: `${act.timestamp}-${i}`,
                kind: "online",
                displayStart: start.toISOString(),
                start: start.toISOString(),
                end: end ? end.toISOString() : undefined,
                data: { status: act.data?.status },
            })
        }
        return rows
    }, [
        selectedCharacterAndAccessToken?.character,
        onlineActivity,
        showOnlineOnly,
    ])

    const handleSelect =
        (kind: ActivityRowKind) =>
        (range: { start: number | null; end: number | null }) => {
            setSelectedTimestampRange({
                start: range.start,
                end: range.end ?? Date.now(),
            })
            setLastSelectionSource(kind)
            setSelectionVersion((v) => v + 1)
        }

    const conditionalActivityContent = () => (
        <Stack direction="column" gap="20px">
            <CharacterActivityTable
                title="Location and Quest Activity"
                kind="location"
                selfSource="location"
                rows={locationRows}
                onSelect={handleSelect("location")}
                selectedRange={selectedTimestampRange}
                lastSelectionSource={lastSelectionSource}
                selectionVersion={selectionVersion}
                filters={[
                    {
                        label: "Hide public areas",
                        checked: hidePublicAreas,
                        onChange: setHidePublicAreas,
                    },
                    {
                        label: "Hide wilderness areas",
                        checked: hideWildernessAreas,
                        onChange: setHideWildernessAreas,
                    },
                    {
                        label: "Don't count time logged out",
                        checked: discardLocationLoggedOut,
                        onChange: setDiscardLocationLoggedOut,
                    },
                ]}
                columns={[
                    {
                        key: "location",
                        header: "Location",
                        render: (r) => renderLocationName(r),
                    },
                    {
                        key: "quest",
                        header: "Quest",
                        render: (r) => renderQuestName(r),
                    },
                    { key: "__time__", header: "Time", render: () => null },
                    {
                        key: "__duration__",
                        header: "Duration",
                        render: () => null,
                    },
                ]}
                infoNote={
                    <span>
                        Not all quests are tracked. Some data may be missing or
                        incomplete.
                    </span>
                }
            />
            <CharacterActivityTable
                title="Level Activity"
                kind="level"
                selfSource="level"
                rows={levelRows}
                onSelect={handleSelect("level")}
                selectedRange={selectedTimestampRange}
                lastSelectionSource={lastSelectionSource}
                selectionVersion={selectionVersion}
                filters={[
                    {
                        label: "Don't count time logged out",
                        checked: discardLevelLoggedOut,
                        onChange: setDiscardLevelLoggedOut,
                    },
                    {
                        label: "Don't count time in public areas",
                        checked: discardLevelPublicArea,
                        onChange: setDiscardLevelPublicArea,
                    },
                ]}
                columns={[
                    {
                        key: "level",
                        header: "Level",
                        render: (r) => renderLevelValue(r),
                    },
                    {
                        key: "classes",
                        header: "Classes",
                        render: (r) => renderLevelClasses(r),
                    },
                    { key: "__time__", header: "Time", render: () => null },
                    {
                        key: "__duration__",
                        header: "Duration",
                        render: () => null,
                    },
                ]}
                infoNote={<span>Some data may be missing or incomplete.</span>}
            />
            <CharacterActivityTable
                title="Online Activity"
                kind="online"
                selfSource="online"
                rows={onlineRows}
                onSelect={handleSelect("online")}
                selectedRange={selectedTimestampRange}
                lastSelectionSource={lastSelectionSource}
                selectionVersion={selectionVersion}
                filters={[
                    {
                        label: "Only show when I'm online",
                        checked: showOnlineOnly,
                        onChange: setShowOnlineOnly,
                    },
                ]}
                columns={[
                    {
                        key: "status",
                        header: "Status Activity",
                        render: (r) => renderStatus(r),
                    },
                    { key: "__time__", header: "Time", render: () => null },
                    {
                        key: "__duration__",
                        header: "Duration",
                        render: () => null,
                    },
                ]}
                infoNote={<span>Some data may be missing or incomplete.</span>}
            />
        </Stack>
    )

    return (
        <Page
            title="Character Activity History"
            description="View detailed information about your characters' activity history, including questing history, level history, login history, and more."
            pageMessages={() => {
                const messages = []
                if (characterDataState === LoadingState.Haulted)
                    messages.push(<LiveDataHaultedPageMessage />)
                if (isCharacterSelectionInvalid)
                    messages.push(
                        <PageMessage
                            title="Permission Denied"
                            type="error"
                            message="You don't have permission to view that character. Make sure you've registered and verified the character."
                        />
                    )
                if (
                    locationActivityIsError ||
                    onlineActivityIsError ||
                    levelActivityIsError
                ) {
                    messages.push(<DataLoadingErrorPageMessage />)
                }
                if (!hideActivityDevelopmentNotice) {
                    messages.push(
                        <PageMessage
                            title="Active Development"
                            message={
                                <span>
                                    This page is currently in active
                                    development. If you encounter any issues or
                                    have suggestions, please visit the{" "}
                                    <Link to="/feedback">Feedback page</Link>.
                                </span>
                            }
                            type="info"
                            onDismiss={() =>
                                setHideActivityDevelopmentNotice(true)
                            }
                        />
                    )
                }
                return messages
            }}
        >
            <ContentClusterGroup>
                <ContentCluster title="Character Activity">
                    {conditionalSelectionContent()}
                    {conditionalActivityContent()}
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Activity

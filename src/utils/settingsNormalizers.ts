import { LfmSortType } from "../models/Lfm.ts"
import type { LfmSortSetting } from "../models/Lfm.ts"
import { CharacterSortType } from "../models/Character.ts"
import type { CharacterSortBy } from "../models/Character.ts"
import type { AccessToken } from "../models/Verification.ts"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_LFM_PANEL_WIDTH,
    DEFAULT_MOUSE_OVER_DELAY,
    MAX_FONT_SIZE,
    MAXIMUM_MOUSE_OVER_DELAY,
    MIN_FONT_SIZE,
    MINIMUM_MOUSE_OVER_DELAY,
} from "../constants/lfmPanel.ts"
import {
    DEFAULT_CHARACTER_COUNT,
    DEFAULT_REFRESH_RATE,
    DEFAULT_WHO_PANEL_WIDTH,
    MAXIMUM_CHARACTER_COUNT,
    MAXIMUM_REFRESH_RATE,
    MINIMUM_CHARACTER_COUNT,
    MINIMUM_REFRESH_RATE,
} from "../constants/whoPanel.ts"
import { MIN_LEVEL, MAX_LEVEL, CLASS_LIST_LOWER } from "../constants/game.ts"

// ── Primitive helpers ─────────────────────────────────────────────────────────

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function coerceNumber(
    value: unknown,
    { min, max, def }: { min?: number; max?: number; def: number }
): number {
    const n = typeof value === "number" ? value : parseInt(String(value))
    if (isNaN(n)) return def
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
}

function coerceBool(value: unknown, def: boolean): boolean {
    if (typeof value === "boolean") return value
    if (value === undefined || value === null) return def
    return Boolean(value)
}

export function coerceNumberArray(value: unknown): number[] {
    return Array.isArray(value)
        ? value.filter((n): n is number => typeof n === "number")
        : []
}

function coerceStringArray(value: unknown, def: string[] = []): string[] {
    return Array.isArray(value)
        ? value.filter((s): s is string => typeof s === "string")
        : def
}

function coerceBooleanRecord(value: unknown): Record<string, boolean> {
    if (!isRecord(value)) return {}
    const result: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(value)) {
        if (typeof v === "boolean") result[k] = v
    }
    return result
}

// ── LFM settings ──────────────────────────────────────────────────────────────

export interface NormalizedLfmSettings {
    minLevel: number
    maxLevel: number
    filterByMyCharacters: boolean
    showNotEligible: boolean
    hideContentIDontOwn: boolean
    indicateContentIDontOwn: boolean
    ownedContent: string[]
    fontSize: number
    panelWidth: number
    showBoundingBoxes: boolean
    sortBy: LfmSortSetting
    isDynamicWidth: boolean
    showRaidTimerIndicator: boolean
    showMemberCount: boolean
    showQuestGuesses: boolean
    showQuestTips: boolean
    showCharacterGuildNames: boolean
    trackedCharacterIds: number[]
    showLfmPostedTime: boolean
    showQuestMetrics: boolean
    mouseOverDelay: number
    showLfmActivity: boolean
    isMultiColumn: boolean
    showEligibleCharacters: boolean
    hideGroupsPostedByIgnoredCharacters: boolean
    hideGroupsContainingIgnoredCharacters: boolean
    showIndicationForGroupsPostedByFriends: boolean
    showIndicationForGroupsContainingFriends: boolean
    highlightRaids: boolean
    hideAllLevelGroups: boolean
    showEligibilityDividers: boolean
    onlyShowRaids: boolean
    hideFullGroups: boolean
}

export function normalizeLfmSettings(input: unknown): NormalizedLfmSettings {
    const s = isRecord(input) ? input : {}
    const rawSort = isRecord(s.sortBy) ? s.sortBy : {}
    const sortBy: LfmSortSetting =
        rawSort.type !== undefined && typeof rawSort.ascending === "boolean"
            ? {
                  type: rawSort.type as LfmSortType,
                  ascending: rawSort.ascending,
              }
            : { type: LfmSortType.LEVEL, ascending: true }

    return {
        minLevel: coerceNumber(s.minLevel, {
            min: MIN_LEVEL,
            max: MAX_LEVEL,
            def: MIN_LEVEL,
        }),
        maxLevel: coerceNumber(s.maxLevel, {
            min: MIN_LEVEL,
            max: MAX_LEVEL,
            def: MAX_LEVEL,
        }),
        fontSize: coerceNumber(s.fontSize, {
            min: MIN_FONT_SIZE,
            max: MAX_FONT_SIZE,
            def: DEFAULT_BASE_FONT_SIZE,
        }),
        panelWidth: coerceNumber(s.panelWidth, {
            min: 100,
            max: 2000,
            def: DEFAULT_LFM_PANEL_WIDTH,
        }),
        mouseOverDelay: coerceNumber(s.mouseOverDelay, {
            min: MINIMUM_MOUSE_OVER_DELAY,
            max: MAXIMUM_MOUSE_OVER_DELAY,
            def: DEFAULT_MOUSE_OVER_DELAY,
        }),
        filterByMyCharacters: coerceBool(s.filterByMyCharacters, false),
        showNotEligible: coerceBool(s.showNotEligible, true),
        hideContentIDontOwn: coerceBool(s.hideContentIDontOwn, false),
        indicateContentIDontOwn: coerceBool(s.indicateContentIDontOwn, false),
        showBoundingBoxes: coerceBool(s.showBoundingBoxes, false),
        isDynamicWidth: coerceBool(s.isDynamicWidth, false),
        showRaidTimerIndicator: coerceBool(s.showRaidTimerIndicator, true),
        showMemberCount: coerceBool(s.showMemberCount, true),
        showQuestGuesses: coerceBool(s.showQuestGuesses, true),
        showQuestTips: coerceBool(s.showQuestTips, true),
        showCharacterGuildNames: coerceBool(s.showCharacterGuildNames, true),
        showLfmPostedTime: coerceBool(s.showLfmPostedTime, true),
        showQuestMetrics: coerceBool(s.showQuestMetrics, true),
        showLfmActivity: coerceBool(s.showLfmActivity, true),
        isMultiColumn: coerceBool(s.isMultiColumn, true),
        showEligibleCharacters: coerceBool(s.showEligibleCharacters, false),
        hideGroupsPostedByIgnoredCharacters: coerceBool(
            s.hideGroupsPostedByIgnoredCharacters,
            false
        ),
        hideGroupsContainingIgnoredCharacters: coerceBool(
            s.hideGroupsContainingIgnoredCharacters,
            false
        ),
        showIndicationForGroupsPostedByFriends: coerceBool(
            s.showIndicationForGroupsPostedByFriends,
            true
        ),
        showIndicationForGroupsContainingFriends: coerceBool(
            s.showIndicationForGroupsContainingFriends,
            true
        ),
        highlightRaids: coerceBool(s.highlightRaids, false),
        hideAllLevelGroups: coerceBool(s.hideAllLevelGroups, false),
        showEligibilityDividers: coerceBool(s.showEligibilityDividers, true),
        onlyShowRaids: coerceBool(s.onlyShowRaids, false),
        hideFullGroups: coerceBool(s.hideFullGroups, false),
        ownedContent: coerceStringArray(s.ownedContent),
        trackedCharacterIds: coerceNumberArray(s.trackedCharacterIds),
        sortBy,
    }
}

// ── WHO settings ──────────────────────────────────────────────────────────────

export interface NormalizedWhoSettings {
    stringFilter: string
    classNameFilter: string[]
    minLevel: number
    maxLevel: number
    isGroupView: boolean
    shouldIncludeRegion: boolean
    isExactMatch: boolean
    sortBy: CharacterSortBy
    panelWidth: number
    isDynamicWidth: boolean
    shouldSaveSettings: boolean
    shouldSaveClassFilter: boolean
    shouldSaveStringFilter: boolean
    shouldSaveLevelFilter: boolean
    shouldSaveSortBy: boolean
    shouldSaveGroupView: boolean
    shouldSaveExactMatch: boolean
    showInQuestIndicator: boolean
    showQuestName: boolean
    refreshInterval: number
    hideIgnoredCharacters: boolean
    pinRegisteredCharacters: boolean
    pinFriends: boolean
    alwaysShowRegisteredCharacters: boolean
    alwaysShowFriends: boolean
    maximumRenderedCharacterCount: number
}

export function normalizeWhoSettings(input: unknown): NormalizedWhoSettings {
    const s = isRecord(input) ? input : {}
    const rawSort = isRecord(s.sortBy) ? s.sortBy : {}
    const sortBy: CharacterSortBy =
        rawSort.type !== undefined && typeof rawSort.ascending === "boolean"
            ? {
                  type: rawSort.type as CharacterSortType,
                  ascending: rawSort.ascending,
              }
            : { type: CharacterSortType.Level, ascending: true }

    return {
        stringFilter: typeof s.stringFilter === "string" ? s.stringFilter : "",
        classNameFilter: coerceStringArray(
            s.classNameFilter,
            CLASS_LIST_LOWER as string[]
        ),
        minLevel: coerceNumber(s.minLevel, {
            min: MIN_LEVEL,
            max: MAX_LEVEL,
            def: MIN_LEVEL,
        }),
        maxLevel: coerceNumber(s.maxLevel, {
            min: MIN_LEVEL,
            max: MAX_LEVEL,
            def: MAX_LEVEL,
        }),
        panelWidth: coerceNumber(s.panelWidth, {
            min: 100,
            max: 2000,
            def: DEFAULT_WHO_PANEL_WIDTH,
        }),
        refreshInterval: coerceNumber(s.refreshInterval, {
            min: MINIMUM_REFRESH_RATE,
            max: MAXIMUM_REFRESH_RATE,
            def: DEFAULT_REFRESH_RATE,
        }),
        maximumRenderedCharacterCount: coerceNumber(
            s.maximumRenderedCharacterCount,
            {
                min: MINIMUM_CHARACTER_COUNT,
                max: MAXIMUM_CHARACTER_COUNT,
                def: DEFAULT_CHARACTER_COUNT,
            }
        ),
        isGroupView: coerceBool(s.isGroupView, false),
        shouldIncludeRegion: coerceBool(s.shouldIncludeRegion, false),
        isExactMatch: coerceBool(s.isExactMatch, false),
        isDynamicWidth: coerceBool(s.isDynamicWidth, false),
        shouldSaveSettings: coerceBool(s.shouldSaveSettings, false),
        shouldSaveClassFilter: coerceBool(s.shouldSaveClassFilter, false),
        shouldSaveStringFilter: coerceBool(s.shouldSaveStringFilter, false),
        shouldSaveLevelFilter: coerceBool(s.shouldSaveLevelFilter, false),
        shouldSaveSortBy: coerceBool(s.shouldSaveSortBy, false),
        shouldSaveGroupView: coerceBool(s.shouldSaveGroupView, false),
        shouldSaveExactMatch: coerceBool(s.shouldSaveExactMatch, false),
        showInQuestIndicator: coerceBool(s.showInQuestIndicator, true),
        showQuestName: coerceBool(s.showQuestName, true),
        hideIgnoredCharacters: coerceBool(s.hideIgnoredCharacters, true),
        pinRegisteredCharacters: coerceBool(s.pinRegisteredCharacters, true),
        pinFriends: coerceBool(s.pinFriends, true),
        alwaysShowRegisteredCharacters: coerceBool(
            s.alwaysShowRegisteredCharacters,
            false
        ),
        alwaysShowFriends: coerceBool(s.alwaysShowFriends, false),
        sortBy,
    }
}

// ── Top-level persistent settings ─────────────────────────────────────────────

export interface NormalizedPersistentSettings {
    "lfm-settings": NormalizedLfmSettings
    "who-settings": NormalizedWhoSettings
    "access-tokens": AccessToken[]
    "boolean-flags": Record<string, boolean>
    "dismissed-feature-callouts": string[]
    friends: number[]
    ignores: number[]
    "registered-characters": number[]
}

function normalizeAccessTokens(input: unknown): AccessToken[] {
    if (!Array.isArray(input)) return []
    return input.filter(
        (t): t is AccessToken =>
            isRecord(t) &&
            typeof t.character_id === "number" &&
            typeof t.access_token === "string"
    )
}

export function normalizeAllPersistentSettings(
    input: unknown
): NormalizedPersistentSettings {
    const s = isRecord(input) ? input : {}
    return {
        "lfm-settings": normalizeLfmSettings(s["lfm-settings"]),
        "who-settings": normalizeWhoSettings(s["who-settings"]),
        "access-tokens": normalizeAccessTokens(s["access-tokens"]),
        "boolean-flags": coerceBooleanRecord(s["boolean-flags"]),
        "dismissed-feature-callouts": coerceStringArray(
            s["dismissed-feature-callouts"]
        ),
        friends: coerceNumberArray(s.friends),
        ignores: coerceNumberArray(s.ignores),
        "registered-characters": coerceNumberArray(s["registered-characters"]),
    }
}

export function normalizePartialPersistentSettings(
    input: unknown,
    keys: string[]
): Partial<NormalizedPersistentSettings> {
    const full = normalizeAllPersistentSettings(input)
    return Object.fromEntries(
        keys
            .filter((k): k is keyof NormalizedPersistentSettings => k in full)
            .map((k) => [k, full[k]])
    ) as Partial<NormalizedPersistentSettings>
}

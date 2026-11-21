import { useCallback, useEffect, useRef, useState } from "react"
import { useAppContext } from "../../contexts/AppContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { useUserContext } from "../../contexts/UserContext"
import { AlertPreferences } from "../../models/Alert"
import {
    getAlertPreferences,
    putAlertPreferences,
} from "../../services/alertService"
import { isNotLoggedIn } from "../../services/authSession"
import logMessage from "../../utils/logUtils"
import {
    defaultQuietHours,
    effectiveTimezone,
    isValidQuietWindow,
} from "../../utils/quietHours"

const SAVE_DEBOUNCE_MS = 600

interface QuietHours {
    // Null until loaded.
    preferences: AlertPreferences | null
    isLoading: boolean
    loadFailed: boolean
    // True when the window can't be saved yet (e.g. start and end are the same).
    isInvalid: boolean
    isSaving: boolean
    update: (patch: Partial<AlertPreferences>) => void
    reload: () => Promise<void>
}

/** Account-wide quiet hours for alerts. Changes show immediately and save shortly after. */
function useQuietHours(): QuietHours {
    const { isLoggedIn, authedRequest } = useUserContext()
    const { timezoneOverride } = useAppContext()
    const { createNotification } = useNotificationContext()

    const [preferences, setPreferences] = useState<AlertPreferences | null>(
        null
    )
    const [isLoading, setIsLoading] = useState(false)
    const [loadFailed, setLoadFailed] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const latest = useRef<AlertPreferences | null>(null)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const timezoneRef = useRef(effectiveTimezone(timezoneOverride))
    timezoneRef.current = effectiveTimezone(timezoneOverride)

    const reload = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await authedRequest((token) =>
                getAlertPreferences(token)
            )
            const loaded = response.data
            // Never saved: start from the timezone the site is already showing.
            const next = loaded.saved
                ? loaded
                : defaultQuietHours(timezoneRef.current)
            latest.current = next
            setPreferences(next)
            setLoadFailed(false)
        } catch (error) {
            if (isNotLoggedIn(error)) return
            setLoadFailed(true)
            logMessage("Failed to load alert quiet hours", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
        } finally {
            setIsLoading(false)
        }
    }, [authedRequest])

    useEffect(() => {
        if (isLoggedIn) {
            void reload()
        } else {
            latest.current = null
            setPreferences(null)
        }
        // Reload only on login/logout, not on every access-token refresh.
    }, [isLoggedIn])

    const save = useCallback(async () => {
        const toSave = latest.current
        if (!toSave) return
        if (
            toSave.quiet_enabled &&
            !isValidQuietWindow(toSave.quiet_start, toSave.quiet_end)
        ) {
            return
        }
        setIsSaving(true)
        try {
            const response = await authedRequest((token) =>
                putAlertPreferences(token, toSave)
            )
            // Keep any edits made while this request was in flight.
            if (latest.current === toSave) {
                latest.current = response.data
                setPreferences(response.data)
            }
        } catch (error) {
            if (isNotLoggedIn(error)) return
            const message = (
                error as { response?: { data?: { error?: string } } }
            )?.response?.data?.error
            createNotification({
                title: "Couldn't save quiet hours",
                message:
                    typeof message === "string" && message
                        ? message
                        : "Please try again.",
                type: "error",
                ttl: 5000,
            })
            void reload()
        } finally {
            setIsSaving(false)
        }
    }, [authedRequest, createNotification, reload])

    const update = useCallback(
        (patch: Partial<AlertPreferences>) => {
            const current = latest.current
            if (!current) return
            const next = { ...current, ...patch }
            latest.current = next
            setPreferences(next)
            if (saveTimer.current) clearTimeout(saveTimer.current)
            saveTimer.current = setTimeout(() => void save(), SAVE_DEBOUNCE_MS)
        },
        [save]
    )

    useEffect(
        () => () => {
            // Don't lose a pending change when leaving the page.
            if (saveTimer.current) {
                clearTimeout(saveTimer.current)
                void save()
            }
        },
        [save]
    )

    const isInvalid =
        !!preferences &&
        preferences.quiet_enabled &&
        !isValidQuietWindow(preferences.quiet_start, preferences.quiet_end)

    return {
        preferences,
        isLoading,
        loadFailed,
        isInvalid,
        isSaving,
        update,
        reload,
    }
}

export default useQuietHours
export type { QuietHours }

// Per-device alert delivery preferences (stored in localStorage, not synced to the account, because
// whether a device should beep or show OS notifications depends on the device).
interface NotificationPreferences {
    osNotifications: boolean
    sound: boolean
    // The "turn on notifications" step was skipped or turned off on this device.
    setupDismissed: boolean
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = Object.freeze(
    {
        osNotifications: false,
        sound: true,
        setupDismissed: false,
    }
)

export type { NotificationPreferences }
export { DEFAULT_NOTIFICATION_PREFERENCES }

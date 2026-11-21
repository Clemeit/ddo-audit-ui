import React from "react"
import Switch from "../global/Switch"
import Button from "../global/Button"
import Skeleton from "../global/Skeleton"
import ValidationMessage from "../global/ValidationMessage"
import { useAppContext } from "../../contexts/AppContext"
import { AlertPreferences } from "../../models/Alert"
import {
    describeQuietWindow,
    effectiveTimezone,
    isValidQuietWindow,
} from "../../utils/quietHours"
import type { QuietHours as QuietHoursState } from "./useQuietHours"

interface Props {
    quietHours: QuietHoursState
}

/** "11:00 PM to 7:00 AM" while quiet hours are on and usable, otherwise null. For the collapsed card title. */
function activeQuietWindow(
    preferences: AlertPreferences | null
): string | null {
    if (
        !preferences ||
        !preferences.quiet_enabled ||
        !isValidQuietWindow(preferences.quiet_start, preferences.quiet_end)
    ) {
        return null
    }
    return describeQuietWindow(preferences.quiet_start, preferences.quiet_end)
}

/** The quiet-hours controls: account-wide, so shown as their own section inside the notifications card. */
const QuietHours = ({ quietHours }: Props) => {
    const { timezoneOverride } = useAppContext()
    const { preferences, isLoading, loadFailed, isInvalid, update, reload } =
        quietHours

    const heading = <h3 className="device-bar-heading">Quiet hours</h3>

    if (!preferences) {
        if (loadFailed) {
            return (
                <div className="device-bar-section">
                    {heading}
                    <p className="device-bar-status">
                        Couldn't load your quiet hours.{" "}
                        <Button type="text" small onClick={() => void reload()}>
                            Try again
                        </Button>
                    </p>
                </div>
            )
        }
        return isLoading ? (
            <div className="device-bar-section">
                {heading}
                <Skeleton width="100%" height="40px" />
            </div>
        ) : null
    }

    const { quiet_enabled, quiet_start, quiet_end, timezone } = preferences
    const currentTimezone = effectiveTimezone(timezoneOverride)
    const quietWindow = activeQuietWindow(preferences)

    return (
        <div className="device-bar-section">
            {heading}
            <p className="device-bar-status">
                {quietWindow
                    ? `No alerts from ${quietWindow} (${timezone}).`
                    : "Silence alerts during certain hours, like overnight."}
            </p>
            <div className="quiet-hours-switch">
                <Switch
                    checked={quiet_enabled}
                    onChange={(checked) => update({ quiet_enabled: checked })}
                    label="Quiet hours"
                />
                <span>{quiet_enabled ? "On" : "Off"}</span>
            </div>
            {quiet_enabled && (
                <>
                    <div className="quiet-hours-times">
                        <label className="quiet-hours-time">
                            <span>From</span>
                            <input
                                type="time"
                                value={quiet_start}
                                onChange={(e) =>
                                    update({ quiet_start: e.target.value })
                                }
                            />
                        </label>
                        <label className="quiet-hours-time">
                            <span>Until</span>
                            <input
                                type="time"
                                value={quiet_end}
                                onChange={(e) =>
                                    update({ quiet_end: e.target.value })
                                }
                            />
                        </label>
                    </div>
                    <ValidationMessage
                        type="error"
                        message="Pick two different times."
                        visible={isInvalid}
                    />
                    <p className="device-bar-status">
                        Times are in {timezone}.
                        {timezone !== currentTimezone && (
                            <>
                                {" "}
                                <Button
                                    type="text"
                                    small
                                    onClick={() =>
                                        update({ timezone: currentTimezone })
                                    }
                                >
                                    Use {currentTimezone}
                                </Button>
                            </>
                        )}
                    </p>
                </>
            )}
        </div>
    )
}

export default QuietHours
export { activeQuietWindow }

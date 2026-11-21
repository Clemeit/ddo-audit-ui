import React from "react"
import ExpandableContainer from "../global/ExpandableContainer"
import Switch from "../global/Switch"
import Button from "../global/Button"
import Skeleton from "../global/Skeleton"
import ValidationMessage from "../global/ValidationMessage"
import { useAppContext } from "../../contexts/AppContext"
import {
    describeQuietWindow,
    effectiveTimezone,
    isValidQuietWindow,
} from "../../utils/quietHours"
import type { QuietHours as QuietHoursState } from "./useQuietHours"

interface Props {
    quietHours: QuietHoursState
}

/** Account-wide quiet hours: a collapsed one-line card (like the device card) that expands into the settings. */
const QuietHours = ({ quietHours }: Props) => {
    const { timezoneOverride } = useAppContext()
    const { preferences, isLoading, loadFailed, isInvalid, update, reload } =
        quietHours

    if (!preferences && !loadFailed) {
        return isLoading ? <Skeleton width="100%" height="40px" /> : null
    }

    const renderCard = (
        title: string,
        isOn: boolean,
        panel: React.ReactNode
    ) => (
        <ExpandableContainer
            className={`device-bar quiet-hours-card device-bar-${isOn ? "on" : "off"}`}
            aria-label="Quiet hours"
            icon={<span className="device-bar-dot" aria-hidden />}
            title={title}
        >
            <div className="device-bar-panel">{panel}</div>
        </ExpandableContainer>
    )

    if (!preferences) {
        return renderCard(
            "Quiet hours",
            false,
            <p className="device-bar-status">
                Couldn't load your quiet hours.{" "}
                <Button type="text" small onClick={() => void reload()}>
                    Try again
                </Button>
            </p>
        )
    }

    const { quiet_enabled, quiet_start, quiet_end, timezone } = preferences
    const currentTimezone = effectiveTimezone(timezoneOverride)
    const validWindow = isValidQuietWindow(quiet_start, quiet_end)
    const isActive = quiet_enabled && validWindow

    return renderCard(
        isActive
            ? `Quiet hours: ${describeQuietWindow(quiet_start, quiet_end)}`
            : "Quiet hours are off",
        isActive,
        <>
            <p className="device-bar-status">
                {isActive
                    ? `No alerts from ${describeQuietWindow(
                          quiet_start,
                          quiet_end
                      )} (${timezone}). Alerts that happen then are skipped, not delayed.`
                    : "Skip alerts during certain hours, like overnight. Alerts that happen during quiet hours are skipped, not delayed."}
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
        </>
    )
}

export default QuietHours

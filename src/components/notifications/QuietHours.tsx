import React from "react"
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

const QuietHours = ({ quietHours }: Props) => {
    const { timezoneOverride } = useAppContext()
    const { preferences, isLoading, loadFailed, isInvalid, update, reload } =
        quietHours

    if (loadFailed) {
        return (
            <section className="quiet-hours" aria-labelledby="quiet-hours">
                <h2 id="quiet-hours">Quiet hours</h2>
                <p className="quiet-hours-note">
                    Couldn't load your quiet hours.{" "}
                    <Button type="text" small onClick={() => void reload()}>
                        Try again
                    </Button>
                </p>
            </section>
        )
    }
    if (!preferences) {
        return isLoading ? <Skeleton width="100%" height="64px" /> : null
    }

    const { quiet_enabled, quiet_start, quiet_end, timezone } = preferences
    const currentTimezone = effectiveTimezone(timezoneOverride)
    const validWindow = isValidQuietWindow(quiet_start, quiet_end)

    return (
        <section className="quiet-hours" aria-labelledby="quiet-hours">
            <div className="quiet-hours-header">
                <h2 id="quiet-hours">Quiet hours</h2>
                <Switch
                    checked={quiet_enabled}
                    onChange={(checked) => update({ quiet_enabled: checked })}
                    label="Quiet hours"
                />
            </div>
            <p className="quiet-hours-note">
                {quiet_enabled && validWindow
                    ? `No alerts from ${describeQuietWindow(
                          quiet_start,
                          quiet_end
                      )} (${timezone}). Alerts that happen then are skipped, not delayed.`
                    : "Skip alerts during certain hours, like overnight. Alerts that happen during quiet hours are skipped, not delayed."}
            </p>
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
                    <p className="quiet-hours-timezone">
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
        </section>
    )
}

export default QuietHours

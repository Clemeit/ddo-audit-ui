import { useState } from "react"
import { CharacterActivityData } from "../../models/Activity"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import LiveDuration from "../global/LiveDuration"

interface Props {
    onlineActivity: CharacterActivityData[]
}

const OnlineActivity = ({ onlineActivity }: Props) => {
    const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false)

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                Online Activity
            </h3>
            <Stack gap="15px" wrap style={{ rowGap: "0px" }}>
                <Checkbox
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    checked={showOnlineOnly}
                >
                    Only show when I'm online
                </Checkbox>
            </Stack>
            <div
                className="table-container"
                style={{
                    maxHeight: "410px",
                }}
            >
                <table>
                    <thead>
                        <tr>
                            <th>Status Activity</th>
                            <th>Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!onlineActivity ||
                            (onlineActivity.length === 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        No data to show
                                    </td>
                                </tr>
                            ))}
                        {onlineActivity?.map((activity, index) => {
                            if (
                                !showOnlineOnly ||
                                activity.data?.status === true
                            ) {
                                return (
                                    <tr key={`${activity.timestamp}-${index}`}>
                                        <td>
                                            {activity?.data?.status === true
                                                ? "Logged In"
                                                : "Logged Out"}
                                        </td>
                                        <td>
                                            {dateToShortStringWithTime(
                                                new Date(activity.timestamp)
                                            )}
                                        </td>
                                        <td>
                                            {index === 0 ? (
                                                <LiveDuration
                                                    start={activity.timestamp}
                                                    // live (now - start)
                                                    intervalMs={1000}
                                                    onlyWhenVisible
                                                    compact
                                                />
                                            ) : (
                                                convertMillisecondsToPrettyString(
                                                    new Date(
                                                        onlineActivity[
                                                            Math.max(
                                                                index - 1,
                                                                0
                                                            )
                                                        ].timestamp
                                                    ).getTime() -
                                                        new Date(
                                                            activity.timestamp
                                                        ).getTime(),
                                                    true,
                                                    true,
                                                    false,
                                                    2,
                                                    true
                                                )
                                            )}
                                        </td>
                                    </tr>
                                )
                            }
                            return null
                        })}
                    </tbody>
                </table>
            </div>
            <div>
                <InfoSVG
                    className="page-message-icon"
                    style={{ fill: `var(--info)` }}
                />
                <ColoredText color="secondary">
                    Some data may be missing or incomplete.
                </ColoredText>
            </div>
        </Stack>
    )
}

export default OnlineActivity

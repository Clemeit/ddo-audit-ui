import { useMemo, useState } from "react"
import { CharacterActivityData } from "../../models/Activity"
import { Quest } from "../../models/Lfm"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import LiveDuration from "../global/LiveDuration"
import { Area } from "../../models/Area"

interface Props {
    quests: { [key: number]: Quest }
    areas: { [key: number]: Area }
    locationActivity: CharacterActivityData[]
}

const LocationActivity = ({ quests, areas, locationActivity }: Props) => {
    const questsArray = useMemo(() => Object.values(quests), [quests])

    const getQuestForArea = (areaId: number): Quest | undefined => {
        return questsArray.find((quest) => quest.area_id === areaId)
    }

    const [hidePublicAreas, setHidePublicAreas] = useState<boolean>(false)
    const [hidewildernessAreas, setHidewildernessAreas] =
        useState<boolean>(false)
    const [discardLoggedOutTime, setDiscardLoggedOutTime] =
        useState<boolean>(false)

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                Location and Quest Activity
            </h3>
            <Stack gap="15px">
                <Checkbox
                    onChange={(e) => setHidePublicAreas(e.target.checked)}
                    checked={hidePublicAreas}
                >
                    Hide public areas
                </Checkbox>
                <Checkbox
                    onChange={(e) => setHidewildernessAreas(e.target.checked)}
                    checked={hidewildernessAreas}
                >
                    Hide wilderness areas
                </Checkbox>
                <Checkbox
                    onChange={(e) => setDiscardLoggedOutTime(e.target.checked)}
                    checked={discardLoggedOutTime}
                >
                    Don't count time logged out
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
                            <th>Location</th>
                            <th>Quest</th>
                            <th>Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!locationActivity ||
                            (locationActivity.length === 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        No data to show
                                    </td>
                                </tr>
                            ))}
                        {locationActivity?.map((activity, index) => {
                            const quest = getQuestForArea(
                                activity.data?.location_id
                            )
                            const isWilderness =
                                areas[activity.data?.location_id || 0]
                                    ?.is_wilderness

                            if (isWilderness && hidewildernessAreas) {
                                return null
                            }
                            if (hidePublicAreas && !quest) {
                                return null
                            }

                            return (
                                <tr>
                                    <td>
                                        {
                                            areas[
                                                activity.data?.location_id || 0
                                            ].name
                                        }
                                    </td>
                                    <td>
                                        {
                                            getQuestForArea(
                                                activity.data?.location_id
                                            )?.name
                                        }
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
                                                    locationActivity[
                                                        Math.max(index - 1, 0)
                                                    ].timestamp
                                                ).getTime() -
                                                    new Date(
                                                        activity.timestamp
                                                    ).getTime(),
                                                true,
                                                true
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
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
                    Not all quests are tracked. Some data may be missing or
                    incomplete.
                </ColoredText>
            </div>
        </Stack>
    )
}

export default LocationActivity

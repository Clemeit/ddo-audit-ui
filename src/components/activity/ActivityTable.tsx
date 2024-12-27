import React, { act } from "react"
import PropTypes from "prop-types"
import { ActivityEvent, CharacterActivityType } from "../../models/Activity.ts"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import "./ActivityTable.css"
import { mapClassesToString } from "../../utils/stringUtils.ts"
import { LoadingState } from "../../models/Api.ts"
import { RANSACK_HOURS } from "../../constants/game.ts"

const ActivityTable = ({
    characterActivity,
    activityType,
    loadingState,
    filter = "",
}) => {
    function renderTableHead() {
        if (activityType === CharacterActivityType.location) {
            return (
                <tr>
                    {filter && <th></th>}
                    <th>Timestamp</th>
                    <th>Location</th>
                    <th>Duration</th>
                </tr>
            )
        }

        if (activityType === CharacterActivityType.status) {
            return (
                <tr>
                    <th>Timestamp</th>
                    <th>Event</th>
                    <th>Duration</th>
                </tr>
            )
        }

        if (activityType === CharacterActivityType.total_level) {
            return (
                <tr>
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>Classes</th>
                    <th>Duration</th>
                </tr>
            )
        }

        return null
    }

    function renderTableBody() {
        if (loadingState === LoadingState.Loading) {
            return isLoadingRow
        }

        if (loadingState === LoadingState.Error) {
            return errorMessageRow
        }

        if (!characterActivity || characterActivity.length === 0) {
            return noAcitivtyMessageRow
        }

        const tableRows: JSX.Element[] = []

        let characterActivityConsolidated: ActivityEvent[] = []
        if (activityType === CharacterActivityType.location && filter) {
            characterActivityConsolidated = characterActivity
        } else {
            // if two consecutive activities have the same data, we can consolidate them
            characterActivityConsolidated = characterActivity.reduce(
                (acc: ActivityEvent[], activity: ActivityEvent, i: number) => {
                    const previousActivity = characterActivity[i + 1]

                    if (activityType === CharacterActivityType.location) {
                        if (
                            previousActivity &&
                            previousActivity.data?.id === activity.data?.id
                        ) {
                            return acc
                        }
                    } else if (activityType === CharacterActivityType.status) {
                        if (
                            previousActivity &&
                            previousActivity.data?.value ===
                                activity.data?.value
                        ) {
                            return acc
                        }
                    } else if (
                        activityType === CharacterActivityType.total_level
                    ) {
                        if (
                            previousActivity &&
                            previousActivity.data?.total_level ===
                                activity.data?.total_level
                        ) {
                            return acc
                        }
                    }
                    return [...acc, activity]
                },
                []
            )
        }

        // setup for ransack counting
        let ransackBoundaryRowShown = false
        let runCount = 0
        if (activityType === CharacterActivityType.location && filter) {
            runCount =
                characterActivityConsolidated.filter(
                    (activity: ActivityEvent) => {
                        if (activityType === CharacterActivityType.location) {
                            const filterMatch = activity.data.name
                                .toLowerCase()
                                .includes(filter.toLowerCase())
                            const isPastRansackBoundary =
                                (new Date().getTime() -
                                    new Date(activity.timestamp).getTime()) /
                                    1000 /
                                    60 /
                                    60 >=
                                RANSACK_HOURS
                            return filterMatch && !isPastRansackBoundary
                        }
                        return true
                    }
                ).length + 1
        }

        characterActivityConsolidated.forEach(
            (activity: ActivityEvent, i: number) => {
                const nextTimestamp = new Date(
                    characterActivityConsolidated[i - 1]?.timestamp
                )
                const timestamp = new Date(activity.timestamp)

                const timeDifferenceMilliseconds =
                    nextTimestamp.getTime() - timestamp.getTime()

                if (activityType === CharacterActivityType.location) {
                    if (
                        filter &&
                        !activity.data?.name
                            ?.toLowerCase()
                            .includes(filter.toLowerCase())
                    )
                        return
                    const isRansackBoundary =
                        (new Date().getTime() - timestamp.getTime()) /
                            1000 /
                            60 /
                            60 >=
                            RANSACK_HOURS && !ransackBoundaryRowShown
                    if (isRansackBoundary) ransackBoundaryRowShown = true
                    if (filter) runCount--
                    tableRows.push(
                        <tr
                            key={i}
                            className={
                                isRansackBoundary ? "ransack-boundary-row" : ""
                            }
                        >
                            {filter && (
                                <td className={runCount > 7 ? "red-text" : ""}>
                                    {(!ransackBoundaryRowShown ||
                                        (isRansackBoundary && runCount > 0)) &&
                                        runCount}
                                </td>
                            )}
                            <td>{timestamp.toLocaleString()}</td>
                            <td
                                className={
                                    activity.data.is_public_space
                                        ? ""
                                        : "orange-text"
                                }
                            >
                                {activity.data.name}
                            </td>
                            <td
                                className={
                                    activity.data.is_public_space
                                        ? ""
                                        : "orange-text"
                                }
                            >
                                {isNaN(timeDifferenceMilliseconds)
                                    ? "-"
                                    : convertMillisecondsToPrettyString(
                                          timeDifferenceMilliseconds
                                      )}
                            </td>
                        </tr>
                    )
                }

                if (activityType === CharacterActivityType.status) {
                    tableRows.push(
                        <tr key={i}>
                            <td>{timestamp.toLocaleString()}</td>
                            <td>
                                {activity.data.value ? (
                                    <span className="text-green-desaturated">
                                        Log in
                                    </span>
                                ) : (
                                    <span className="">Log off</span>
                                )}
                            </td>
                            <td
                                className={
                                    activity.data.value
                                        ? "text-green-desaturated"
                                        : ""
                                }
                            >
                                {isNaN(timeDifferenceMilliseconds)
                                    ? "-"
                                    : convertMillisecondsToPrettyString(
                                          timeDifferenceMilliseconds
                                      )}
                            </td>
                        </tr>
                    )
                }

                if (activityType === CharacterActivityType.total_level) {
                    tableRows.push(
                        <tr key={i}>
                            <td>{timestamp.toLocaleString()}</td>
                            <td>{activity.data.total_level}</td>
                            <td>{mapClassesToString(activity.data.classes)}</td>
                            <td>
                                {isNaN(timeDifferenceMilliseconds)
                                    ? "-"
                                    : convertMillisecondsToPrettyString(
                                          timeDifferenceMilliseconds
                                      )}
                            </td>
                        </tr>
                    )
                }
            }
        )

        return tableRows
    }

    const errorMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                Error loading activity
            </td>
        </tr>
    )

    const noAcitivtyMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                No activity to display
            </td>
        </tr>
    )

    const isLoadingRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                Loading...
            </td>
        </tr>
    )

    const tableHeader =
        activityType === CharacterActivityType.location
            ? "Location"
            : activityType === CharacterActivityType.status
              ? "Status"
              : "Level"

    return (
        <>
            <h2 className="activity-table-title">{tableHeader}</h2>
            {/* <div className="activity-table-filter-container">
                {renderFilters()}
            </div> */}
            <div className="activity-table-container">
                <table className="activity-table">
                    <thead>{renderTableHead()}</thead>
                    <tbody>{renderTableBody()}</tbody>
                </table>
            </div>
        </>
    )
}

ActivityTable.propTypes = {
    characterActivity: PropTypes.array,
    activityType: PropTypes.oneOf(Object.values(CharacterActivityType))
        .isRequired,
    loadingState: PropTypes.oneOf(Object.values(LoadingState)).isRequired,
}

export default ActivityTable

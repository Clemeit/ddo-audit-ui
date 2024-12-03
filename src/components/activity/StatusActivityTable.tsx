import React from "react"
import PropTypes from "prop-types"
import { ActivityEvent } from "../../models/Activity.ts"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import "./ActivityTable.css"

const StatusActivityTable = ({ characterActivity }) => {
    function renderTableHead() {
        return (
            <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Time since last activity</th>
            </tr>
        )
    }

    function renderTableBody() {
        const tableRows: JSX.Element[] = []

        characterActivity.forEach((activity: ActivityEvent, i: number) => {
            const timestamp = new Date(activity.timestamp)
            const nextTimestamp = new Date(characterActivity[i + 1]?.timestamp)

            const timeDifferenceMilliseconds =
                timestamp.getTime() - nextTimestamp.getTime()

            tableRows.push(
                <tr key={i}>
                    <td>{timestamp.toLocaleString()}</td>
                    <td>
                        {activity.data.value ? (
                            <span className="text-green-desaturated">
                                Log in
                            </span>
                        ) : (
                            <span className="text-red-desaturated">
                                Log off
                            </span>
                        )}
                    </td>
                    <td>
                        {isNaN(timeDifferenceMilliseconds)
                            ? "-"
                            : convertMillisecondsToPrettyString(
                                  timeDifferenceMilliseconds
                              )}
                    </td>
                </tr>
            )
        })

        return tableRows
    }

    return (
        <div className="table-container">
            <table className="activity-table">
                <thead>{renderTableHead()}</thead>
                <tbody>{renderTableBody()}</tbody>
            </table>
        </div>
    )
}

StatusActivityTable.propTypes = {
    characterActivity: PropTypes.array.isRequired,
}

export default StatusActivityTable

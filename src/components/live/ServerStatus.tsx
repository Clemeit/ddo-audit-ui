import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import "./ServerStatus.css"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import {
    convertMillisecondsToPrettyString,
    toSentenceCase,
} from "../../utils/stringUtils.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import { SERVER_NAMES, SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { LoadingState } from "../../models/Api.ts"

const ServerStatus = ({
    serverInfoData,
    serverInfoState,
}: {
    serverInfoData: ServerInfoApiDataModel | null
    serverInfoState: LoadingState
}) => {
    const mostRecentCheck = useMemo(() => {
        if (serverInfoData === null) {
            return {
                mostRecentStatusCheck: new Date(),
                timeDifferenceInSeconds: 0,
            }
        }

        const statusCheckTimesAsDates: Date[] = Object.values(serverInfoData)
            .map((server) => new Date(server.last_status_check + "Z"))
            .filter((date) => !isNaN(date.getTime())) // Filter out invalid dates
        const mostRecentStatusCheck = new Date(
            Math.max(...statusCheckTimesAsDates.map((date) => date.getTime()))
        )
        // get current time in UTC
        const currentTime = new Date()
        const timeDifferenceInSeconds = Math.floor(
            (currentTime.getTime() - mostRecentStatusCheck.getTime()) / 1000
        )
        return { mostRecentStatusCheck, timeDifferenceInSeconds }
    }, [serverInfoData])

    const isLoading = () => {
        return (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading ||
            serverInfoData === null ||
            Object.keys(serverInfoData).length === 0
        )
    }

    const lastCheckedMessage = () => {
        if (isLoading()) {
            return <span className="secondary-text">Loading...</span>
        }

        const { timeDifferenceInSeconds } = mostRecentCheck

        let delayStatementSpan = <span />
        if (timeDifferenceInSeconds < 10) {
            delayStatementSpan = (
                <span className="secondary-text">
                    just now <span className="orange-text">(live data)</span>
                </span>
            )
        } else if (timeDifferenceInSeconds < 30) {
            delayStatementSpan = (
                <span className="secondary-text">a few seconds ago</span>
            )
        } else if (timeDifferenceInSeconds < 60) {
            delayStatementSpan = (
                <span className="secondary-text">less than a minute ago</span>
            )
        } else if (timeDifferenceInSeconds < 120) {
            delayStatementSpan = (
                <span className="secondary-text">about a minute ago</span>
            )
        } else {
            delayStatementSpan = (
                <span className="secondary-text">
                    {convertMillisecondsToPrettyString(
                        timeDifferenceInSeconds * 1000,
                        true
                    )}{" "}
                    ago
                </span>
            )
        }

        return (
            <span className="secondary-text">
                Server status was last checked {delayStatementSpan}
            </span>
        )
    }

    const serverStatusDisplay = () => {
        if (isLoading()) {
            return (
                <div className="server-status-container">
                    {SERVER_NAMES.sort(([server_name_a], [server_name_b]) =>
                        server_name_a.localeCompare(server_name_b)
                    ).map((serverName) => (
                        <div key={serverName} className="server-status">
                            <Pending className="status-icon" title="Loading" />
                            <span>{serverName}</span>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div className="server-status-container">
                {Object.entries(serverInfoData || {})
                    .filter(([serverName]) =>
                        SERVER_NAMES_LOWER.includes(serverName)
                    )
                    .sort(([server_name_a], [server_name_b]) =>
                        server_name_a.localeCompare(server_name_b)
                    )
                    .map(([server_name, server_data]) => (
                        <div key={server_name} className="server-status">
                            <span>
                                {server_data.is_online ? (
                                    <Checkmark
                                        className="status-icon"
                                        title="Online"
                                    />
                                ) : (
                                    <X
                                        className="status-icon"
                                        title="Offline"
                                    />
                                )}
                            </span>
                            <span>{toSentenceCase(server_name)}</span>
                        </div>
                    ))}
            </div>
        )
    }

    const validationMessage = () => {
        if (serverInfoState !== LoadingState.Loaded) {
            return null
        }

        const { timeDifferenceInSeconds } = mostRecentCheck

        return (
            <ValidationMessage
                type="warning"
                message="The data is old and might not be accurate."
                visible={timeDifferenceInSeconds >= 120}
            />
        )
    }

    const display = () => {
        if (serverInfoState === LoadingState.Error) {
            return <p>Something went wrong. Please refresh the page.</p>
        }

        return (
            <div className="server-status-display">
                {lastCheckedMessage()}
                {validationMessage()}
                {serverStatusDisplay()}
            </div>
        )
    }

    return <div>{display()}</div>
}

export default ServerStatus

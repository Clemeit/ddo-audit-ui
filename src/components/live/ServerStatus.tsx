import React, { useCallback, useMemo } from "react"
import "./ServerStatus.css"
import { ServerInfo, ServerInfoApiDataModel } from "../../models/Game.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import {
    SERVER_NAMES,
    SERVER_NAMES_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../../constants/servers.ts"
import { LoadingState } from "../../models/Api.ts"

const ServerStatus = ({
    serverInfoData,
    serverInfoState,
    hide32BitServers,
}: {
    serverInfoData: ServerInfoApiDataModel | null
    serverInfoState: LoadingState
    hide32BitServers: boolean
}) => {
    const mostRecentStatusCheck = useMemo(() => {
        if (serverInfoData === null) {
            return new Date(0)
        }

        const statusCheckTimesAsDates: Date[] = Object.values(serverInfoData)
            .map((server) => new Date(server.last_status_check))
            .filter((date) => !isNaN(date.getTime())) // Filter out invalid dates

        // If no valid dates found, return epoch
        if (statusCheckTimesAsDates.length === 0) {
            return new Date(0)
        }

        const maxTime = Math.max(
            ...statusCheckTimesAsDates.map((date) => date.getTime())
        )
        const mostRecent = new Date(maxTime)

        // Additional safety check
        if (isNaN(mostRecent.getTime())) {
            return new Date(0)
        }

        return mostRecent
    }, [serverInfoData])

    const timeDifferenceInSeconds = useMemo(() => {
        if (serverInfoData === null || mostRecentStatusCheck.getTime() === 0) {
            return null
        }

        const currentTime = new Date()
        const timeDiff = Math.floor(
            (currentTime.getTime() - mostRecentStatusCheck.getTime()) / 1000
        )

        return timeDiff
    }, [serverInfoData, mostRecentStatusCheck])

    const isLoading = useCallback(() => {
        return (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading ||
            serverInfoData === null ||
            Object.keys(serverInfoData || {}).length === 0
        )
    }, [serverInfoState, serverInfoData])

    const lastCheckedMessage = useCallback(() => {
        if (isLoading()) {
            return <span className="secondary-text">Loading...</span>
        }

        const roundedDate = new Date(
            Math.floor(mostRecentStatusCheck.getTime() / 5000) * 5000
        )
        return (
            <span className="secondary-text">
                Server status was last checked at{" "}
                {roundedDate.toLocaleTimeString()}
            </span>
        )
    }, [isLoading, mostRecentStatusCheck])

    const filterServerNamePredicate = useCallback(
        (serverName: string) => {
            const validServerName = SERVER_NAMES_LOWER.includes(
                serverName?.toLowerCase()
            )
            const is32BitServer = SERVERS_32_BITS_LOWER.includes(
                serverName?.toLowerCase()
            )
            if (!validServerName) {
                return false
            }
            if (hide32BitServers && is32BitServer) {
                return false
            }
            return true
        },
        [hide32BitServers]
    )

    const serverStatusDisplay = useCallback(() => {
        if (isLoading()) {
            return (
                <div className="server-status-container">
                    {[...SERVER_NAMES]
                        .filter(filterServerNamePredicate)
                        .sort((server_name_a, server_name_b) =>
                            server_name_a.localeCompare(server_name_b)
                        )
                        .map((serverName) => (
                            <div key={serverName} className="server-status">
                                <Pending
                                    className="status-icon"
                                    title="Loading"
                                />
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
                        filterServerNamePredicate(serverName)
                    )
                    .sort(([server_name_a], [server_name_b]) =>
                        server_name_a.localeCompare(server_name_b)
                    )
                    .sort(
                        (
                            [, server_a_data]: [string, ServerInfo],
                            [, server_b_data]: [string, ServerInfo]
                        ) =>
                            (server_b_data.is_online ? 1 : 0) -
                            (server_a_data.is_online ? 1 : 0)
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
    }, [isLoading, serverInfoData, hide32BitServers])

    const validationMessage = useCallback(() => {
        if (serverInfoState !== LoadingState.Loaded) {
            return null
        }

        return (
            <ValidationMessage
                type="warning"
                message="The data is old and might not be accurate."
                visible={timeDifferenceInSeconds >= 120}
            />
        )
    }, [serverInfoState, timeDifferenceInSeconds])

    const display = useCallback(() => {
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
    }, [
        serverInfoState,
        lastCheckedMessage,
        validationMessage,
        serverStatusDisplay,
    ])

    return <div>{display()}</div>
}

export default ServerStatus

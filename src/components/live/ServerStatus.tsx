import React, { useEffect, useState, useRef } from "react"
import "./ServerStatus.css"
import { getServerInfo } from "../../services/gameService.ts"
import { ServerInfo } from "../../models/Game.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { toSentenceCase } from "../../utils/stringUtils.ts"

const ServerStatus = () => {
    const [pageLoadedAt] = useState(new Date())
    const [mustReload, setMustReload] = useState(false)
    const [serverInfo, setServerInfo] = useState<Record<string, ServerInfo>>({})
    const [isError, setIsError] = useState(true)

    let fetchServerInfoInterval = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        fetchServerInfo()
        fetchServerInfoInterval.current = setInterval(fetchServerInfo, 5000)
        return () => {
            if (fetchServerInfoInterval.current) {
                clearInterval(fetchServerInfoInterval.current)
            }
        }
    }, [])

    function fetchServerInfo() {
        // if the page has been loaded for more than 6 hours, stop fetching server info
        if (
            new Date().getTime() - pageLoadedAt.getTime() >
            6 * 60 * 60 * 1000
        ) {
            if (fetchServerInfoInterval.current)
                clearInterval(fetchServerInfoInterval.current)
            setMustReload(true)
            return
        }
        getServerInfo()
            .then((response) => {
                const responseData = response.data
                const serversDict = responseData.data.servers
                setServerInfo(serversDict)
                setIsError(false)
            })
            .catch(() => {
                setIsError(true)
            })
    }

    const display = () => {
        if (mustReload) {
            return (
                <p>
                    To continue viewing live server status, please refresh the
                    page.
                </p>
            )
        }

        if (isError || Object.keys(serverInfo).length === 0) {
            return <p>Looking for game servers...</p>
        }

        const statusCheckTimesAsDates: Date[] = Object.values(serverInfo)
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

        let delayStatementSpan = <span />
        if (timeDifferenceInSeconds < 10) {
            delayStatementSpan = (
                <span>
                    just now <span className="orange-text">(live data)</span>
                </span>
            )
        } else if (timeDifferenceInSeconds < 30) {
            delayStatementSpan = <span>a few seconds ago</span>
        } else if (timeDifferenceInSeconds < 60) {
            delayStatementSpan = <span>less than a minute ago</span>
        } else if (timeDifferenceInSeconds < 120) {
            delayStatementSpan = <span>about a minute ago</span>
        } else {
            delayStatementSpan = (
                <span>at {mostRecentStatusCheck.toString()}</span>
            )
        }

        return (
            <>
                <p>Server status was last checked {delayStatementSpan}</p>
                <div className="server-status-container">
                    {Object.entries(serverInfo)
                        .sort(([server_name_a], [server_name_b]) =>
                            server_name_a.localeCompare(server_name_b)
                        )
                        .map(([server_name, server_data]) => (
                            <div key={server_name} className="server-status">
                                <span>
                                    {server_data.is_online ? (
                                        <Checkmark />
                                    ) : (
                                        <X />
                                    )}
                                </span>
                                <span>{toSentenceCase(server_name)}</span>
                            </div>
                        ))}
                </div>
            </>
        )
    }

    return <div>{display()}</div>
}

export default ServerStatus

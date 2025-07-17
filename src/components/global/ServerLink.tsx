import React from "react"
import { SERVER_NAMES_LOWER } from "../../constants/servers"
import Link from "./Link"
import { toSentenceCase } from "../../utils/stringUtils"

interface Props {
    serverName?: string
}

const ServerLink = ({ serverName }: Props) => {
    const serverNameNormalized = (serverName || "").toLowerCase()
    const knownServer = SERVER_NAMES_LOWER.includes(serverNameNormalized)
    if (knownServer) {
        return (
            <Link to={`/servers/${serverNameNormalized}`}>
                {toSentenceCase(serverNameNormalized)}
            </Link>
        )
    } else {
        return <span>Unknown</span>
    }
}

export default ServerLink

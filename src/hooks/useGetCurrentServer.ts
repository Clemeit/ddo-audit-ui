import { useLocation } from "react-router-dom"
import {
    toSentenceCase,
    toPossessiveCase,
    levenshteinDistance,
} from "../utils/stringUtils.ts"
import {
    SERVER_NAMES_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../constants/servers.ts"
import { useMemo } from "react"
import { MAX_LEVENSHTEIN_DISTANCE } from "../constants/client.ts"

const useGetCurrentServer = () => {
    const location = useLocation()
    const serverName = location.pathname.split("/")[2] || ""

    const isValidServer = SERVER_NAMES_LOWER.includes(serverName.toLowerCase())

    const closestMatch = useMemo(() => {
        if (isValidServer) return serverName.toLowerCase()
        let closestDistance = MAX_LEVENSHTEIN_DISTANCE
        let closestName: string | undefined = undefined
        SERVER_NAMES_LOWER.forEach((name) => {
            const distance = levenshteinDistance(name, serverName.toLowerCase())
            if (distance < closestDistance) {
                closestDistance = distance
                closestName = name
            }
        })
        return closestName
    }, [serverName, isValidServer])

    return {
        serverName,
        serverNameLowercase: serverName.toLowerCase(),
        serverNameSentenceCase: toSentenceCase(serverName),
        serverNamePossessiveCase: toPossessiveCase(toSentenceCase(serverName)),
        isValidServer,
        closestMatch,
        is32BitServer: SERVERS_32_BITS_LOWER.includes(serverName.toLowerCase()),
    }
}

export default useGetCurrentServer

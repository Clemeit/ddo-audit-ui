import React from "react"
import { useLocation } from "react-router-dom"
import { toSentenceCase, toPossessiveCase } from "../utils/stringUtils.ts"

const useGetCurrentServer = () => {
    const location = useLocation()
    const serverName = location.pathname.split("/")[2] || ""

    return {
        serverNameLowercase: serverName.toLowerCase(),
        serverNameSentenceCase: toSentenceCase(serverName),
        serverNamePossessiveCase: toPossessiveCase(toSentenceCase(serverName)),
    }
}

export default useGetCurrentServer
import React from "react"
import {
    ErrorGettingRegisteredCharacters,
    NoRegisteredCharacters,
} from "../global/CommonMessages.tsx"
import Link from "../global/Link.tsx"
import { pluralize } from "../../utils/stringUtils.ts"

interface Props {
    isError: boolean
    isLoaded: boolean
    initialCharacterLoadDone: boolean
    registeredCharactersCount: number
}

const TimersHeader = ({
    isError,
    isLoaded,
    initialCharacterLoadDone,
    registeredCharactersCount,
}: Props) => {
    if (isError) return <ErrorGettingRegisteredCharacters />

    if (!isLoaded && !initialCharacterLoadDone) {
        return <p>Loading...</p>
    }

    if (registeredCharactersCount === 0) {
        return <NoRegisteredCharacters />
    }

    return (
        <p>
            Showing timers for{" "}
            <span className="orange-text">
                {registeredCharactersCount} registered{" "}
                {pluralize("character", registeredCharactersCount)}
            </span>
            .{" "}
            <Link to="/registration" className="link">
                Register more
            </Link>
            .
        </p>
    )
}

export default TimersHeader

import React, { useState, useEffect } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import VerificationTable from "./VerificationTable.tsx"
import { Character } from "../../models/Character.ts"
import { getCharacterById } from "../../services/characterService.ts"
import { Link } from "react-router-dom"

interface AccessToken {
    character_id: string
    access_token: string
}

const Page1 = ({
    setPage,
    setCharacter,
}: {
    setPage: Function
    setCharacter: Function
}) => {
    // Registered characters:
    const [, setRegisteredCharacterIds] = useState<string[]>([])
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])

    // Verified characters:
    const [verifiedCharacterIds, setVerifiedCharacterIds] = useState<string[]>(
        []
    )

    useEffect(() => {
        // get registered character ids and access tokens from local storage
        refreshCharacters()
    }, [])

    function removeCharacter(character: Character) {
        const accessTokens = JSON.parse(
            localStorage.getItem("access-tokens") || "[]"
        )
        const newAccessTokens = accessTokens.filter(
            (token: AccessToken) => token.character_id !== character.id
        )
        localStorage.setItem("access-tokens", JSON.stringify(newAccessTokens))
        refreshCharacters()
    }

    function refreshCharacters() {
        const registeredCharacterIds = JSON.parse(
            localStorage.getItem("registered-characters") || "[]"
        )
        const accessTokens = JSON.parse(
            localStorage.getItem("access-tokens") || "[]"
        )
        const verifiedCharacterIds = accessTokens.map(
            (token: AccessToken) => token.character_id
        )

        setRegisteredCharacterIds(registeredCharacterIds)
        setVerifiedCharacterIds(verifiedCharacterIds)

        // fetch character data
        const promises = registeredCharacterIds.map((id: string) =>
            getCharacterById(id)
        )
        Promise.all(promises).then((responses) => {
            const characters = responses
                .map((response) => response.data.data)
                .filter((character) => character)
            setRegisteredCharacters(characters)
        })
    }

    return (
        <>
            <ContentCluster title="Verify Your Characters">
                <p>Verify your characters to access additional information.</p>
                <VerificationTable
                    characters={registeredCharacters}
                    verifiedCharacters={verifiedCharacterIds}
                    selectCharacter={(character: Character) => {
                        setCharacter(character)
                        setPage(2)
                    }}
                    removeCharacter={(character: Character) => {
                        removeCharacter(character)
                    }}
                />
                <p>
                    Not seeing your characters? Go to{" "}
                    <Link className="link" to="/registration">
                        Character Registration
                    </Link>{" "}
                    to add them!
                </p>
            </ContentCluster>
            <ContentCluster title="Benefits">
                <p>
                    Verifying your character gives you access to additional
                    information such as:
                </p>
                <ul>
                    <li>
                        Questing history - what quests you've ran, when you ran
                        them, and how long they took
                    </li>
                    <li>
                        Level history - when you level up and how long each
                        level took to complete
                    </li>
                    <li>
                        Login history - when you log in and log out, daily and
                        weekly playtime
                    </li>
                    <li>
                        Giuild members - information that you'd find in the
                        Guild tab of the social panel
                    </li>
                </ul>
                <p>
                    Character verification is entirely optional. This process is
                    easy and does not require login credentials or personal
                    information.{" "}
                    <span className="orange-text">
                        We will never ask for your username or password. Do not
                        provide this information to us!
                    </span>
                </p>
                <p>
                    Note: Access tokens will be stored in your browser's local
                    storage. If you clear your browser's cookies, you will need
                    to verify your characters again.
                </p>
            </ContentCluster>
        </>
    )
}

export default Page1

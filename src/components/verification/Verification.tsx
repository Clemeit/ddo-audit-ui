import React, { useState, useEffect } from "react"
import Page from "../global/Page.tsx"
import "./Verification.css"
import { Character } from "../../models/Character.ts"
import usePagination from "../../hooks/usePagination.ts"
import { AccessToken } from "../../models/Verification.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import Page3 from "./Page3.tsx"
import { useLocation } from "react-router-dom"
import { getCharacterById } from "../../services/characterService.ts"

const VerificationPage = () => {
    const location = useLocation()
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: true,
    })

    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
        null
    )
    const [pendingAccessToken, setPendingAccessToken] =
        useState<AccessToken | null>(null)

    useEffect(() => {
        if (currentPage === 1) {
            setCurrentCharacter(null)
            setPendingAccessToken(null)

            const id = new URLSearchParams(location.search).get("id")
            if (id) {
                getCharacterById(id)
                    .then((response) => {
                        setCurrentCharacter(response.data.data)
                        // push /registration to history so that the user can
                        // navigate back to the registration page
                        window.history.pushState({}, "", "/registration")
                        setPage(2)
                    })
                    .catch(() => {})
            }
        }
    }, [currentPage])

    return (
        <Page
            title="DDO Character Verification"
            description="Verify your characters to access detailed information such as questing history, level history, login history, and more."
        >
            {currentPage === 1 && (
                <Page1 setPage={setPage} setCharacter={setCurrentCharacter} />
            )}
            {currentPage === 2 && (
                <Page2
                    setPage={setPage}
                    setPendingAccessToken={setPendingAccessToken}
                    character={currentCharacter}
                />
            )}
            {currentPage === 3 && (
                <Page3
                    setPage={setPage}
                    accessToken={pendingAccessToken}
                    character={currentCharacter}
                />
            )}
        </Page>
    )
}

export default VerificationPage

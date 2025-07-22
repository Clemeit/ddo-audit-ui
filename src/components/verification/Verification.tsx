import React, { useState, useEffect } from "react"
import Page from "../global/Page.tsx"
import "./Verification.css"
import { Character } from "../../models/Character.ts"
import usePagination from "../../hooks/usePagination.ts"
import { AccessToken } from "../../models/Verification.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import { useLocation, useNavigate } from "react-router-dom"
import { getCharacterById } from "../../services/characterService.ts"
import { getAccessTokens as getAccessTokensFromLocalStorage } from "../../utils/localStorage.ts"

const VerificationPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isLoaded, setIsLoaded] = useState(false)
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: false,
        maxPage: 2,
    })

    const accessTokens = getAccessTokensFromLocalStorage()

    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
        null
    )
    const [pendingAccessToken, setPendingAccessToken] =
        useState<AccessToken | null>(null)

    useEffect(() => {
        if (currentPage === 1) {
            const id = new URLSearchParams(location.search).get("id")
            if (id) {
                getCharacterById(id)
                    .then((response) => {
                        setCurrentCharacter(response.data)
                        setIsLoaded(true)
                    })
                    .catch(() => {})
            } else {
                window.history.replaceState({}, "", "/registration")
                navigate("/registration")
            }
        } else if (currentPage === 2) {
            if (!pendingAccessToken) {
                window.history.replaceState({}, "", "/registration")
                navigate("/registration")
            }
        }
    }, [currentPage])

    return (
        <Page
            title="DDO Character Verification"
            description="Verify your characters to access detailed information such as questing history, level history, login history, and more."
        >
            {currentPage === 1 && (
                <Page1
                    setPage={setPage}
                    setPendingAccessToken={setPendingAccessToken}
                    character={currentCharacter}
                    isLoaded={isLoaded}
                    firstTime={accessTokens.length === 0}
                />
            )}
            {currentPage === 2 && (
                <Page2
                    setPage={setPage}
                    accessToken={pendingAccessToken}
                    character={currentCharacter}
                    isLoaded={isLoaded}
                    firstTime={accessTokens.length === 0}
                />
            )}
        </Page>
    )
}

export default VerificationPage

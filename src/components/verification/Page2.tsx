import React, { useState, useEffect, useRef } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import { Link } from "react-router-dom"
import { addAccessToken } from "../../utils/localStorage.ts"
import { useNavigate } from "react-router-dom"

const Page2 = ({
    setPage,
    accessToken,
    character,
    isLoaded,
}: {
    setPage: Function
    accessToken: AccessToken | null
    character: Character | null
    isLoaded: boolean
}) => {
    const navigate = useNavigate()
    let pollVerificationEndpointTimeout = useRef<NodeJS.Timeout | null>(null)
    let navigateToNextPageTimeout = useRef<NodeJS.Timeout | null>(null)

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    function addCharacterAccessToken() {
        if (accessToken) addAccessToken(accessToken)
    }

    function pollVerificationChallenge() {
        if (accessToken?.character_id) {
            getVerificationChallengeByCharacterId(accessToken?.character_id)
                .then((response) => {
                    const verificationResponse: Verification =
                        response.data.data
                    setVerificationChallenge(verificationResponse)

                    // check
                    if (!verificationResponse.challenge_word_match) {
                        if (pollVerificationEndpointTimeout.current)
                            clearInterval(
                                pollVerificationEndpointTimeout.current
                            )
                        addCharacterAccessToken()
                        if (navigateToNextPageTimeout.current)
                            clearInterval(navigateToNextPageTimeout.current)
                        navigateToNextPageTimeout.current = setTimeout(() => {
                            navigate("/registration")
                        }, 1000)
                    }
                })
                .catch(() => {})
        }
    }

    useEffect(() => {
        // get the character id from the URL
        if (accessToken?.character_id) {
            pollVerificationChallenge()

            // start polling the verification endpoint
            pollVerificationEndpointTimeout.current = setInterval(() => {
                pollVerificationChallenge()
            }, 1000)
        }

        return () => {
            if (pollVerificationEndpointTimeout.current)
                clearInterval(pollVerificationEndpointTimeout.current)
            if (navigateToNextPageTimeout.current)
                clearInterval(navigateToNextPageTimeout.current)
        }
    }, [])

    return (
        <>
            {!character && (
                <ContentCluster title="Oops! Something Went Wrong">
                    <p>
                        To verify a character, head over to the{" "}
                        <Link className="link" to="/registration">
                            Registration page
                        </Link>{" "}
                        and click "Verify" for any character in the list.
                    </p>
                    <p>
                        If you got here by refreshing the page, just head back
                        to the Registration page to start the process again.
                    </p>
                </ContentCluster>
            )}
            {!!character && (
                <ContentCluster title="Verify Character">
                    <p>
                        One last step. <b>Remove</b> the verification code from
                        the Public Comment field in the Social Panel.
                    </p>
                    <p>
                        Hint: With the Comment field blank, click the Submit
                        button.
                    </p>
                    <p>Here's the checklist:</p>
                    <ul>
                        <li>
                            <strong>Step 1:</strong> Code has been removed from
                            the Public Comment field{" "}
                            {verificationChallenge &&
                            !verificationChallenge.challenge_word_match ? (
                                <Checkmark className="step-icon" />
                            ) : (
                                <X className="step-icon" />
                            )}
                        </li>
                    </ul>
                    <p className="secondary-text">
                        This page will automatically refresh. Do not refresh
                        this page.
                    </p>
                </ContentCluster>
            )}
        </>
    )
}

export default Page2

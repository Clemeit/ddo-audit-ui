import React, { useState, useEffect, useRef } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-ignore
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import { Link } from "react-router-dom"

const Page3 = ({
    setPage,
    accessToken,
    character,
}: {
    setPage: Function
    accessToken: AccessToken | null
    character: Character | null
}) => {
    let pollVerificationEndpointTimeout = useRef<NodeJS.Timeout | null>(null)
    let navigateToNextPageTimeout = useRef<NodeJS.Timeout | null>(null)

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    function addCharacterAccessToken() {
        const accessTokens = JSON.parse(
            localStorage.getItem("access-tokens") || "[]"
        )
        // if the character id is already in the list, update the access token
        const existingTokenIndex = accessTokens.findIndex(
            (token: AccessToken) =>
                token.character_id === accessToken?.character_id
        )
        if (existingTokenIndex !== -1) {
            accessTokens[existingTokenIndex] = accessToken
        } else {
            accessTokens.push(accessToken)
        }
        localStorage.setItem("access-tokens", JSON.stringify(accessTokens))
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
                            setPage(1)
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
                        <Link className="link" to="/verification">
                            Verification page
                        </Link>{" "}
                        and select a character from the list.
                    </p>
                    <p>
                        If you got here by refreshing the page, just head back
                        to the Verification page to start the process again.
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

export default Page3
import React, { useState, useEffect, useRef } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import { Character } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-ignore
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import Spacer from "../global/Spacer.tsx"
import { Link } from "react-router-dom"

const Page2 = ({
    setPage,
    setPendingAccessToken,
    character,
}: {
    setPage: Function
    setPendingAccessToken: Function
    character: Character | null
}) => {
    let pollVerificationEndpointTimeout = useRef<NodeJS.Timeout | null>(null)
    let navigateToNextPageTimeout = useRef<NodeJS.Timeout | null>(null)

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    function pollVerificationChallenge() {
        if (character && character.id) {
            getVerificationChallengeByCharacterId(character.id!)
                .then((response) => {
                    const verificationResponse: Verification =
                        response.data.data
                    setVerificationChallenge(verificationResponse)

                    // check
                    if (verificationResponse.challenge_passed) {
                        if (pollVerificationEndpointTimeout.current)
                            clearInterval(
                                pollVerificationEndpointTimeout.current
                            )
                        const accessToken: AccessToken = {
                            character_id: character.id,
                            access_token: verificationResponse.access_token,
                        }
                        setPendingAccessToken(accessToken)
                        if (navigateToNextPageTimeout.current)
                            clearInterval(navigateToNextPageTimeout.current)
                        navigateToNextPageTimeout.current = setTimeout(() => {
                            setPage(3)
                        }, 1000)
                    }
                })
                .catch((error) => {})
        }
    }

    useEffect(() => {
        if (!character) return
        if (character.id) {
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
    }, [character])

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
                        to the Verification page and select the character again.
                    </p>
                </ContentCluster>
            )}
            {!!character && (
                <ContentCluster title="Verify Character">
                    <p>
                        To verify{" "}
                        <span className="orange-text">
                            {character?.name || "your character"}
                        </span>
                        , you will need to log into{" "}
                        <span className="orange-text">
                            {character?.server_name || "the game"}
                        </span>{" "}
                        and enter the following text in the Public Comment field
                        found at the bottom of the Who tab in the Social Panel.
                        There's nothing special about this text. It's just a
                        random code to verify that you have access to the
                        character.
                    </p>
                    <code className="verification-code">
                        {verificationChallenge?.challenge_word || (
                            <span>&nbsp;</span>
                        )}
                    </code>
                    <p>
                        Hint: Open the Social Panel. Go to the "Who" tab.
                        There's a Comment field and a Submit button at the
                        bottom.
                    </p>
                    <p>Here's the checklist:</p>
                    <ul>
                        <li>
                            <strong>Step 1:</strong> Character is online{" "}
                            {verificationChallenge &&
                            verificationChallenge.is_online ? (
                                <Checkmark className="step-icon" />
                            ) : (
                                <X className="step-icon" />
                            )}
                        </li>
                        <li>
                            <strong>Step 2:</strong> Character is not anonymous{" "}
                            {verificationChallenge &&
                            !verificationChallenge.is_anonymous ? (
                                <Checkmark className="step-icon" />
                            ) : (
                                <X className="step-icon" />
                            )}
                        </li>
                        <li>
                            <strong>Step 3:</strong> Code is entered in the
                            Public Comment field on the Who tab{" "}
                            {verificationChallenge &&
                            verificationChallenge.challenge_word_match ? (
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
                    <Spacer size="10px" />
                    <Stack gap="10px" fullWidth justify="space-between">
                        <Button
                            text="Back"
                            type="secondary"
                            onClick={() => window.history.back()}
                        />
                    </Stack>
                </ContentCluster>
            )}
        </>
    )
}

export default Page2
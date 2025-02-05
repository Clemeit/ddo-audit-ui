import React, { useState, useEffect, useRef, useCallback } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import Spacer from "../global/Spacer.tsx"
import ExpandableContainer from "../global/ExpandableContainer.tsx"
import { useNavigate } from "react-router-dom"
import "./Verification.css"
import PageMessage from "../global/PageMessage.tsx"

const Page1 = ({
    setPage,
    setPendingAccessToken,
    character,
    isLoaded,
}: {
    setPage: Function
    setPendingAccessToken: Function
    character: Character | null
    isLoaded: boolean
}) => {
    const pageTimeout = 1000 * 60 * 5
    const [pageLoadedTimestamp] = useState<number>(Date.now())
    const [isPageTimeout, setIsPageTimeout] = useState<boolean>(false)
    const navigate = useNavigate()
    const pollVerificationEndpointTimeout = useRef<NodeJS.Timeout | null>(null)
    const navigateToNextPageTimeout = useRef<NodeJS.Timeout | null>(null)

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    const pollVerificationChallenge = useCallback(() => {
        if (Date.now() - pageLoadedTimestamp > pageTimeout) {
            setIsPageTimeout(true)
            return
        }
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
                            setPage(2)
                        }, 1000)
                    }
                })
                .catch((error) => {})
        }
    }, [
        pollVerificationEndpointTimeout,
        character,
        setPage,
        setPendingAccessToken,
    ])

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
        <ContentCluster title="Verify Character">
            {isPageTimeout && (
                <PageMessage
                    type="error"
                    title="Page Timeout"
                    message="This page has timed out. Please refresh the page to try again."
                />
            )}
            <ExpandableContainer title="What is this?">
                <ContentCluster>
                    <p>
                        Verifying your character gives you access to additional
                        information such as:
                    </p>
                    <ul>
                        <li>Raid and ransack timers</li>
                        <li>
                            Questing history - what quests you've ran, when you
                            ran them, and how long they took
                        </li>
                        <li>
                            Level history - when you level up and how long each
                            level took to complete
                        </li>
                        <li>
                            Guild members - information that you'd find in the
                            Guild tab of the social panel
                        </li>
                    </ul>
                    <p>
                        Character verification is entirely optional. This
                        process does <strong>not</strong> require login
                        credentials or personal information.{" "}
                        <span className="orange-text">
                            We will never ask for your username or password.
                        </span>
                    </p>
                    <p>
                        Access tokens will be stored as cookies. If you clear
                        your cookies, you will need to verify your characters
                        again.
                    </p>
                </ContentCluster>
            </ExpandableContainer>
            <p>
                To verify that you have access to{" "}
                <span className="orange-text">
                    {character?.name || "your character"}
                </span>
                , you will need to log into{" "}
                <span className="orange-text">
                    {character?.server_name || "the game"}
                </span>{" "}
                and enter the following text in the Public Comment field found
                at the bottom of the Who tab in the Social Panel.
            </p>
            <code className="verification-code">
                {verificationChallenge?.challenge_word || <span>&nbsp;</span>}
            </code>
            <ExpandableContainer title="Show me how">
                <div className="comment-field-demo" />
            </ExpandableContainer>
            <p>Here's the checklist:</p>
            <ul>
                <li>
                    {verificationChallenge &&
                    verificationChallenge.is_online ? (
                        <Checkmark className="step-icon" />
                    ) : (
                        <X className="step-icon" />
                    )}{" "}
                    <strong>Step 1:</strong> Character is online
                </li>
                <li>
                    {verificationChallenge &&
                    !verificationChallenge.is_anonymous ? (
                        <Checkmark className="step-icon" />
                    ) : (
                        <X className="step-icon" />
                    )}{" "}
                    <strong>Step 2:</strong> Character is not anonymous
                </li>
                <li>
                    {verificationChallenge &&
                    verificationChallenge.challenge_word_match ? (
                        <Checkmark className="step-icon" />
                    ) : (
                        <X className="step-icon" />
                    )}{" "}
                    <strong>Step 3:</strong> Code is entered in the Public
                    Comment field on the Who tab
                </li>
            </ul>
            <p className="secondary-text">
                This page will automatically refresh. Do not refresh this page.
            </p>
            <Spacer size="10px" />
            <Stack gap="10px" fullWidth justify="space-between">
                <Button
                    type="secondary"
                    onClick={() => navigate("/registration")}
                >
                    Back
                </Button>
            </Stack>
        </ContentCluster>
    )
}

export default Page1

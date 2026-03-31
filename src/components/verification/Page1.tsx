import React, { useState, useEffect, useRef, useCallback } from "react"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as Info } from "../../assets/svg/info.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import Spacer from "../global/Spacer.tsx"
import ExpandableContainer from "../global/ExpandableContainer.tsx"
import { useNavigate } from "react-router-dom"
import "./Verification.css"
import PageMessage from "../global/PageMessage.tsx"
import logMessage from "../../utils/logUtils.ts"

const Page1 = ({
    setPage,
    setPendingAccessToken,
    character,
    isLoaded,
    firstTime,
}: {
    setPage: Function
    setPendingAccessToken: Function
    character: Character | null
    isLoaded: boolean
    firstTime: boolean
}) => {
    const pageTimeout = 1000 * 60 * 5
    const [pageLoadedTimestamp] = useState<number>(Date.now())
    const [isPageTimeout, setIsPageTimeout] = useState<boolean>(false)
    const navigate = useNavigate()
    const pollVerificationEndpointTimeout = useRef<NodeJS.Timeout | null>(null)
    const navigateToNextPageTimeout = useRef<NodeJS.Timeout | null>(null)
    const isPollingRef = useRef<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    const pollVerificationChallenge = useCallback(async () => {
        if (Date.now() - pageLoadedTimestamp > pageTimeout) {
            setIsPageTimeout(true)
            if (pollVerificationEndpointTimeout.current) {
                clearInterval(pollVerificationEndpointTimeout.current)
            }
            return
        }
        if (isPollingRef.current) {
            return
        }
        if (character && character.id) {
            isPollingRef.current = true
            try {
                const response = await getVerificationChallengeByCharacterId(
                    character.id
                )
                const verificationResponse = response?.data

                if (!verificationResponse) {
                    return
                }

                setVerificationChallenge(verificationResponse)

                if (verificationResponse.challenge_passed) {
                    if (pollVerificationEndpointTimeout.current) {
                        clearInterval(pollVerificationEndpointTimeout.current)
                        const accessToken: AccessToken = {
                            character_id: character.id,
                            access_token: verificationResponse.access_token,
                        }
                        setPendingAccessToken(accessToken)
                        if (navigateToNextPageTimeout.current)
                            clearTimeout(navigateToNextPageTimeout.current)
                        navigateToNextPageTimeout.current = setTimeout(() => {
                            setPage(2)
                        }, 1000)
                    }
                }
                setIsError(false)
            } catch (error) {
                if (pollVerificationEndpointTimeout.current)
                    clearInterval(pollVerificationEndpointTimeout.current)
                setIsError(true)
                logMessage("Verification data failure", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
            } finally {
                isPollingRef.current = false
            }
        }
    }, [
        character,
        pageLoadedTimestamp,
        pageTimeout,
        setPage,
        setPendingAccessToken,
    ])

    useEffect(() => {
        if (!character) return
        if (character.id) {
            pollVerificationChallenge()

            // start polling the verification endpoint
            if (pollVerificationEndpointTimeout.current) {
                clearInterval(pollVerificationEndpointTimeout.current)
            }
            pollVerificationEndpointTimeout.current = setInterval(() => {
                pollVerificationChallenge()
            }, 1000)
        }

        return () => {
            if (pollVerificationEndpointTimeout.current)
                clearInterval(pollVerificationEndpointTimeout.current)
            if (navigateToNextPageTimeout.current)
                clearTimeout(navigateToNextPageTimeout.current)
        }
    }, [character, pollVerificationChallenge])

    return (
        <ContentClusterGroup>
            {isError && (
                <PageMessage
                    type="error"
                    title="Information Failed to Load"
                    message="This error has been recorded. Please try again later."
                />
            )}
            {!isError && (
                <ContentCluster title="Verify Character">
                    {isPageTimeout && (
                        <PageMessage
                            type="error"
                            title="Page Timeout"
                            message="This page has timed out. Please refresh the page to try again."
                        />
                    )}
                    <p>
                        To verify that you have access to{" "}
                        <span className="orange-text">
                            {character?.name || "your character"}
                        </span>
                        , you will need to log into{" "}
                        <span className="orange-text">
                            {character?.server_name || "the game"}
                        </span>
                        , enter the following text into the{" "}
                        <span className="orange-text">
                            Public Comment field
                        </span>{" "}
                        found at the bottom of the Who tab in the Social Panel,
                        and click the &quot;Submit&quot; button.
                    </p>
                    {!verificationChallenge?.challenge_word && (
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <span>Code loading, please wait...</span>
                        </div>
                    )}
                    <code className="verification-code">
                        {verificationChallenge?.challenge_word || (
                            <span>&nbsp;</span>
                        )}
                    </code>
                    <ExpandableContainer
                        defaultState={firstTime}
                        className="demo-container"
                        title="Show me how"
                        icon={<Info style={{ fill: "var(--info)" }} />}
                    >
                        <div className="comment-field-demo" />
                    </ExpandableContainer>
                    <p>Here&apos;s the checklist:</p>
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
                            <strong>Step 3:</strong> Code is entered in the
                            Public Comment field on the Who tab
                        </li>
                    </ul>
                    <p className="secondary-text">
                        This page will automatically refresh. Do not refresh
                        this page.
                    </p>
                    <Spacer size="10px" />
                    <Stack gap="10px" width="100%" justify="space-between">
                        <Button
                            type="secondary"
                            onClick={() => navigate("/registration")}
                        >
                            Back
                        </Button>
                    </Stack>
                </ContentCluster>
            )}
            <ContentCluster title="About this Feature">
                <p>
                    Verifying your character gives you access to additional
                    information such as:
                </p>
                <ul>
                    <li>Raid and ransack timers</li>
                    <li>
                        Questing history - what quests you've ran, when you ran
                        them, and how long they took
                    </li>
                    <li>
                        Level history - when you level up and how long each
                        level took to complete
                    </li>
                    <li>
                        Guild members - information that you'd find in the Guild
                        tab of the social panel
                    </li>
                </ul>
                <p>
                    Character verification is entirely optional. This process
                    does <strong>not</strong> require log-in credentials or
                    personal information.{" "}
                    <span className="orange-text">
                        We will never ask for your username or password.
                    </span>
                </p>
                <p>
                    Access tokens will be stored as cookies. If you clear your
                    cookies, you will need to verify your characters again.
                </p>
            </ContentCluster>
        </ContentClusterGroup>
    )
}

export default Page1

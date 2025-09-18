import { useState, useEffect, useRef } from "react"
import { ContentCluster } from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as Info } from "../../assets/svg/info.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { Verification, AccessToken } from "../../models/Verification.ts"
import { getVerificationChallengeByCharacterId } from "../../services/verificationService.ts"
import Link from "../global/Link.tsx"
import { addAccessToken } from "../../utils/localStorage.ts"
import { useNavigate } from "react-router-dom"
import ExpandableContainer from "../global/ExpandableContainer.tsx"
import PageMessage from "../global/PageMessage.tsx"

const Page2 = ({
    setPage,
    accessToken,
    character,
    isLoaded,
    firstTime,
}: {
    setPage: Function
    accessToken: AccessToken | null
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

    const [verificationChallenge, setVerificationChallenge] =
        useState<Verification | null>(null)

    function addCharacterAccessToken() {
        if (accessToken) addAccessToken(accessToken)
    }

    function pollVerificationChallenge() {
        if (Date.now() - pageLoadedTimestamp > pageTimeout) {
            setIsPageTimeout(true)
            return
        }
        if (accessToken?.character_id) {
            getVerificationChallengeByCharacterId(accessToken?.character_id)
                .then((response) => {
                    const verificationResponse = response.data
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
                        and click &quot;Verify&quot; for any character in the
                        list.
                    </p>
                    <p>
                        If you got here by refreshing the page, just head back
                        to the Registration page to start the process again.
                    </p>
                </ContentCluster>
            )}
            {!!character && (
                <ContentCluster title="Verify Character">
                    {isPageTimeout && (
                        <PageMessage
                            type="error"
                            title="Page Timeout"
                            message="This page has timed out. Please refresh the page to try again."
                        />
                    )}
                    <p>
                        One last step. <b>Reset</b> your public comment by
                        clicking the &quot;Submit&quot; button while the Comment
                        field is blank.
                    </p>
                    <ExpandableContainer
                        defaultState={firstTime}
                        className="demo-container"
                        title="Show me how"
                        icon={<Info style={{ fill: "var(--info)" }} />}
                    >
                        <div className="remove-comment-field-demo" />
                    </ExpandableContainer>
                    <p>Here&apos;s the checklist:</p>
                    <ul>
                        <li>
                            {verificationChallenge &&
                            !verificationChallenge.challenge_word_match ? (
                                <Checkmark className="step-icon" />
                            ) : (
                                <X className="step-icon" />
                            )}{" "}
                            <strong>Step 1:</strong> Code has been removed from
                            the Public Comment field
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

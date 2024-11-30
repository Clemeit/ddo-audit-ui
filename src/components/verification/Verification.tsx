import React, { useEffect, useState, useRef } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import "./Verification.css"
import { Link } from "react-router-dom"
import VerificationTable from "./VerificationTable.tsx"
import { Character } from "../../models/Character.ts"
import usePagination from "../../hooks/usePagination.ts"
import {
    getCharacterByNameAndServer,
    getCharacterById,
} from "../../services/characterService.ts"
import { useLocation } from "react-router-dom"
import { clear } from "console"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import Spacer from "../global/Spacer.tsx"

const Verification = () => {
    const location = useLocation()
    const { currentPage, setPage } = usePagination()

    // Registered characters:
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])

    // Verified characters:
    const [verifiedCharacterIds, setVerifiedCharacterIds] = useState<string[]>(
        []
    )

    // Current character to verify:
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
        null
    )

    useEffect(() => {
        if (!currentCharacter) return

        let navigateDelay: NodeJS.Timeout
        if (
            currentPage === 3 &&
            currentCharacter?.is_online &&
            !currentCharacter?.is_anonymous &&
            currentCharacter?.public_comment === "749ICH"
        ) {
            if (refreshInterval.current) clearInterval(refreshInterval.current)
            navigateDelay = setTimeout(() => {
                setPage(4)
            }, 1000)
        }

        if (currentPage === 4 && currentCharacter?.public_comment === "") {
            if (refreshInterval.current) clearInterval(refreshInterval.current)
            setVerifiedCharacterIds([
                ...verifiedCharacterIds,
                currentCharacter.id,
            ])
            navigateDelay = setTimeout(() => {
                setPage(2)
            }, 1000)
        }

        return () => {
            clearTimeout(navigateDelay)
        }
    }, [currentCharacter])

    let refreshInterval = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
        if (currentPage === 2) {
            reloadCharacters()
        }

        // Poll the current character every second
        if (refreshInterval.current) clearInterval(refreshInterval.current)
        if (currentPage === 3 || currentPage === 4) {
            refreshCurrentCharacter()
            refreshInterval.current = setInterval(() => {
                refreshCurrentCharacter()
            }, 1000)
        }

        return () => {
            if (refreshInterval.current) clearInterval(refreshInterval.current)
        }
    }, [currentPage])

    function refreshCurrentCharacter() {
        const id = new URLSearchParams(location.search).get("id")
        if (id) {
            getCharacterById(id)
                .then((response) => {
                    setCurrentCharacter(response.data.data)
                })
                .catch((error) => {})
        }
    }

    function reloadCharacters() {
        // get the list of registered character IDs from local storage
        const ids = JSON.parse(
            localStorage.getItem("registered-characters") || "[]"
        )
        // for every ID, look up the character data and add it to the list
        const promises = ids.map((id: string) => getCharacterById(id))
        Promise.all(promises).then((responses) => {
            const characters = responses
                .map((response) => response.data.data)
                .filter((character) => character)
            setRegisteredCharacters(characters)
        })
    }

    const page1 = (
        <>
            <ContentCluster title="Benefits">
                <p>
                    Verifying your character gives you access to additional
                    information like:
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
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button
                        text="Next"
                        type="primary"
                        onClick={() => setPage(2)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const page2 = (
        <>
            <ContentCluster title="Select a Character">
                <p>Select a registered character to verify:</p>
                <VerificationTable
                    characters={registeredCharacters}
                    verifiedCharacters={verifiedCharacterIds}
                />
                <p>
                    Not seeing your characters? Go to{" "}
                    <Link style={{ color: "#2299FF" }} to="/registration">
                        Character Registration
                    </Link>{" "}
                    to add them!
                </p>
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button
                        text="Back"
                        type="secondary"
                        onClick={() => setPage(1)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const page3 = (
        <>
            <ContentCluster title="Verify Character">
                <p>
                    To verify your character, you will need to log into the game
                    and enter the following text in the Public Comment field
                    found in the Social Panel. There's nothing special about
                    this text. It's just a random code to verify that you have
                    access to the character.
                </p>
                <code className="verification-code">749ICH</code>
                <p>
                    Hint: Open the Social Panel. Go to the "Who" tab. There's a
                    Comment field and a Submit button at the bottom.
                </p>
                <p>Here's the checklist:</p>
                <ul>
                    <li>
                        <strong>Step 1:</strong> Character is online{" "}
                        {currentCharacter && currentCharacter.is_online ? (
                            <Checkmark className="step-icon" />
                        ) : (
                            <X className="step-icon" />
                        )}
                    </li>
                    <li>
                        <strong>Step 2:</strong> Character is not anonymous{" "}
                        {currentCharacter &&
                        currentCharacter.is_online &&
                        !currentCharacter?.is_anonymous ? (
                            <Checkmark className="step-icon" />
                        ) : (
                            <X className="step-icon" />
                        )}
                    </li>
                    <li>
                        <strong>Step 3:</strong> Verification code is entered in
                        the Public Comment field{" "}
                        {currentCharacter &&
                        currentCharacter.is_online &&
                        currentCharacter?.public_comment === "749ICH" ? (
                            <Checkmark className="step-icon" />
                        ) : (
                            <X className="step-icon" />
                        )}
                    </li>
                </ul>
                <p className="secondary-text">
                    This page will automatically refresh.
                </p>
                <Spacer size="10px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button
                        text="Back"
                        type="secondary"
                        onClick={() => setPage(2)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const page4 = (
        <>
            <ContentCluster title="Verify Character">
                <p>
                    One last step. <b>Remove</b> the verification code from the
                    Public Comment field in the Social Panel.
                </p>
                <p>
                    Hint: With the Comment field blank, click the Submit button.
                </p>
                <p>Here's the checklist:</p>
                <ul>
                    <li>
                        <strong>Step 1:</strong> Verification code has been
                        removed from the Public Comment field{" "}
                        {currentCharacter &&
                        currentCharacter?.public_comment === "" ? (
                            <Checkmark className="step-icon" />
                        ) : (
                            <X className="step-icon" />
                        )}
                    </li>
                </ul>
                <p className="secondary-text">
                    This page will automatically refresh.
                </p>
            </ContentCluster>
        </>
    )

    return (
        <Page
            title="DDO Character Verification"
            description="Verify your characters to access detailed information such as questing history, level history, login history, and more."
        >
            {currentPage === 1 && page1}
            {currentPage === 2 && page2}
            {currentPage === 3 && page3}
            {currentPage === 4 && page4}
        </Page>
    )
}

export default Verification
